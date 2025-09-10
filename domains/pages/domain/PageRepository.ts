import { Page, CreatePageData, UpdatePageData, Block, CreateBlockData, UpdateBlockData } from './Page';

export interface PageRepository {
  // Page operations
  findById(id: string): Promise<Page | null>;
  findBySlug(slug: string): Promise<Page | null>;
  findByUserId(userId: string): Promise<Page[]>;
  create(pageData: CreatePageData): Promise<Page>;
  update(id: string, pageData: UpdatePageData): Promise<Page>;
  delete(id: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;

  // Block operations
  findBlocksByPageId(pageId: string): Promise<Block[]>;
  findBlockById(id: string): Promise<Block | null>;
  createBlock(blockData: CreateBlockData): Promise<Block>;
  updateBlock(id: string, blockData: UpdateBlockData): Promise<Block>;
  deleteBlock(id: string): Promise<void>;
  reorderBlocks(pageId: string, blockIds: string[]): Promise<void>;
}
