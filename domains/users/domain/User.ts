export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: 'admin' | 'tenant';
  plan: 'admin' | 'free' | 'pro';
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  username: string;
  name: string;
  password: string;
  role?: 'admin' | 'tenant';
  plan?: 'admin' | 'free' | 'pro';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  username?: string;
  plan?: 'admin' | 'free' | 'pro';
  profileImageUrl?: string;
}
