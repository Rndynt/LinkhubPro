import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import {
  PlusIcon,
  EditIcon,
  ExternalLinkIcon,
  CopyIcon,
  TrashIcon,
  CrownIcon,
} from "lucide-react";

interface Page {
  id: string;
  title: string;
  slug: string;
  description?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreatePageData {
  title: string;
  slug: string;
}

export default function Pages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPageData, setNewPageData] = useState<CreatePageData>({
    title: "",
    slug: "",
  });

  const { data: pages, isLoading } = useQuery<Page[]>({
    queryKey: ["/api/pages"],
    retry: false,
  });

  const createPageMutation = useMutation({
    mutationFn: async (data: CreatePageData) => {
      const response = await apiRequest("POST", "/api/pages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      setIsCreateDialogOpen(false);
      setNewPageData({ title: "", slug: "" });
      toast({
        title: "Page created",
        description: "Your new page has been created successfully.",
      });
    },
    onError: (error: any) => {
      if (error.message.includes('upgrade_required')) {
        toast({
          title: "Upgrade Required",
          description: "Free plan allows only 1 page. Upgrade to Pro for unlimited pages.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create page.",
          variant: "destructive",
        });
      }
    },
  });

  const handleCreatePage = () => {
    if (!newPageData.title || !newPageData.slug) {
      toast({
        title: "Missing fields",
        description: "Please fill in both title and slug.",
        variant: "destructive",
      });
      return;
    }

    createPageMutation.mutate(newPageData);
  };

  const handleTitleChange = (title: string) => {
    setNewPageData(prev => ({
      ...prev,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50),
    }));
  };

  const copyPageUrl = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copied",
      description: "Page URL has been copied to clipboard.",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Pages</h1>
            <p className="text-muted-foreground">Manage your bio link pages</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const canCreatePage = user?.plan === 'pro' || !pages || pages.length === 0;

  return (
    <div className="p-6" data-testid="pages-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-pages-title">Pages</h1>
          <p className="text-muted-foreground">Manage your bio link pages</p>
        </div>
        
        {canCreatePage ? (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-page">
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Page
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-create-page">
              <DialogHeader>
                <DialogTitle>Create New Page</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    placeholder="My Bio Page"
                    value={newPageData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    data-testid="input-page-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Page URL</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">linkhub.pro/</span>
                    <Input
                      id="slug"
                      placeholder="my-bio-page"
                      value={newPageData.slug}
                      onChange={(e) => setNewPageData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') }))}
                      data-testid="input-page-slug"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel-create"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreatePage}
                    disabled={createPageMutation.isPending}
                    data-testid="button-confirm-create"
                  >
                    {createPageMutation.isPending ? "Creating..." : "Create Page"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button disabled data-testid="button-create-page-disabled">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Page (Upgrade Required)
          </Button>
        )}
      </div>

      {/* Pages Grid */}
      {pages && pages.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Card key={page.id} data-testid={`page-card-${page.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg" data-testid={`text-page-title-${page.id}`}>
                    {page.title}
                  </CardTitle>
                  <Badge 
                    variant={page.isPublished ? "default" : "secondary"}
                    data-testid={`badge-page-status-${page.id}`}
                  >
                    {page.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground" data-testid={`text-page-url-${page.id}`}>
                  linkhub.pro/{page.slug}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex space-x-2">
                  <Link href={`/dashboard/pages/${page.id}/editor`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      data-testid={`button-edit-page-${page.id}`}
                    >
                      <EditIcon className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyPageUrl(page.slug)}
                    data-testid={`button-copy-url-${page.id}`}
                  >
                    <CopyIcon className="w-4 h-4" />
                  </Button>
                </div>
                
                {page.isPublished && (
                  <a 
                    href={`/p/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full"
                      data-testid={`button-view-page-${page.id}`}
                    >
                      <ExternalLinkIcon className="w-4 h-4 mr-2" />
                      View Page
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No pages yet</h3>
          <p className="text-muted-foreground mb-6">Create your first bio link page to get started.</p>
          {canCreatePage && (
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-page">
              Create Your First Page
            </Button>
          )}
        </div>
      )}

      {/* Upgrade CTA for free users */}
      {user?.plan === 'free' && pages && pages.length > 0 && (
        <Card className="mt-8 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2">Upgrade to Pro</h3>
                <p className="text-sm text-muted-foreground">
                  Create unlimited pages and access all premium features.
                </p>
              </div>
              <Link href="/dashboard/billing">
                <Button data-testid="button-upgrade-pages">
                  <CrownIcon className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
