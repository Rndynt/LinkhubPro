import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboardIcon,
  FileTextIcon,
  BarChartIcon,
  CreditCardIcon,
  GlobeIcon,
  SettingsIcon,
  ShieldCheckIcon,
  CrownIcon,
  ExternalLinkIcon,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
    testId: "nav-dashboard",
  },
  {
    title: "Pages",
    url: "/dashboard/pages",
    icon: FileTextIcon,
    testId: "nav-pages",
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChartIcon,
    testId: "nav-analytics",
  },
  {
    title: "Billing",
    url: "/dashboard/billing",
    icon: CreditCardIcon,
    testId: "nav-billing",
  },
  {
    title: "Domains",
    url: "/dashboard/domains",
    icon: GlobeIcon,
    testId: "nav-domains",
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: SettingsIcon,
    testId: "nav-settings",
  },
];

const adminItems = [
  {
    title: "Admin Panel",
    url: "/dashboard/admin",
    icon: ShieldCheckIcon,
    testId: "nav-admin",
  },
];

export default function AppSidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location === "/dashboard" || location === "/";
    }
    return location.startsWith(path);
  };

  return (
    <Sidebar data-testid="sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/">
          <div className="flex items-center space-x-3 hover-elevate p-2 rounded-lg cursor-pointer">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-lg">Linkhub Pro</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} data-testid={item.testId}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - Only visible to admins */}
        {user?.role === 'admin' && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link href={item.url} data-testid={item.testId}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Plan Upgrade CTA for free users */}
        {user?.plan === 'free' && (
          <SidebarGroup className="mt-6">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-2 mb-2">
                <CrownIcon className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Unlock unlimited pages, all blocks, and advanced features.
              </p>
              <Link href="/dashboard/billing">
                <Button size="sm" className="w-full" data-testid="button-upgrade-sidebar">
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {/* Quick Links */}
        <div className="space-y-2">
          <Link href="/p/preview">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-xs"
              data-testid="button-preview-page"
            >
              <ExternalLinkIcon className="w-3 h-3 mr-2" />
              Preview Your Page
            </Button>
          </Link>
          
          {/* Plan Badge */}
          <div className="flex items-center justify-center">
            <Badge 
              variant={user?.plan === 'pro' ? 'default' : 'secondary'}
              className="text-xs"
              data-testid="badge-plan-sidebar"
            >
              {user?.plan === 'pro' && <CrownIcon className="w-3 h-3 mr-1" />}
              {user?.plan === 'pro' ? 'Pro' : 'Free'} Plan
            </Badge>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
