import { SocialPlatform, SocialMediaPost } from '../../types/social';

export abstract class BaseSocialService {
  protected accessToken: string;
  protected refreshToken: string;

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  abstract publishPost(post: SocialMediaPost): Promise<string>;
  abstract refreshAccessToken(): Promise<void>;
  abstract validatePost(post: SocialMediaPost): boolean;
} 