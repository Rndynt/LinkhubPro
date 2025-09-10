'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  CreditCard, 
  Globe, 
  Settings,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: string;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    testId: 'link-dashboard'
  },
  {
    name: 'Pages',
    href: '/dashboard/pages',
    icon: FileText,
    testId: 'link-pages'
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    testId: 'link-analytics'
  },
  {
    name: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCard,
    testId: 'link-billing'
  },
  {
    name: 'Domains',
    href: '/dashboard/domains',
    icon: Globe,
    testId: 'link-domains'
  },
  {
    name: 'Admin',
    href: '/dashboard/admin',
    icon: Settings,
    testId: 'link-admin',
    adminOnly: true
  },
];

export function Sidebar({ isOpen = true, onClose, userRole = 'tenant' }: SidebarProps) {
  const pathname = usePathname();

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || userRole === 'admin'
  );

  return (
    <div className={cn(
      'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    )}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center space-x-3" data-testid="link-logo">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-lg">Linkhub Pro</span>
          </Link>
          
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
              data-testid="button-sidebar-close"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-4 py-4">
          <nav className="space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  data-testid={item.testId}
                  onClick={onClose}
                >
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start space-x-3',
                      isActive && 'bg-primary text-primary-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3" data-testid="sidebar-user-profile">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-accent-foreground text-sm font-semibold">J</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" data-testid="text-user-name">
                Jessica Creator
              </p>
              <p className="text-xs text-muted-foreground truncate" data-testid="text-user-plan">
                Free Plan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
