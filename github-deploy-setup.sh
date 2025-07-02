#!/usr/bin/env bash
set -e

# ┌───────────────────────────────────────────────────────────────────┐
# │       TheCueRoom GitHub Pages Deployment Setup Script          │
# └───────────────────────────────────────────────────────────────────┘

RED='\033[0;31m'    YELLOW='\033[1;33m'
GREEN='\033[0;32m'  BLUE='\033[0;34m'
NC='\033[0m'        # No color

info()   { echo -e "${BLUE}ℹ️  $1${NC}"; }
success(){ echo -e "${GREEN}✅ $1${NC}"; }
warn()   { echo -e "${YELLOW}⚠️  $1${NC}"; }
error()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

# ensure we’re in project root
[ -f package.json ] || error "package.json not found; run from project root"

info "Installing project dependencies…"
npm install
success "Dependencies installed"

info "Building everything and generating static assets…"
npm run build:static
success "Static build complete"

info "Copying CNAME, favicon, robots.txt & sitemap.xml…"
# you can adjust these as needed
[ -f client/public/CNAME ] && cp client/public/CNAME dist/public/CNAME
[ -f attached_assets/Icon_1751081882323.ico ] && cp attached_assets/Icon_1751081882323.ico dist/favicon.ico
cat > dist/robots.txt << 'EOF'
User-agent: *
Allow: /

Sitemap: https://thecueroom.xyz/sitemap.xml
EOF
cat > dist/sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://thecueroom.xyz/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://thecueroom.xyz/about</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://thecueroom.xyz/contact</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://thecueroom.xyz/privacy</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>
  <url><loc>https://thecueroom.xyz/terms</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>
</urlset>
success "Additional assets created"

# verify
[ -f dist/index.html ] || error "dist/index.html missing"
[ -d dist/public ]   || error "dist/public missing"
success "Build verification passed"

success "🎉 GitHub Pages setup complete! Your 'dist/public' folder is ready for deployment."
