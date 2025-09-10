import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import {
  UsersIcon,
  CrownIcon,
  CreditCardIcon,
  FileTextIcon,
  TrendingUpIcon,
  SearchIcon,
  MoreHorizontalIcon,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  proUsers: number;
  totalPages: number;
  monthlyRevenue: number;
  usersChange: number;
  revenueChange: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  username: string;
  plan: string;
  role: string;
  createdAt: string;
}

interface AdminSubscription {
  id: string;
  status: string;
  user: {
    name: string;
    email: string;
  };
  package: {
    name: string;
    priceCents: number;
  };
  createdAt: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: user?.role === 'admin',
    retry: false,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery<{
    users: AdminUser[];
    total: number;
  }>({
    queryKey: ["/api/admin/users", searchTerm, userFilter],
    enabled: user?.role === 'admin',
    retry: false,
  });

  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useQuery<{
    subscriptions: AdminSubscription[];
    total: number;
  }>({
    queryKey: ["/api/admin/subscriptions"],
    enabled: user?.role === 'admin',
    retry: false,
  });

  // Mock data for demonstration
  const mockStats: AdminStats = {
    totalUsers: 2847,
    proUsers: 489,
    totalPages: 3692,
    monthlyRevenue: 17115000,
    usersChange: 23,
    revenueChange: 18,
  };

  const mockUsers: AdminUser[] = [
    {
      id: "1",
      name: "Maria Santos",
      email: "maria@example.com",
      username: "maria",
      plan: "pro",
      role: "tenant",
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      name: "David Wilson",
      email: "david@example.com",
      username: "david",
      plan: "free",
      role: "tenant",
      createdAt: "2024-01-14T15:30:00Z",
    },
    {
      id: "3",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      username: "sarah",
      plan: "pro",
      role: "tenant",
      createdAt: "2024-01-13T09:20:00Z",
    },
  ];

  const displayStats = stats || mockStats;
  const displayUsers = usersData?.users || mockUsers;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(cents);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (statsLoading || usersLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8" data-testid="admin-panel">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-destructive" data-testid="text-admin-title">
          Admin Panel
        </h1>
        <p className="text-muted-foreground">System-wide statistics and user management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="admin-stats-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-users">
              {displayStats.totalUsers.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUpIcon className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">+{displayStats.usersChange}%</span>
              <span className="ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="admin-stats-pro-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pro Subscribers</CardTitle>
            <CrownIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pro-users">
              {displayStats.proUsers.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="text-green-600">
                {Math.round((displayStats.proUsers / displayStats.totalUsers) * 100)}%
              </span>
              <span className="ml-1">conversion rate</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="admin-stats-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-monthly-revenue">
              {formatCurrency(displayStats.monthlyRevenue)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUpIcon className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">+{displayStats.revenueChange}%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="admin-stats-pages">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-pages">
              {displayStats.totalPages.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Avg {Math.round(displayStats.totalPages / displayStats.totalUsers)} per user
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Users Management */}
        <div className="lg:col-span-2">
          <Card data-testid="card-users-management">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Users Management</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                      data-testid="input-search-users"
                    />
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-32" data-testid="select-user-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="free">Free Plan</SelectItem>
                      <SelectItem value="pro">Pro Plan</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                    data-testid={`admin-user-${user.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-semibold text-sm">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium" data-testid={`text-user-name-${user.id}`}>
                            {user.name}
                          </h4>
                          {user.role === 'admin' && (
                            <Badge variant="destructive" className="text-xs">Admin</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground" data-testid={`text-user-email-${user.id}`}>
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={user.plan === 'pro' ? 'default' : 'secondary'}
                        data-testid={`badge-user-plan-${user.id}`}
                      >
                        {user.plan === 'pro' && <CrownIcon className="w-3 h-3 mr-1" />}
                        {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                      </Badge>
                      <Button variant="ghost" size="sm" data-testid={`button-user-actions-${user.id}`}>
                        <MoreHorizontalIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health & Quick Actions */}
        <div className="space-y-6">
          {/* System Health */}
          <Card data-testid="card-system-health">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>System Health</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">All systems operational</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Response</span>
                <span className="text-sm text-muted-foreground">45ms avg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage Usage</span>
                <span className="text-sm text-muted-foreground">67% of 1TB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Sessions</span>
                <span className="text-sm text-muted-foreground">1,247</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Subscriptions */}
          <Card data-testid="card-recent-subscriptions">
            <CardHeader>
              <CardTitle>Recent Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptionsData?.subscriptions && subscriptionsData.subscriptions.length > 0 ? (
                <div className="space-y-3">
                  {subscriptionsData.subscriptions.slice(0, 3).map((subscription) => (
                    <div
                      key={subscription.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      data-testid={`admin-subscription-${subscription.id}`}
                    >
                      <div>
                        <p className="font-medium text-sm">{subscription.user.name}</p>
                        <p className="text-xs text-muted-foreground">{subscription.package.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(subscription.package.priceCents)}
                        </p>
                        <Badge variant="default" className="text-xs">
                          {subscription.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CreditCardIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent subscriptions</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" data-testid="button-export-users">
                <UsersIcon className="w-4 h-4 mr-2" />
                Export User Data
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-system-backup">
                <FileTextIcon className="w-4 h-4 mr-2" />
                Create System Backup
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-audit-logs">
                <TrendingUpIcon className="w-4 h-4 mr-2" />
                View Audit Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
