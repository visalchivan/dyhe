# 🚚 DYHE Delivery Platform

Complete delivery management system with admin panel, driver mobile portal, package tracking, and label printing.

## 🎯 Features

- ✅ **Multi-role System** - Super Admin, Admin, User, Driver, Merchant
- ✅ **Driver Mobile Portal** - Mobile-optimized delivery management
- ✅ **Package Management** - Create, assign, track packages
- ✅ **Direct Label Printing** - 80mm x 100mm thermal printer support
- ✅ **QR Code Generation** - Package tracking with QR codes
- ✅ **Real-time Updates** - Live package status tracking
- ✅ **Reports & Analytics** - Comprehensive delivery reports
- ✅ **Settings Management** - Dynamic company information
- ✅ **PWA Support** - Installable mobile app
- ✅ **Google Maps Integration** - Navigation for drivers

## 📦 Project Structure

- `apps/api` - NestJS + Prisma backend API
- `apps/web` - Next.js frontend dashboard
- `packages/*` - Shared configs and UI components

## Requirements

- Node 18+
- pnpm 9 (corepack: `corepack enable && corepack prepare pnpm@9 --activate`)
- Docker (for containerized runs)

## Getting Started (local)

```bash
pnpm install
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:8000

## Environment

- API uses Prisma. Set `DATABASE_URL` when running outside Docker
- Web uses `NEXT_PUBLIC_API_URL` for API base URL (defaults to `http://localhost:8000`)

## Scripts

Root (via turbo):

```bash
pnpm dev           # run all dev servers
pnpm build         # build all
pnpm lint          # lint all
pnpm check-types   # typecheck all
```

API:

```bash
cd apps/api
pnpm dev
pnpm build
pnpm start:prod
pnpm db:generate   # prisma generate
pnpm db:migrate    # prisma migrate dev
```

Web:

```bash
cd apps/web
pnpm dev
pnpm build
pnpm start
```

## 🚀 Deployment

### ⚡ One-Command Deployment:

```bash
./docker-deploy.sh
```

**That's it! Live in 5 minutes!** 🎉

### 📖 Documentation:

- ⭐ **`DEPLOYMENT.md`** - **Complete deployment guide (everything in one file!)**
- 🚚 **`DRIVER_SYSTEM_EXPLAINED.md`** - Driver system architecture

### 🎯 What Gets Deployed:

- ✅ PostgreSQL Database
- ✅ NestJS API Backend
- ✅ Next.js Frontend
- ✅ Nginx Reverse Proxy
- ✅ Certbot (SSL auto-renewal)
- ✅ Health checks & auto-restart
- ✅ Log management
- ✅ Data persistence

### ⚠️ Important Notes:

**After deployment, you MUST run database setup:**

```bash
# Push database schema (creates tables)
docker-compose exec api sh -c "cd apps/api && npx prisma db push"

# Seed super admin and settings
docker-compose exec api node apps/api/dist/setup.js
```

**Environment Variables (Turborepo):**

This monorepo has separate `.env` files:

- **Root `.env`** - Used by Docker (database, JWT secrets, API URL)
- **`apps/web/.env`** - Only for local dev with `pnpm dev`
- **`apps/api/.env`** - Only for local dev with `pnpm dev`

For Docker: Set `NEXT_PUBLIC_API_URL=http://localhost/api` in **root `.env`**

## 🖨️ Label Printing

Direct thermal printer support (80mm x 100mm):

- **Direct printing** - No PDF, instant print
- **QR code generation** - Automatic package tracking
- **Dynamic settings** - Company info from Settings page
- **Bulk printing** - Print multiple labels at once
- **Mobile-friendly** - Print from any device

Print from:

- Packages table (quick print button)
- Package creation (optional after creation)
- Bulk creation (optional after bulk creation)
- Print Packages page (single or bulk)

## Tech Stack

- Web: Next.js 15, React 19, Ant Design 5, React Query
- API: NestJS 11, Prisma 6, PostgreSQL 16
- Monorepo: Turborepo, pnpm workspaces

## Repo Structure

```
apps/
  api/
  web/
packages/
  eslint-config/
  typescript-config/
  ui/
```

## 🔐 Default Credentials

After deployment:

- **Username:** `superadmin`
- **Password:** `admin123`
- ⚠️ **CHANGE IMMEDIATELY AFTER FIRST LOGIN!**

## 📱 Mobile Support

- ✅ Fully responsive design
- ✅ PWA (Progressive Web App)
- ✅ Installable on home screen
- ✅ Driver portal optimized for mobile
- ✅ Touch-friendly interface (44px buttons)
- ✅ Works on 3G/4G

## 🎯 Quick Start

### Local Development:

```bash
pnpm install
pnpm dev
```

### Production Deployment:

```bash
./docker-deploy.sh
```

## 📖 Documentation

- **Development:** This README
- **Deployment:** `DEPLOYMENT.md` ⭐ **Everything you need!**
- **Driver System:** `DRIVER_SYSTEM_EXPLAINED.md`

## 💰 Estimated Costs

- VPS (4GB): $20-40/month
- Domain: $10-15/year
- **Total: ~$21-41/month**

## 🆘 Support

- **Deployment help:** Check `DEPLOYMENT.md` (has everything!)
- **View logs:** `docker-compose logs -f`
- **Check status:** `docker-compose ps`
- **Restart:** `docker-compose restart`

---

**Ready to deploy? Just run `./docker-deploy.sh`!** 🐳🚀
