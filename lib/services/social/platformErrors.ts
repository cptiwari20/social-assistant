export enum SocialPlatformErrorCode {
  // Common errors
  RATE_LIMIT = 'RATE_LIMIT',
  AUTH_ERROR = 'AUTH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // Twitter specific
  TWITTER_DUPLICATE = 'TWITTER_DUPLICATE',
  TWITTER_CONTENT_VIOLATION = 'TWITTER_CONTENT_VIOLATION',
  
  // Instagram specific
  INSTAGRAM_MEDIA_ERROR = 'INSTAGRAM_MEDIA_ERROR',
  INSTAGRAM_ASPECT_RATIO = 'INSTAGRAM_ASPECT_RATIO',
  
  // LinkedIn specific
  LINKEDIN_CONTENT_TYPE = 'LINKEDIN_CONTENT_TYPE',
  LINKEDIN_URL_INVALID = 'LINKEDIN_URL_INVALID'
}

export interface PlatformError extends Error {
  code: SocialPlatformErrorCode;
  platform: string;
  retryable: boolean;
  retryDelay?: number;
}

export const platformErrorHandlers = {
  [SocialPlatformErrorCode.RATE_LIMIT]: {
    retryable: true,
    getDelay: (attempt: number) => Math.min(60000 * Math.pow(2, attempt), 3600000), // Max 1 hour
  },
  
  [SocialPlatformErrorCode.AUTH_ERROR]: {
    retryable: false,
    action: 'reconnect',
  },
  
  [SocialPlatformErrorCode.TWITTER_DUPLICATE]: {
    retryable: false,
    action: 'skip',
  },
  
  [SocialPlatformErrorCode.INSTAGRAM_MEDIA_ERROR]: {
    retryable: true,
    getDelay: () => 300000, // 5 minutes
    maxAttempts: 3,
  },
}; 