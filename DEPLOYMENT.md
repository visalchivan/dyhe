# 🚀 DYHE Platform - Complete Deployment Guide

**One document. Everything you need. Super simple.**

---

## ⚡ QUICK START (10 Minutes)

### Local or VPS - Same Commands:

```bash
# 1. Setup environment
cp docker.env.example .env
nano .env  # Add your passwords & secrets

# 2. Deploy containers
chmod +x docker-deploy.sh
./docker-deploy.sh

# 3. Setup database (REQUIRED!)
docker-compose exec api sh -c "cd apps/api && npx prisma db push"
docker-compose exec api node apps/api/dist/setup.js

# 4. Access
# Web: http://localhost
# Login: superadmin / admin123
```

**Done! 🎉**

---

## ⚠️ IMPORTANT: Turborepo & Environment Variables

This is a **Turborepo monorepo** - environment variables work differently than normal projects!

### Environment Files:

```
dyhe-platform/
├── .env                    ← Docker uses this! ⭐
├── apps/
│   ├── web/
│   │   └── .env           ← Only for local dev (pnpm dev)
│   └── api/
│       └── .env           ← Only for local dev (pnpm dev)
```

### For Docker Deployment:

**Use ONLY the root `.env` file!**

- Docker Compose reads: **root `.env`**
- Passes as build args to containers
- Individual app `.env` files are **IGNORED** in Docker!

**Critical setting:**

```env
NEXT_PUBLIC_API_URL=http://localhost/api  # Via nginx proxy
```

**For production with domain:**

```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

### For Local Development (`pnpm dev`):

**Use individual app `.env` files:**

- `apps/web/.env` - Set `NEXT_PUBLIC_API_URL=http://localhost:8000`
- `apps/api/.env` - Set `DATABASE_URL` and `JWT_SECRET`
- Root `.env` is ignored

---

## 📋 COMPLETE DEPLOYMENT FLOW

### 🏠 **BEFORE DEPLOYMENT (On Your Computer)**

#### 1. Test Locally (5 minutes)

```bash
cd /Users/chivanvisal/Desktop/dyhe-platform

# Update database
cd apps/api
npm run db:push

# Test everything works
cd ../..
pnpm dev
# Visit http://localhost:3000
# Test all features!
```

#### 2. Commit & Push (2 minutes)

```bash
git add .
git commit -m "Ready for production"
git push origin main
```

---

### ☁️ **GET HOSTING (One-time Setup)**

#### 3. Buy VPS (5 minutes)

Go to **DigitalOcean** / **Linode** / **Vultr**:

- OS: **Ubuntu 22.04 LTS**
- RAM: **4GB** ($24/month recommended)
- Storage: **40GB SSD**
- Region: **Singapore** (closest to Cambodia)

You get:

- IP: `123.45.67.89`
- Root password (they email you)

#### 4. Buy Domain - Optional (5 minutes)

Go to **Namecheap** / **GoDaddy**:

- Buy: `dyhe-delivery.com` ($12/year)
- Add DNS records:
  ```
  A    @      123.45.67.89
  A    www    123.45.67.89
  A    api    123.45.67.89
  ```
- Wait 1-24 hours for DNS to propagate

---

### 🖥️ **ON VPS (First Time Setup - 15 minutes)**

#### 5. Connect to VPS

```bash
ssh root@123.45.67.89
# Enter password from email
```

#### 6. Install Docker

```bash
# One command installs Docker
curl -fsSL https://get.docker.com | sh

# Verify
docker --version
docker compose version
```

#### 7. Clone Repository

```bash
cd /root
git clone https://github.com/your-username/dyhe-platform.git
cd dyhe-platform
```

#### 8. Create Environment File

```bash
# Copy template
cp docker.env.example .env

# Generate JWT secrets
openssl rand -hex 32
# Copy the output

# Edit .env
nano .env
```

**Fill in these values:**

```env
# Database
POSTGRES_DB=dyhe_production
POSTGRES_USER=dyhe_user
POSTGRES_PASSWORD=MyStr0ngDbP@ssw0rd123  # ← Choose strong password

# JWT Secrets (paste the generated values)
JWT_SECRET=paste_first_openssl_output_here
JWT_REFRESH_SECRET=run_openssl_again_and_paste_here

# Settings
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=30d

# API URL
# With domain:
NEXT_PUBLIC_API_URL=https://api.dyhe-delivery.com

# Without domain (testing):
# NEXT_PUBLIC_API_URL=http://123.45.67.89:8000
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

#### 9. DEPLOY! 🚀

```bash
chmod +x docker-deploy.sh
./docker-deploy.sh
```

**Wait 3-5 minutes. Script will:**

- Build Docker images
- Start all containers
- Create database
- Wait for services to be healthy

**You'll see:**

```
╔════════════════════════════════════════╗
║     🎉 Deployment Complete!           ║
╚════════════════════════════════════════╝

📍 Your containers are running!
```

#### 10. Setup Database (IMPORTANT!)

The script does NOT automatically run migrations. You must do this manually:

```bash
# Step 1: Push database schema (creates all tables)
docker-compose exec api sh -c "cd apps/api && npx prisma db push"

# Step 2: Seed super admin and settings
docker-compose exec api node apps/api/dist/setup.js
```

**You'll see:**

```
🚀 Starting DYHE Platform setup...

📋 Setting up system settings...
✅ Settings configured

👤 Setting up super admin...
✅ Super admin created successfully!
   Username: superadmin
   Email: admin@dyhe.com
   Role: SUPER_ADMIN

🔐 Login Credentials:
   Username: superadmin
   Password: admin123
```

**What this does:**

- ✅ Creates all database tables (users, packages, drivers, etc.)
- ✅ Seeds super admin account
- ✅ Seeds default company settings

#### 11. Verify Everything Works

```bash
# Check all containers are healthy
docker-compose ps

# Should show:
# dyhe-db       healthy
# dyhe-api      healthy
# dyhe-web      healthy
# dyhe-nginx    running
# dyhe-certbot  running
```

#### 12. Test It!

On your computer, open browser:

```
http://123.45.67.89
```

Or:

```
http://123.45.67.89:80
```

**Login:**

- Username: `superadmin`
- Password: `admin123`

**YOU'RE LIVE! ✅**

**⚠️ IMPORTANT:** Change the password immediately after first login!

---

### 🔒 **SETUP SSL (If you have domain - 10 minutes)**

#### 11. Get SSL Certificate

```bash
# On VPS, run:
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@dyhe-delivery.com \
  --agree-tos \
  --no-eff-email \
  -d dyhe-delivery.com \
  -d www.dyhe-delivery.com \
  -d api.dyhe-delivery.com
```

#### 12. Enable HTTPS in Nginx

```bash
nano nginx-docker.conf

# Find these lines (around line 24):
# location / {
#     return 301 https://$host$request_uri;
# }
# UNCOMMENT THEM (remove the #)

# Find the HTTPS server block (around line 55):
# server {
#     listen 443 ssl http2;
#     ...
# }
# UNCOMMENT THE ENTIRE BLOCK

# Replace "your-domain.com" with "dyhe-delivery.com"

# Save: Ctrl+X, Y, Enter
```

#### 13. Restart Nginx

```bash
docker-compose restart nginx
```

#### 14. Access with HTTPS

```
https://dyhe-delivery.com  ← Green padlock!
```

---

### 🎯 **CONFIGURE PLATFORM (10 minutes)**

#### 15. First Login

Visit: `https://dyhe-delivery.com` (or `http://123.45.67.89:3000`)

Login:

- Username: `superadmin`
- Password: `admin123`

#### 16. Change Password

- Click profile icon (top right)
- Click "Logout" dropdown → Go to Team page
- Find "superadmin" user
- Click 🔒 Change Password
- Enter new strong password

#### 17. Configure Settings

- Go to **Settings** page (sidebar)
- Update:
  - **Company Name:** "DYHE Express Delivery"
  - **Company Phone:** "Tel: +855 12 345 678"
  - **Company Address:** "Your real address here"
  - **Label Company Name:** "DYHE Express"
  - **Label Remarks:** "Your terms and conditions"
- Click **Save All Settings**

#### 18. Create Your First Driver

- Go to **Drivers** page
- Click **"Add Driver"**
- Fill in:
  ```
  Name: John Doe
  Email: john@example.com
  Phone: +855987654321
  Username: johndoe          ← For login
  Password: driver123        ← For login
  Delivery Fee: 1.00
  Driver Status: ACTIVE
  Bank: ABA
  Bank Account Number: 123456789
  Bank Account Name: John Doe
  Status: ACTIVE
  ```
- Click **Save**

#### 19. Create Your First Merchant

- Go to **Merchants** page
- Click **"Add Merchant"**
- Fill in all details
- Click **Save**

#### 20. Create Test Package

- Go to **Packages** page
- Click **"Create Package"**
- Select merchant
- Fill customer details
- Click **Save**
- Modal appears: **"Print Package Label?"**
- Click **"Print Now"** to test!

#### 21. Test Driver Login on Mobile

- Open phone browser
- Visit: `https://dyhe-delivery.com`
- Login:
  - Username: `johndoe`
  - Password: `driver123`
- See driver dashboard! 📱
- Tap browser menu → **"Add to Home Screen"**
- Now it's an app! 🎉

---

## ✅ YOU'RE DONE!

### Timeline Summary:

```
Day 1:
├─ Test locally (5 min)
├─ Commit code (2 min)
├─ Buy VPS (5 min)
├─ Buy domain [optional] (5 min)
├─ Install Docker on VPS (2 min)
├─ Clone repo (1 min)
├─ Setup .env (3 min)
├─ Run ./docker-deploy.sh (5 min)
├─ [Optional] Setup SSL (10 min)
├─ Configure platform (10 min)
└─ Total: ~50 minutes

Day 2-7:
└─ DNS propagates (0-24 hours, automatic)

DONE! Platform is LIVE! 🎉
```

---

## 🔄 FUTURE UPDATES (Easy!)

### When You Make Code Changes:

**On Your Computer:**

```bash
git add .
git commit -m "New feature"
git push origin main
```

**On VPS:**

```bash
ssh root@123.45.67.89
cd /root/dyhe-platform
git pull origin main
docker-compose up -d --build

# Done! Updated in 3 minutes!
```

---

## 📊 WHAT'S RUNNING

After `./docker-deploy.sh`:

```
✅ dyhe-db        PostgreSQL 16 (Database)
✅ dyhe-api       NestJS 11 (Backend API)
✅ dyhe-web       Next.js 15 (Frontend)
✅ dyhe-nginx     Nginx (Reverse Proxy)
✅ dyhe-certbot   Certbot (SSL Auto-Renewal)
```

**All containers have:**

- Health checks
- Auto-restart on crash
- Persistent volumes
- Network isolation
- Log management

---

## 🎯 USEFUL COMMANDS

### Viewing Status:

```bash
# List all containers
docker-compose ps

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100

# Resource usage
docker stats
```

### Managing Services:

```bash
# Restart all
docker-compose restart

# Restart specific
docker-compose restart api

# Stop all
docker-compose down

# Start all
docker-compose up -d

# Rebuild and start
docker-compose up -d --build
```

### Database Management:

```bash
# Backup database
docker-compose exec db pg_dump -U dyhe_user dyhe_production > backup.sql

# Backup with timestamp
docker-compose exec db pg_dump -U dyhe_user dyhe_production > backup_$(date +%Y%m%d).sql

# Restore database
cat backup.sql | docker-compose exec -T db psql -U dyhe_user dyhe_production

# Access database
docker-compose exec db psql -U dyhe_user -d dyhe_production
```

### Maintenance:

```bash
# Clean old images
docker system prune -a

# View disk usage
docker system df

# Remove unused volumes
docker volume prune
```

---

## 🐛 TROUBLESHOOTING

### 1. Container Won't Start ❌

**Problem:** Container keeps restarting or shows "unhealthy"

```bash
# Check logs to see the error
docker-compose logs api
docker-compose logs web

# Check if port is in use
lsof -i :8000  # For API
lsof -i :3000  # For Web

# Restart specific service
docker-compose restart api

# Full rebuild
docker-compose down
docker-compose up -d --build
```

---

### 2. Prisma Client Error 🔴

**Error:** `Cannot find module '../../generated/client'`

**Why:** Prisma client wasn't copied to Docker runtime container

**Solution:** Already fixed in `apps/api/Dockerfile`! But if you see this:

```bash
# Rebuild API container
docker-compose down
docker-compose up -d --build api
```

**What was fixed:**

```dockerfile
# Added this line to Dockerfile:
COPY --from=builder /app/apps/api/generated ./apps/api/generated
```

---

### 3. Database Tables Don't Exist 💾

**Error:** `The table 'public.settings' does not exist`

**Why:** Database schema wasn't pushed

**Solution:**

```bash
# Step 1: Push database schema (creates tables)
docker-compose exec api sh -c "cd apps/api && npx prisma db push"

# Step 2: Run setup (seeds data)
docker-compose exec api node apps/api/dist/setup.js
```

**What this does:**

- ✅ Creates all database tables
- ✅ Seeds super admin (`superadmin` / `admin123`)
- ✅ Seeds default settings

---

### 4. Web Container Restart Loop 🔄

**Error:** `Cannot find module 'next/dist/bin/next'`

**Why:** Next.js wasn't properly copied to container

**Solution:** Already fixed in `apps/web/Dockerfile`!

```bash
# If you still see this, rebuild:
docker-compose down
docker-compose up -d --build web
```

**What was fixed:**

```dockerfile
# Added these lines:
COPY --from=deps /app/node_modules ./node_modules
WORKDIR /app/apps/web
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]
```

---

### 5. Health Check Failing ❤️‍🩹

**Problem:** Container shows "unhealthy" status

**Why:** Missing `curl` or `/health` endpoint

**Solution:** Already fixed!

```bash
# Check health endpoint
docker-compose exec api curl http://localhost:8000/health

# Should return:
# {"status":"ok","timestamp":"...","uptime":123}
```

**What was fixed:**

- Added `curl` to `apps/api/Dockerfile`
- Added `/health` endpoint to `apps/api/src/app.controller.ts`

---

### 6. Docker Compose Version Warning ⚠️

**Warning:** `the attribute version is obsolete`

**Solution:** Already fixed! Removed `version: "3.9"` from `docker-compose.yml`.

---

### 7. Can't Access localhost:3000 🌐

**Problem:** Browser can't reach the application

**Check 1:** Are all containers running?

```bash
docker-compose ps

# All should show "Up" or "healthy"
```

**Check 2:** Try accessing through Nginx

```bash
# Access via Nginx on port 80
http://localhost

# Or explicit port
http://localhost:80
```

**Note:** Services are accessed through Nginx by default!

---

### 8. Database Connection Errors 🗄️

**Problem:** API can't connect to database

```bash
# Check database is running
docker-compose ps db
# Should show "healthy"

# View database logs
docker-compose logs db

# Verify DATABASE_URL
docker-compose exec api env | grep DATABASE_URL

# Access database manually
docker-compose exec db psql -U dyhe_user -d dyhe_production

# List tables
\dt

# Exit
\q
```

---

### 9. Out of Disk Space 💽

**Problem:** Docker runs out of space

```bash
# Check disk usage
docker system df

# Clean up (safe)
docker system prune -f

# Clean up everything (removes unused images)
docker system prune -a -f

# Remove old containers
docker container prune

# Remove unused volumes (⚠️ deletes data!)
docker volume prune
```

---

### 10. SSL Certificate Issues 🔒

**Problem:** HTTPS not working after getting certificate

```bash
# Check certificates exist
docker-compose run certbot certificates

# Renew manually
docker-compose run certbot renew

# Check nginx config is valid
docker-compose exec nginx nginx -t

# Restart nginx
docker-compose restart nginx

# View nginx logs
docker-compose logs nginx
```

---

### 11. Port Already in Use 🚪

**Error:** `bind: address already in use`

```bash
# Find what's using port 80
lsof -i :80

# Find what's using port 443
lsof -i :443

# Kill the process
sudo kill -9 <PID>

# Or stop your local web server (Apache, Nginx, etc.)

# Then restart Docker
docker-compose down
docker-compose up -d
```

---

### 12. Can't Login After Setup 🔐

**Problem:** Login doesn't work

**Check credentials:**

- Username: `superadmin` (case-sensitive!)
- Password: `admin123` (case-sensitive!)

**Clear browser cache:**

- Chrome: `Cmd+Shift+Delete` (Mac) or `Ctrl+Shift+Delete` (Windows)
- Or use Incognito/Private mode

**Check API is responding:**

```bash
# Check API health
docker-compose logs -f api

# Test health endpoint
docker-compose exec api curl http://localhost:8000/health
```

---

### 13. Environment Variables Not Loading 📝

**Problem:** App can't read .env file

```bash
# Check .env exists
ls -la .env

# View docker-compose config
docker-compose config

# Restart to reload env
docker-compose down
docker-compose up -d
```

---

## 🔧 COMPLETE REBUILD (Nuclear Option)

If nothing works, start fresh:

```bash
# 1. Stop and remove everything
docker-compose down -v

# 2. Remove all Docker data
docker system prune -a -f

# 3. Recreate .env
rm .env
cp docker.env.example .env
nano .env  # Add your secrets

# 4. Rebuild from scratch
docker-compose up -d --build

# 5. Wait for database
sleep 30

# 6. Push schema
docker-compose exec api sh -c "cd apps/api && npx prisma db push"

# 7. Run setup
docker-compose exec api node apps/api/dist/setup.js

# 8. Check status
docker-compose ps

# 9. Access app
# http://localhost
```

---

## 📋 PRE-FLIGHT CHECKLIST

Before deploying, verify:

- [ ] Docker installed: `docker --version`
- [ ] Docker Compose installed: `docker compose version`
- [ ] `.env` file exists: `ls -la .env`
- [ ] JWT secrets generated (not default values!)
- [ ] Strong database password set
- [ ] Ports 80 & 443 available: `lsof -i :80 :443`
- [ ] At least 10GB free disk space: `df -h`

---

## 🆘 DEBUG COMMANDS

### View Logs:

```bash
# All services
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f db

# Since specific time
docker-compose logs --since 10m
```

### Container Inspection:

```bash
# List containers
docker-compose ps

# Detailed info
docker inspect dyhe-api

# Resource usage
docker stats

# Execute commands inside
docker-compose exec api sh
docker-compose exec web sh
docker-compose exec db sh
```

### Debug API:

```bash
# Enter API container
docker-compose exec api sh

# Check environment
env | grep -i db
env | grep -i jwt

# Check Prisma
cd apps/api
npx prisma --version
ls -la generated/

# Test database connection
npx prisma db pull

# Exit
exit
```

### Debug Web:

```bash
# Enter web container
docker-compose exec web sh

# Check Next.js
ls -la node_modules/next/
ls -la .next/

# Check environment
env | grep NEXT_PUBLIC

# Exit
exit
```

### Debug Database:

```bash
# Enter database
docker-compose exec db psql -U dyhe_user -d dyhe_production

# List tables
\dt

# Count users
SELECT COUNT(*) FROM users;

# List users
SELECT id, username, role FROM users;

# Exit
\q
```

---

## 🎯 COMMON ERROR SOLUTIONS

| Error                        | Solution                                                                 |
| ---------------------------- | ------------------------------------------------------------------------ |
| `MODULE_NOT_FOUND` (Prisma)  | Rebuild API: `docker-compose up -d --build api`                          |
| `MODULE_NOT_FOUND` (Next.js) | Rebuild web: `docker-compose up -d --build web`                          |
| `table does not exist`       | Run: `docker-compose exec api sh -c "cd apps/api && npx prisma db push"` |
| `unhealthy` container        | Check logs: `docker-compose logs <service>`                              |
| `address already in use`     | Stop conflicting service: `lsof -i :<port>`                              |
| Can't login                  | Check credentials (case-sensitive!)                                      |
| SSL not working              | Check nginx config, restart nginx                                        |

---

## 💡 TIPS & TRICKS

### Quick Restart:

```bash
# Restart everything quickly
docker-compose restart

# Restart specific service
docker-compose restart api
```

### Force Rebuild:

```bash
# Rebuild without cache
docker-compose build --no-cache

# Then start
docker-compose up -d
```

### Clean Start:

```bash
# Remove containers but keep volumes (keeps data!)
docker-compose down

# Remove containers AND volumes (fresh start!)
docker-compose down -v
```

### Monitor Resources:

```bash
# Live resource usage
docker stats

# Disk usage
docker system df
```

---

## 💾 BACKUP STRATEGY

### Setup Automated Daily Backups:

```bash
# Create backup directory
mkdir -p /root/dyhe-platform/backups

# Create backup script
cat > /root/dyhe-platform/backup.sh <<'EOF'
#!/bin/bash
cd /root/dyhe-platform
docker-compose exec -T db pg_dump -U dyhe_user dyhe_production > ./backups/backup_$(date +%Y%m%d_%H%M%S).sql
echo "Backup completed: backup_$(date +%Y%m%d_%H%M%S).sql"
EOF

# Make executable
chmod +x /root/dyhe-platform/backup.sh

# Add to crontab (runs daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /root/dyhe-platform/backup.sh >> /root/dyhe-platform/backups/backup.log 2>&1
```

### Manual Backup:

```bash
docker-compose exec db pg_dump -U dyhe_user dyhe_production > backup.sql
```

---

## 🔒 SECURITY CHECKLIST

### After Deployment:

- [ ] Change super admin password
- [ ] Use strong database password (in .env)
- [ ] Generate secure JWT secrets (with openssl)
- [ ] Enable HTTPS/SSL (for production)
- [ ] Configure firewall (ufw):
  ```bash
  ufw allow 22/tcp   # SSH
  ufw allow 80/tcp   # HTTP
  ufw allow 443/tcp  # HTTPS
  ufw enable
  ```
- [ ] Setup automated backups
- [ ] Test all features
- [ ] Remove default credentials

---

## 💰 COSTS

| Setup                      | RAM | CPU | Storage | Cost/Month |
| -------------------------- | --- | --- | ------- | ---------- |
| **Small** (Testing)        | 2GB | 1   | 20GB    | $10-12     |
| **Medium** (Production) ⭐ | 4GB | 2   | 40GB    | $20-24     |
| **Large** (High Traffic)   | 8GB | 4   | 80GB    | $40-48     |

**Plus:**

- Domain: $12/year (~$1/month)

**Total: ~$21-41/month for production**

### Recommended Providers:

- DigitalOcean
- Linode
- Vultr
- Hetzner
- AWS Lightsail

---

## 📱 MOBILE & PWA

### For Drivers:

1. Open site on phone
2. Login with driver credentials
3. Browser shows: **"Add to Home Screen"**
4. Tap **Add**
5. App appears on home screen!
6. Opens full-screen like native app

### Features:

- ✅ Works offline
- ✅ Fast loading
- ✅ Push notifications ready
- ✅ No App Store needed
- ✅ Auto-updates

---

## 🎯 FEATURES AFTER DEPLOYMENT

### Admin Dashboard:

- Real-time stats (packages, deliveries, revenue)
- Package management (create, edit, delete, assign)
- Bulk operations (create, assign, print)
- Driver management (create with login)
- Merchant management
- Team management (users, roles)
- Reports & analytics (export CSV)
- Settings (company info, labels)
- Direct label printing
- QR code generation

### Driver Mobile Portal:

- Login with username/password
- Dashboard with stats (total, delivering, delivered, COD)
- My Deliveries page
- Update package status
- View customer info
- One-tap call customer
- Navigate with Google Maps
- COD tracking
- Mobile-optimized UI
- PWA installable

### Security:

- JWT authentication
- Role-based access control (RBAC)
- Password hashing (bcrypt)
- HTTPS/SSL
- CORS configured
- Secure sessions
- Container isolation

---

## 🔧 DOCKER CONFIGURATION

### Services in docker-compose.yml:

```yaml
db: PostgreSQL 16 database
api: NestJS backend (health checked)
web: Next.js frontend (health checked)
nginx: Reverse proxy (ports 80, 443)
certbot: SSL auto-renewal
```

### Environment Variables (.env):

```env
POSTGRES_DB               Database name
POSTGRES_USER             Database user
POSTGRES_PASSWORD         Database password
JWT_SECRET                Access token secret
JWT_REFRESH_SECRET        Refresh token secret
JWT_EXPIRATION            Token lifespan (1h)
JWT_REFRESH_EXPIRATION    Refresh lifespan (30d)
NEXT_PUBLIC_API_URL       API URL for frontend
```

### Volumes (Persistent Data):

```
db_data        Database files
backups        Database backups
certbot/conf   SSL certificates
certbot/www    SSL challenges
```

---

## 📖 DOCUMENTATION FILES

After consolidation, you only need:

- **`DEPLOYMENT.md`** ⭐ This file - Everything!
- **`DRIVER_SYSTEM_EXPLAINED.md`** - Driver architecture
- **`README.md`** - Project overview

**Scripts:**

- `docker-deploy.sh` - One-command deployment
- `docker.env.example` - Environment template

**Config:**

- `docker-compose.yml` - Docker orchestration
- `nginx-docker.conf` - Web server
- `apps/api/Dockerfile` - API container
- `apps/web/Dockerfile` - Web container

---

## 🎬 COMPLETE EXAMPLE

### Fresh VPS Deployment (Full Commands):

```bash
# === ON YOUR COMPUTER ===
cd /Users/chivanvisal/Desktop/dyhe-platform
git add .
git commit -m "Production ready"
git push origin main

# === ON VPS ===
ssh root@123.45.67.89

# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone repo
cd /root
git clone https://github.com/your-username/dyhe-platform.git
cd dyhe-platform

# Setup environment
cp docker.env.example .env
openssl rand -hex 32  # Copy output
nano .env
# Paste JWT_SECRET and JWT_REFRESH_SECRET
# Set POSTGRES_PASSWORD
# Set NEXT_PUBLIC_API_URL
# Save (Ctrl+X, Y, Enter)

# Deploy!
chmod +x docker-deploy.sh
./docker-deploy.sh

# === OPTIONAL: SSL ===
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@dyhe-delivery.com \
  --agree-tos \
  --no-eff-email \
  -d dyhe-delivery.com \
  -d www.dyhe-delivery.com \
  -d api.dyhe-delivery.com

nano nginx-docker.conf  # Uncomment HTTPS, update domain
docker-compose restart nginx

# === DONE! ===
# Visit: https://dyhe-delivery.com
```

---

## ✨ QUICK REFERENCE

### Deploy:

```bash
./docker-deploy.sh
```

### View Status:

```bash
docker-compose ps
```

### View Logs:

```bash
docker-compose logs -f
```

### Restart:

```bash
docker-compose restart
```

### Update:

```bash
git pull && docker-compose up -d --build
```

### Backup:

```bash
docker-compose exec db pg_dump -U dyhe_user dyhe_production > backup.sql
```

### Stop:

```bash
docker-compose down
```

---

## 🎊 SUCCESS CRITERIA

Your deployment is successful when:

- ✅ Can access web (green padlock if SSL)
- ✅ Can login as super admin
- ✅ Can create drivers with login
- ✅ Driver can login on mobile
- ✅ Can create and assign packages
- ✅ Can print labels (direct to printer)
- ✅ Driver sees only their packages
- ✅ Can update package status
- ✅ Settings page works
- ✅ Reports generate
- ✅ Mobile responsive
- ✅ PWA installable

---

## 🆘 NEED HELP?

### Common Issues:

**"Container won't start"**
→ `docker-compose logs api`

**"Can't access web"**
→ Check `NEXT_PUBLIC_API_URL` in .env

**"Database connection failed"**
→ `docker-compose ps db` - is it running?

**"Out of disk space"**
→ `docker system prune -a`

**"SSL not working"**
→ Check domain DNS, wait for propagation

---

## 💡 PRO TIPS

1. **Always backup before updates**

   ```bash
   docker-compose exec db pg_dump -U dyhe_user dyhe_production > backup_before_update.sql
   ```

2. **Monitor logs regularly**

   ```bash
   docker-compose logs -f | grep -i error
   ```

3. **Test locally first**
   - Run `./docker-deploy.sh` on your computer
   - Test all features
   - Then deploy to VPS

4. **Use strong passwords**
   - Database: 16+ characters
   - JWT: Generated with openssl (32 bytes)
   - Admin: Change default immediately

5. **Setup firewall**

   ```bash
   ufw allow 22,80,443/tcp
   ufw enable
   ```

6. **Automate backups**
   - Daily backups to `/root/dyhe-platform/backups`
   - Keep last 30 days
   - Test restore monthly

---

## 🎉 CONGRATULATIONS!

You now have:

- ✅ **Complete delivery platform** deployed
- ✅ **One-command** deployment & updates
- ✅ **Docker-powered** (modern & scalable)
- ✅ **Mobile-optimized** driver portal
- ✅ **Secure** (SSL, RBAC, hashing)
- ✅ **Production-ready** (health checks, auto-restart)
- ✅ **Easy to maintain** (simple commands)

---

## 📞 SUPPORT

If you need help:

1. Check logs: `docker-compose logs -f`
2. Check status: `docker-compose ps`
3. Restart: `docker-compose restart`
4. Full rebuild: `docker-compose down && docker-compose up -d --build`

---

**DEPLOY NOW:**

```bash
./docker-deploy.sh
```

**GO LIVE IN 5 MINUTES! 🚀🎊**
