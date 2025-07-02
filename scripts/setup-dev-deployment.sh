#!/bin/bash

# TheCueRoom - GitHub Pages Development Setup Script
echo "🔧 TheCueRoom - GitHub Pages Development Setup"
echo "=============================================="

# Get repository information
if [ -z "$1" ]; then
    echo "📝 Usage: $0 <github-username>"
    echo "Example: $0 myusername"
    echo ""
    echo "This will set up deployment to: https://myusername.github.io/thecueroom/"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="thecueroom"

echo "👤 GitHub Username: $GITHUB_USERNAME"
echo "📁 Repository: $REPO_NAME"
echo "🌐 Dev URL: https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
    git branch -M main
fi

# Create development branch if it doesn't exist
echo "🌿 Setting up development branch..."
git checkout -b dev 2>/dev/null || git checkout dev

# Add package.json script (since we can't edit directly)
echo "📦 Adding build scripts..."
if ! grep -q '"build:dev"' package.json; then
    echo ""
    echo "⚠️  MANUAL STEP REQUIRED:"
    echo "Add this script to your package.json scripts section:"
    echo ""
    echo '"build:dev": "node scripts/build-dev.js",'
    echo ""
    echo "Press Enter when completed..."
    read
fi

# Build the development version
echo "🏗️  Building development version..."
npm run build:dev

# Set up GitHub repository
echo "🔗 Setting up GitHub repository..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

# Create .gitignore for development
echo "📄 Creating development .gitignore..."
cat > .gitignore.dev << 'EOF'
# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.development
.env.test

# Logs
*.log
npm-debug.log*

# IDE files
.vscode/
.idea/
*.swp

# OS files
.DS_Store
Thumbs.db

# Keep dist for GitHub Pages
# dist/

# Database
*.sqlite
*.db

# Temporary files
tmp/
temp/

# Cache
.cache/
EOF

# Add all files and commit
echo "📝 Committing development build..."
git add .
git commit -m "Development build for GitHub Pages deployment" || echo "No changes to commit"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
echo ""
echo "📋 Next steps:"
echo "1. Push to GitHub: git push -u origin dev"
echo "2. Go to: https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/pages"
echo "3. Set source to 'GitHub Actions'"
echo "4. The site will be available at: https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
echo ""
echo "🔄 For updates:"
echo "- Push to 'dev' branch to trigger automatic deployment"
echo "- Run 'npm run build:dev' to build locally"
echo ""

# Create deployment status check
echo "✅ Development deployment setup completed!"
echo ""
echo "📊 Build Summary:"
echo "- Environment: Development"
echo "- Base Path: /$REPO_NAME/"
echo "- Build Output: dist/public/"
echo "- GitHub Actions: Enabled"
echo "- Auto-deploy: On push to dev branch"