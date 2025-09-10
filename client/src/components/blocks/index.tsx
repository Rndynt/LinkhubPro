import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import {
  ExternalLinkIcon,
  InstagramIcon,
  YoutubeIcon,
  PhoneIcon,
  MessageCircleIcon,
  LinkIcon,
  ImageIcon,
  ShoppingCartIcon,
  CalendarIcon,
  PlayIcon,
} from "lucide-react";

interface Block {
  id: string;
  type: string;
  position: number;
  config: any;
  isVisible: boolean;
}

interface BlockRendererProps {
  block: Block;
  pageId: string;
  isPublic?: boolean;
}

export default function BlockRenderer({ block, pageId, isPublic = false }: BlockRendererProps) {
  const [isLoading, setIsLoading] = useState(false);

  const trackClick = async (blockId: string, url?: string) => {
    if (!isPublic) return;
    
    try {
      await apiRequest("POST", "/api/events", {
        pageId,
        blockId,
        eventType: "click",
        metadata: url ? { url } : undefined,
      });
    } catch (error) {
      console.error("Failed to track click:", error);
    }
  };

  const handleLinkClick = async (url: string, blockId: string) => {
    await trackClick(blockId, url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const renderBlock = () => {
    switch (block.type) {
      case "link":
        return (
          <Button
            variant="outline"
            className="w-full p-4 h-auto text-left justify-start hover-elevate"
            onClick={() => handleLinkClick(block.config.url, block.id)}
            data-testid={`link-block-${block.id}`}
          >
            <LinkIcon className="w-5 h-5 mr-3" />
            <div>
              <div className="font-medium">{block.config.label}</div>
              {block.config.description && (
                <div className="text-sm text-muted-foreground">{block.config.description}</div>
              )}
            </div>
          </Button>
        );

      case "button":
        const buttonVariant = block.config.style === "primary" ? "default" : 
                            block.config.style === "secondary" ? "secondary" : "outline";
        return (
          <Button
            variant={buttonVariant}
            className="w-full p-4 h-auto hover-elevate"
            onClick={() => handleLinkClick(block.config.url, block.id)}
            data-testid={`button-block-${block.id}`}
          >
            {block.config.icon && <ExternalLinkIcon className="w-5 h-5 mr-2" />}
            {block.config.label}
          </Button>
        );

      case "image":
        return (
          <div className="text-center" data-testid={`image-block-${block.id}`}>
            {block.config.src ? (
              <div
                className="relative overflow-hidden rounded-lg cursor-pointer hover-elevate"
                onClick={() => block.config.clickUrl && handleLinkClick(block.config.clickUrl, block.id)}
              >
                <img
                  src={block.config.src}
                  alt={block.config.alt || "Image"}
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: block.config.maxHeight || "300px" }}
                />
                {block.config.clickUrl && (
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLinkIcon className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            {block.config.caption && (
              <p className="text-sm text-muted-foreground mt-2">{block.config.caption}</p>
            )}
          </div>
        );

      case "text":
        const alignment = block.config.align || "center";
        return (
          <div 
            className={`text-${alignment}`}
            data-testid={`text-block-${block.id}`}
            dangerouslySetInnerHTML={{ __html: block.config.content || "Your text here" }}
          />
        );

      case "links_block":
        return (
          <div className="space-y-3" data-testid={`links-block-${block.id}`}>
            {(block.config.links || []).map((link: any, index: number) => (
              <Button
                key={index}
                variant="default"
                className="w-full p-4 h-auto text-center justify-center hover-elevate shadow-lg"
                onClick={() => handleLinkClick(link.url, block.id)}
              >
                <div className="flex items-center justify-center space-x-3">
                  {link.emoji && <span className="text-xl">{link.emoji}</span>}
                  <span className="font-medium">{link.label}</span>
                </div>
              </Button>
            ))}
          </div>
        );

      case "social_block":
        return (
          <div className="flex space-x-4" data-testid={`social-block-${block.id}`}>
            {(block.config.socials || []).map((social: any, index: number) => {
              const getSocialIcon = (provider: string) => {
                switch (provider) {
                  case "instagram": return <InstagramIcon className="w-5 h-5" />;
                  case "youtube": return <YoutubeIcon className="w-5 h-5" />;
                  default: return <ExternalLinkIcon className="w-5 h-5" />;
                }
              };

              const getSocialColor = (provider: string) => {
                switch (provider) {
                  case "instagram": return "bg-gradient-to-r from-pink-500 to-orange-500";
                  case "youtube": return "bg-red-600";
                  default: return "bg-primary";
                }
              };

              return (
                <Button
                  key={index}
                  className={`flex-1 text-white hover:opacity-90 transition-opacity shadow-lg ${getSocialColor(social.provider)}`}
                  onClick={() => handleLinkClick(social.url, block.id)}
                >
                  <div className="text-center">
                    <div className="mb-1">{getSocialIcon(social.provider)}</div>
                    <div className="text-sm font-medium capitalize">{social.provider}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        );

      case "contact_block":
        return (
          <div className="space-y-3" data-testid={`contact-block-${block.id}`}>
            {block.config.phone && (
              <Button
                variant="outline"
                className="w-full p-4 h-auto justify-start hover-elevate"
                onClick={() => {
                  window.location.href = `tel:${block.config.phone}`;
                  trackClick(block.id);
                }}
              >
                <PhoneIcon className="w-5 h-5 mr-3" />
                <span>Call {block.config.phone}</span>
              </Button>
            )}
            {block.config.whatsapp_prefilled && (
              <Button
                className="w-full bg-green-600 text-white hover:bg-green-700 p-4 h-auto shadow-lg"
                onClick={() => {
                  const message = encodeURIComponent(block.config.whatsapp_prefilled);
                  const phone = block.config.phone?.replace(/[^0-9]/g, '');
                  window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
                  trackClick(block.id);
                }}
              >
                <MessageCircleIcon className="w-5 h-5 mr-3" />
                <span>WhatsApp Me</span>
              </Button>
            )}
          </div>
        );

      case "product_card":
        return (
          <Card className="hover-elevate cursor-pointer" data-testid={`product-block-${block.id}`}>
            <CardContent className="p-6">
              {block.config.image && (
                <img
                  src={block.config.image}
                  alt={block.config.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="font-semibold text-lg mb-2">{block.config.title}</h3>
              <p className="text-muted-foreground mb-4">{block.config.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  {block.config.currency || "Rp"} {block.config.price}
                </span>
                <Button
                  onClick={() => handleLinkClick(block.config.buyUrl, block.id)}
                >
                  <ShoppingCartIcon className="w-4 h-4 mr-2" />
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "video":
        return (
          <div className="relative" data-testid={`video-block-${block.id}`}>
            {block.config.videoUrl ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {block.config.videoUrl.includes("youtube.com") || block.config.videoUrl.includes("youtu.be") ? (
                  <iframe
                    src={block.config.videoUrl.replace("watch?v=", "embed/")}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={block.config.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <PlayIcon className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            {block.config.title && (
              <h3 className="font-semibold text-center mt-3">{block.config.title}</h3>
            )}
          </div>
        );

      case "countdown":
        return (
          <Card data-testid={`countdown-block-${block.id}`}>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-lg mb-4">{block.config.title}</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                {["Days", "Hours", "Minutes", "Seconds"].map((unit, index) => (
                  <div key={unit} className="bg-primary/10 rounded-lg p-3">
                    <div className="text-2xl font-bold text-primary">00</div>
                    <div className="text-xs text-muted-foreground">{unit}</div>
                  </div>
                ))}
              </div>
              {block.config.targetDate && (
                <p className="text-sm text-muted-foreground mt-4">
                  Until {new Date(block.config.targetDate).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground">
                Unknown block type: {block.type}
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="block-renderer" data-block-type={block.type}>
      {renderBlock()}
    </div>
  );
}
