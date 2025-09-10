import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  SearchIcon,
  LinkIcon,
  MousePointerClickIcon,
  ImageIcon,
  TypeIcon,
  UserIcon,
  PhoneIcon,
  ShoppingCartIcon,
  PlayIcon,
  CalendarIcon,
  BarChartIcon,
  CrownIcon,
} from "lucide-react";

interface BlockType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  category: "basic" | "social" | "media" | "commerce" | "pro";
  description: string;
  requiresPro: boolean;
}

interface BlockLibraryProps {
  onAddBlock: (type: string) => void;
}

const blockTypes: BlockType[] = [
  // Basic Blocks
  {
    id: "link",
    name: "Link",
    icon: LinkIcon,
    category: "basic",
    description: "Simple link button",
    requiresPro: false,
  },
  {
    id: "button",
    name: "Button",
    icon: MousePointerClickIcon,
    category: "basic",
    description: "Styled action button",
    requiresPro: false,
  },
  {
    id: "image",
    name: "Image",
    icon: ImageIcon,
    category: "media",
    description: "Upload or link to image",
    requiresPro: false,
  },
  {
    id: "text",
    name: "Text",
    icon: TypeIcon,
    category: "basic",
    description: "Rich text content",
    requiresPro: false,
  },
  // Composite Basic Blocks
  {
    id: "links_block",
    name: "Links Block",
    icon: LinkIcon,
    category: "basic",
    description: "Multiple links in one block",
    requiresPro: false,
  },
  {
    id: "social_block",
    name: "Social Block",
    icon: UserIcon,
    category: "social",
    description: "Social media links",
    requiresPro: false,
  },
  {
    id: "contact_block",
    name: "Contact Block",
    icon: PhoneIcon,
    category: "basic",
    description: "Phone and WhatsApp contact",
    requiresPro: false,
  },
  // Pro Blocks
  {
    id: "product_card",
    name: "Product Card",
    icon: ShoppingCartIcon,
    category: "commerce",
    description: "Showcase products with buy buttons",
    requiresPro: true,
  },
  {
    id: "video",
    name: "Video",
    icon: PlayIcon,
    category: "media",
    description: "Embed videos from YouTube or upload",
    requiresPro: true,
  },
  {
    id: "countdown",
    name: "Countdown",
    icon: CalendarIcon,
    category: "pro",
    description: "Countdown timer to events",
    requiresPro: true,
  },
  {
    id: "dynamic_feed",
    name: "Dynamic Feed",
    icon: BarChartIcon,
    category: "pro",
    description: "RSS, Twitter, or YouTube feeds",
    requiresPro: true,
  },
];

export default function BlockLibrary({ onAddBlock }: BlockLibraryProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "All Blocks" },
    { id: "basic", name: "Basic" },
    { id: "social", name: "Social" },
    { id: "media", name: "Media" },
    { id: "commerce", name: "Commerce" },
    { id: "pro", name: "Pro" },
  ];

  const filteredBlocks = blockTypes.filter((block) => {
    const matchesSearch = block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         block.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || block.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBlockClick = (blockType: BlockType) => {
    if (blockType.requiresPro && user?.plan === 'free') {
      // Show upgrade modal or prevent action
      return;
    }
    onAddBlock(blockType.id);
  };

  return (
    <div className="h-full flex flex-col" data-testid="block-library">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold mb-2">Block Library</h2>
        <p className="text-sm text-muted-foreground mb-4">Drag blocks to your page</p>
        
        <div className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search blocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-blocks"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                data-testid={`filter-${category.id}`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {categories.map((category) => {
            if (selectedCategory !== "all" && selectedCategory !== category.id) return null;
            if (category.id === "all") return null;
            
            const categoryBlocks = filteredBlocks.filter(block => block.category === category.id);
            if (categoryBlocks.length === 0) return null;
            
            return (
              <div key={category.id}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                  {category.name}
                  {category.id === "pro" && (
                    <Badge variant="secondary" className="ml-2">
                      <CrownIcon className="w-3 h-3 mr-1" />
                      PRO
                    </Badge>
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {categoryBlocks.map((block) => {
                    const canUse = !block.requiresPro || user?.plan === 'pro';
                    const Icon = block.icon;
                    
                    return (
                      <div
                        key={block.id}
                        className={`
                          p-3 rounded-lg border-2 border-dashed transition-all cursor-pointer
                          ${canUse 
                            ? 'border-transparent hover:border-primary bg-secondary hover:bg-secondary/80' 
                            : 'border-border bg-muted/50 opacity-60 cursor-not-allowed'
                          }
                        `}
                        onClick={() => canUse && handleBlockClick(block)}
                        data-testid={`block-type-${block.id}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                          canUse ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          <Icon className={`w-4 h-4 ${canUse ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-xs font-medium ${canUse ? '' : 'text-muted-foreground'}`}>
                            {block.name}
                          </p>
                          {block.requiresPro && (
                            <CrownIcon className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{block.description}</p>
                      </div>
                    );
                  })}
                </div>
                
                {category.id === "pro" && user?.plan === 'free' && (
                  <div className="mt-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                    <p className="text-xs text-accent font-medium mb-1">Upgrade to unlock</p>
                    <Button size="sm" className="text-xs">
                      Go Pro
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
