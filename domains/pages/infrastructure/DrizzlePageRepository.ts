import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, asc, desc, count } from 'drizzle-orm';
import * as schema from '../../../packages/db/schema';
import { PageRepository } from '../domain/PageRepository';
import { Page, CreatePageData, UpdatePageData, Block, CreateBlockData, UpdateBlockData } from '../domain/Page';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export class DrizzlePageRepository implements PageRepository {
  // Page operations
  async findById(id: string): Promise<Page | null> {
    const [page] = await db.select().from(schema.pages).where(eq(schema.pages.id, id));
    return page || null;
  }

  async findBySlug(slug: string): Promise<Page | null> {
    const [page] = await db.select().from(schema.pages).where(eq(schema.pages.slug, slug));
    return page || null;
  }

  async findByUserId(userId: string): Promise<Page[]> {
    return db.select()
      .from(schema.pages)
      .where(eq(schema.pages.userId, userId))
      .orderBy(desc(schema.pages.createdAt));
  }

  async create(pageData: CreatePageData): Promise<Page> {
    const [page] = await db.insert(schema.pages).values(pageData).returning();
    return page;
  }

  async update(id: string, pageData: UpdatePageData): Promise<Page> {
    const [page] = await db.update(schema.pages)
      .set({
        ...pageData,
        updatedAt: new Date(),
      })
      .where(eq(schema.pages.id, id))
      .returning();
    return page;
  }

  async delete(id: string): Promise<void> {
    await db.delete(schema.pages).where(eq(schema.pages.id, id));
  }

  async countByUserId(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(schema.pages)
      .where(eq(schema.pages.userId, userId));
    return result.count;
  }

  // Block operations
  async findBlocksByPageId(pageId: string): Promise<Block[]> {
    return db.select()
      .from(schema.blocks)
      .where(eq(schema.blocks.pageId, pageId))
      .orderBy(asc(schema.blocks.position));
  }

  async findBlockById(id: string): Promise<Block | null> {
    const [block] = await db.select().from(schema.blocks).where(eq(schema.blocks.id, id));
    return block || null;
  }

  async createBlock(blockData: CreateBlockData): Promise<Block> {
    const [block] = await db.insert(schema.blocks).values(blockData).returning();
    return block;
  }

  async updateBlock(id: string, blockData: UpdateBlockData): Promise<Block> {
    const [block] = await db.update(schema.blocks)
      .set({
        ...blockData,
        updatedAt: new Date(),
      })
      .where(eq(schema.blocks.id, id))
      .returning();
    return block;
  }

  async deleteBlock(id: string): Promise<void> {
    await db.delete(schema.blocks).where(eq(schema.blocks.id, id));
  }

  async reorderBlocks(pageId: string, blockIds: string[]): Promise<void> {
    // Update positions based on the new order
    for (let i = 0; i < blockIds.length; i++) {
      await db.update(schema.blocks)
        .set({ position: i + 1, updatedAt: new Date() })
        .where(eq(schema.blocks.id, blockIds[i]));
    }
  }
}
