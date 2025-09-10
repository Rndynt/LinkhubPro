import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import {
  CheckIcon,
  CrownIcon,
  CreditCardIcon,
  CalendarIcon,
  ReceiptIcon,
} from "lucide-react";

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  package: {
    id: string;
    name: string;
    priceCents: number;
    billingInterval: string;
  };
}

interface Payment {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  paidAt: string;
}

export default function Billing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const { data: subscription } = useQuery<Subscription>({
    queryKey: ["/api/billing/subscription"],
    retry: false,
  });

  const { data: payments } = useQuery<Payment[]>({
    queryKey: ["/api/billing/payments"],
    retry: false,
  });

  const createCheckoutMutation = useMutation({
    mutationFn: async (planData: { packageId: string }) => {
      const response = await apiRequest("POST", "/api/payments/create-checkout", planData);
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Midtrans checkout
      window.open(data.redirectUrl, '_blank');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session.",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = () => {
    const packageId = billingInterval === 'yearly' ? 'pkg-pro-yearly' : 'pkg-pro';
    createCheckoutMutation.mutate({ packageId });
  };

  const formatCurrency = (cents: number, currency = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(cents);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 space-y-8" data-testid="billing-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2" data-testid="text-billing-title">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan */}
      <Card data-testid="card-current-plan">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              {user?.plan === 'pro' && <CrownIcon className="w-5 h-5 text-yellow-500" />}
              <span>Current Plan</span>
            </CardTitle>
            <Badge 
              variant={user?.plan === 'pro' ? 'default' : 'secondary'}
              data-testid="badge-current-plan"
            >
              {user?.plan === 'pro' ? 'Pro' : 'Free'} Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.plan === 'free' ? (
            <div>
              <p className="text-muted-foreground mb-4">
                You're currently on the free plan. Upgrade to unlock all features.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                  <span>1 Bio Page</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                  <span>Basic Blocks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                  <span>Basic Analytics</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground mb-4">
                You have full access to all Pro features.
              </p>
              {subscription && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge variant="default">{subscription.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Next billing date:</span>
                    <span>{formatDate(subscription.currentPeriodEnd)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Amount:</span>
                    <span>{formatCurrency(subscription.package.priceCents)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Section - Only show for free users */}
      {user?.plan === 'free' && (
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-4">
            <Label htmlFor="billing-toggle">Monthly</Label>
            <Switch
              id="billing-toggle"
              checked={billingInterval === 'yearly'}
              onCheckedChange={(checked) => setBillingInterval(checked ? 'yearly' : 'monthly')}
              data-testid="switch-billing-interval"
            />
            <Label htmlFor="billing-toggle">
              Yearly <Badge variant="secondary" className="ml-1">Save 2 months</Badge>
            </Label>
          </div>

          <Card className="border-primary bg-gradient-to-r from-primary/5 to-accent/5" data-testid="card-pro-plan">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-center justify-center">
                <CrownIcon className="w-6 h-6 text-yellow-500" />
                <span>Pro Plan</span>
              </CardTitle>
              <div className="text-center">
                <div className="text-4xl font-bold">
                  {formatCurrency(billingInterval === 'yearly' ? 420000 : 35000)}
                </div>
                <p className="text-muted-foreground">
                  per {billingInterval === 'yearly' ? 'year' : 'month'}
                </p>
                {billingInterval === 'yearly' && (
                  <p className="text-sm text-green-600 font-medium">Save Rp 70,000 per year</p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                  <span>Unlimited Bio Pages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                  <span>All Block Types (20+)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                  <span>Advanced Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                  <span>Custom Domain</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                  <span>Remove Branding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                  <span>Priority Support</span>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleUpgrade}
                disabled={createCheckoutMutation.isPending}
                data-testid="button-upgrade-to-pro"
              >
                <CrownIcon className="w-4 h-4 mr-2" />
                {createCheckoutMutation.isPending ? "Processing..." : "Upgrade to Pro"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment History */}
      <Card data-testid="card-payment-history">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ReceiptIcon className="w-5 h-5" />
            <span>Payment History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div 
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  data-testid={`payment-${payment.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CreditCardIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {formatCurrency(payment.amountCents, payment.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.paidAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={payment.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {payment.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <ReceiptIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCardIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payment history yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
