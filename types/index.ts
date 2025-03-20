export enum Platform {
  TWITTER = 'TWITTER',
  INSTAGRAM = 'INSTAGRAM',
  LINKEDIN = 'LINKEDIN'
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED'
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
} 