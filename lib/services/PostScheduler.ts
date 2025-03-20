import { queues } from '../queue/config';
import { prisma } from '../prisma';
import { PostPublisher } from './PostPublisher';

export class PostScheduler {
  private publisher: PostPublisher;

  constructor() {
    this.publisher = new PostPublisher();
  }

  async schedulePost(postId: string): Promise<void> {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const scheduledTime = new Date(post.scheduledTime);
    const now = new Date();
    const delay = Math.max(0, scheduledTime.getTime() - now.getTime());

    await queues.postScheduler.add(
      { postId },
      { 
        delay,
        jobId: postId,
      }
    );

    await prisma.post.update({
      where: { id: postId },
      data: { status: 'SCHEDULED' }
    });
  }

  async cancelScheduledPost(postId: string): Promise<void> {
    const job = await queues.postScheduler.getJob(postId);
    if (job) {
      await job.remove();
      await prisma.post.update({
        where: { id: postId },
        data: { status: 'DRAFT' }
      });
    }
  }

  async processScheduledPosts(): Promise<void> {
    const posts = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledTime: {
          lte: new Date()
        }
      }
    });

    for (const post of posts) {
      try {
        await this.publisher.publishPost(post.id);
      } catch (error) {
        console.error(`Failed to publish post ${post.id}:`, error);
      }
    }
  }
} 