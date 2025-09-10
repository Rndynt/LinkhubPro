import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BlockRenderer from "@/components/blocks";
import { XIcon } from "lucide-react";

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
  user?: {
    name: string;
    profileImageUrl?: string;
  };
}

interface CanvasProps {
  page: PageData;
  selectedBlock: Block | null;
  onBlockSelect: (block: Block | null) => void;
}

export default function Canvas({ page, selectedBlock, onBlockSelect }: CanvasProps) {
  const [draggedOver, setDraggedOver] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(null);
    // Handle block drop logic here
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver("drop-zone");
  };

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sortedBlocks = [...page.blocks].sort((a, b) => a.position - b.position);

  return (
    <div className="p-8" data-testid="canvas">
      <div className="max-w-sm mx-auto">
        {/* Phone Preview Frame */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 border border-border relative">
          {/* Page Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center">
              <Avatar className="w-16 h-16">
                <AvatarImage src={page.user?.profileImageUrl} />
                <AvatarFallback className="text-white font-bold text-lg">
                  {getUserInitials(page.user?.name || page.title)}
                </AvatarFallback>
              </Avatar>
            </div>
            <h2 className="text-lg font-semibold" data-testid="canvas-page-title">
              {page.title}
            </h2>
            {page.description && (
              <p className="text-sm text-muted-foreground" data-testid="canvas-page-description">
                {page.description}
              </p>
            )}
          </div>

          {/* Blocks Container */}
          <div className="space-y-4" id="blocks-container">
            {sortedBlocks.map((block) => (
              <div
                key={block.id}
                className={`
                  block-item group relative transition-all rounded-lg
                  ${selectedBlock?.id === block.id 
                    ? 'ring-2 ring-primary ring-offset-2' 
                    : 'hover:ring-2 hover:ring-primary/50 hover:ring-offset-1'
                  }
                `}
                onClick={() => onBlockSelect(block)}
                data-testid={`canvas-block-${block.id}`}
              >
                {/* Delete Button */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    className="w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle block deletion
                    }}
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>

                {/* Block Content */}
                <div className="pointer-events-none">
                  <BlockRenderer 
                    block={block} 
                    pageId={page.id} 
                    isPublic={false} 
                  />
                </div>
              </div>
            ))}

            {/* Drop Zone */}
            <div
              className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all
                ${draggedOver === 'drop-zone' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary hover:bg-primary/5'
                }
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setDraggedOver(null)}
              data-testid="canvas-drop-zone"
            >
              <div className="w-8 h-8 mx-auto mb-2 text-muted-foreground">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">
                {sortedBlocks.length === 0 ? "Add your first block" : "Drop blocks here"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
