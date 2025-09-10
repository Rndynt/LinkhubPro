'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Settings, Eye, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Page {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPages();
  }, []);

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
      } else if (response.status === 401) {
        toast({
          title: 'Session expired',
          description: 'Please log in again',
          variant: 'destructive',
        });
      } else {
        throw new Error('Failed to fetch pages');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load pages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePage = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'New Page',
          slug: `page-${Date.now()}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Page created',
          description: 'Your new page has been created successfully',
        });
        fetchPages(); // Refresh the list
      } else if (response.status === 403) {
        const data = await response.json();
        if (data.error === 'upgrade_required') {
          toast({
            title: 'Upgrade Required',
            description: 'Free users can only create 1 page. Upgrade to Pro for unlimited pages.',
            variant: 'destructive',
          });
        }
      } else {
        throw new Error('Failed to create page');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create page',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Page deleted',
          description: 'The page has been deleted successfully',
        });
        fetchPages(); // Refresh the list
      } else {
        throw new Error('Failed to delete page');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete page',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <Sidebar userRole="tenant" />
          <div className="flex-1 flex flex-col">
            <Header 
              title="Pages" 
              subtitle="Loading..."
              onMenuClick={() => setSidebarOpen(true)}
            />
            <main className="flex-1 p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded-xl"></div>
                ))}
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
            title="Pages" 
            subtitle="Manage your link-in-bio pages"
            actions={
              <Button onClick={handleCreatePage} data-testid="button-create-page">
                <Plus className="w-4 h-4 mr-2" />
                Create Page
              </Button>
            }
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="flex-1 overflow-auto p-6">
            {pages.length > 0 ? (
              <div className="space-y-4">
                {pages.map((page) => (
                  <Card key={page.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">
                              {page.title.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold" data-testid={`page-title-${page.id}`}>
                              {page.title}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>linkhub.pro/{page.slug}</span>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Updated {new Date(page.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge variant={page.isPublished ? "default" : "secondary"}>
                            {page.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                          
                          <Link href={`/p/${page.slug}`} target="_blank">
                            <Button size="sm" variant="outline" data-testid={`button-view-${page.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          
                          <Link href={`/dashboard/pages/${page.id}/editor`}>
                            <Button size="sm" data-testid={`button-edit-${page.id}`}>
                              <Settings className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem 
                                onClick={() => handleDeletePage(page.id)}
                                className="text-destructive"
                                data-testid={`button-delete-${page.id}`}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No pages yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your first link-in-bio page to get started sharing all your important links in one place.
                </p>
                <Button onClick={handleCreatePage} size="lg" data-testid="button-create-first-page">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Page
                </Button>
              </div>
            )}

            {/* Upgrade CTA for free users */}
            {pages.length >= 1 && (
              <Card className="mt-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold mb-2">Want to create more pages?</h4>
                      <p className="text-sm text-muted-foreground">
                        You've reached the free plan limit of 1 page. Upgrade to Pro for unlimited pages.
                      </p>
                    </div>
                    <Link href="/dashboard/billing">
                      <Button data-testid="button-upgrade-cta">
                        Upgrade to Pro
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
