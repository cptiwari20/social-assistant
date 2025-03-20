import { prisma } from '../prisma';
import { TwitterService } from './social/TwitterService';
import { SocialPlatform, SocialMediaPost } from '../types/social';
import { InstagramService } from './social/InstagramService';
import { LinkedInService } from './social/LinkedInService';

export class PostPublisher {
  private async getServiceForPlatform(platform: SocialPlatform, workspaceId: string) {
    const account = await prisma.socialAccount.findFirst({
      where: {
        workspaceId,
        platform
      }
    });

    if (!account) {
      throw new Error(`No ${platform} account configured`);
    }

    switch (platform) {
      case SocialPlatform.TWITTER:
        return new TwitterService(account.accessToken, account.refreshToken);
      case SocialPlatform.INSTAGRAM:
        return new InstagramService(account.accessToken, account.refreshToken);
      case SocialPlatform.LINKEDIN:
        return new LinkedInService(account.accessToken, account.refreshToken);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  async publishPost(postId: string): Promise<void> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { workspace: true }
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const results = await Promise.allSettled(
      post.platforms.map(async (platform) => {
        try {
          const service = await this.getServiceForPlatform(platform as SocialPlatform, post.workspaceId);
          
          const socialPost: SocialMediaPost = {
            content: post.content,
            mediaUrls: post.mediaUrls,
            platform: platform as SocialPlatform,
            scheduledTime: post.scheduledTime
          };

          const postId = await service.publishPost(socialPost);

          await prisma.post.update({
            where: { id: post.id },
            data: {
              status: 'PUBLISHED',
              analytics: {
                ...post.analytics,
                [platform]: { postId, publishedAt: new Date() }
              }
            }
          });
        } catch (error) {
          console.error(`Error publishing to ${platform}:`, error);
          throw error;
        }
      })
    );

    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      await prisma.post.update({
        where: { id: post.id },
        data: { status: 'FAILED' }
      });
      throw new Error(`Failed to publish to some platforms`);
    }
  }
} 