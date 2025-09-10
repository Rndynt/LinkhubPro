import { AnalyticsEvent, CreateAnalyticsEventData, AnalyticsSummary, Shortlink, CreateShortlinkData } from './Analytics';

export interface AnalyticsRepository {
  // Analytics events
  createEvent(eventData: CreateAnalyticsEventData): Promise<AnalyticsEvent>;
  findEventsByPageId(pageId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsEvent[]>;
  findEventsByUserId(userId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsEvent[]>;
  getAnalyticsSummary(pageId: string, days?: number): Promise<AnalyticsSummary>;

  // Shortlinks
  findShortlinkByCode(code: string): Promise<Shortlink | null>;
  createShortlink(shortlinkData: CreateShortlinkData): Promise<Shortlink>;
  incrementShortlinkClicks(shortlinkId: string): Promise<void>;
  findShortlinksByPageId(pageId: string): Promise<Shortlink[]>;
}
