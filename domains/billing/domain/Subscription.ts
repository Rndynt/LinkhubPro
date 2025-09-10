export interface Subscription {
  id: string;
  userId: string;
  packageId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Package {
  id: string;
  handle: string;
  name: string;
  priceCents: number;
  currency: string;
  billingInterval: string;
  features: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  externalId?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentData {
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  externalId?: string;
  metadata?: Record<string, any>;
}
