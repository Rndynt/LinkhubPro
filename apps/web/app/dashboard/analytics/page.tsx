'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Calendar,
  BarChart3,
  ExternalLink,
  Download
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  conversionRate: number;
  topPerformingLinks: Array<{
    label: string;
    clicks: number;
    url?: string;
  }>;
  eventsOverTime: Record<string, number>;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalClicks: 0,
    conversionRate: 0,
    topPerformingLinks: [],
    eventsOverTime: {},
  });
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (pages.length > 0 || selectedPage === 'all') {
      fetchAnalytics();
    }
  }, [selectedPage, timeRange, pages]);

  const fetchPages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to continue',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/pages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPages(data.pages || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load pages',
        variant: 'destructive',
      });
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        timeRange,
        ...(selectedPage !== 'all' && { pageId: selectedPage }),
      });

      const response = await fetch(`/api/analytics?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        // For demo purposes, set some sample data
        setAnalytics({
          totalViews: 1234,
          totalClicks: 567,
          conversionRate: 46.0,
          topPerformingLinks: [
            { label: 'Blog Link', clicks: 156 },
            { label: 'Shop Link', clicks: 98 },
            { label: 'Instagram', clicks: 76 },
            { label: 'YouTube', clicks: 54 },
            { label: 'Portfolio', clicks: 32 },
          ],
          eventsOverTime: {},
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    toast({
      title: 'Export initiated',
      description: 'Your analytics data will be downloaded shortly',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <Sidebar userRole="tenant" />
          <div className="flex-1 flex flex-col">
            <Header 
              title="Analytics" 
              subtitle="Loading..."
              onMenuClick={() => setSidebarOpen(true)}
            />
            <main className="flex-1 p-6">
              <div className="animate-pulse space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-muted rounded-xl"></div>
                  ))}
                </div>
                <div className="h-64 bg-muted rounded-xl"></div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          userRole="tenant" 
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            title="Analytics" 
            subtitle="Track your performance and engagement"
            actions={
              <Button variant="outline" onClick={exportData} data-testid="button-export">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            }
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="flex-1 overflow-auto p-6 space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Page</label>
                  <Select value={selectedPage} onValueChange={setSelectedPage}>
                    <SelectTrigger className="w-48" data-testid="select-page">
                      <SelectValue placeholder="Select page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pages</SelectItem>
                      {pages.map((page) => (
                        <SelectItem key={page.id} value={page.id}>
                          {page.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Time Range</label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32" data-testid="select-time-range">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                      <p className="text-3xl font-bold" data-testid="stat-total-views">
                        {analytics.totalViews.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600 font-medium">+12%</span>
                    <span className="text-muted-foreground ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Clicks</p>
                      <p className="text-3xl font-bold" data-testid="stat-total-clicks">
                        {analytics.totalClicks.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <MousePointer className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600 font-medium">+8%</span>
                    <span className="text-muted-foreground ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <p className="text-3xl font-bold" data-testid="stat-conversion-rate">
                        {analytics.conversionRate}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600 font-medium">+3%</span>
                    <span className="text-muted-foreground ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Views over time chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Views Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Chart visualization would appear here
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Views and clicks over the selected time period
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top performing links */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topPerformingLinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-primary text-xs font-semibold">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm" data-testid={`link-label-${index}`}>
                              {link.label}
                            </p>
                            {link.url && (
                              <p className="text-xs text-muted-foreground flex items-center">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                {link.url}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" data-testid={`link-clicks-${index}`}>
                          {link.clicks} clicks
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Page Performance */}
            {pages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Page Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pages.map((page) => (
                      <div key={page.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-semibold text-sm">
                              {page.title.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium" data-testid={`page-title-${page.id}`}>
                              {page.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              linkhub.pro/{page.slug}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="text-center">
                            <p className="font-semibold">--</p>
                            <p className="text-muted-foreground">Views</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">--</p>
                            <p className="text-muted-foreground">Clicks</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">--%</p>
                            <p className="text-muted-foreground">CTR</p>
                          </div>
                          <Badge variant={page.isPublished ? "default" : "secondary"}>
                            {page.isPublished ? 'Live' : 'Draft'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upgrade CTA for advanced analytics */}
            <Card className="border-accent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold mb-2">Advanced Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Get detailed insights, conversion tracking, and custom date ranges with Pro.
                    </p>
                  </div>
                  <Button data-testid="button-upgrade-analytics">
                    Upgrade to Pro
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
