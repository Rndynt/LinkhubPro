import { PageRepository } from '../domain/PageRepository';
import { Page, CreatePageData, UpdatePageData, Block, CreateBlockData, UpdateBlockData } from '../domain/Page';

export class PageService {
  constructor(private pageRepository: PageRepository) {}

  async createPage(userId: string, pageData: CreatePageData, userPlan: string): Promise<Page> {
    // Check plan limits for free users
    if (userPlan === 'free') {
      const existingPagesCount = await this.pageRepository.countByUserId(userId);
      if (existingPagesCount >= 1) {
        throw new Error('upgrade_required');
      }
    }

    // Ensure slug is unique
    const existingPage = await this.pageRepository.findBySlug(pageData.slug);
    if (existingPage) {
      throw new Error('Slug already exists');
    }

    const page = await this.pageRepository.create({
      ...pageData,
      userId,
    });

    // If this is a free user's first page, create default blocks
    if (userPlan === 'free') {
      await this.createDefaultBlocks(page.id);
    }

    return page;
  }

  async getPageById(id: string): Promise<Page | null> {
    return this.pageRepository.findById(id);
  }

  async getPageBySlug(slug: string): Promise<{ page: Page; blocks: Block[] } | null> {
    const page = await this.pageRepository.findBySlug(slug);
    if (!page) return null;

    const blocks = await this.pageRepository.findBlocksByPageId(page.id);
    return { page, blocks };
  }

  async getUserPages(userId: string): Promise<Page[]> {
    return this.pageRepository.findByUserId(userId);
  }

  async updatePage(id: string, pageData: UpdatePageData): Promise<Page> {
    return this.pageRepository.update(id, pageData);
  }

  async deletePage(id: string): Promise<void> {
    return this.pageRepository.delete(id);
  }

  // Block operations
  async createBlock(pageId: string, blockData: CreateBlockData, userPlan: string): Promise<Block> {
    // Check if block type is PRO-only for free users
    const proOnlyBlocks = ['product_card', 'dynamic_feed', 'paywall', 'custom_domain'];
    if (userPlan === 'free' && proOnlyBlocks.includes(blockData.type)) {
      throw new Error('upgrade_required');
    }

    return this.pageRepository.createBlock({
      ...blockData,
      pageId,
    });
  }

  async getPageBlocks(pageId: string): Promise<Block[]> {
    return this.pageRepository.findBlocksByPageId(pageId);
  }

  async updateBlock(id: string, blockData: UpdateBlockData): Promise<Block> {
    return this.pageRepository.updateBlock(id, blockData);
  }

  async deleteBlock(id: string): Promise<void> {
    return this.pageRepository.deleteBlock(id);
  }

  async reorderBlocks(pageId: string, blockIds: string[]): Promise<void> {
    return this.pageRepository.reorderBlocks(pageId, blockIds);
  }

  private async createDefaultBlocks(pageId: string): Promise<void> {
    const defaultBlocks = [
      {
        pageId,
        type: 'links_block',
        position: 1,
        config: {
          links: [
            { label: 'Blog', url: 'https://example.com/blog' },
            { label: 'Shop', url: 'https://example.com/shop' },
            { label: 'Portfolio', url: 'https://example.com/portfolio' },
          ],
        },
      },
      {
        pageId,
        type: 'social_block',
        position: 2,
        config: {
          socials: [
            { provider: 'instagram', url: 'https://instagram.com/username' },
            { provider: 'twitter', url: 'https://twitter.com/username' },
          ],
        },
      },
      {
        pageId,
        type: 'contact_block',
        position: 3,
        config: {
          phone: '+1234567890',
          whatsapp_prefilled: 'Hello! I found you on your link page.',
        },
      },
    ];

    for (const blockData of defaultBlocks) {
      await this.pageRepository.createBlock(blockData);
    }
  }
}
