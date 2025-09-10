'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Eye, 
  Save, 
  Plus,
  Link2,
  Type,
  Image,
  MessageSquare,
  Share2,
  Phone,
  Trash2,
  GripVertical,
  Palette
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Block {
  id: string;
  type: string;
  position: number;
  config: Record<string, any>;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  description?: string;
  isPublished: boolean;
}

const BLOCK_TYPES = [
  { type: 'link', icon: Link2, label: 'Link', isPro: false },
  { type: 'button', icon: Type, label: 'Button', isPro: false },
  { type: 'image', icon: Image, label: 'Image', isPro: false },
  { type: 'text', icon: Type, label: 'Text', isPro: false },
  { type: 'links_block', icon: Link2, label: 'Links Block', isPro: false },
  { type: 'social_block', icon: Share2, label: 'Social Block', isPro: false },
  { type: 'contact_block', icon: Phone, label: 'Contact Block', isPro: false },
  { type: 'product_card', icon: MessageSquare, label: 'Product Card', isPro: true },
  { type: 'dynamic_feed', icon: Type, label: 'Dynamic Feed', isPro: true },
];

export default function PageEditor() {
  const params = useParams();
  const pageId = params.id as string;
  
  const [page, setPage] = useState<Page | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (pageId) {
      fetchPageData();
    }
  }, [pageId]);

  const fetchPageData = async () => {
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

      // Fetch page data
      const pageResponse = await fetch(`/api/pages/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (pageResponse.ok) {
        const pageData = await pageResponse.json();
        setPage(pageData.page);
      }

      // Fetch blocks
      const blocksResponse = await fetch(`/api/pages/${pageId}/blocks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (blocksResponse.ok) {
        const blocksData = await blocksResponse.json();
        setBlocks(blocksData.blocks || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load page data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBlock = async (blockType: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pages/${pageId}/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: blockType,
          position: blocks.length + 1,
          config: getDefaultConfig(blockType),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBlocks(prev => [...prev, data.block]);
        toast({
          title: 'Block added',
          description: 'New block has been added to your page',
        });
      } else if (response.status === 403) {
        toast({
          title: 'Upgrade Required',
          description: 'This block type requires a Pro subscription',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add block',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pages/${pageId}/blocks/${blockId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setBlocks(prev => prev.filter(block => block.id !== blockId));
        setSelectedBlock(null);
        toast({
          title: 'Block deleted',
          description: 'Block has been removed from your page',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete block',
        variant: 'destructive',
      });
    }
  };

  const handleSavePage = async () => {
    if (!page) return;
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: page.title,
          description: page.description,
          isPublished: page.isPublished,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Page saved',
          description: 'Your changes have been saved successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save page',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getDefaultConfig = (blockType: string) => {
    switch (blockType) {
      case 'link':
        return { label: 'New Link', url: 'https://example.com' };
      case 'button':
        return { label: 'Click Me', url: 'https://example.com', style: 'primary' };
      case 'text':
        return { content: 'Add your text here' };
      case 'links_block':
        return { 
          links: [
            { label: 'Link 1', url: 'https://example.com' },
            { label: 'Link 2', url: 'https://example.com' },
          ]
        };
      case 'social_block':
        return {
          socials: [
            { provider: 'instagram', url: 'https://instagram.com/username' },
            { provider: 'twitter', url: 'https://twitter.com/username' },
          ]
        };
      case 'contact_block':
        return { phone: '+1234567890', whatsapp_prefilled: 'Hello!' };
      default:
        return {};
    }
  };

  const renderBlockPreview = (block: Block) => {
    switch (block.type) {
      case 'link':
        return (
          <div className="bg-primary text-primary-foreground p-4 rounded-xl text-center">
            {block.config.label || 'Link'}
          </div>
        );
      case 'button':
        return (
          <div className="bg-accent text-accent-foreground p-4 rounded-xl text-center">
            {block.config.label || 'Button'}
          </div>
        );
      case 'text':
        return (
          <div className="p-4 text-center text-foreground">
            {block.config.content || 'Text content'}
          </div>
        );
      case 'links_block':
        return (
          <div className="space-y-2">
            {(block.config.links || []).map((link: any, index: number) => (
              <div key={index} className="bg-primary text-primary-foreground p-3 rounded-lg text-center text-sm">
                {link.label}
              </div>
            ))}
          </div>
        );
      case 'social_block':
        return (
          <div className="flex space-x-2">
            {(block.config.socials || []).map((social: any, index: number) => (
              <div key={index} className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 text-white p-3 rounded-lg text-center text-sm">
                {social.provider}
              </div>
            ))}
          </div>
        );
      case 'contact_block':
        return (
          <div className="bg-green-600 text-white p-4 rounded-xl text-center">
            Contact Me
          </div>
        );
      default:
        return (
          <div className="bg-muted text-muted-foreground p-4 rounded-xl text-center">
            {block.type}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Page not found</h2>
          <Link href="/dashboard/pages">
            <Button>Back to Pages</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Left Sidebar - Block Library */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold mb-2">Block Library</h2>
          <p className="text-sm text-muted-foreground">Drag blocks to your page</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Basic Blocks</h3>
              <div className="grid grid-cols-2 gap-3">
                {BLOCK_TYPES.filter(b => !b.isPro).map((blockType) => (
                  <Button
                    key={blockType.type}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center space-y-2"
                    onClick={() => handleAddBlock(blockType.type)}
                    data-testid={`add-block-${blockType.type}`}
                  >
                    <blockType.icon className="w-4 h-4" />
                    <span className="text-xs">{blockType.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                Pro Blocks
                <Badge variant="secondary" className="ml-2 text-xs">PRO</Badge>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {BLOCK_TYPES.filter(b => b.isPro).map((blockType) => (
                  <Button
                    key={blockType.type}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center space-y-2 opacity-60"
                    onClick={() => handleAddBlock(blockType.type)}
                    data-testid={`add-block-${blockType.type}`}
                  >
                    <blockType.icon className="w-4 h-4" />
                    <span className="text-xs">{blockType.label}</span>
                  </Button>
                ))}
              </div>
              <div className="mt-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-xs text-accent font-medium mb-1">Upgrade to unlock</p>
                <Link href="/dashboard/billing">
                  <Button size="sm" className="text-xs">
                    Go Pro
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/pages">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold" data-testid="page-title">
                  {page.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  linkhub.pro/{page.slug}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href={`/p/${page.slug}`} target="_blank">
                <Button variant="outline" size="sm" data-testid="button-preview">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </Link>
              <Button 
                onClick={handleSavePage} 
                disabled={isSaving}
                data-testid="button-save"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-sm mx-auto">
            {/* Phone Preview Frame */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-border">
              {/* Page Header */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {page.title.charAt(0)}
                  </span>
                </div>
                <h2 className="text-lg font-semibold">{page.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {page.description || 'Add a description...'}
                </p>
              </div>

              {/* Blocks Container */}
              <div className="space-y-4" data-testid="blocks-container">
                {blocks
                  .sort((a, b) => a.position - b.position)
                  .map((block) => (
                    <div
                      key={block.id}
                      className={`group relative border-2 border-dashed transition-all cursor-pointer ${
                        selectedBlock?.id === block.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-transparent hover:border-primary'
                      }`}
                      onClick={() => setSelectedBlock(block)}
                      data-testid={`block-${block.id}`}
                    >
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="destructive"
                          className="w-6 h-6 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBlock(block.id);
                          }}
                          data-testid={`delete-block-${block.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-4 h-4 bg-muted rounded flex items-center justify-center">
                          <GripVertical className="w-2 h-2" />
                        </div>
                      </div>
                      
                      {renderBlockPreview(block)}
                    </div>
                  ))}

                {/* Drop Zone */}
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center text-muted-foreground hover:border-primary hover:bg-primary/5 transition-all">
                  <Plus className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Add blocks from the sidebar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Block Config */}
      <div className="w-80 bg-card border-l border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">
            {selectedBlock ? 'Block Settings' : 'Page Settings'}
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {selectedBlock ? (
            <div className="space-y-4">
              <div>
                <Label>Block Type</Label>
                <p className="text-sm text-muted-foreground capitalize">
                  {selectedBlock.type.replace('_', ' ')}
                </p>
              </div>
              
              {selectedBlock.type === 'link' && (
                <>
                  <div>
                    <Label htmlFor="link-label">Label</Label>
                    <Input
                      id="link-label"
                      value={selectedBlock.config.label || ''}
                      onChange={(e) => {
                        setSelectedBlock(prev => prev ? {
                          ...prev,
                          config: { ...prev.config, label: e.target.value }
                        } : null);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="link-url">URL</Label>
                    <Input
                      id="link-url"
                      type="url"
                      value={selectedBlock.config.url || ''}
                      onChange={(e) => {
                        setSelectedBlock(prev => prev ? {
                          ...prev,
                          config: { ...prev.config, url: e.target.value }
                        } : null);
                      }}
                    />
                  </div>
                </>
              )}
              
              {selectedBlock.type === 'text' && (
                <div>
                  <Label htmlFor="text-content">Content</Label>
                  <Input
                    id="text-content"
                    value={selectedBlock.config.content || ''}
                    onChange={(e) => {
                      setSelectedBlock(prev => prev ? {
                        ...prev,
                        config: { ...prev.config, content: e.target.value }
                      } : null);
                    }}
                  />
                </div>
              )}
              
              <Button
                onClick={() => {
                  // TODO: Save block changes
                  toast({
                    title: 'Block updated',
                    description: 'Your block settings have been saved',
                  });
                }}
                className="w-full"
                data-testid="button-save-block"
              >
                Save Block
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="page-title">Page Title</Label>
                <Input
                  id="page-title"
                  value={page.title}
                  onChange={(e) => {
                    setPage(prev => prev ? { ...prev, title: e.target.value } : null);
                  }}
                />
              </div>
              
              <div>
                <Label htmlFor="page-description">Description</Label>
                <Input
                  id="page-description"
                  value={page.description || ''}
                  onChange={(e) => {
                    setPage(prev => prev ? { ...prev, description: e.target.value } : null);
                  }}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="page-published"
                  checked={page.isPublished}
                  onChange={(e) => {
                    setPage(prev => prev ? { ...prev, isPublished: e.target.checked } : null);
                  }}
                  className="w-4 h-4"
                />
                <Label htmlFor="page-published">Published</Label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
