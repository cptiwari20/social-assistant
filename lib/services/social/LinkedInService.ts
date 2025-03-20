import { BaseSocialService } from './BaseSocialService';
import { SocialMediaPost, PLATFORM_CONFIGS, SocialPlatform } from '../../types/social';

export class LinkedInService extends BaseSocialService {
  private apiUrl = 'https://api.linkedin.com/v2';

  constructor(accessToken: string, refreshToken: string) {
    super(accessToken, refreshToken);
  }

  async publishPost(post: SocialMediaPost): Promise<string> {
    try {
      if (!this.validatePost(post)) {
        throw new Error('Invalid post content');
      }

      const author = await this.getAuthorUrn();
      let shareContent: any = {
        author,
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: post.content
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      // Add media if present
      if (post.mediaUrls?.length) {
        const mediaAssets = await Promise.all(
          post.mediaUrls.map(url => this.uploadMedia(url))
        );

        shareContent.specificContent['com.linkedin.ugc.ShareContent'].media = mediaAssets;
        shareContent.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
      }

      const response = await fetch(`${this.apiUrl}/ugcPosts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(shareContent),
      });

      if (!response.ok) {
        throw new Error('Failed to publish LinkedIn post');
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('LinkedIn publish error:', error);
      throw error;
    }
  }

  private async getAuthorUrn(): Promise<string> {
    const response = await fetch(`${this.apiUrl}/me`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get LinkedIn profile');
    }

    const data = await response.json();
    return `urn:li:person:${data.id}`;
  }

  private async uploadMedia(url: string): Promise<any> {
    // First register the media upload
    const registerResponse = await fetch(`${this.apiUrl}/assets?action=registerUpload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: await this.getAuthorUrn(),
          serviceRelationships: [{
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent',
          }],
        },
      }),
    });

    const uploadData = await registerResponse.json();
    
    // Upload the binary image data
    const imageResponse = await fetch(url);
    const imageBlob = await imageResponse.blob();
    
    await fetch(uploadData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl, {
      method: 'PUT',
      body: imageBlob,
    });

    return {
      status: 'READY',
      description: {
        text: 'Image upload'
      },
      media: uploadData.value.asset,
    };
  }

  async refreshAccessToken(): Promise<void> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh LinkedIn access token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
  }

  validatePost(post: SocialMediaPost): boolean {
    const config = PLATFORM_CONFIGS[SocialPlatform.LINKEDIN];
    
    if (post.content.length > (config.maxCharacters || 3000)) {
      return false;
    }

    if (post.mediaUrls && post.mediaUrls.length > (config.maxMedia || 9)) {
      return false;
    }

    // Validate media types if present
    if (post.mediaUrls) {
      return post.mediaUrls.every(url => {
        const fileExtension = url.split('.').pop()?.toLowerCase();
        return config.supportedMediaTypes.some(type => 
          type.includes(fileExtension || '')
        );
      });
    }

    return true;
  }
} 