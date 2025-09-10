import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import BlockRenderer from "@/components/blocks";
import { ExternalLinkIcon, HeartIcon } from "lucide-react";

interface PublicPage {
  id: string;
  title: string;
  slug: string;
  description?: string;
  isPublished: boolean;
  user: {
    name: string;
    username: string;
    profileImageUrl?: string;
  };
  blocks: Array<{
    id: string;
    type: string;
    position: number;
    config: any;
    isVisible: boolean;
  }>;
}

export default function PublicPage() {
  const [, params] = useRoute("/p/:slug");
  const slug = params?.slug;
  const [viewTracked, setViewTracked] = useState(false);

  const { data: page, isLoading, error } = useQuery<PublicPage>({
    queryKey: ["/api/page", slug],
    enabled: !!slug,
    retry: false,
  });

  // Track page view
  useEffect(() => {
    if (page && !viewTracked) {
      apiRequest("POST", "/api/events", {
        pageId: page.id,
        eventType: "view",
      }).catch(console.error);
      setViewTracked(true);
    }
  }, [page, viewTracked]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLinkIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The page you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (!page.isPublished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLinkIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Page Not Available</h1>
          <p className="text-muted-foreground mb-4">
            This page is currently unpublished.
          </p>
        </div>
      </div>
    );
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const visibleBlocks = page.blocks
    .filter(block => block.isVisible)
    .sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-8" data-testid="public-page">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-border">
          {/* Profile Header */}
          <div className="text-center mb-8" data-testid="profile-header">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full p-1">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={page.user.profileImageUrl} alt={page.user.name} />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white font-bold text-xl">
                      {getUserInitials(page.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2" data-testid="page-title">
              {page.title}
            </h1>
            {page.description && (
              <p className="text-muted-foreground mb-4" data-testid="page-description">
                {page.description}
              </p>
            )}
          </div>

          {/* Blocks */}
          <div className="space-y-4 mb-8" data-testid="page-blocks">
            {visibleBlocks.map((block) => (
              <div key={block.id} data-testid={`block-${block.type}-${block.id}`}>
                <BlockRenderer 
                  block={block} 
                  pageId={page.id}
                  isPublic={true}
                />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Made with <HeartIcon className="inline w-3 h-3 text-red-500 mx-1" /> using{" "}
              <a 
                href="https://linkhub.pro" 
                className="text-primary hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Linkhub Pro
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
