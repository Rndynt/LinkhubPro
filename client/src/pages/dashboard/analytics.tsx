import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  EyeIcon,
  MousePointerClickIcon,
  TrendingUpIcon,
  BarChartIcon,
  CalendarIcon,
  ExternalLinkIcon,
} from "lucide-react";

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  conversionRate: number;
  topPages: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    clicks: number;
  }>;
  topLinks: Array<{
    label: string;
    url: string;
    clicks: number;
  }>;
  chartData: Array<{
    date: string;
    views: number;
    clicks: number;
  }>;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
}

export default function Analytics() {
  const { user } = useAuth();
  const [selectedPage, setSelectedPage] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("7d");

  const { data: pages } = useQuery<Page[]>({
    queryKey: ["/api/pages"],
    retry: false,
  });

  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", selectedPage, timeRange],
    retry: false,
  });

  // Handle no data scenario
  const displayAnalytics = analytics || {
    totalViews: 0,
    totalClicks: 0,
    conversionRate: 0,
    topPages: [],
    topLinks: [],
    chartData: [],
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case "7d": return "Last 7 days";
      case "30d": return "Last 30 days";
      case "90d": return "Last 3 months";
      default: return "Last 7 days";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your page performance</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
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

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your page performance</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Unable to load analytics</h3>
            <p className="text-muted-foreground">Please try refreshing the page or check your connection.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8" data-testid="analytics-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-analytics-title">Analytics</h1>
          <p className="text-muted-foreground">Track your page performance and engagement</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="w-48" data-testid="select-page">
              <SelectValue placeholder="Select page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pages</SelectItem>
              {pages?.map((page) => (
                <SelectItem key={page.id} value={page.id}>
                  {page.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="stats-card-views">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <EyeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-views">
              {displayAnalytics.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {getTimeRangeLabel(timeRange)}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stats-card-clicks">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClickIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-clicks">
              {displayAnalytics.totalClicks.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {getTimeRangeLabel(timeRange)}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stats-card-conversion">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-conversion-rate">
              {displayAnalytics.conversionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Clicks per view
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card data-testid="card-analytics-chart">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChartIcon className="w-5 h-5" />
            <span>Performance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayAnalytics.chartData.length > 0 ? (
            <div className="h-80 bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChartIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Chart Data Available</p>
                <p className="text-sm text-muted-foreground">
                  {displayAnalytics.chartData.length} days of data from {getTimeRangeLabel(timeRange).toLowerCase()}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-80 bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChartIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No Data Available</p>
                <p className="text-sm text-muted-foreground">
                  No analytics data found for the selected time period. Start sharing your pages to see data here.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performance Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Top Pages */}
        <Card data-testid="card-top-pages">
          <CardHeader>
            <CardTitle>Top Performing Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {displayAnalytics.topPages.map((page, index) => (
                <div 
                  key={page.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-muted/30 rounded-lg gap-3 sm:gap-0"
                  data-testid={`top-page-${index}`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-sm sm:text-base">{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{page.title}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">/{page.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-3 sm:gap-1">
                    <div className="flex items-center space-x-3 sm:space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-medium">{page.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MousePointerClickIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-medium">{page.clicks}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0" data-testid={`button-view-page-${index}`}>
                      <ExternalLinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Links */}
        <Card data-testid="card-top-links">
          <CardHeader>
            <CardTitle>Top Performing Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {displayAnalytics.topLinks.map((link, index) => (
                <div 
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-muted/30 rounded-lg gap-3 sm:gap-0"
                  data-testid={`top-link-${index}`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-semibold text-sm sm:text-base">{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{link.label}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate break-all">{link.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-2">
                    <div className="text-left sm:text-right">
                      <p className="font-medium text-sm sm:text-base">{link.clicks}</p>
                      <p className="text-xs text-muted-foreground">clicks</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0" data-testid={`button-view-link-${index}`}>
                      <ExternalLinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pro Features Notice */}
      {user?.plan === 'free' && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="text-center">
              <BarChartIcon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Unlock Advanced Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Get detailed insights, custom date ranges, export data, and more with Pro.
              </p>
              <Button data-testid="button-upgrade-analytics">
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
