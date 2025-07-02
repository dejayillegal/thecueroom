# TheCueRoom Setup Instructions

> **Complete step-by-step guide to set up TheCueRoom platform from scratch**

## Table of Contents

- [Quick Setup (Recommended)](#quick-setup-recommended)
- [Manual Setup](#manual-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Authentication Setup](#authentication-setup)
- [External Services](#external-services)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Verification](#verification)

## Quick Setup (Recommended)

### One-Command Installation

```bash
# Clone repository
git clone https://github.com/TheCueRoom/platform.git
cd platform

# Make setup script executable and run
chmod +x setup.sh
./setup.sh
```

The setup script will:
- Install all dependencies
- Setup environment variables
- Initialize database
- Configure authentication
- Start development server

## Manual Setup

### Prerequisites

Ensure you have the following installed:

```bash
# Check Node.js version (Required: >=18.0.0)
node --version

# Check npm version (Required: >=9.0.0)
npm --version

# Check Git
git --version
```

If you don't have these installed:

#### Install Node.js
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Or download from https://nodejs.org/
```

#### Install Git
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install git

# macOS (using Homebrew)
brew install git

# Or download from https://git-scm.com/
```

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/TheCueRoom/platform.git

# Navigate to project directory
cd platform

# Verify project structure
ls -la
```

You should see:
```
├── client/
├── server/
├── shared/
├── package.json
├── .env.example
└── setup.sh
```

### Step 2: Install Dependencies

```bash
# Install all project dependencies
npm install

# Verify installation
npm list --depth=0
```

Expected output should show all major dependencies without errors.

### Step 3: Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env  # or use your preferred editor
```

## Environment Configuration

### Required Variables

Edit `.env` file with the following configuration:

```bash
# ===========================================
# CORE CONFIGURATION
# ===========================================

# Development/Production mode
NODE_ENV=development

# Server port (default: 5000)
PORT=5000

# ===========================================
# DATABASE CONFIGURATION
# ===========================================

# PostgreSQL connection string
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://username:password@localhost:5432/thecueroom

# Individual database components (auto-populated by Replit)
PGHOST=localhost
PGPORT=5432
PGDATABASE=thecueroom

# ===========================================
# AUTHENTICATION CONFIGURATION
# ===========================================

# Replit authentication
REPL_ID=your-repl-id-here
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-domain.replit.app

# Session security
SESSION_SECRET=your-super-secret-session-key-here

# ===========================================
# EXTERNAL SERVICES (Optional)
# ===========================================

# OpenAI for AI features
OPENAI_API_KEY=sk-your-openai-key-here

# SendGrid for email services
SENDGRID_API_KEY=SG.your-sendgrid-key-here
FROM_EMAIL=support@thecueroom.xyz

# ===========================================
# FEATURE FLAGS
# ===========================================

# Enable/disable features
ENABLE_AI_MODERATION=true
ENABLE_EMAIL_VERIFICATION=true
ENABLE_ANALYTICS=true
```

### Environment Variable Details

#### Database Configuration

**Option 1: Local PostgreSQL**
```bash
# Install PostgreSQL locally
sudo apt install postgresql postgresql-contrib  # Ubuntu
brew install postgresql  # macOS

# Create database
sudo -u postgres createdb thecueroom
sudo -u postgres createuser thecueroom_user

# Set DATABASE_URL
DATABASE_URL=postgresql://thecueroom_user:password@localhost:5432/thecueroom
```

**Option 2: Neon (Recommended)**
```bash
# Sign up at https://neon.tech
# Create a new project
# Copy the connection string to DATABASE_URL
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require
```

#### Authentication Setup

**Replit Auth Configuration:**
1. Go to your Replit account settings
2. Find your REPL_ID in the project URL
3. Set REPLIT_DOMAINS to your repl domain

```bash
# Example configuration
REPL_ID=abcd1234-5678-9012-3456-789012345678
REPLIT_DOMAINS=your-project.username.replit.app
```

#### Session Security

```bash
# Generate a strong session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Use the output as SESSION_SECRET
SESSION_SECRET=your-generated-secret-here
```

## Database Setup

### Initialize Database Schema

```bash
# Push schema to database
npm run db:push

# Verify database connection
npm run db:studio
```

The `db:studio` command opens Drizzle Studio in your browser at `http://localhost:4983`.

### Seed Initial Data

```bash
# Create admin user and sample data
npm run db:seed
```

This creates:
- Admin user (admin@thecueroom.xyz / admin123)
- Sample posts and comments
- Example gigs and events
- Test user accounts

### Database Commands

```bash
# View database schema
npm run db:studio

# Generate new migration
npm run db:generate

# Push schema changes
npm run db:push

# Reset database (CAUTION: Deletes all data)
npm run db:reset
```

## Authentication Setup

### Replit Auth Configuration

1. **Enable Replit Auth in your project:**
   ```bash
   # In Replit shell
   replit auth setup
   ```

2. **Configure callback URLs:**
   - Login URL: `https://your-domain/api/login`
   - Callback URL: `https://your-domain/api/callback`
   - Logout URL: `https://your-domain/api/auth/logout`

3. **Test authentication:**
   ```bash
   curl https://your-domain/api/auth/user
   ```

### Manual Auth Testing

```bash
# Test authentication endpoint
curl -X GET http://localhost:5000/api/auth/user

# Expected response (when not authenticated):
# {"message":"Unauthorized"}

# Test login redirect
curl -X GET http://localhost:5000/api/login
# Should redirect to Replit login
```

## External Services

### OpenAI Setup (Optional)

1. **Get API Key:**
   - Visit https://platform.openai.com/
   - Create an account and get API key
   - Add to `.env`: `OPENAI_API_KEY=sk-your-key`

2. **Test API:**
   ```bash
   curl -X POST http://localhost:5000/api/test-openai
   ```

### SendGrid Setup (Optional)

1. **Get API Key:**
   - Visit https://sendgrid.com/
   - Create account and get API key
   - Add to `.env`: `SENDGRID_API_KEY=SG.your-key`

2. **Configure sender:**
   ```bash
   FROM_EMAIL=support@yourdomain.com
   ```

3. **Test email:**
   ```bash
   curl -X POST http://localhost:5000/api/test-email \
     -H "Content-Type: application/json" \
     -d '{"to":"test@example.com","subject":"Test","body":"Hello"}'
   ```

## Development Setup

### Start Development Server

```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run dev:client    # Frontend only (port 3000)
npm run dev:server    # Backend only (port 5000)
```

### Development URLs

- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:5000/api
- **Database Studio**: http://localhost:4983 (when running `npm run db:studio`)

### Development Workflow

1. **Frontend Development:**
   ```bash
   # Navigate to client directory
   cd client
   
   # Install frontend-specific packages if needed
   npm install package-name
   
   # Run frontend tests
   npm run test:client
   ```

2. **Backend Development:**
   ```bash
   # Navigate to server directory
   cd server
   
   # Run backend tests
   npm run test:server
   
   # Check API endpoints
   npm run test:api
   ```

3. **Database Changes:**
   ```bash
   # After modifying shared/schema.ts
   npm run db:generate
   npm run db:push
   ```

## Production Setup

### Build for Production

```bash
# Build both frontend and backend
npm run build

# Test production build locally
npm run preview
```

### Production Environment

```bash
# Set production environment
NODE_ENV=production

# Use production database
DATABASE_URL=postgresql://prod-user:password@prod-host:5432/thecueroom

# Set secure session secret
SESSION_SECRET=your-production-secret-key

# Configure external services
OPENAI_API_KEY=your-production-openai-key
SENDGRID_API_KEY=your-production-sendgrid-key
```

### Deployment Commands

```bash
# Deploy to Replit
replit deploy

# Deploy to Vercel
vercel --prod

# Deploy to Railway
railway up

# Deploy to custom server
npm run deploy:custom
```

## Verification

### Health Check

```bash
# Check if server is running
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"2025-01-01T00:00:00.000Z","uptime":123}
```

### Feature Testing

1. **Authentication:**
   ```bash
   # Visit login page
   curl http://localhost:5000/api/login
   ```

2. **Database Connection:**
   ```bash
   # Check database
   npm run db:studio
   ```

3. **API Endpoints:**
   ```bash
   # Test posts endpoint
   curl http://localhost:5000/api/posts
   
   # Test news feeds
   curl http://localhost:5000/api/feeds/rss
   ```

4. **Frontend:**
   - Open http://localhost:5000
   - Verify navigation works
   - Test user registration
   - Create a test post

### Troubleshooting Setup Issues

#### Common Issues

**1. Port Already in Use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

**2. Database Connection Failed:**
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart

# Check connection string
echo $DATABASE_URL
```

**3. Permission Denied:**
```bash
# Fix file permissions
chmod +x setup.sh
chmod 755 node_modules/.bin/*
```

**4. Module Not Found:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Verification Checklist

- [ ] Dependencies installed successfully
- [ ] Environment variables configured
- [ ] Database connected and schema applied
- [ ] Authentication working
- [ ] Development server starts without errors
- [ ] Frontend accessible at http://localhost:5000
- [ ] API endpoints responding
- [ ] Admin panel accessible
- [ ] User registration/login functional

### Getting Help

If you encounter issues:

1. **Check logs:**
   ```bash
   # View server logs
   npm run dev 2>&1 | tee setup.log
   ```

2. **Verify configuration:**
   ```bash
   # Check environment
   npm run config:check
   ```

3. **Reset and retry:**
   ```bash
   # Clean installation
   npm run clean
   ./setup.sh
   ```

4. **Common solutions:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

**Setup Complete! 🎉**

Your TheCueRoom platform should now be running successfully. Visit http://localhost:5000 to start exploring the underground music community!