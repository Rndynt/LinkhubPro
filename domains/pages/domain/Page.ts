export interface Page {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description?: string;
  isPublished: boolean;
  customDomain?: string;
  metaTitle?: string;
  metaDescription?: string;
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePageData {
  userId: string;
  title: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  config?: Record<string, any>;
}

export interface UpdatePageData {
  title?: string;
  slug?: string;
  description?: string;
  isPublished?: boolean;
  customDomain?: string;
  metaTitle?: string;
  metaDescription?: string;
  config?: Record<string, any>;
}

export interface Block {
  id: string;
  pageId: string;
  type: string;
  position: number;
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBlockData {
  pageId: string;
  type: string;
  position: number;
  config: Record<string, any>;
}

export interface UpdateBlockData {
  type?: string;
  position?: number;
  config?: Record<string, any>;
}
