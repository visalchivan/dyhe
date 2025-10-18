#!/bin/bash

# ================================
# DYHE Platform - Docker Deployment
# ================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   DYHE Platform - Docker Deploy       ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed!${NC}"
    echo "Install Docker: https://docs.docker.com/engine/install/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed!${NC}"
    echo "Install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
    cp docker.env.example .env
    
    # Generate JWT secrets
    JWT_SECRET=$(openssl rand -hex 32)
    JWT_REFRESH=$(openssl rand -hex 32)
    
    # Update .env with generated secrets
    sed -i "s/change-me-to-secure-random-string-min-32-chars/$JWT_SECRET/" .env
    sed -i "s/change-me-to-another-secure-random-string/$JWT_REFRESH/" .env
    
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please update .env with your database password and domain!${NC}"
    echo ""
    read -p "Press Enter to continue after updating .env..."
fi

echo -e "${BLUE}🏗️  Building Docker images...${NC}"
docker-compose build --no-cache
echo -e "${GREEN}✓ Images built${NC}"
echo ""

echo -e "${BLUE}🚀 Starting containers...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Containers started${NC}"
echo ""

echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check health
echo -e "${BLUE}🏥 Checking service health...${NC}"

# Check database
if docker-compose exec -T db pg_isready -U dyhe_user &> /dev/null; then
    echo -e "${GREEN}✓ Database is healthy${NC}"
else
    echo -e "${RED}✗ Database is not ready${NC}"
fi

# Check API
API_HEALTH=$(docker-compose exec -T api curl -s http://localhost:8000/health 2>/dev/null || echo "DOWN")
if [[ $API_HEALTH == *"ok"* ]] || [[ $API_HEALTH == *"OK"* ]]; then
    echo -e "${GREEN}✓ API is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  API is starting... (check logs: docker-compose logs api)${NC}"
fi

# Check Web
WEB_HEALTH=$(docker-compose exec -T web curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$WEB_HEALTH" == "200" ] || [ "$WEB_HEALTH" == "307" ]; then
    echo -e "${GREEN}✓ Web is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Web is starting... (check logs: docker-compose logs web)${NC}"
fi

echo ""
echo -e "${BLUE}📊 Container Status:${NC}"
docker-compose ps
echo ""

echo -e "${GREEN}"
echo "╔════════════════════════════════════════╗"
echo "║     🎉 Deployment Complete!           ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

echo -e "${BLUE}📍 Access your application:${NC}"
echo "   🌐 Web: http://localhost:3000"
echo "   🔌 API: http://localhost:8000"
echo "   🗄️  Database: localhost:5432"
echo ""

echo -e "${BLUE}🔐 Default Login:${NC}"
echo "   Username: superadmin"
echo "   Password: admin123"
echo "   ${RED}⚠️  CHANGE THIS IMMEDIATELY!${NC}"
echo ""

echo -e "${BLUE}📝 Useful Commands:${NC}"
echo "   docker-compose ps           - List containers"
echo "   docker-compose logs -f      - View all logs"
echo "   docker-compose logs -f api  - View API logs"
echo "   docker-compose logs -f web  - View Web logs"
echo "   docker-compose restart      - Restart all"
echo "   docker-compose down         - Stop all"
echo "   docker-compose up -d        - Start all"
echo ""

echo -e "${YELLOW}📌 Next Steps:${NC}"
echo "   1. Visit http://localhost:3000"
echo "   2. Login with superadmin/admin123"
echo "   3. Change password"
echo "   4. Configure settings"
echo "   5. For production with domain, update .env and nginx-docker.conf"
echo ""

echo -e "${BLUE}🔒 Setup SSL (Production):${NC}"
echo "   1. Update nginx-docker.conf with your domain"
echo "   2. Run: docker-compose run certbot certonly --webroot -w /var/www/certbot -d your-domain.com"
echo "   3. Uncomment HTTPS section in nginx-docker.conf"
echo "   4. Run: docker-compose restart nginx"
echo ""

