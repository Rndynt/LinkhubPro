import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BlockLibrary from "@/components/editor/BlockLibrary";
import Canvas from "@/components/editor/Canvas";
import ConfigPanel from "@/components/editor/ConfigPanel";
import { ArrowLeftIcon, EyeIcon, SaveIcon } from "lucide-react";

interface Block {
  id: string;
  type: string;
  position: number;
  config: any;
  isVisible: boolean;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  isPublished: boolean;
  blocks: Block[];
}

export default function Editor() {
  const [, params] = useRoute("/dashboard/pages/:id/editor");
  const pageId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: page, isLoading } = useQuery<PageData>({
    queryKey: ["/api/pages", pageId],
    enabled: !!pageId,
    retry: false,
  });

  const updatePageMutation = useMutation({
    mutationFn: async (updates: Partial<PageData>) => {
      const response = await apiRequest("PUT", `/api/pages/${pageId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages", pageId] });
      setHasUnsavedChanges(false);
      toast({
        title: "Page updated",
        description: "Your changes have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update page.",
        variant: "destructive",
      });
    },
  });

  const createBlockMutation = useMutation({
    mutationFn: async (blockData: { type: string; position: number; config: any }) => {
      const response = await apiRequest("POST", `/api/pages/${pageId}/blocks`, blockData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages", pageId] });
      toast({
        title: "Block added",
        description: "New block has been added to your page.",
      });
    },
    onError: (error: any) => {
      if (error.message.includes('upgrade_required')) {
        toast({
          title: "Upgrade Required",
          description: "This block requires a Pro plan subscription.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to add block.",
          variant: "destructive",
        });
      }
    },
  });

  const handleSave = () => {
    if (!page) return;
    updatePageMutation.mutate({
      title: page.title,
      description: page.description,
      isPublished: page.isPublished,
    });
  };

  const handlePublishToggle = () => {
    if (!page) return;
    updatePageMutation.mutate({
      isPublished: !page.isPublished,
    });
  };

  const handleAddBlock = (type: string) => {
    if (!page) return;
    const nextPosition = Math.max(...(page.blocks?.map(b => b.position) || [0])) + 1;
    createBlockMutation.mutate({
      type,
      position: nextPosition,
      config: getDefaultBlockConfig(type),
    });
  };

  const getDefaultBlockConfig = (type: string) => {
    switch (type) {
      case 'link':
        return { label: 'New Link', url: 'https://example.com' };
      case 'button':
        return { label: 'Click Me', url: 'https://example.com', style: 'primary' };
      case 'image':
        return { src: '', alt: 'Image', width: '100%' };
      case 'text':
        return { content: 'Your text here', align: 'center' };
      case 'social_block':
        return { socials: [{ provider: 'instagram', url: '' }] };
      case 'links_block':
        return { links: [{ label: 'New Link', url: '' }] };
      case 'contact_block':
        return { phone: '', whatsapp_prefilled: '' };
      default:
        return {};
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Page not found</h3>
          <p className="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p>
          <Link href="/dashboard/pages">
            <Button>Back to Pages</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background" data-testid="editor-page">
      {/* Left Sidebar - Block Library */}
      <div className="w-80 border-r border-border bg-card">
        <BlockLibrary onAddBlock={handleAddBlock} />
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/pages">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeftIcon className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold" data-testid="text-page-title">
                  {page.title}
                </h1>
                <p className="text-sm text-muted-foreground" data-testid="text-page-url">
                  linkhub.pro/{page.slug}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Label htmlFor="published">Published</Label>
                <Switch
                  id="published"
                  checked={page.isPublished}
                  onCheckedChange={handlePublishToggle}
                  disabled={updatePageMutation.isPending}
                  data-testid="switch-published"
                />
              </div>
              {page.isPublished && (
                <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" data-testid="button-preview">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </a>
              )}
              <Button
                onClick={handleSave}
                disabled={updatePageMutation.isPending || !hasUnsavedChanges}
                data-testid="button-save"
              >
                <SaveIcon className="w-4 h-4 mr-2" />
                {updatePageMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-muted/20">
          <Canvas 
            page={page} 
            selectedBlock={selectedBlock}
            onBlockSelect={setSelectedBlock}
          />
        </div>
      </div>

      {/* Right Sidebar - Config Panel */}
      <div className="w-80 border-l border-border bg-card">
        <ConfigPanel 
          selectedBlock={selectedBlock}
          onBlockUpdate={(blockId, updates) => {
            // Handle block updates here
            setHasUnsavedChanges(true);
          }}
        />
      </div>
    </div>
  );
}
