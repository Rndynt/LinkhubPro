import { AnalyticsRepository } from '../domain/AnalyticsRepository';
import { CreateAnalyticsEventData, AnalyticsSummary, CreateShortlinkData, Shortlink } from '../domain/Analytics';

export class AnalyticsService {
  constructor(private analyticsRepository: AnalyticsRepository) {}

  async trackEvent(eventData: CreateAnalyticsEventData): Promise<void> {
    await this.analyticsRepository.createEvent(eventData);
  }

  async trackPageView(pageId: string, metadata?: Record<string, any>): Promise<void> {
    await this.analyticsRepository.createEvent({
      pageId,
      type: 'view',
      metadata: metadata || {},
    });
  }

  async trackLinkClick(pageId: string, blockId?: string, metadata?: Record<string, any>): Promise<void> {
    await this.analyticsRepository.createEvent({
      pageId,
      blockId,
      type: 'click',
      metadata: metadata || {},
    });
  }

  async redirectShortlink(code: string): Promise<string> {
    const shortlink = await this.analyticsRepository.findShortlinkByCode(code);
    if (!shortlink) {
      throw new Error('Shortlink not found');
    }

    // Increment clicks atomically
    await this.analyticsRepository.incrementShortlinkClicks(shortlink.id);

    // Track analytics event
    await this.analyticsRepository.createEvent({
      shortlinkId: shortlink.id,
      pageId: shortlink.pageId,
      blockId: shortlink.blockId,
      type: 'click',
      metadata: { code, targetUrl: shortlink.targetUrl },
    });

    return shortlink.targetUrl;
  }

  async getPageAnalytics(pageId: string, days = 7): Promise<AnalyticsSummary> {
    return this.analyticsRepository.getAnalyticsSummary(pageId, days);
  }

  async getUserAnalytics(userId: string, days = 7): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const events = await this.analyticsRepository.findEventsByUserId(userId, startDate, endDate);

    const views = events.filter(e => e.type === 'view').length;
    const clicks = events.filter(e => e.type === 'click').length;
    const conversionRate = views > 0 ? (clicks / views) * 100 : 0;

    return {
      totalViews: views,
      totalClicks: clicks,
      conversionRate: Math.round(conversionRate * 100) / 100,
      eventsOverTime: this.groupEventsByDate(events),
    };
  }

  async createShortlink(shortlinkData: CreateShortlinkData): Promise<Shortlink> {
    // Generate unique code if not provided
    if (!shortlinkData.code) {
      shortlinkData.code = this.generateShortCode();
    }

    // Check if code already exists
    const existing = await this.analyticsRepository.findShortlinkByCode(shortlinkData.code);
    if (existing) {
      throw new Error('Shortlink code already exists');
    }

    return this.analyticsRepository.createShortlink(shortlinkData);
  }

  private generateShortCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Group analytics events by date and count views and clicks separately.
   */
  private groupEventsByDate(
    events: any[],
  ): Record<string, { views: number; clicks: number }> {
    const grouped: Record<string, { views: number; clicks: number }> = {};
    for (const event of events) {
      const date = event.createdAt.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { views: 0, clicks: 0 };
      }
      if (event.type === 'view') grouped[date].views++;
      if (event.type === 'click') grouped[date].clicks++;
    }
    return grouped;
  }
}
