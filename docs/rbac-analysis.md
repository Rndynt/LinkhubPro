# Analisis Mendalam Sistem RBAC Linkhub Pro

## Overview Sistem RBAC

Linkhub Pro mengimplementasikan sistem Role-Based Access Control (RBAC) yang terstruktur dengan baik menggunakan PostgreSQL enums dan middleware Express untuk enforcing permissions.

## Struktur Role dan Permission

### 1. Definisi Role (Database Schema)

```typescript
// shared/schema.ts
export const roleEnum = pgEnum('role', ['admin', 'tenant']);
export const planEnum = pgEnum('plan', ['free', 'pro', 'admin']);
```

#### Roles Yang Tersedia:
- **admin**: Role super user dengan akses penuh ke sistem
- **tenant**: Role user biasa yang bisa free atau pro

#### Plans Yang Tersedia:
- **admin**: Plan khusus untuk admin (unlimited access)
- **pro**: Plan berbayar dengan fitur premium
- **free**: Plan gratis dengan limitasi

### 2. User Schema dengan RBAC

```typescript
// Users table dengan role dan plan
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).unique().notNull(),
  username: varchar("username", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  password: text("password"),
  role: roleEnum("role").default('tenant').notNull(),  // RBAC Role
  plan: planEnum("plan").default('free').notNull(),    // Feature Plan
  // ... other fields
});
```

## Middleware dan Authentication

### 1. Authentication Middleware

```typescript
// server/routes.ts
export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user; // Attach user with role info
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

### 2. Admin Authorization Middleware

```typescript
// server/routes.ts
export const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
```

## Implementasi RBAC di Frontend

### 1. Conditional UI Rendering

```typescript
// client/src/components/layout/Sidebar.tsx
{user?.role === 'admin' && (
  <SidebarGroup className="mt-6">
    <SidebarGroupLabel>Administration</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        {adminItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={isActive(item.url)}>
              <Link href={item.url}>
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
```

### 2. Route Protection

```typescript
// client/src/App.tsx - Protected Admin Routes
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
```

### 3. Component-Level Access Control

```typescript
// client/src/pages/dashboard/admin/endpoints.tsx
export default function EndpointsMonitor() {
  const { user } = useAuth();

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <Alert>
          <ShieldIcon className="h-4 w-4" />
          <AlertDescription>
            Access denied. This page is only accessible by administrators.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  // ... rest of component
}
```

## Endpoints dan Permissions

### 1. Admin-Only Endpoints

```typescript
// server/routes.ts
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  // Admin audit logging
  await storage.createAdminAuditLog({
    adminId: req.user.id,
    action: 'view_users',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  const result = await storage.getAllUsers(Number(limit), Number(offset));
  res.json(result);
});
```

### 2. Plan-Based Feature Restrictions

```typescript
// server/routes.ts - Block creation with plan checks
app.post('/api/pages/:pageId/blocks', authenticateToken, async (req, res) => {
  // Check if block type requires Pro plan
  const proBlocks = ['product_card', 'dynamic_feed'];
  if (proBlocks.includes(type) && req.user.plan === 'free') {
    return res.status(403).json({ 
      error: 'upgrade_required', 
      message: 'This block requires Pro plan' 
    });
  }
  // ... create block logic
});

// Page creation limits for free users
app.post('/api/pages', authenticateToken, async (req, res) => {
  if (req.user.plan === 'free') {
    const existingPages = await storage.getUserPages(req.user.id);
    if (existingPages.length >= 1) {
      return res.status(403).json({ 
        error: 'upgrade_required', 
        message: 'Free plan allows only 1 page' 
      });
    }
  }
  // ... create page logic
});
```

## Audit Logging untuk Admin Actions

### 1. Admin Audit Schema

```typescript
// shared/schema.ts
export const adminAudit = pgTable("admin_audit", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: uuid("admin_id").notNull().references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  targetUserId: uuid("target_user_id").references(() => users.id),
  metadata: jsonb("metadata"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
```

### 2. Audit Logging Implementation

```typescript
// Setiap admin action dicatat
await storage.createAdminAuditLog({
  adminId: req.user.id,
  action: 'view_users',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

## Block Types dan Permission Matrix

### Free Plan Blocks (Basic):
- `title_subtitle`
- `link`
- `button`
- `card`
- `image`
- `contact_form`
- `newsletter_signup`
- `embed`
- `gallery`
- `map`
- `messenger_button`
- `shortlink_button`
- `video`
- `count_stats`
- `schedule_button`
- `password_protect`
- `links_block`
- `social_block`
- `contact_block`

### Pro Plan Blocks (Premium):
- `product_card` - E-commerce integration
- `dynamic_feed` - Real-time content
- `paywall` - Premium content protection

### Admin Plan:
- Unlimited access to all blocks
- Admin panel access
- User management
- System monitoring
- Audit logs access

## Keamanan RBAC Implementation

### 1. **Server-Side Enforcement**
- ✅ Semua permission check dilakukan di backend
- ✅ JWT token verification
- ✅ Database-level role storage
- ✅ Middleware-based authorization

### 2. **Frontend Protection**
- ✅ Conditional UI rendering
- ✅ Route-level protection
- ✅ Component-level access control
- ✅ Real-time role checking

### 3. **Audit & Monitoring**
- ✅ Admin action logging
- ✅ IP address tracking
- ✅ User agent tracking
- ✅ Timestamp tracking

## Rekomendasi Improvements

### 1. **Fine-Grained Permissions**
```typescript
// Bisa ditambahkan permission-based system
export const permissions = pgEnum('permission', [
  'read_users', 'write_users', 'delete_users',
  'read_analytics', 'write_analytics',
  'manage_billing', 'manage_domains'
]);

// Role-Permission junction table
export const rolePermissions = pgTable("role_permissions", {
  roleId: varchar("role_id").references(() => roles.id),
  permission: permissions("permission"),
});
```

### 2. **Resource-Level Permissions**
```typescript
// Permissions per resource/tenant
export const userPermissions = pgTable("user_permissions", {
  userId: uuid("user_id").references(() => users.id),
  resourceType: varchar("resource_type"), // 'page', 'domain', etc
  resourceId: uuid("resource_id"),
  permission: varchar("permission"), // 'read', 'write', 'delete'
});
```

### 3. **Session Management**
- Implementasi session timeout
- Force logout untuk admin actions
- Device tracking dan management

## Kesimpulan

Sistem RBAC Linkhub Pro sudah **sangat baik dan terstruktur** dengan:

### ✅ **Kelebihan:**
1. **Clear role separation** - Admin vs Tenant roles
2. **Plan-based feature gating** - Free vs Pro vs Admin
3. **Server-side enforcement** - Security-first approach
4. **Audit logging** - Trackable admin actions
5. **Frontend integration** - Seamless UX
6. **Middleware architecture** - Reusable and maintainable

### 🔧 **Area untuk Enhancement:**
1. **Permission granularity** - Bisa lebih detail per feature
2. **Resource-level permissions** - Ownership-based access
3. **Session management** - Security hardening
4. **Rate limiting** - Anti-abuse measures

**Overall Rating: 8.5/10** - Sistem RBAC yang solid dan production-ready!