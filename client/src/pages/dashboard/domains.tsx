import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import {
  GlobeIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  CopyIcon,
  AlertCircleIcon,
  CrownIcon,
} from "lucide-react";

interface Domain {
  id: string;
  domain: string;
  isVerified: boolean;
  sslEnabled: boolean;
  createdAt: string;
  verificationToken?: string;
}

export default function Domains() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [verificationInstructions, setVerificationInstructions] = useState<{
    domain: string;
    token: string;
  } | null>(null);

  const { data: domains, isLoading } = useQuery<Domain[]>({
    queryKey: ["/api/domains"],
    retry: false,
  });

  const addDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      const response = await apiRequest("POST", "/api/domains", { domain });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      setNewDomain("");
      setIsAddDialogOpen(false);
      setVerificationInstructions({
        domain: data.domain,
        token: data.verificationToken,
      });
      toast({
        title: "Domain added",
        description: "Domain has been added. Please verify ownership.",
      });
    },
    onError: (error: any) => {
      if (error.message.includes('upgrade_required')) {
        toast({
          title: "Upgrade Required",
          description: "Custom domains require a Pro plan subscription.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to add domain.",
          variant: "destructive",
        });
      }
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      const response = await apiRequest("POST", `/api/domains/${domainId}/verify`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      toast({
        title: "Domain verified",
        description: "Your domain has been successfully verified!",
      });
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: error.message || "Failed to verify domain. Please check your DNS settings.",
        variant: "destructive",
      });
    },
  });

  const handleAddDomain = () => {
    if (!newDomain.trim()) {
      toast({
        title: "Invalid domain",
        description: "Please enter a valid domain name.",
        variant: "destructive",
      });
      return;
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,})+$/;
    if (!domainRegex.test(newDomain)) {
      toast({
        title: "Invalid domain",
        description: "Please enter a valid domain name (e.g., example.com).",
        variant: "destructive",
      });
      return;
    }

    addDomainMutation.mutate(newDomain);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${type} copied to clipboard.`,
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Custom Domains</h1>
            <p className="text-muted-foreground">Connect your own domain to your pages</p>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8" data-testid="domains-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-domains-title">Custom Domains</h1>
          <p className="text-muted-foreground">Connect your own domain to your bio link pages</p>
        </div>
        
        {user?.plan === 'pro' ? (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-domain">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Domain
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-add-domain">
              <DialogHeader>
                <DialogTitle>Add Custom Domain</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain Name</Label>
                  <Input
                    id="domain"
                    placeholder="example.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
                    data-testid="input-domain"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your domain without http:// or https://
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    data-testid="button-cancel-domain"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddDomain}
                    disabled={addDomainMutation.isPending}
                    data-testid="button-confirm-add-domain"
                  >
                    {addDomainMutation.isPending ? "Adding..." : "Add Domain"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button disabled data-testid="button-add-domain-disabled">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Domain (Pro Only)
          </Button>
        )}
      </div>

      {/* Domains List */}
      {domains && domains.length > 0 ? (
        <div className="space-y-4">
          {domains.map((domain) => (
            <Card key={domain.id} data-testid={`domain-card-${domain.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg" data-testid={`text-domain-name-${domain.id}`}>
                    {domain.domain}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={domain.isVerified ? "default" : "secondary"}
                      data-testid={`badge-domain-status-${domain.id}`}
                    >
                      {domain.isVerified ? (
                        <>
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Verified
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-3 h-3 mr-1" />
                          Pending
                        </>
                      )}
                    </Badge>
                    {domain.sslEnabled && (
                      <Badge variant="outline">SSL</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!domain.isVerified && (
                  <Alert>
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertDescription>
                      Domain verification is pending. Follow the instructions below to verify ownership.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex space-x-2">
                  {!domain.isVerified && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => verifyDomainMutation.mutate(domain.id)}
                      disabled={verifyDomainMutation.isPending}
                      data-testid={`button-verify-domain-${domain.id}`}
                    >
                      {verifyDomainMutation.isPending ? "Verifying..." : "Verify Domain"}
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(domain.domain, "Domain")}
                    data-testid={`button-copy-domain-${domain.id}`}
                  >
                    <CopyIcon className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <GlobeIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No custom domains</h3>
          <p className="text-muted-foreground mb-6">
            Connect your own domain to create a professional presence.
          </p>
          {user?.plan === 'pro' ? (
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-domain">
              Add Your First Domain
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Custom domains require a Pro subscription.</p>
              <Button data-testid="button-upgrade-for-domains">
                <CrownIcon className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Verification Instructions Modal */}
      {verificationInstructions && (
        <Dialog 
          open={!!verificationInstructions} 
          onOpenChange={() => setVerificationInstructions(null)}
        >
          <DialogContent className="max-w-2xl" data-testid="dialog-verification-instructions">
            <DialogHeader>
              <DialogTitle>Verify Domain Ownership</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  Add the following TXT record to your domain's DNS settings to verify ownership.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Record Type</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input value="TXT" disabled className="flex-1" />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard("TXT", "Record type")}
                    >
                      <CopyIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Name/Host</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input 
                      value={`_linkhub-verification.${verificationInstructions.domain}`} 
                      disabled 
                      className="flex-1" 
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(`_linkhub-verification.${verificationInstructions.domain}`, "Name")}
                    >
                      <CopyIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Value</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input 
                      value={verificationInstructions.token} 
                      disabled 
                      className="flex-1" 
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(verificationInstructions.token, "Verification token")}
                    >
                      <CopyIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <Alert>
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  DNS changes can take up to 48 hours to propagate. You can check verification status anytime.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end">
                <Button onClick={() => setVerificationInstructions(null)}>
                  Got it
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Pro Features Notice */}
      {user?.plan === 'free' && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="text-center">
              <GlobeIcon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Professional Custom Domains</h3>
              <p className="text-muted-foreground mb-4">
                Connect your own domain, enable SSL, and create a professional brand presence with Pro.
              </p>
              <Button data-testid="button-upgrade-domains">
                <CrownIcon className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
