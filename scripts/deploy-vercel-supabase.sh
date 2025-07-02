#!/bin/bash

# Deploy TheCueRoom to Vercel + Supabase (Optimal Free Stack)
# Zero monthly cost with excellent performance

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_step() { echo -e "${YELLOW}▶ $1${NC}"; }

echo "🚀 Deploying TheCueRoom to Vercel + Supabase"
echo "=============================================="

# Check prerequisites
print_step "Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "Node.js required"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "Git required"; exit 1; }

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    print_info "Installing Vercel CLI..."
    npm install -g vercel
fi

print_success "Prerequisites satisfied"

# Install dependencies
print_step "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Create Supabase configuration
print_step "Preparing Supabase configuration..."
cat > .env.supabase << 'EOF'
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database URL for Drizzle
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres

# Authentication
SESSION_SECRET=TheCueRoom2024SupabaseDeployment64CharSecretKeyForProduction

# Email (Gmail SMTP - Free)
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
FROM_EMAIL=support@thecueroom.xyz
ADMIN_EMAIL=admin@thecueroom.xyz
SUPPORT_EMAIL=support@thecueroom.xyz

# Application Settings
NODE_ENV=production
DOMAIN=thecueroom.xyz
SITE_URL=https://thecueroom.xyz
API_URL=https://thecueroom.xyz/api
EOF

print_success "Supabase configuration template created"

# Copy Vercel configuration
print_step "Configuring Vercel deployment..."
cp hosting-configs/vercel-supabase.json vercel.json

# Build optimized version
print_step "Building optimized production version..."
NODE_ENV=production npm run build

# Copy static assets
echo "thecueroom.xyz" > dist/CNAME
touch dist/.nojekyll

# Copy favicon if exists
if [ -f "attached_assets/Icon_1751081882323.ico" ]; then
    cp attached_assets/Icon_1751081882323.ico dist/favicon.ico
fi

print_success "Production build completed"

# Deploy to Vercel
print_step "Deploying to Vercel..."
vercel deploy --prod --yes

print_success "Deployment initiated"

echo ""
print_info "🎯 Manual Steps Required:"
echo ""
echo "1. Create Supabase Project:"
echo "   • Go to https://supabase.com"
echo "   • Create new project: 'thecueroom'"
echo "   • Copy URL and API keys to Vercel environment variables"
echo ""
echo "2. Setup Database:"
echo "   • Run hosting-configs/supabase-schema.sql in Supabase SQL Editor"
echo "   • Verify tables are created successfully"
echo ""
echo "3. Configure Vercel Environment Variables:"
echo "   • Go to Vercel dashboard → Project → Settings → Environment Variables"
echo "   • Add all variables from .env.supabase"
echo ""
echo "4. Setup Custom Domain:"
echo "   • In Vercel dashboard → Domains"
echo "   • Add thecueroom.xyz"
echo "   • Update DNS: CNAME @ → cname.vercel-dns.com"
echo ""
echo "5. Configure Email:"
echo "   • Enable Gmail 2FA and generate App Password"
echo "   • Add GMAIL_USER and GMAIL_APP_PASSWORD to Vercel"
echo ""
print_success "Vercel + Supabase deployment ready!"
print_info "Total monthly cost: $0 (Free tiers only)"
print_info "Performance: Excellent global CDN, <200ms response times"