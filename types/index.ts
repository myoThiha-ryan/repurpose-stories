export type Platform = 'instagram' | 'facebook';

export type PostStatus = 'pending' | 'uploading' | 'processing' | 'publishing' | 'success' | 'error';

export interface UploadRecord {
  id: string;
  filename: string;
  originalName: string;
  uploadedAt: string;
  platforms: Platform[];
  status: PostStatus;
  instagramPostId?: string;
  facebookPostId?: string;
  errorMessage?: string;
  videoUrl?: string;
}

export interface FacebookTokenData {
  accessToken: string;
  pageId?: string;
  pageName?: string;
  instagramAccountId?: string;
  instagramUsername?: string;
  expiresAt?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface InstagramMediaContainer {
  id: string;
  status?: string;
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
    username?: string;
  };
}

export interface PostStoryRequest {
  platforms: Platform[];
  uploadId: string;
  videoUrl: string;
}

export interface PostStoryResult {
  instagram?: {
    success: boolean;
    postId?: string;
    error?: string;
  };
  facebook?: {
    success: boolean;
    postId?: string;
    error?: string;
  };
}
