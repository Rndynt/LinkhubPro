'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, CreditCard, Calendar, Download } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  billingInterval: string;
  features: Record<string, any>;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface User {
  plan: string;
  subscriptionEnd?: string;
}

export default function BillingPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [user, setUser] = useState<User>({ plan: 'free' });
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
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

      // Fetch packages
      const packagesResponse = await fetch('/api/packages', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json();
        setPackages(packagesData.packages || []);
      }

      // Fetch user payments
      const paymentsResponse = await fetch('/api/payments', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData.payments || []);
      }

      // Fetch user info
      const userResponse = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser({
          plan: userData.user.plan,
          subscriptionEnd: userData.subscription?.currentPeriodEnd,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load billing data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (packageId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ packageId }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Midtrans payment page
        // In a real implementation, you would use Midtrans SDK
        toast({
          title: 'Payment initiated',
          description: 'Redirecting to payment gateway...',
        });
        
        // Mock payment success for demo
        setTimeout(() => {
          toast({
            title: 'Payment successful!',
            description: 'Your account has been upgraded to Pro',
          });
          fetchBillingData();
        }, 2000);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initiate payment',
        variant: 'destructive',
      });
    }
  };

  const formatPrice = (cents: number, currency: string) => {
    if (currency === 'IDR') {
      return `Rp ${(cents).toLocaleString('id-ID')}`;
    }
    return `${currency} ${(cents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <Sidebar userRole="tenant" />
          <div className="flex-1 flex flex-col">
            <Header 
              title="Billing" 
              subtitle="Loading..."
              onMenuClick={() => setSidebarOpen(true)}
            />
            <main className="flex-1 p-6">
              <div className="animate-pulse space-y-6">
                <div className="h-32 bg-muted rounded-xl"></div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="h-64 bg-muted rounded-xl"></div>
                  <div className="h-64 bg-muted rounded-xl"></div>
                </div>
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
            title="Billing" 
            subtitle="Manage your subscription and payments"
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="flex-1 overflow-auto p-6 space-y-8">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-bold capitalize" data-testid="current-plan">
                        {user.plan} Plan
                      </h3>
                      <Badge variant={user.plan === 'pro' ? 'default' : 'secondary'}>
                        {user.plan === 'pro' ? 'Active' : 'Free'}
                      </Badge>
                    </div>
                    {user.plan === 'pro' && user.subscriptionEnd && (
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Renews on {new Date(user.subscriptionEnd).toLocaleDateString()}
                      </p>
                    )}
                    {user.plan === 'free' && (
                      <p className="text-sm text-muted-foreground">
                        Limited to 1 page and basic features
                      </p>
                    )}
                  </div>
                  {user.plan === 'free' && (
                    <Button data-testid="button-upgrade-now">
                      Upgrade Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing Plans */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {packages.map((pkg) => (
                  <Card key={pkg.id} className={pkg.name.toLowerCase() === 'pro' ? 'border-primary' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{pkg.name}</CardTitle>
                        {pkg.name.toLowerCase() === 'pro' && (
                          <Badge>Most Popular</Badge>
                        )}
                      </div>
                      <div className="text-3xl font-bold" data-testid={`price-${pkg.name.toLowerCase()}`}>
                        {pkg.priceCents === 0 ? 'Free' : formatPrice(pkg.priceCents, pkg.currency)}
                        {pkg.priceCents > 0 && (
                          <span className="text-lg font-normal text-muted-foreground">
                            /{pkg.billingInterval}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {pkg.name.toLowerCase() === 'free' ? (
                          <>
                            <li className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-sm">1 Bio Page</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-sm">Basic Blocks</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-sm">Basic Analytics</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-sm">Linkhub Branding</span>
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-primary" />
                              <span className="text-sm">Unlimited Bio Pages</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-primary" />
                              <span className="text-sm">All Block Types (20+ blocks)</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-primary" />
                              <span className="text-sm">Advanced Analytics</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-primary" />
                              <span className="text-sm">Custom Domain</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-primary" />
                              <span className="text-sm">Remove Linkhub Branding</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-primary" />
                              <span className="text-sm">Priority Support</span>
                            </li>
                          </>
                        )}
                      </ul>
                      
                      <Button 
                        className="w-full"
                        variant={pkg.name.toLowerCase() === 'pro' ? 'default' : 'outline'}
                        disabled={user.plan === pkg.name.toLowerCase()}
                        onClick={() => handleUpgrade(pkg.id)}
                        data-testid={`button-select-${pkg.name.toLowerCase()}`}
                      >
                        {user.plan === pkg.name.toLowerCase() 
                          ? 'Current Plan' 
                          : pkg.priceCents === 0 
                            ? 'Current Plan' 
                            : 'Upgrade to Pro'
                        }
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Payment History */}
            {payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {formatPrice(payment.amount, payment.currency)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={payment.status === 'completed' ? 'default' : 'secondary'}
                            data-testid={`payment-status-${payment.id}`}
                          >
                            {payment.status}
                          </Badge>
                          <Button size="icon" variant="ghost" data-testid={`download-invoice-${payment.id}`}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
