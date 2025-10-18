# 🚀 DYHE Platform - Complete Deployment Guide

**One document. Everything you need. Super simple.**

---

## ⚡ QUICK START (5 Minutes)

### Local or VPS - Same 3 Commands:

```bash
# 1. Setup environment
cp docker.env.example .env
nano .env  # Add your passwords & secrets

# 2. Deploy
chmod +x docker-deploy.sh
./docker-deploy.sh

# 3. Access
# Web: http://localhost:3000
# Login: superadmin / admin123
```

**Done! 🎉**

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
- Run migrations
- Seed superadmin & settings
- Health check everything

**You'll see:**

```
╔════════════════════════════════════════╗
║     🎉 Deployment Complete!           ║
╚════════════════════════════════════════╝

📍 Access your application:
   🌐 Web: http://123.45.67.89:3000
   🔌 API: http://123.45.67.89:8000

🔐 Default Login:
   Username: superadmin
   Password: admin123
```

#### 10. Test It!

On your computer, open browser:

```
http://123.45.67.89:3000
```

Login:

- Username: `superadmin`
- Password: `admin123`

**YOU'RE LIVE! ✅**

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

### Container Won't Start:

```bash
# Check logs
docker-compose logs api

# Check port conflicts
lsof -i :8000

# Restart
docker-compose restart api

# Full rebuild
docker-compose down
docker-compose up -d --build
```

### Database Errors:

```bash
# Check database running
docker-compose ps db

# View database logs
docker-compose logs db

# Access database
docker-compose exec db psql -U dyhe_user -d dyhe_production

# Verify DATABASE_URL
docker-compose exec api env | grep DATABASE_URL
```

### Can't Access Web:

```bash
# Check web logs
docker-compose logs web

# Check API URL
docker-compose exec web env | grep NEXT_PUBLIC_API_URL

# Restart web
docker-compose restart web
```

### Out of Disk Space:

```bash
# Clean Docker
docker system prune -a -f

# Remove old images
docker image prune -a

# Check disk usage
df -h
```

### SSL Issues:

```bash
# Check certificates
docker-compose run certbot certificates

# Renew manually
docker-compose run certbot renew

# Check nginx config
docker-compose exec nginx nginx -t

# Restart nginx
docker-compose restart nginx
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
