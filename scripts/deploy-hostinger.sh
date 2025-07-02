#!/bin/bash

# TheCueRoom - Hostinger Deployment Script
# Domain: thecueroom.xyz

echo "🚀 TheCueRoom Hostinger Deployment Setup"
echo "Domain: thecueroom.xyz"
echo "========================================="

# Check if required tools are installed
check_dependencies() {
    echo "Checking dependencies..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git is required but not installed"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is required but not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is required but not installed"
        exit 1
    fi
    
    echo "✅ All dependencies are installed"
}

# Build the project
build_project() {
    echo "Building project for production..."
    
    # Install dependencies
    npm ci
    
    # Build frontend
    npm run build
    
    # Build server for Vercel
    esbuild server/vercel-adapter.ts --bundle --platform=node --target=node18 --outfile=dist/api/index.js --external:pg-native --external:@neondatabase/serverless
    
    echo "✅ Build completed"
}

# Create GitHub repository setup
setup_github() {
    echo "Setting up GitHub repository..."
    
    # Initialize git if not already done
    if [ ! -d ".git" ]; then
        git init
        git branch -M main
    fi
    
    # Create .gitignore for production
    cat > .gitignore << EOF
# Production files
node_modules/
.env
.env.local
.env.development
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Build files (keep dist for deployment)
# dist/

# Database
*.sqlite
*.db

# Temporary files
tmp/
temp/
EOF
    
    # Add all files
    git add .
    git commit -m "Initial commit - TheCueRoom production ready"
    
    echo "✅ Git repository setup completed"
    echo "📝 Next: Push to GitHub and enable Pages"
}

# Create DNS configuration guide
create_dns_guide() {
    cat > HOSTINGER_DNS_SETUP.md << 'EOF'
# Hostinger DNS Configuration for thecueroom.xyz

## DNS Records to Add

### For GitHub Pages (Frontend)
```
Type: A
Name: @
Value: 185.199.108.153
TTL: 3600

Type: A
Name: @  
Value: 185.199.109.153
TTL: 3600

Type: A
Name: @
Value: 185.199.110.153
TTL: 3600

Type: A
Name: @
Value: 185.199.111.153
TTL: 3600

Type: CNAME
Name: www
Value: [your-github-username].github.io
TTL: 3600
```

### For API (Vercel)
```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
TTL: 3600
```

### For Email (Gmail SMTP)
```
Type: MX
Name: @
Value: smtp.gmail.com
Priority: 10
TTL: 3600
```

## Steps:
1. Login to Hostinger control panel
2. Go to DNS/Nameservers section
3. Add the above records
4. Wait 24-48 hours for propagation
5. Verify at https://dnschecker.org

## Email Setup:
1. Create Gmail account: support@thecueroom.xyz
2. Enable 2FA and generate app password
3. Add credentials to environment variables
EOF
    
    echo "✅ DNS configuration guide created"
}

# Create deployment package
create_deployment_package() {
    echo "Creating deployment package..."
    
    # Create production environment template
    cat > .env.production.template << 'EOF'
# TheCueRoom Production Environment Variables
# Copy this to .env.production and fill in your values

# Database Configuration (Supabase)
DATABASE_URL=postgresql://postgres:[password]@[project-ref].supabase.co:5432/postgres

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=support@thecueroom.xyz
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=TheCueRoom <support@thecueroom.xyz>

# Session Security (Generate a secure random string)
SESSION_SECRET=your-super-secure-session-secret-here

# OpenAI Configuration (Optional)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Production URLs
VITE_API_URL=https://api.thecueroom.xyz
VITE_DOMAIN=thecueroom.xyz

# Node Environment
NODE_ENV=production
EOF
    
    # Create deployment checklist
    cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# TheCueRoom Deployment Checklist

## Pre-Deployment
- [ ] GitHub repository created
- [ ] Supabase project created and configured
- [ ] Gmail SMTP credentials obtained
- [ ] Environment variables configured
- [ ] DNS records added to Hostinger

## GitHub Pages Setup
- [ ] Repository pushed to GitHub
- [ ] GitHub Pages enabled in repository settings
- [ ] Custom domain (thecueroom.xyz) configured
- [ ] HTTPS enforcement enabled
- [ ] Build action working

## Vercel API Setup  
- [ ] Vercel account connected to GitHub
- [ ] Project imported from GitHub
- [ ] Environment variables added to Vercel
- [ ] API deployment successful
- [ ] Custom domain (api.thecueroom.xyz) configured

## Post-Deployment Testing
- [ ] Website loads at thecueroom.xyz
- [ ] Authentication working
- [ ] Email verification working
- [ ] Admin panel accessible
- [ ] Database operations working
- [ ] Mobile responsiveness verified

## Go-Live
- [ ] Admin account created
- [ ] Content populated
- [ ] Monitoring setup
- [ ] Backup procedures established
EOF
    
    echo "✅ Deployment package created"
}

# Main execution
main() {
    check_dependencies
    build_project
    setup_github
    create_dns_guide
    create_deployment_package
    
    echo ""
    echo "🎉 Hostinger deployment setup completed!"
    echo ""
    echo "📁 Files created:"
    echo "   • HOSTINGER_DNS_SETUP.md"
    echo "   • DEPLOYMENT_CHECKLIST.md"
    echo "   • .env.production.template"
    echo "   • .gitignore"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Create GitHub repository"
    echo "2. Push code: git remote add origin [your-repo-url]"
    echo "3. Push code: git push -u origin main"
    echo "4. Enable GitHub Pages"
    echo "5. Configure DNS at Hostinger"
    echo "6. Deploy API to Vercel"
    echo ""
    echo "📖 Follow DEPLOYMENT_CHECKLIST.md for complete setup"
}

# Run main function
main