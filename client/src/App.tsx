import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Dashboard from "@/pages/dashboard/index";
import Pages from "@/pages/dashboard/pages";
import Editor from "@/pages/dashboard/editor";
import Billing from "@/pages/dashboard/billing";
import Analytics from "@/pages/dashboard/analytics";
import Domains from "@/pages/dashboard/domains";
import AdminPanel from "@/pages/dashboard/admin/index";
import EndpointsMonitor from "@/pages/dashboard/admin/endpoints";
import PublicPage from "@/pages/public/[slug]";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider defaultOpen={false} style={style}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 bg-background">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-w-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/register" component={Register} />
          <Route path="/p/:slug" component={PublicPage} />
        </>
      ) : (
        <>
          <Route path="/">
            {() => (
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path="/dashboard">
            {() => (
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path="/dashboard/pages">
            {() => (
              <AuthenticatedLayout>
                <Pages />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path="/dashboard/pages/:id/editor">
            {() => (
              <AuthenticatedLayout>
                <Editor />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path="/dashboard/billing">
            {() => (
              <AuthenticatedLayout>
                <Billing />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path="/dashboard/analytics">
            {() => (
              <AuthenticatedLayout>
                <Analytics />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path="/dashboard/domains">
            {() => (
              <AuthenticatedLayout>
                <Domains />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path="/dashboard/admin">
            {() => (
              <AuthenticatedLayout>
                <AdminPanel />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path="/dashboard/admin/endpoints">
            {() => (
              <AuthenticatedLayout>
                <EndpointsMonitor />
              </AuthenticatedLayout>
            )}
          </Route>
          <Route path="/p/:slug" component={PublicPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
