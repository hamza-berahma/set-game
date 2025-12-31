#!/bin/bash

# Railway Environment Variables Setup Helper
# This script helps you set up the correct environment variables for Railway deployment

echo "=========================================="
echo "Railway Environment Variables Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Backend Setup${NC}"
echo "1. Deploy backend service first"
echo "2. Get your backend URL from Railway (Settings → Networking → Generate Domain)"
read -p "Enter your backend URL (e.g., https://backend-xxxx.up.railway.app): " BACKEND_URL

if [[ ! $BACKEND_URL =~ ^https?:// ]]; then
    echo -e "${RED}Error: URL must start with http:// or https://${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Frontend Setup${NC}"
echo "1. Deploy frontend service"
echo "2. Get your frontend URL from Railway (Settings → Networking → Generate Domain)"
read -p "Enter your frontend URL (e.g., https://frontend-xxxx.up.railway.app): " FRONTEND_URL

if [[ ! $FRONTEND_URL =~ ^https?:// ]]; then
    echo -e "${RED}Error: URL must start with http:// or https://${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Environment Variables to Set in Railway"
echo "==========================================${NC}"
echo ""

echo -e "${YELLOW}BACKEND SERVICE VARIABLES:${NC}"
echo "Go to: Backend Service → Variables"
echo ""
echo "Required:"
echo "  NODE_ENV=production"
echo "  JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo 'GENERATE-A-32-CHAR-SECRET')"
echo ""
echo "CORS (set after frontend is deployed):"
echo "  CORS_ORIGIN=$FRONTEND_URL"
echo ""
echo "Database:"
echo "  DATABASE_URL=<Auto-set by Railway when you add PostgreSQL service>"
echo "  (Use 'Add Reference' to link PostgreSQL to backend)"
echo ""
echo "Redis (optional):"
echo "  REDIS_URL=<Auto-set by Railway when you add Redis service>"
echo "  (Use 'Add Reference' to link Redis to backend)"
echo ""

echo -e "${YELLOW}FRONTEND SERVICE VARIABLES:${NC}"
echo "Go to: Frontend Service → Variables"
echo ""
echo "Required:"
echo "  VITE_API_URL=$BACKEND_URL"
echo ""
echo -e "${RED}IMPORTANT:${NC} VITE_API_URL is a build-time variable."
echo "After setting it, you MUST trigger a new deployment!"
echo ""

echo -e "${GREEN}=========================================="
echo "Setup Checklist"
echo "==========================================${NC}"
echo ""
echo "Backend:"
echo "  [ ] PostgreSQL service added"
echo "  [ ] Redis service added (optional)"
echo "  [ ] Backend service deployed"
echo "  [ ] Backend URL generated: $BACKEND_URL"
echo "  [ ] NODE_ENV=production set"
echo "  [ ] JWT_SECRET generated and set"
echo "  [ ] DATABASE_URL linked (via Add Reference)"
echo "  [ ] Database migrations run"
echo "  [ ] CORS_ORIGIN set to: $FRONTEND_URL"
echo ""
echo "Frontend:"
echo "  [ ] Frontend service deployed"
echo "  [ ] Frontend URL generated: $FRONTEND_URL"
echo "  [ ] VITE_API_URL set to: $BACKEND_URL"
echo "  [ ] Frontend redeployed (after setting VITE_API_URL)"
echo ""
echo -e "${GREEN}After setup, test:${NC}"
echo "  Backend health: $BACKEND_URL/health"
echo "  Frontend: $FRONTEND_URL"
echo ""

