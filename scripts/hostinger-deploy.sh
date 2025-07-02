#!/bin/bash

# TheCueRoom Hostinger Deployment Automation Script
# This script prepares and deploys TheCueRoom for thecueroom.xyz with Hostinger

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

echo "🚀 TheCueRoom Hostinger Deployment Setup"
echo "=========================================="

# Step 1: Check prerequisites
print_info "Checking prerequisites..."

if [ ! -f "package.json" ]; then
    print_error "package.json not found. Run this script from TheCueRoom root directory."
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

print_success "Prerequisites check passed"

# Step 2: Install dependencies
print_info "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Step 3: Create production environment file
print_info "Creating production environment configuration..."
cat > .env.production << 'EOF'
# TheCueRoom Production Environment for Hostinger Deployment
NODE_ENV=production
DOMAIN=thecueroom.xyz
SITE_URL=https://thecueroom.xyz
API_URL=https://api.thecueroom.xyz

# Database (Railway PostgreSQL)
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway

# Session Security
SESSION_SECRET=TheCueRoom2024UltraSecureSessionKey64CharactersLongForMaximumSecurity

# Email Configuration (Choose one method)
# Method 1: Gmail SMTP (Free - Recommended)
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
FROM_EMAIL=support@thecueroom.xyz

# Method 2: Hostinger Email ($0.99/month)
# SMTP_HOST=smtp.hostinger.com
# SMTP_PORT=587
# SMTP_USER=admin@thecueroom.xyz
# SMTP_PASS=your-email-password

# Admin Configuration
ADMIN_EMAIL=admin@thecueroom.xyz
SUPPORT_EMAIL=support@thecueroom.xyz
CONTACT_EMAIL=contact@thecueroom.xyz

# Optional: OpenAI for advanced features
# OPENAI_API_KEY=your-openai-api-key-here
EOF

print_success "Production environment file created"

# Step 4: Update client configuration for domain
print_info "Configuring client for thecueroom.xyz..."
cat > client/src/lib/config.ts << 'EOF'
// TheCueRoom Production Configuration
export const config = {
  domain: 'thecueroom.xyz',
  siteUrl: 'https://thecueroom.xyz',
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.thecueroom.xyz',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export const emailConfig = {
  adminEmail: 'admin@thecueroom.xyz',
  supportEmail: 'support@thecueroom.xyz',
  contactEmail: 'contact@thecueroom.xyz',
  noreplyEmail: 'support@thecueroom.xyz',
};
EOF

print_success "Client configuration updated"

# Step 5: Build production version
print_info "Building production version..."
NODE_ENV=production npx vite build --config vite.config.production.ts
print_success "Production build completed"

# Step 6: Generate static pages with Hostinger optimization
print_info "Generating optimized static pages..."
node scripts/build-static.js

# Add Hostinger-specific optimizations
cat > dist/_redirects << 'EOF'
# Hostinger redirect rules
/api/* https://api.thecueroom.xyz/:splat 200
/* /index.html 200
EOF

# Create robots.txt optimized for Hostinger
cat > dist/robots.txt << 'EOF'
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: https://thecueroom.xyz/sitemap.xml
EOF

print_success "Static pages generated with Hostinger optimizations"

# Step 7: Create GitHub deployment files
print_info "Creating GitHub deployment configuration..."

mkdir -p .github/workflows
cat > .github/workflows/hostinger-deploy.yml << 'EOF'
name: Deploy TheCueRoom to GitHub Pages (Hostinger Domain)

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build for production
      run: |
        NODE_ENV=production npx vite build --config vite.config.production.ts
        node scripts/build-static.js
      env:
        NODE_ENV: production
        VITE_DOMAIN: thecueroom.xyz
        VITE_API_URL: https://api.thecueroom.xyz
        VITE_SITE_URL: https://thecueroom.xyz
    
    - name: Setup Pages
      uses: actions/configure-pages@v4
    
    - name: Upload artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: 'dist'
    
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
EOF

print_success "GitHub Actions workflow created"

# Step 8: Create deployment package
print_info "Creating deployment package..."
tar -czf TheCueRoom-Hostinger-Ready.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=*.log \
  --exclude=.env \
  .

print_success "Deployment package created: TheCueRoom-Hostinger-Ready.tar.gz"

# Step 9: Create Railway backend deployment
print_info "Creating Railway backend configuration..."
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/api/health"
  }
}
EOF

# Create Dockerfile for Railway
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]
EOF

print_success "Railway deployment files created"

# Step 10: Display next steps
echo ""
print_success "🎉 TheCueRoom is ready for Hostinger deployment!"
echo ""
print_info "Next Steps:"
echo ""
echo "1. 🌐 Configure Hostinger DNS:"
echo "   - Login to Hostinger hPanel"
echo "   - Go to Domains → thecueroom.xyz → DNS"
echo "   - Add A records pointing to GitHub Pages:"
echo "     185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153"
echo ""
echo "2. 📧 Setup Email (Choose one):"
echo "   Option A: Hostinger Email (\$0.99/month)"
echo "   Option B: Cloudflare Email Routing (Free)"
echo "   Option C: Gmail SMTP (Free)"
echo ""
echo "3. 🚀 Deploy to GitHub:"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'TheCueRoom production deployment'"
echo "   git remote add origin https://github.com/yourusername/thecueroom-xyz.git"
echo "   git push -u origin main"
echo ""
echo "4. ⚙️ Configure GitHub Pages:"
echo "   - Repository Settings → Pages"
echo "   - Source: GitHub Actions"
echo "   - Custom domain: thecueroom.xyz"
echo ""
echo "5. 🗄️ Deploy Backend to Railway:"
echo "   railway login"
echo "   railway init"
echo "   railway add postgresql"
echo "   railway deploy"
echo ""
print_info "📖 Detailed instructions: HOSTINGER_DEPLOYMENT_GUIDE.md"
print_success "Your TheCueRoom platform is ready to go live!"
EOF

chmod +x scripts/hostinger-deploy.sh

print_success "Hostinger deployment script created"