export interface AdminStats {
  totalUsers: number;
  proUsers: number;
  totalPages: number;
  totalRevenue: number;
  recentSignups: number;
  conversionRate: number;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  plan: string;
  createdAt: Date;
  pagesCount: number;
  totalViews: number;
  totalClicks: number;
}

export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface CreateAuditLogData {
  adminUserId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}
