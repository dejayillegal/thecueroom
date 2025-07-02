#!/bin/bash

# TheCueRoom - Automated Setup Script
# This script sets up the complete TheCueRoom platform

echo "🎵 TheCueRoom Setup - Underground Music Community Platform"
echo "========================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    echo "   Please upgrade Node.js"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📋 Creating environment configuration..."
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo ""
    echo "⚠️  IMPORTANT: You must configure your .env file with:"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - SESSION_SECRET (64 random characters)"
    echo "   - SENDGRID_API_KEY (for email service)"
    echo ""
    echo "   Example setup:"
    echo "   1. Get free PostgreSQL database from neon.tech"
    echo "   2. Get free SendGrid account for email service"
    echo "   3. Generate session secret with:"
    echo "      node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
    echo ""
else
    echo "✅ Environment file already exists"
fi

# Generate session secret if not set
if ! grep -q "SESSION_SECRET=your-super-secret" .env; then
    echo "🔐 Session secret already configured"
else
    echo "🔐 Generating secure session secret..."
    SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    sed -i.bak "s/SESSION_SECRET=your-super-secret-session-key-here/SESSION_SECRET=$SECRET/" .env
    rm -f .env.bak
    echo "✅ Session secret generated and configured"
fi

# Check database configuration
echo "🗄️  Checking database configuration..."
if grep -q "DATABASE_URL=postgresql://" .env && ! grep -q "DATABASE_URL=postgresql://username:password" .env; then
    echo "✅ Database URL configured"
    
    # Try to push database schema
    echo "📊 Setting up database schema..."
    npm run db:push
    
    if [ $? -eq 0 ]; then
        echo "✅ Database schema configured successfully"
    else
        echo "⚠️  Database schema setup failed - please check your DATABASE_URL"
    fi
else
    echo "⚠️  Database URL not configured in .env file"
    echo "   Please set DATABASE_URL to your PostgreSQL connection string"
fi

# Check email configuration
echo "📧 Checking email configuration..."
if grep -q "SENDGRID_API_KEY=your-sendgrid" .env; then
    echo "⚠️  SendGrid API key not configured"
    echo "   Please set SENDGRID_API_KEY in .env file"
else
    echo "✅ Email service configured"
fi

echo ""
echo "🎯 Setup Summary:"
echo "=================="

# Check what's configured
CONFIGURED=0
TOTAL=3

if ! grep -q "DATABASE_URL=postgresql://username:password" .env; then
    echo "✅ Database: Configured"
    ((CONFIGURED++))
else
    echo "❌ Database: Not configured"
fi

if ! grep -q "SESSION_SECRET=your-super-secret" .env; then
    echo "✅ Security: Session secret generated"
    ((CONFIGURED++))
else
    echo "❌ Security: Session secret not generated"
fi

if ! grep -q "SENDGRID_API_KEY=your-sendgrid" .env; then
    echo "✅ Email: Configured"
    ((CONFIGURED++))
else
    echo "❌ Email: Not configured"
fi

echo ""
echo "Configuration: $CONFIGURED/$TOTAL components ready"

if [ $CONFIGURED -eq $TOTAL ]; then
    echo ""
    echo "🚀 Setup Complete! Your platform is ready to run."
    echo ""
    echo "To start the application:"
    echo "   npm run dev"
    echo ""
    echo "The platform will be available at: http://localhost:5000"
    echo ""
    echo "Default admin login:"
    echo "   Email: admin@thecueroom.xyz"
    echo "   Password: admin123"
    echo "   (Please change this password after first login)"
    echo ""
    echo "📚 Documentation available:"
    echo "   - README.md - Project overview"
    echo "   - SETUP_INSTRUCTIONS.md - Detailed setup guide"
    echo "   - DEPLOYMENT_GUIDE.md - Deployment instructions"
    echo ""
else
    echo ""
    echo "⚠️  Setup partially complete. Please:"
    echo "   1. Configure missing components in .env file"
    echo "   2. Run setup again or manually run: npm run db:push"
    echo "   3. Start with: npm run dev"
    echo ""
    echo "📚 Need help? Check SETUP_INSTRUCTIONS.md for detailed guidance"
fi

echo ""
echo "🎵 Welcome to TheCueRoom - Underground Music Community Platform"
echo "   Built for India's electronic music artists and DJs"