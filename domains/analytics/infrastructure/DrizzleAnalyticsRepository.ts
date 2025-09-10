import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, gte, lte, sql, and, desc } from 'drizzle-orm';
import * as schema from '../../../packages/db/schema';
import { AnalyticsRepository } from '../domain/AnalyticsRepository';
import { AnalyticsEvent, CreateAnalyticsEventData, AnalyticsSummary, Shortlink, CreateShortlinkData } from '../domain/Analytics';

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

export class DrizzleAnalyticsRepository implements AnalyticsRepository {
  async createEvent(eventData: CreateAnalyticsEventData): Promise<AnalyticsEvent> {
    const [event] = await db.insert(schema.analyticsEvents).values(eventData).returning();
    return event;
  }

  async findEventsByPageId(pageId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsEvent[]> {
    let query = db.select().from(schema.analyticsEvents).where(eq(schema.analyticsEvents.pageId, pageId));

    if (startDate && endDate) {
      query = query.where(
        and(
          eq(schema.analyticsEvents.pageId, pageId),
          gte(schema.analyticsEvents.createdAt, startDate),
          lte(schema.analyticsEvents.createdAt, endDate)
        )
      );
    }

    return query.orderBy(desc(schema.analyticsEvents.createdAt));
  }

  async findEventsByUserId(userId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsEvent[]> {
    // Join with pages to get events for user's pages
    let query = db.select({
      id: schema.analyticsEvents.id,
      pageId: schema.analyticsEvents.pageId,
      blockId: schema.analyticsEvents.blockId,
      shortlinkId: schema.analyticsEvents.shortlinkId,
      type: schema.analyticsEvents.type,
      metadata: schema.analyticsEvents.metadata,
      userAgent: schema.analyticsEvents.userAgent,
      ipAddress: schema.analyticsEvents.ipAddress,
      createdAt: schema.analyticsEvents.createdAt,
    })
    .from(schema.analyticsEvents)
    .innerJoin(schema.pages, eq(schema.analyticsEvents.pageId, schema.pages.id))
    .where(eq(schema.pages.userId, userId));

    if (startDate && endDate) {
      query = query.where(
        and(
          eq(schema.pages.userId, userId),
          gte(schema.analyticsEvents.createdAt, startDate),
          lte(schema.analyticsEvents.createdAt, endDate)
        )
      );
    }

    return query.orderBy(desc(schema.analyticsEvents.createdAt));
  }

  async getAnalyticsSummary(pageId: string, days = 7): Promise<AnalyticsSummary> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await this.findEventsByPageId(pageId, startDate, new Date());

    const views = events.filter(e => e.type === 'view').length;
    const clicks = events.filter(e => e.type === 'click').length;
    const conversionRate = views > 0 ? (clicks / views) * 100 : 0;

    // Get top performing links from block clicks
    const linkClicks = events.filter(e => e.type === 'click' && e.blockId);
    const linkCounts: Record<string, number> = {};
    
    linkClicks.forEach(event => {
      const label = event.metadata?.linkLabel || event.metadata?.url || 'Unknown Link';
      linkCounts[label] = (linkCounts[label] || 0) + 1;
    });

    const topPerformingLinks = Object.entries(linkCounts)
      .map(([label, clicks]) => ({ label, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    return {
      totalViews: views,
      totalClicks: clicks,
      conversionRate: Math.round(conversionRate * 100) / 100,
      topPerformingLinks,
    };
  }

  // Shortlinks
  async findShortlinkByCode(code: string): Promise<Shortlink | null> {
    const [shortlink] = await db.select().from(schema.shortlinks).where(eq(schema.shortlinks.code, code));
    return shortlink || null;
  }

  async createShortlink(shortlinkData: CreateShortlinkData): Promise<Shortlink> {
    const [shortlink] = await db.insert(schema.shortlinks).values(shortlinkData).returning();
    return shortlink;
  }

  async incrementShortlinkClicks(shortlinkId: string): Promise<void> {
    await db.update(schema.shortlinks)
      .set({ 
        clicks: sql`${schema.shortlinks.clicks} + 1`,
        updatedAt: new Date()
      })
      .where(eq(schema.shortlinks.id, shortlinkId));
  }

  async findShortlinksByPageId(pageId: string): Promise<Shortlink[]> {
    return db.select()
      .from(schema.shortlinks)
      .where(eq(schema.shortlinks.pageId, pageId))
      .orderBy(desc(schema.shortlinks.createdAt));
  }
}
