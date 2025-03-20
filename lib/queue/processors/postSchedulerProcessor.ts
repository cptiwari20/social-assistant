import { Job } from 'bull';
import { PostPublisher } from '../../services/PostPublisher';
import { prisma } from '../../prisma';
import { JobErrorHandler, JobError } from '../errorHandler';

interface ScheduledPostJob {
  postId: string;
  workspaceId: string;
  platforms: string[];
}

export async function processScheduledPost(job: Job<ScheduledPostJob>) {
  const { postId, platforms } = job.data;
  const publisher = new PostPublisher();

  try {
    // Check if post still exists and should be published
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { workspace: true },
    });

    if (!post) {
      throw Object.assign(new Error('Post not found'), {
        code: 'POST_NOT_FOUND',
        retryable: false,
      });
    }

    if (post.status !== 'SCHEDULED') {
      throw Object.assign(new Error('Post is no longer scheduled'), {
        code: 'INVALID_STATUS',
        retryable: false,
      });
    }

    // Update status to processing
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'PROCESSING',
        processingStartedAt: new Date(),
      },
    });

    // Attempt to publish to each platform
    const results = await Promise.allSettled(
      platforms.map(platform => publisher.publishToPlaftorm(postId, platform))
    );

    // Check results and handle partial failures
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      if (failures.length === platforms.length) {
        // All platforms failed
        throw Object.assign(new Error('Failed to publish to all platforms'), {
          code: 'PUBLISH_FAILED',
          retryable: true,
          platformErrors: failures.map(f => (f as PromiseRejectedResult).reason),
        });
      } else {
        // Partial success - update status accordingly
        await prisma.post.update({
          where: { id: postId },
          data: {
            status: 'PARTIALLY_PUBLISHED',
            error: `Failed to publish to some platforms: ${failures
              .map(f => (f as PromiseRejectedResult).reason.platform)
              .join(', ')}`,
          },
        });
      }
    } else {
      // All platforms succeeded
      await prisma.post.update({
        where: { id: postId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      });
    }
  } catch (error) {
    await JobErrorHandler.handleError(job, error as JobError);
    throw error; // Re-throw to trigger Bull's retry mechanism
  }
} 