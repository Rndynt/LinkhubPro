'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Globe, CheckCircle, XCircle, AlertCircle, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Domain {
  id: string;
  domain: string;
  isVerified: boolean;
  verificationToken?: string;
  dnsInstructions?: string;
  createdAt: string;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
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

      const response = await fetch('/api/domains', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDomains(data.domains || []);
      } else if (response.status === 401) {
        toast({
          title: 'Session expired',
          description: 'Please log in again',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load domains',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a domain name',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ domain: newDomain.trim().toLowerCase() }),
      });

      if (response.ok) {
        const data = await response.json();
        setDomains(prev => [...prev, data.domain]);
        setNewDomain('');
        setShowAddDialog(false);
        toast({
          title: 'Domain added',
          description: 'Your domain has been added. Please verify it by adding the DNS record.',
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to add domain',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add domain',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/domains/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ domainId }),
      });

      if (response.ok) {
        toast({
          title: 'Verification initiated',
          description: 'We are checking your DNS records. This may take a few minutes.',
        });
        
        // Refresh domains after a delay
        setTimeout(() => {
          fetchDomains();
        }, 2000);
      } else {
        const data = await response.json();
        toast({
          title: 'Verification failed',
          description: data.error || 'Please check your DNS settings and try again',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify domain',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'DNS record copied to clipboard',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <Sidebar userRole="tenant" />
          <div className="flex-1 flex flex-col">
            <Header 
              title="Domains" 
              subtitle="Loading..."
              onMenuClick={() => setSidebarOpen(true)}
            />
            <main className="flex-1 p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-xl"></div>
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
            title="Domains" 
            subtitle="Connect your custom domain"
            actions={
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-domain">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Domain
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Custom Domain</DialogTitle>
                    <DialogDescription>
                      Enter your custom domain name to connect it to your Linkhub Pro pages.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="domain">Domain Name</Label>
                      <Input
                        id="domain"
                        placeholder="example.com"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        data-testid="input-domain"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter without http:// or www.
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddDomain} 
                        disabled={isAdding}
                        data-testid="button-confirm-add-domain"
                      >
                        {isAdding ? 'Adding...' : 'Add Domain'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            }
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="flex-1 overflow-auto p-6">
            {/* Pro feature notice */}
            <Card className="mb-6 border-accent">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Custom Domains</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Connect your own domain to your Linkhub Pro pages for better branding.
                    </p>
                    <Badge variant="secondary">Pro Feature</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {domains.length > 0 ? (
              <div className="space-y-4">
                {domains.map((domain) => (
                  <Card key={domain.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Globe className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold" data-testid={`domain-${domain.id}`}>
                              {domain.domain}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Added {new Date(domain.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={domain.isVerified ? "default" : "destructive"}
                            data-testid={`domain-status-${domain.id}`}
                          >
                            {domain.isVerified ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Pending
                              </>
                            )}
                          </Badge>
                          
                          {!domain.isVerified && (
                            <Button 
                              size="sm" 
                              onClick={() => handleVerifyDomain(domain.id)}
                              data-testid={`button-verify-${domain.id}`}
                            >
                              Verify
                            </Button>
                          )}
                        </div>
                      </div>

                      {!domain.isVerified && (
                        <div className="border-t pt-4">
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <div className="flex items-start space-x-2 mb-3">
                              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-medium mb-1">DNS Configuration Required</h4>
                                <p className="text-sm text-muted-foreground">
                                  Add the following DNS record to verify your domain:
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-sm font-mono bg-card p-3 rounded border">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Type:</span>
                                <span>CNAME</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <div className="flex items-center space-x-2">
                                  <span>{domain.domain}</span>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6"
                                    onClick={() => copyToClipboard(domain.domain)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Value:</span>
                                <div className="flex items-center space-x-2">
                                  <span>linkhub.pro</span>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6"
                                    onClick={() => copyToClipboard('linkhub.pro')}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mt-2">
                              DNS changes can take up to 24 hours to propagate. Once configured, click "Verify" to check the status.
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No custom domains</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Connect your own domain to make your link-in-bio pages more professional and branded.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => setShowAddDialog(true)}
                  data-testid="button-add-first-domain"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Domain
                </Button>
              </div>
            )}

            {/* Help section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">How to configure DNS:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Log in to your domain registrar's control panel</li>
                      <li>Navigate to DNS management or DNS records</li>
                      <li>Add a new CNAME record with the values shown above</li>
                      <li>Save the changes and wait for propagation</li>
                      <li>Click "Verify" to confirm the setup</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Common issues:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>DNS changes can take up to 24 hours to propagate</li>
                      <li>Make sure there are no conflicting A or CNAME records</li>
                      <li>Some registrars require you to omit the root domain from the Name field</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
