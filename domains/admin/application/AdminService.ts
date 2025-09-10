import { UserRepository } from '../../users/domain/UserRepository';
import { BillingRepository } from '../../billing/domain/BillingRepository';
import { AnalyticsRepository } from '../../analytics/domain/AnalyticsRepository';
import { AdminStats, AdminUser, CreateAuditLogData } from '../domain/Admin';

export class AdminService {
  constructor(
    private userRepository: UserRepository,
    private billingRepository: BillingRepository,
    private analyticsRepository: AnalyticsRepository
  ) {}

  async getAdminStats(): Promise<AdminStats> {
    const totalUsers = await this.userRepository.count();
    
    // Get users with pro plan
    const allUsers = await this.userRepository.findAll(0, 1000);
    const proUsers = allUsers.filter(u => u.plan === 'pro').length;
    
    // Calculate recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSignups = allUsers.filter(u => u.createdAt >= thirtyDaysAgo).length;
    
    // Calculate conversion rate
    const conversionRate = totalUsers > 0 ? (proUsers / totalUsers) * 100 : 0;

    return {
      totalUsers,
      proUsers,
      totalPages: 0, // Would need page repository to count
      totalRevenue: 0, // Would need payment repository to sum
      recentSignups,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  async getAllUsers(offset = 0, limit = 50): Promise<{ users: AdminUser[]; total: number }> {
    const { users, total } = await this.userRepository.findAll(offset, limit);
    
    // Convert to AdminUser format with additional stats
    const adminUsers: AdminUser[] = users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      plan: user.plan,
      createdAt: user.createdAt,
      pagesCount: 0, // Would need to query pages
      totalViews: 0, // Would need to query analytics
      totalClicks: 0, // Would need to query analytics
    }));

    return { users: adminUsers, total };
  }

  async updateUserPlan(adminUserId: string, userId: string, newPlan: 'free' | 'pro'): Promise<void> {
    await this.userRepository.update(userId, { plan: newPlan });
    
    // Log admin action
    await this.logAdminAction({
      adminUserId,
      action: 'UPDATE_USER_PLAN',
      resourceType: 'user',
      resourceId: userId,
      metadata: { newPlan },
    });
  }

  async deleteUser(adminUserId: string, userId: string): Promise<void> {
    await this.userRepository.delete(userId);
    
    // Log admin action
    await this.logAdminAction({
      adminUserId,
      action: 'DELETE_USER',
      resourceType: 'user',
      resourceId: userId,
    });
  }

  async getAllSubscriptions() {
    // This would fetch all subscriptions with user details
    // Implementation would depend on the billing repository
    return [];
  }

  async getAllPackages() {
    return this.billingRepository.findAllPackages();
  }

  async updatePackage(adminUserId: string, packageId: string, updateData: any): Promise<void> {
    // This would update package details
    // Implementation would depend on the billing repository having an update method
    
    // Log admin action
    await this.logAdminAction({
      adminUserId,
      action: 'UPDATE_PACKAGE',
      resourceType: 'package',
      resourceId: packageId,
      metadata: updateData,
    });
  }

  async impersonateUser(adminUserId: string, userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Log admin action
    await this.logAdminAction({
      adminUserId,
      action: 'IMPERSONATE_USER',
      resourceType: 'user',
      resourceId: userId,
    });

    // Generate impersonation token (would implement JWT with special claims)
    // For now, return a placeholder
    return `impersonation_token_${userId}`;
  }

  private async logAdminAction(auditData: CreateAuditLogData): Promise<void> {
    // This would insert into admin_audit table
    // Implementation would depend on having an admin repository
    console.log('Admin action logged:', auditData);
  }
}
