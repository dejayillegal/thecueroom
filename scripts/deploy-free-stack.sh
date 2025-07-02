#!/bin/bash

# TheCueRoom 100% Free Deployment Script
# Deploys to GitHub Pages + Vercel + Neon + Cloudflare (all free tiers)

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

echo "🚀 TheCueRoom 100% Free Stack Deployment"
echo "========================================"

# Check prerequisites
print_info "Checking requirements..."

if [ ! -f "package.json" ]; then
    print_error "Run this script from TheCueRoom project root"
    exit 1
fi

if ! command -v git &> /dev/null; then
    print_error "Git is required"
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js 18+ is required"
    exit 1
fi

print_success "Requirements satisfied"

# Install dependencies
print_info "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Create free environment configuration
print_info "Creating free deployment configuration..."
cat > .env.free << 'EOF'
# TheCueRoom Free Stack Configuration
NODE_ENV=production

# Domain
DOMAIN=thecueroom.xyz
SITE_URL=https://thecueroom.xyz
API_URL=https://api.thecueroom.xyz

# Free Database (Neon)
DATABASE_URL=postgresql://user:pass@host:port/neondb

# Session Security
SESSION_SECRET=TheCueRoom2024FreeDeploymentSecureKey64CharactersForMaxSecurity

# Free Email (Cloudflare + Gmail)
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
FROM_EMAIL=support@thecueroom.xyz
ADMIN_EMAIL=admin@thecueroom.xyz
SUPPORT_EMAIL=support@thecueroom.xyz

# Optional AI Features
# OPENAI_API_KEY=your-openai-key
EOF

print_success "Environment configuration created"

# Build optimized production version
print_info "Building optimized production version..."
NODE_ENV=production npm run build

# Copy static assets for GitHub Pages
print_info "Preparing GitHub Pages deployment..."
echo "thecueroom.xyz" > dist/CNAME
touch dist/.nojekyll

# Copy favicon if exists
if [ -f "attached_assets/Icon_1751081882323.ico" ]; then
    cp attached_assets/Icon_1751081882323.ico dist/favicon.ico
    print_success "Favicon added"
fi

# Create robots.txt
cat > dist/robots.txt << 'EOF'
User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://thecueroom.xyz/sitemap.xml
EOF

# Generate sitemap
cat > dist/sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://thecueroom.xyz/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://thecueroom.xyz/about</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://thecueroom.xyz/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
EOF

print_success "Static files prepared"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

print_success "Production build completed"

echo ""
print_info "🎯 Deployment Instructions:"
echo ""
echo "1. Free Database Setup (Neon):"
echo "   • Sign up at https://neon.tech (free account)"
echo "   • Create project: 'thecueroom'"
echo "   • Copy connection string to .env.free"
echo ""
echo "2. Free Email Setup (Cloudflare):"
echo "   • Add thecueroom.xyz to cloudflare.com (free)"
echo "   • Update nameservers in Hostinger"
echo "   • Enable Email Routing → Forward to Gmail"
echo ""
echo "3. Deploy Backend (Vercel - Free):"
echo "   vercel --prod"
echo "   • Add environment variables from .env.free"
echo "   • Note the deployment URL"
echo ""
echo "4. Update DNS (Cloudflare):"
echo "   • CNAME api → your-vercel-deployment.vercel.app"
echo "   • A records for GitHub Pages (already configured)"
echo ""
echo "5. Deploy Frontend (GitHub Pages):"
echo "   git add ."
echo "   git commit -m 'Deploy TheCueRoom free stack'"
echo "   git push origin main"
echo ""
echo "6. Enable GitHub Pages:"
echo "   • Repository Settings → Pages"
echo "   • Source: GitHub Actions"
echo "   • Custom domain: thecueroom.xyz"
echo ""
print_success "All files ready for 100% free deployment!"
echo ""
print_info "Total monthly cost: $0 (only domain registration fee)"
print_info "Services: GitHub Pages + Vercel + Neon + Cloudflare"