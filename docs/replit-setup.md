# Setup Otomatis Linkhub Pro di Replit

## Database dan Seeder Setup

Ketika project ini di-import ke Replit Agent, ikuti langkah-langkah berikut untuk setup database dan seeder otomatis:

### 1. Provision Database PostgreSQL

```bash
# Replit akan otomatis membuat environment variables:
# DATABASE_URL, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, PGHOST
```

### 2. Setup Database Schema

```bash
# Push schema ke database PostgreSQL
npm run db:push
```

### 3. Jalankan Database Seeder

```bash
# Jalankan seeder untuk mengisi data awal
tsx packages/db/seed.ts
```

### 4. Verifikasi Seeding

```bash
# Verifikasi data berhasil di-insert
tsx scripts/verify-seed.ts
```

### 5. Start Aplikasi

```bash
# Jalankan aplikasi di port 5000
npm run dev
```

## Data Default yang Dibuat Seeder

### Users (dengan password default: `password123`):
1. **Admin User**: 
   - Email: `admin@linkhub.pro`
   - Username: `admin`
   - Role: `admin`
   - Plan: `admin`

2. **Free User**: 
   - Email: `user@example.com`
   - Username: `user`
   - Role: `tenant`
   - Plan: `free`

3. **Pro User**: 
   - Email: `shop@example.com`
   - Username: `shop`
   - Role: `tenant`
   - Plan: `pro`

### Packages:
1. **Free Plan**: IDR 0/month
2. **Pro Plan**: IDR 99,000/month

### Default Pages dan Blocks:
- Setiap user mendapat 1 page default dengan 3 blocks (links, social, contact)

## Environment Variables yang Diperlukan

```bash
DATABASE_URL=          # Auto-generated oleh Replit
JWT_SECRET=           # Perlu diset untuk authentication
NODE_ENV=development  # Otomatis diset untuk development mode
PORT=5000            # Port yang digunakan aplikasi
```

## Troubleshooting

### Jika Database Connection Error:
```bash
# Check environment variables
env | grep DATABASE

# Restart aplikasi
npm run dev
```

### Jika Seeder Gagal:
```bash
# Clear dan jalankan ulang seeder
tsx packages/db/seed.ts
```

### Jika Login Error 401:
- Pastikan JWT_SECRET sudah diset di environment variables
- Check database connection
- Verifikasi user data dengan seeder

## Workflow Otomatis

Untuk setup otomatis saat import GitHub ke Replit:

1. **Auto-detect**: Replit otomatis detect Node.js project
2. **Install dependencies**: `npm install`
3. **Setup database**: Gunakan `create_postgresql_database_tool`
4. **Push schema**: `npm run db:push`
5. **Run seeder**: `tsx packages/db/seed.ts`
6. **Start app**: `npm run dev` di port 5000

## Testing Login

Setelah setup selesai, test login dengan:
- **Admin**: `admin@linkhub.pro` / `password123`
- **User**: `user@example.com` / `password123`
- **Shop**: `shop@example.com` / `password123`

Dashboard dapat diakses di `/dashboard`.
