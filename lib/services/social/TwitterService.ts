import { BaseSocialService } from './BaseSocialService';
import { SocialMediaPost, PLATFORM_CONFIGS, SocialPlatform } from '../../types/social';
import { TwitterApi } from 'twitter-api-v2';

export class TwitterService extends BaseSocialService {
  private client: TwitterApi;

  constructor(accessToken: string, refreshToken: string) {
    super(accessToken, refreshToken);
    this.client = new TwitterApi(accessToken);
  }

  async publishPost(post: SocialMediaPost): Promise<string> {
    try {
      if (!this.validatePost(post)) {
        throw new Error('Invalid post content');
      }

      let mediaIds: string[] = [];
      
      if (post.mediaUrls?.length) {
        mediaIds = await Promise.all(
          post.mediaUrls.map(url => this.uploadMedia(url))
        );
      }

      const tweet = await this.client.v2.tweet({
        text: post.content,
        media: mediaIds.length ? { media_ids: mediaIds } : undefined
      });

      return tweet.data.id;
    } catch (error) {
      console.error('Twitter publish error:', error);
      throw error;
    }
  }

  private async uploadMedia(url: string): Promise<string> {
    // Implement media upload logic
    return '';
  }

  async refreshAccessToken(): Promise<void> {
    // Implement token refresh logic
  }

  validatePost(post: SocialMediaPost): boolean {
    const config = PLATFORM_CONFIGS[SocialPlatform.TWITTER];
    return post.content.length <= config.maxCharacters &&
           (!post.mediaUrls || post.mediaUrls.length <= config.maxMedia);
  }
} 