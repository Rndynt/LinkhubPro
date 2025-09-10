import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  EyeIcon,
  MousePointerClickIcon,
  FileTextIcon,
  TrendingUpIcon,
  PlusIcon,
  ExternalLinkIcon,
  CrownIcon,
} from "lucide-react";

interface DashboardStats {
  totalViews: number;
  totalClicks: number;
  activePages: number;
  conversionRate: number;
  viewsChange: number;
  clicksChange: number;
}

interface RecentPage {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/analytics/stats"],
    retry: false,
  });

  const { data: pages, isLoading: pagesLoading } = useQuery<RecentPage[]>({
    queryKey: ["/api/pages"],
    retry: false,
  });

  if (statsLoading || pagesLoading) {
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

  const mockStats: DashboardStats = {
    totalViews: 1234,
    totalClicks: 567,
    activePages: pages?.length || 0,
    conversionRate: 46,
    viewsChange: 12,
    clicksChange: 8,
  };

  const displayStats = stats || mockStats;

  return (
    <div className="p-6 space-y-8" data-testid="dashboard-page">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">
            Dashboard
          </h1>
          <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
            Welcome back, {user?.name}! Here's your overview.
          </p>
        </div>
        <Link href="/dashboard/pages">
          <Button data-testid="button-create-page">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Page
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="stats-card-views">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <EyeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-views">
              {displayStats.totalViews.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUpIcon className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">+{displayStats.viewsChange}%</span>
              <span className="ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stats-card-clicks">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
            <MousePointerClickIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-clicks">
              {displayStats.totalClicks.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUpIcon className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">+{displayStats.clicksChange}%</span>
              <span className="ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stats-card-pages">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pages</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-pages">
              {displayStats.activePages}
            </div>
            <div className="text-xs text-muted-foreground">
              {user?.plan === 'free' ? 'Free plan limit' : 'Unlimited pages'}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stats-card-conversion">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-conversion-rate">
              {displayStats.conversionRate}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUpIcon className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">+3%</span>
              <span className="ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Your Pages */}
        <Card data-testid="card-your-pages">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Pages</CardTitle>
            <Link href="/dashboard/pages">
              <Button variant="ghost" size="sm" data-testid="button-view-all-pages">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {pages && pages.length > 0 ? (
              pages.slice(0, 3).map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  data-testid={`page-item-${page.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold text-sm">
                        {page.title.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium" data-testid={`text-page-title-${page.id}`}>
                        {page.title}
                      </h4>
                      <p className="text-sm text-muted-foreground" data-testid={`text-page-slug-${page.id}`}>
                        linkhub.pro/{page.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={page.isPublished ? "default" : "secondary"}
                      data-testid={`badge-page-status-${page.id}`}
                    >
                      {page.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Link href={`/dashboard/pages/${page.id}/editor`}>
                      <Button variant="ghost" size="sm" data-testid={`button-edit-page-${page.id}`}>
                        <ExternalLinkIcon className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileTextIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No pages created yet</p>
                <Link href="/dashboard/pages">
                  <Button data-testid="button-create-first-page">Create Your First Page</Button>
                </Link>
              </div>
            )}

            {/* Upgrade CTA for free users */}
            {user?.plan === 'free' && (
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2">Want to create more pages?</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Upgrade to Pro for unlimited pages and advanced features.
                </p>
                <Link href="/dashboard/billing">
                  <Button data-testid="button-upgrade-to-pro">
                    <CrownIcon className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Preview */}
        <Card data-testid="card-analytics-preview">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Analytics Overview</CardTitle>
            <Link href="/dashboard/analytics">
              <Button variant="ghost" size="sm" data-testid="button-view-analytics">
                View details
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <TrendingUpIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Chart visualization would appear here</p>
                <p className="text-xs text-muted-foreground mt-1">Last 7 days activity</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Top Performing Links</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-semibold">1</span>
                    </div>
                    <span className="text-sm">Blog Link</span>
                  </div>
                  <span className="text-sm text-muted-foreground">156 clicks</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-xs font-semibold">2</span>
                    </div>
                    <span className="text-sm">Shop Link</span>
                  </div>
                  <span className="text-sm text-muted-foreground">98 clicks</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-xs font-semibold">3</span>
                    </div>
                    <span className="text-sm">Instagram</span>
                  </div>
                  <span className="text-sm text-muted-foreground">76 clicks</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
