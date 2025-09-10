export interface AnalyticsEvent {
  id: string;
  pageId?: string;
  blockId?: string;
  shortlinkId?: string;
  type: 'view' | 'click' | 'purchase';
  metadata: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

export interface CreateAnalyticsEventData {
  pageId?: string;
  blockId?: string;
  shortlinkId?: string;
  type: 'view' | 'click' | 'purchase';
  metadata?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  conversionRate: number;
  topPerformingLinks: Array<{
    label: string;
    clicks: number;
    url?: string;
  }>;
}

export interface Shortlink {
  id: string;
  code: string;
  targetUrl: string;
  pageId?: string;
  blockId?: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateShortlinkData {
  code: string;
  targetUrl: string;
  pageId?: string;
  blockId?: string;
}
