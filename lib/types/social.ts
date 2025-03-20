export enum SocialPlatform {
  TWITTER = 'TWITTER',
  INSTAGRAM = 'INSTAGRAM',
  LINKEDIN = 'LINKEDIN'
}

export interface SocialMediaPost {
  content: string;
  mediaUrls?: string[];
  platform: SocialPlatform;
  scheduledTime: Date;
}

export interface PlatformConfig {
  maxCharacters?: number;
  maxMedia?: number;
  supportedMediaTypes: string[];
}

export const PLATFORM_CONFIGS: Record<SocialPlatform, PlatformConfig> = {
  TWITTER: {
    maxCharacters: 280,
    maxMedia: 4,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
  },
  INSTAGRAM: {
    maxMedia: 10,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4']
  },
  LINKEDIN: {
    maxCharacters: 3000,
    maxMedia: 9,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4']
  }
}; 