import { BaseSocialService } from './BaseSocialService';
import { SocialMediaPost, PLATFORM_CONFIGS, SocialPlatform } from '../../types/social';

export class InstagramService extends BaseSocialService {
  private apiUrl = 'https://graph.instagram.com/v12.0';

  constructor(accessToken: string, refreshToken: string) {
    super(accessToken, refreshToken);
  }

  async publishPost(post: SocialMediaPost): Promise<string> {
    try {
      if (!this.validatePost(post)) {
        throw new Error('Invalid post content or media');
      }

      if (!post.mediaUrls?.length) {
        throw new Error('Instagram posts require at least one media');
      }

      // First, create a media container
      const mediaId = await this.createMediaContainer(post);

      // Then publish the post
      const response = await fetch(`${this.apiUrl}/me/media_publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: mediaId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish Instagram post');
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Instagram publish error:', error);
      throw error;
    }
  }

  private async createMediaContainer(post: SocialMediaPost): Promise<string> {
    const response = await fetch(`${this.apiUrl}/me/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: post.mediaUrls![0], // Use first image
        caption: post.content,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Instagram media container');
    }

    const data = await response.json();
    return data.id;
  }

  async refreshAccessToken(): Promise<void> {
    const response = await fetch('https://graph.instagram.com/refresh_access_token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Instagram access token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
  }

  validatePost(post: SocialMediaPost): boolean {
    const config = PLATFORM_CONFIGS[SocialPlatform.INSTAGRAM];
    
    if (!post.mediaUrls?.length) {
      return false; // Instagram requires at least one media
    }

    if (post.mediaUrls.length > (config.maxMedia || 1)) {
      return false;
    }

    // Validate media types
    return post.mediaUrls.every(url => {
      const fileExtension = url.split('.').pop()?.toLowerCase();
      return config.supportedMediaTypes.some(type => 
        type.includes(fileExtension || '')
      );
    });
  }
} 