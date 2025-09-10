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

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ["/api/analytics/stats"],
    retry: false,
  });

  const { data: pages, isLoading: pagesLoading, error: pagesError } = useQuery<RecentPage[]>({
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

  if (statsError || pagesError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Unable to load dashboard data</h3>
            <p className="text-muted-foreground">Please try refreshing the page or check your connection.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle no data scenario
  const displayStats = stats || {
    totalViews: 0,
    totalClicks: 0,
    activePages: pages?.length || 0,
    conversionRate: 0,
    viewsChange: 0,
    clicksChange: 0,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8" data-testid="dashboard-page">
      {/* Welcome Section - Remove duplicate Create Page button since it's now in Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">
          Dashboard Overview
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground" data-testid="text-dashboard-subtitle">
          Welcome back, {user?.name}! Here's your performance overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Your Pages */}
        <Card data-testid="card-your-pages">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Pages</CardTitle>
            <Button asChild variant="ghost" size="sm" data-testid="button-view-all-pages">
              <Link href="/dashboard/pages">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {pages && pages.length > 0 ? (
              pages.slice(0, 3).map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  data-testid={`page-item-${page.id}`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground font-semibold text-xs sm:text-sm">
                        {page.title.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-foreground truncate" data-testid={`text-page-title-${page.id}`}>
                        {page.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-foreground/70 truncate" data-testid={`text-page-slug-${page.id}`}>
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
                    <Button asChild variant="ghost" size="sm" data-testid={`button-edit-page-${page.id}`}>
                      <Link href={`/dashboard/pages/${page.id}/editor`}>
                        <ExternalLinkIcon className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileTextIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No pages created yet</p>
                <Button asChild data-testid="button-create-first-page">
                  <Link href="/dashboard/pages">Create Your First Page</Link>
                </Button>
              </div>
            )}

            {/* Upgrade CTA for free users */}
            {user?.plan === 'free' && (
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2">Want to create more pages?</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Upgrade to Pro for unlimited pages and advanced features.
                </p>
                <Button asChild data-testid="button-upgrade-to-pro">
                  <Link href="/dashboard/billing">
                    <CrownIcon className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Preview */}
        <Card data-testid="card-analytics-preview">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Analytics Overview</CardTitle>
            <Button asChild variant="ghost" size="sm" data-testid="button-view-analytics">
              <Link href="/dashboard/analytics">View details</Link>
            </Button>
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
