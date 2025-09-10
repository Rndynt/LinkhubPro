import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { Link, useLocation } from "wouter";
import { 
  BellIcon, 
  PlusIcon, 
  SettingsIcon, 
  LogOutIcon,
  UserIcon,
  CrownIcon,
  SunIcon,
  MoonIcon,
  LaptopIcon
} from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  // Route-aware header configuration
  const getHeaderConfig = (path: string) => {
    if (path === "/" || path === "/dashboard") {
      return { title: "Dashboard", subtitle: `Welcome back, ${user?.name || 'User'}!`, showCreatePage: true };
    } else if (path.startsWith("/dashboard/pages")) {
      return { title: "Pages", subtitle: "Manage your link pages", showCreatePage: true };
    } else if (path.startsWith("/dashboard/analytics")) {
      return { title: "Analytics", subtitle: "View your performance metrics", showCreatePage: false };
    } else if (path.startsWith("/dashboard/billing")) {
      return { title: "Billing", subtitle: "Manage your subscription", showCreatePage: false };
    } else if (path.startsWith("/dashboard/domains")) {
      return { title: "Domains", subtitle: "Manage custom domains", showCreatePage: false };
    } else if (path.startsWith("/dashboard/admin")) {
      return { title: "Admin", subtitle: "System administration", showCreatePage: false };
    } else {
      return { title: "Dashboard", subtitle: `Welcome back, ${user?.name || 'User'}!`, showCreatePage: false };
    }
  };

  const headerConfig = getHeaderConfig(location);

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <SunIcon className="w-4 h-4" />;
      case "dark":
        return <MoonIcon className="w-4 h-4" />;
      default:
        return <LaptopIcon className="w-4 h-4" />;
    }
  };

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <header className="border-b border-border bg-card px-4 sm:px-6 py-3 sm:py-4" data-testid="header">
      <div className="flex items-center justify-between min-w-0">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold truncate" data-testid="text-page-title">
              {headerConfig.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block" data-testid="text-welcome">
              {headerConfig.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Conditional Create Button - Only on relevant pages, exclude editor routes */}
          {headerConfig.showCreatePage && !location.includes('/editor') && (
            <>
              <Button asChild className="hidden sm:flex" data-testid="button-create-page">
                <Link href="/dashboard/pages">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Page
                </Link>
              </Button>
              <Button asChild size="icon" className="sm:hidden" data-testid="button-create-page-mobile">
                <Link href="/dashboard/pages">
                  <PlusIcon className="w-4 h-4" />
                </Link>
              </Button>
            </>
          )}

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={cycleTheme}
            title={`Current theme: ${theme}`}
            data-testid="button-theme-toggle"
          >
            {getThemeIcon()}
          </Button>

          {/* Notifications - Hidden on small screens */}
          <Button variant="ghost" size="icon" className="hidden sm:flex" data-testid="button-notifications">
            <BellIcon className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full" data-testid="button-user-menu">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                    {getUserInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none" data-testid="text-user-name">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground" data-testid="text-user-email">
                    {user?.email}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge 
                      variant={user?.plan === 'pro' ? 'default' : 'secondary'}
                      className="text-xs"
                      data-testid="badge-user-plan"
                    >
                      {user?.plan === 'pro' && <CrownIcon className="w-3 h-3 mr-1" />}
                      {user?.plan === 'pro' ? 'Pro' : 'Free'} Plan
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Mobile-only Notifications in menu */}
              <div className="sm:hidden">
                <DropdownMenuItem data-testid="menu-item-notifications">
                  <BellIcon className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </div>
              <Link href="/dashboard/profile">
                <DropdownMenuItem data-testid="menu-item-profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/billing">
                <DropdownMenuItem data-testid="menu-item-billing">
                  <CrownIcon className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/settings">
                <DropdownMenuItem data-testid="menu-item-settings">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} data-testid="menu-item-logout">
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
