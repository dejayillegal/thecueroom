#!/bin/bash

# TheCueRoom GitHub Deployment Setup Script
# This script prepares your project for deployment on GitHub Pages with custom domain

set -e

echo "🚀 Setting up TheCueRoom for GitHub Pages deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the TheCueRoom project root."
    exit 1
fi

print_info "Starting GitHub Pages deployment setup for thecueroom.xyz"

# Step 1: Install dependencies
print_info "Installing dependencies..."
npm install
print_status "Dependencies installed"

# Step 2: Build the project for production
print_info "Building project for production..."
NODE_ENV=production npx vite build --config vite.config.production.ts
print_status "Production build completed"

# Step 3: Generate static pages
print_info "Generating static pages for GitHub Pages..."
node scripts/build-static.js
print_status "Static pages generated"

# Step 4: Copy additional assets
print_info "Copying additional assets..."

# Copy favicon
if [ -f "attached_assets/Icon_1751081882323.ico" ]; then
    cp attached_assets/Icon_1751081882323.ico dist/favicon.ico
    print_status "Favicon copied"
fi

# Copy logo assets
if [ -d "attached_assets" ]; then
    mkdir -p dist/assets/images
    cp attached_assets/*.png dist/assets/images/ 2>/dev/null || true
    print_status "Logo assets copied"
fi

# Step 5: Create necessary configuration files
print_info "Creating configuration files..."

# Create .nojekyll file to prevent Jekyll processing
touch dist/.nojekyll
print_status ".nojekyll file created"

# Create robots.txt
cat > dist/robots.txt << 'EOF'
User-agent: *
Allow: /

Sitemap: https://thecueroom.xyz/sitemap.xml
EOF
print_status "robots.txt created"

# Create sitemap.xml
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
  <url>
    <loc>https://thecueroom.xyz/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://thecueroom.xyz/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>
EOF
print_status "sitemap.xml created"

# Step 6: Verify build output
print_info "Verifying build output..."

if [ ! -f "dist/index.html" ]; then
    print_error "index.html not found in dist folder"
    exit 1
fi

if [ ! -f "dist/CNAME" ]; then
    print_error "CNAME file not found in dist folder"
    exit 1
fi

print_status "Build verification passed"

# Step 7: Display next steps
echo ""
print_status "🎉 GitHub Pages setup completed successfully!"
echo ""
print_info "Next steps to deploy to thecueroom.xyz:"
echo ""
echo "1. 📁 Create a new GitHub repository:"
echo "   - Go to https://github.com/new"
echo "   - Name: thecueroom-xyz"
echo "   - Set to Public (required for GitHub Pages)"
echo ""
echo "2. 🚀 Push your code to GitHub:"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial TheCueRoom deployment'"
echo "   git branch -M main"
echo "   git remote add origin https://github.com/yourusername/thecueroom-xyz.git"
echo "   git push -u origin main"
echo ""
echo "3. ⚙️  Configure GitHub Pages:"
echo "   - Go to repository Settings > Pages"
echo "   - Source: GitHub Actions"
echo "   - Custom domain: thecueroom.xyz"
echo "   - Enforce HTTPS: ✅"
echo ""
echo "4. 🌐 Configure DNS (at your domain registrar):"
echo "   A records pointing to GitHub Pages IPs:"
echo "   185.199.108.153"
echo "   185.199.109.153" 
echo "   185.199.110.153"
echo "   185.199.111.153"
echo ""
echo "5. 📧 Set up free email hosting (see EMAIL_HOSTING_SETUP.md)"
echo ""
echo "6. 🔐 Add GitHub Secrets for backend deployment:"
echo "   - DATABASE_URL"
echo "   - SESSION_SECRET"
echo "   - GMAIL_USER and GMAIL_APP_PASSWORD (or other email config)"
echo ""
print_status "Your TheCueRoom platform is ready for deployment!"
echo ""
print_info "📖 For detailed instructions, see:"
echo "   - GITHUB_DEPLOYMENT_GUIDE.md"
echo "   - EMAIL_HOSTING_SETUP.md"
echo "   - COMPLETE_DEPLOYMENT_GUIDE.md"