'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Eye, MousePointer, FileText, TrendingUp, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalViews: number;
  totalClicks: number;
  activePages: number;
  conversionRate: number;
}

interface UserPage {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    totalClicks: 0,
    activePages: 0,
    conversionRate: 0
  });
  const [pages, setPages] = useState<UserPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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

      // Fetch user's pages
      const pagesResponse = await fetch('/api/pages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        setPages(pagesData.pages || []);
        
        // Calculate basic stats from pages
        setStats({
          totalViews: 1234, // Would come from analytics API
          totalClicks: 567, // Would come from analytics API
          activePages: pagesData.pages?.length || 0,
          conversionRate: 46, // Would be calculated from analytics
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePage = () => {
    toast({
      title: 'Create Page',
      description: 'Redirecting to page creation...',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <Sidebar userRole="tenant" />
          <div className="flex-1 flex flex-col">
            <Header 
              title="Dashboard" 
              subtitle="Loading..."
              onMenuClick={() => setSidebarOpen(true)}
            />
            <main className="flex-1 p-6">
              <div className="animate-pulse space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-muted rounded-xl"></div>
                  ))}
                </div>
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
            title="Dashboard" 
            subtitle="Welcome back, Jessica! Here's your overview."
            actions={
              <Link href="/dashboard/pages/new">
                <Button data-testid="button-create-page">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Page
                </Button>
              </Link>
            }
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="flex-1 overflow-auto p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                      <p className="text-2xl font-bold" data-testid="stat-total-views">
                        {stats.totalViews.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600 font-medium">+12%</span>
                    <span className="text-muted-foreground ml-1">from last week</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Link Clicks</p>
                      <p className="text-2xl font-bold" data-testid="stat-total-clicks">
                        {stats.totalClicks.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <MousePointer className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600 font-medium">+8%</span>
                    <span className="text-muted-foreground ml-1">from last week</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Pages</p>
                      <p className="text-2xl font-bold" data-testid="stat-active-pages">
                        {stats.activePages}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-muted-foreground">Free plan limit</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <p className="text-2xl font-bold" data-testid="stat-conversion-rate">
                        {stats.conversionRate}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600 font-medium">+3%</span>
                    <span className="text-muted-foreground ml-1">from last week</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Your Pages */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Your Pages</h3>
                    <Link href="/dashboard/pages">
                      <Button variant="ghost" size="sm">View all</Button>
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {pages.length > 0 ? (
                      pages.slice(0, 3).map((page) => (
                        <div key={page.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center space-x-3">
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
                          <div className="flex items-center space-x-2">
                            <Badge variant={page.isPublished ? "default" : "secondary"}>
                              {page.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                            <Link href={`/dashboard/pages/${page.id}/editor`}>
                              <Button size="icon" variant="ghost">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No pages created yet</p>
                        <Link href="/dashboard/pages/new">
                          <Button>Create your first page</Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Upgrade CTA for free users */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                    <h4 className="font-semibold mb-2">Want to create more pages?</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Upgrade to Pro for unlimited pages and advanced features.
                    </p>
                    <Link href="/dashboard/billing">
                      <Button size="sm" data-testid="button-upgrade-pro">
                        Upgrade to Pro
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Preview */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Analytics Overview</h3>
                    <Link href="/dashboard/analytics">
                      <Button variant="ghost" size="sm">View details</Button>
                    </Link>
                  </div>
                  
                  {/* Chart placeholder */}
                  <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Chart visualization would appear here</p>
                      <p className="text-xs text-muted-foreground mt-1">Last 7 days activity</p>
                    </div>
                  </div>

                  {/* Top performing links */}
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
          </main>
        </div>
      </div>
    </div>
  );
}
