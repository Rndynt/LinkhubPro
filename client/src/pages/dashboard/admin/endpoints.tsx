import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  SearchIcon,
  ServerIcon,
  GlobeIcon,
  ShieldIcon,
} from "lucide-react";

interface EndpointStatus {
  endpoint: string;
  method: string;
  status: 'online' | 'offline' | 'slow' | 'error';
  responseTime: number;
  statusCode: number;
  lastChecked: string;
  errorMessage?: string;
  category: 'auth' | 'pages' | 'blocks' | 'analytics' | 'admin' | 'public' | 'payment';
  requiresAuth: boolean;
}

interface EndpointTestResult {
  endpoint: string;
  method: string;
  success: boolean;
  responseTime: number;
  statusCode: number;
  errorMessage?: string;
}

const ENDPOINTS_CONFIG = [
  // Authentication endpoints
  { endpoint: '/api/auth/login', method: 'POST', category: 'auth', requiresAuth: false },
  { endpoint: '/api/auth/register', method: 'POST', category: 'auth', requiresAuth: false },
  { endpoint: '/api/auth/me', method: 'GET', category: 'auth', requiresAuth: true },

  // Pages endpoints
  { endpoint: '/api/pages', method: 'GET', category: 'pages', requiresAuth: true },
  { endpoint: '/api/pages', method: 'POST', category: 'pages', requiresAuth: true },

  // Blocks endpoints
  { endpoint: '/api/pages/:pageId/blocks', method: 'POST', category: 'blocks', requiresAuth: true },

  // Analytics endpoints
  { endpoint: '/api/analytics', method: 'GET', category: 'analytics', requiresAuth: true },
  { endpoint: '/api/events', method: 'POST', category: 'analytics', requiresAuth: false },

  // Admin endpoints
  { endpoint: '/api/admin/users', method: 'GET', category: 'admin', requiresAuth: true },

  // Public endpoints
  { endpoint: '/api/page/:slug', method: 'GET', category: 'public', requiresAuth: false },
  { endpoint: '/s/:code', method: 'GET', category: 'public', requiresAuth: false },

  // Payment endpoints
  { endpoint: '/api/packages', method: 'GET', category: 'payment', requiresAuth: false },
  { endpoint: '/api/payments/create-checkout', method: 'POST', category: 'payment', requiresAuth: true },
];

export default function EndpointsMonitor() {
  const { user } = useAuth();
  const [endpointStatuses, setEndpointStatuses] = useState<EndpointStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="p-3 sm:p-6">
        <Alert className="max-w-2xl mx-auto">
          <ShieldIcon className="h-4 w-4 flex-shrink-0" />
          <AlertDescription className="text-sm sm:text-base">
            Access denied. This page is only accessible by administrators.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const testEndpoint = async (endpoint: string, method: string, requiresAuth: boolean): Promise<EndpointTestResult> => {
    const startTime = Date.now();
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add auth header if required
      if (requiresAuth) {
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      // Replace dynamic parameters with test values
      let testEndpoint = endpoint;
      testEndpoint = testEndpoint.replace(':pageId', 'test-page-id');
      testEndpoint = testEndpoint.replace(':slug', 'test-slug');
      testEndpoint = testEndpoint.replace(':code', 'test-code');
      testEndpoint = testEndpoint.replace(':userId', 'test-user-id');
      testEndpoint = testEndpoint.replace(':id', 'test-id');
      testEndpoint = testEndpoint.replace(':blockId', 'test-block-id');

      let response;
      const requestOptions: RequestInit = {
        method,
        headers,
      };

      // Add test body for POST/PUT requests
      if (method === 'POST' || method === 'PUT') {
        requestOptions.body = JSON.stringify({
          test: true,
          email: 'test@example.com',
          password: 'test123',
          title: 'Test',
          type: 'test',
          config: {}
        });
      }

      response = await fetch(testEndpoint, requestOptions);
      
      const responseTime = Date.now() - startTime;

      return {
        endpoint,
        method,
        success: response.status < 500, // Consider 4xx as success (expected behavior)
        responseTime,
        statusCode: response.status,
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        endpoint,
        method,
        success: false,
        responseTime,
        statusCode: 0,
        errorMessage: error.message,
      };
    }
  };

  const checkAllEndpoints = async () => {
    setIsChecking(true);
    
    try {
      const results = await Promise.allSettled(
        ENDPOINTS_CONFIG.map(config => 
          testEndpoint(config.endpoint, config.method, config.requiresAuth)
        )
      );

      const statuses: EndpointStatus[] = results.map((result, index) => {
        const config = ENDPOINTS_CONFIG[index];
        
        if (result.status === 'fulfilled') {
          const { success, responseTime, statusCode, errorMessage } = result.value;
          
          let status: EndpointStatus['status'] = 'online';
          if (!success) {
            status = 'error';
          } else if (responseTime > 2000) {
            status = 'slow';
          }

          return {
            endpoint: config.endpoint,
            method: config.method,
            status,
            responseTime,
            statusCode,
            lastChecked: new Date().toISOString(),
            errorMessage,
            category: config.category as EndpointStatus['category'],
            requiresAuth: config.requiresAuth,
          };
        } else {
          return {
            endpoint: config.endpoint,
            method: config.method,
            status: 'error' as const,
            responseTime: 0,
            statusCode: 0,
            lastChecked: new Date().toISOString(),
            errorMessage: result.reason?.message || 'Unknown error',
            category: config.category as EndpointStatus['category'],
            requiresAuth: config.requiresAuth,
          };
        }
      });

      setEndpointStatuses(statuses);
      
      // Show summary toast
      const online = statuses.filter(s => s.status === 'online').length;
      const total = statuses.length;
      
      toast({
        title: "Endpoint Check Complete",
        description: `${online}/${total} endpoints are online`,
      });
      
    } catch (error: any) {
      toast({
        title: "Check Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Auto-check on component mount
  useEffect(() => {
    checkAllEndpoints();
  }, []);

  const getStatusIcon = (status: EndpointStatus['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'slow':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <XCircleIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: EndpointStatus['status']) => {
    const variants = {
      online: "default",
      offline: "destructive",
      slow: "secondary",
      error: "destructive",
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const filteredEndpoints = endpointStatuses.filter(endpoint => {
    const matchesFilter = endpoint.endpoint.toLowerCase().includes(filter.toLowerCase()) ||
                         endpoint.method.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || endpoint.category === selectedCategory;
    
    return matchesFilter && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(ENDPOINTS_CONFIG.map(e => e.category)))];

  const stats = {
    total: endpointStatuses.length,
    online: endpointStatuses.filter(e => e.status === 'online').length,
    slow: endpointStatuses.filter(e => e.status === 'slow').length,
    error: endpointStatuses.filter(e => e.status === 'error').length,
    avgResponseTime: endpointStatuses.length > 0 
      ? Math.round(endpointStatuses.reduce((sum, e) => sum + e.responseTime, 0) / endpointStatuses.length)
      : 0,
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ServerIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            Endpoint Monitor
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Monitor the health and performance of all API endpoints
          </p>
        </div>
        <Button 
          onClick={checkAllEndpoints} 
          disabled={isChecking}
          className="flex items-center gap-2 w-full sm:w-auto"
          data-testid="button-refresh-endpoints"
        >
          <RefreshCwIcon className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Checking...' : 'Check All'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <GlobeIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Online</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.online}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Slow</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.slow}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Errors</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.error}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Avg Time</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.avgResponseTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search" className="text-sm font-medium">Search Endpoints</Label>
              <Input
                id="search"
                placeholder="Filter by endpoint or method..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="mt-1"
                data-testid="input-search-endpoints"
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-sm font-medium">Category</Label>
              <select
                id="category"
                className="w-full p-3 border rounded-md bg-background text-foreground mt-1 touch-manipulation"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                data-testid="select-category"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints List */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoints Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-2">
            {filteredEndpoints.map((endpoint, index) => (
              <div
                key={index}
                className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                data-testid={`endpoint-item-${index}`}
              >
                {/* Mobile: Vertical layout, Desktop: Horizontal layout */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  {/* Status icon and main info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-1 sm:mt-0">
                      {getStatusIcon(endpoint.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Method and endpoint */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-sm bg-muted px-2 py-1 rounded font-semibold flex-shrink-0">
                            {endpoint.method}
                          </code>
                          <span className="font-mono text-sm break-all sm:break-normal">{endpoint.endpoint}</span>
                        </div>
                        {endpoint.requiresAuth && (
                          <Badge variant="outline" className="text-xs flex-shrink-0 w-fit">
                            AUTH
                          </Badge>
                        )}
                      </div>
                      
                      {/* Status information - Responsive grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-xs text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">Category</span>
                          <span className="capitalize">{endpoint.category}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">Response</span>
                          <span>{endpoint.responseTime}ms</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">Status</span>
                          <span>{endpoint.statusCode}</span>
                        </div>
                        <div className="flex flex-col col-span-2 sm:col-span-1">
                          <span className="font-medium text-foreground">Last Checked</span>
                          <span>{new Date(endpoint.lastChecked).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      
                      {/* Error message */}
                      {endpoint.errorMessage && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded text-xs text-red-700 dark:text-red-400">
                          <span className="font-medium">Error:</span> {endpoint.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status badge - positioned for mobile/desktop */}
                  <div className="flex justify-start sm:justify-end sm:flex-shrink-0">
                    <div className="touch-manipulation">
                      {getStatusBadge(endpoint.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEndpoints.length === 0 && (
            <div className="text-center py-8 px-4 text-muted-foreground">
              <div className="text-sm sm:text-base">
                No endpoints match your filter criteria.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}