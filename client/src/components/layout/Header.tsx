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
import { Link } from "wouter";
import { 
  BellIcon, 
  PlusIcon, 
  SettingsIcon, 
  LogOutIcon,
  UserIcon,
  CrownIcon
} from "lucide-react";

export default function Header() {
  const { user } = useAuth();

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

  return (
    <header className="border-b border-border bg-card px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <div>
            <h1 className="text-xl font-semibold" data-testid="text-page-title">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground" data-testid="text-welcome">
              Welcome back, {user?.name || 'User'}!
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Create Button */}
          <Link href="/dashboard/pages">
            <Button data-testid="button-create-page">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Page
            </Button>
          </Link>

          {/* Notifications */}
          <Button variant="ghost" size="icon" data-testid="button-notifications">
            <BellIcon className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="button-user-menu">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
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
