import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SettingsIcon, PlusIcon, TrashIcon } from "lucide-react";

interface Block {
  id: string;
  type: string;
  position: number;
  config: any;
  isVisible: boolean;
}

interface ConfigPanelProps {
  selectedBlock: Block | null;
  onBlockUpdate: (blockId: string, updates: Partial<Block>) => void;
}

export default function ConfigPanel({ selectedBlock, onBlockUpdate }: ConfigPanelProps) {
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    if (selectedBlock) {
      setConfig(selectedBlock.config || {});
    }
  }, [selectedBlock]);

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    if (selectedBlock) {
      onBlockUpdate(selectedBlock.id, { config: newConfig });
    }
  };

  const handleArrayAdd = (key: string, defaultItem: any) => {
    const currentArray = config[key] || [];
    handleConfigChange(key, [...currentArray, defaultItem]);
  };

  const handleArrayUpdate = (key: string, index: number, updates: any) => {
    const currentArray = [...(config[key] || [])];
    currentArray[index] = { ...currentArray[index], ...updates };
    handleConfigChange(key, currentArray);
  };

  const handleArrayRemove = (key: string, index: number) => {
    const currentArray = [...(config[key] || [])];
    currentArray.splice(index, 1);
    handleConfigChange(key, currentArray);
  };

  if (!selectedBlock) {
    return (
      <div className="h-full flex flex-col" data-testid="config-panel-empty">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Block Settings</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <SettingsIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Select a block to edit its settings
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderConfigFields = () => {
    switch (selectedBlock.type) {
      case "link":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Link Text</Label>
              <Input
                id="label"
                value={config.label || ""}
                onChange={(e) => handleConfigChange("label", e.target.value)}
                placeholder="Enter link text"
              />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={config.url || ""}
                onChange={(e) => handleConfigChange("url", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={config.description || ""}
                onChange={(e) => handleConfigChange("description", e.target.value)}
                placeholder="Brief description"
              />
            </div>
          </div>
        );

      case "button":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Button Text</Label>
              <Input
                id="label"
                value={config.label || ""}
                onChange={(e) => handleConfigChange("label", e.target.value)}
                placeholder="Click Me"
              />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={config.url || ""}
                onChange={(e) => handleConfigChange("url", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="style">Button Style</Label>
              <Select value={config.style || "primary"} onValueChange={(value) => handleConfigChange("style", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "image":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="src">Image URL</Label>
              <Input
                id="src"
                value={config.src || ""}
                onChange={(e) => handleConfigChange("src", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={config.alt || ""}
                onChange={(e) => handleConfigChange("alt", e.target.value)}
                placeholder="Describe the image"
              />
            </div>
            <div>
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input
                id="caption"
                value={config.caption || ""}
                onChange={(e) => handleConfigChange("caption", e.target.value)}
                placeholder="Image caption"
              />
            </div>
            <div>
              <Label htmlFor="clickUrl">Click URL (optional)</Label>
              <Input
                id="clickUrl"
                value={config.clickUrl || ""}
                onChange={(e) => handleConfigChange("clickUrl", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
        );

      case "text":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Text Content</Label>
              <Textarea
                id="content"
                value={config.content || ""}
                onChange={(e) => handleConfigChange("content", e.target.value)}
                placeholder="Enter your text here"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="align">Text Alignment</Label>
              <Select value={config.align || "center"} onValueChange={(value) => handleConfigChange("align", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "links_block":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Links</Label>
              <Button
                size="sm"
                onClick={() => handleArrayAdd("links", { label: "", url: "", emoji: "" })}
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Link
              </Button>
            </div>
            {(config.links || []).map((link: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Link {index + 1}</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleArrayRemove("links", index)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <Label>Label</Label>
                    <Input
                      value={link.label || ""}
                      onChange={(e) => handleArrayUpdate("links", index, { label: e.target.value })}
                      placeholder="Link name"
                    />
                  </div>
                  <div>
                    <Label>URL</Label>
                    <Input
                      value={link.url || ""}
                      onChange={(e) => handleArrayUpdate("links", index, { url: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label>Emoji (optional)</Label>
                    <Input
                      value={link.emoji || ""}
                      onChange={(e) => handleArrayUpdate("links", index, { emoji: e.target.value })}
                      placeholder="📚"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "social_block":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Social Links</Label>
              <Button
                size="sm"
                onClick={() => handleArrayAdd("socials", { provider: "instagram", url: "" })}
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Social
              </Button>
            </div>
            {(config.socials || []).map((social: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Social {index + 1}</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleArrayRemove("socials", index)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <Label>Platform</Label>
                    <Select
                      value={social.provider || "instagram"}
                      onValueChange={(value) => handleArrayUpdate("socials", index, { provider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>URL</Label>
                    <Input
                      value={social.url || ""}
                      onChange={(e) => handleArrayUpdate("socials", index, { url: e.target.value })}
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "contact_block":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={config.phone || ""}
                onChange={(e) => handleConfigChange("phone", e.target.value)}
                placeholder="+628123456789"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp_prefilled">WhatsApp Message</Label>
              <Textarea
                id="whatsapp_prefilled"
                value={config.whatsapp_prefilled || ""}
                onChange={(e) => handleConfigChange("whatsapp_prefilled", e.target.value)}
                placeholder="Hi, I'm interested in..."
                rows={3}
              />
            </div>
          </div>
        );

      case "product_card":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Product Title</Label>
              <Input
                id="title"
                value={config.title || ""}
                onChange={(e) => handleConfigChange("title", e.target.value)}
                placeholder="Product Name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description || ""}
                onChange={(e) => handleConfigChange("description", e.target.value)}
                placeholder="Product description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={config.price || ""}
                onChange={(e) => handleConfigChange("price", e.target.value)}
                placeholder="99000"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={config.currency || "Rp"}
                onChange={(e) => handleConfigChange("currency", e.target.value)}
                placeholder="Rp"
              />
            </div>
            <div>
              <Label htmlFor="buyUrl">Buy URL</Label>
              <Input
                id="buyUrl"
                value={config.buyUrl || ""}
                onChange={(e) => handleConfigChange("buyUrl", e.target.value)}
                placeholder="https://shop.example.com/product"
              />
            </div>
            <div>
              <Label htmlFor="image">Product Image URL</Label>
              <Input
                id="image"
                value={config.image || ""}
                onChange={(e) => handleConfigChange("image", e.target.value)}
                placeholder="https://example.com/product.jpg"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No configuration available for this block type.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col" data-testid="config-panel">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Block Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Editing: {selectedBlock.type.replace("_", " ")}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {renderConfigFields()}
          
          <Separator />
          
          {/* Block Visibility */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Block Visible</Label>
              <p className="text-sm text-muted-foreground">
                Toggle block visibility
              </p>
            </div>
            <Switch
              checked={selectedBlock.isVisible}
              onCheckedChange={(checked) => onBlockUpdate(selectedBlock.id, { isVisible: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
