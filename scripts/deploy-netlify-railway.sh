#!/bin/bash

# Deploy TheCueRoom to Netlify + Railway (Alternative Free Stack)
# Excellent for full-stack development workflow

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_step() { echo -e "${YELLOW}▶ $1${NC}"; }

echo "🚀 Deploying TheCueRoom to Netlify + Railway"
echo "============================================"

# Check prerequisites
print_step "Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "Node.js required"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "Git required"; exit 1; }

# Install CLIs if needed
if ! command -v netlify &> /dev/null; then
    print_info "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

if ! command -v railway &> /dev/null; then
    print_info "Installing Railway CLI..."
    npm install -g @railway/cli
fi

print_success "Prerequisites satisfied"

# Install dependencies
print_step "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Create Railway configuration
print_step "Preparing Railway backend configuration..."
cat > .env.railway << 'EOF'
# Railway Backend Configuration
NODE_ENV=production
PORT=$PORT

# Database (Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Authentication
SESSION_SECRET=TheCueRoom2024RailwayDeployment64CharSecretKeyForProduction

# Email Configuration
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
FROM_EMAIL=support@thecueroom.xyz
ADMIN_EMAIL=admin@thecueroom.xyz
SUPPORT_EMAIL=support@thecueroom.xyz

# Domain Configuration
DOMAIN=thecueroom.xyz
SITE_URL=https://thecueroom.xyz
API_URL=https://api.thecueroom.xyz
EOF

# Copy configuration files
cp hosting-configs/netlify-railway.toml netlify.toml
cp hosting-configs/railway.json railway.json

print_success "Configuration files prepared"

# Build frontend for Netlify
print_step "Building frontend for Netlify..."
cd client
npm run build
cd ..

# Copy static assets
echo "thecueroom.xyz" > client/dist/CNAME
touch client/dist/.nojekyll

if [ -f "attached_assets/Icon_1751081882323.ico" ]; then
    cp attached_assets/Icon_1751081882323.ico client/dist/favicon.ico
fi

print_success "Frontend build completed"

# Deploy backend to Railway
print_step "Deploying backend to Railway..."
railway login
railway init
railway add postgresql
railway deploy

print_success "Backend deployed to Railway"

# Deploy frontend to Netlify
print_step "Deploying frontend to Netlify..."
netlify deploy --prod --dir=client/dist

print_success "Frontend deployed to Netlify"

echo ""
print_info "🎯 Configuration Steps:"
echo ""
echo "1. Railway Database Setup:"
echo "   • Copy database URL from Railway dashboard"
echo "   • Run schema migration: npm run db:push"
echo ""
echo "2. Environment Variables:"
echo "   • Railway: Add variables from .env.railway"
echo "   • Netlify: Configure API_URL in build settings"
echo ""
echo "3. Custom Domains:"
echo "   • Netlify: Add thecueroom.xyz in domain settings"
echo "   • Railway: Add api.thecueroom.xyz"
echo ""
echo "4. DNS Configuration:"
echo "   • CNAME @ → elegant-swan-123.netlify.app"
echo "   • CNAME api → your-app.railway.app"
echo ""
print_success "Netlify + Railway deployment completed!"
print_info "Total monthly cost: $0 (Free tiers)"
print_info "Performance: Good global coverage, reliable uptime"