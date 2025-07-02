# TheCueRoom - Deployment Guide

## 🚀 Complete Deployment Documentation

This guide provides step-by-step instructions for deploying TheCueRoom in various environments, from local development to production.

## 📋 Pre-Deployment Checklist

### Required Services
- [ ] PostgreSQL database (Neon recommended)
- [ ] Email service (SendGrid recommended)
- [ ] Domain name (optional)
- [ ] SSL certificate (automatically handled by most platforms)

### Required Environment Variables
```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-super-secret-session-key-here
SENDGRID_API_KEY=your-sendgrid-api-key
OPENAI_API_KEY=your-openai-api-key (optional)
NODE_ENV=production
```

## 🔧 Local Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd thecueroom
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env` file:
```env
DATABASE_URL=postgresql://localhost:5432/thecueroom
SESSION_SECRET=dev-secret-key-change-in-production
SENDGRID_API_KEY=your-sendgrid-api-key
NODE_ENV=development
```

### 4. Database Setup
```bash
# Create database
createdb thecueroom

# Push schema
npm run db:push
```

### 5. Start Development Server
```bash
npm run dev
```

Access at: `http://localhost:5000`

## 🌐 Replit Deployment (Recommended)

### 1. Import Project
- Go to Replit.com
- Click "Import from GitHub"
- Paste repository URL
- Select "Import"

### 2. Configure Environment Variables
In Replit Secrets tab, add:
```
DATABASE_URL=your-neon-database-url
SESSION_SECRET=generate-strong-secret-key
SENDGRID_API_KEY=your-sendgrid-api-key
OPENAI_API_KEY=your-openai-api-key
```

### 3. Database Setup
In Replit Shell:
```bash
npm run db:push
```

### 4. Deploy
- Click "Run" button
- Application starts automatically
- Access via generated Replit URL

## 🗄️ Database Configuration

### Neon Database Setup (Recommended)
1. Visit [neon.tech](https://neon.tech)
2. Create account and new project
3. Copy connection string
4. Add to `DATABASE_URL` environment variable

### Local PostgreSQL Setup
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb thecueroom

# Create user
sudo -u postgres createuser --interactive

# Set password
sudo -u postgres psql
\password username
```

## 📧 Email Service Configuration

### SendGrid Setup (Recommended)
1. Visit [sendgrid.com](https://sendgrid.com)
2. Create account
3. Generate API key in Settings > API Keys
4. Add to `SENDGRID_API_KEY` environment variable
5. Verify sender email in SendGrid dashboard

### Email Templates
The platform includes built-in HTML email templates for:
- Email verification
- Welcome emails
- Password reset

## 🔐 Security Configuration

### Session Secret Generation
Generate a strong session secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Environment Security
- Never commit `.env` files
- Use platform-specific secret management
- Rotate secrets regularly
- Use HTTPS in production

## 🌟 Production Deployment Options

### Option 1: Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
vercel env add SENDGRID_API_KEY
```

### Option 2: Railway Deployment
1. Visit [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add environment variables in dashboard
4. Deploy automatically

### Option 3: Digital Ocean App Platform
1. Connect repository to Digital Ocean
2. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`
3. Add environment variables
4. Deploy

### Option 4: AWS/Heroku
```bash
# For Heroku
heroku create thecueroom
heroku config:set DATABASE_URL=your-db-url
heroku config:set SESSION_SECRET=your-secret
git push heroku main
```

## 🎯 Post-Deployment Steps

### 1. Database Initialization
```bash
# Run migrations
npm run db:push

# Verify connection
curl http://your-domain/api/health
```

### 2. Admin Account Setup
- Email: `admin@thecueroom.xyz`
- Password: `admin123`

**Important**: Change admin passwords immediately after deployment.

### 3. Email Verification Test
Test email functionality:
```bash
curl -X POST http://your-domain/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 4. Platform Verification
Test key endpoints:
- `GET /api/health` - Health check
- `POST /api/auth/login` - Authentication
- `GET /api/news` - News aggregation
- `GET /api/posts` - Content system

## 📊 Monitoring & Maintenance

### Health Checks
The platform includes built-in health monitoring:
- Database connectivity
- External service status
- Memory usage
- Response times

### Log Monitoring
Check application logs for:
- Authentication failures
- Database errors
- Email delivery issues
- API response times

### Backup Strategy
- Database: Automated backups via Neon/provider
- User uploads: Cloud storage recommended
- Configuration: Version control

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check connection string format
DATABASE_URL=postgresql://user:password@host:port/database

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

#### Email Delivery Issues
- Verify SendGrid API key
- Check sender email verification
- Review spam folder
- Monitor SendGrid activity dashboard

#### Session Issues
- Verify SESSION_SECRET is set
- Check cookie settings
- Clear browser cookies
- Restart application

#### Performance Issues
- Monitor database query performance
- Check memory usage
- Review response times
- Optimize database indexes

### Debug Mode
Enable debug logging:
```env
NODE_ENV=development
DEBUG=*
```

## 📈 Scaling Considerations

### Database Scaling
- Connection pooling configured
- Read replicas for heavy queries
- Index optimization for performance

### Application Scaling
- Stateless design for horizontal scaling
- Session storage in database
- WebSocket scaling considerations

### CDN Integration
For static assets:
- Configure CDN for uploaded images
- Optimize bundle sizes
- Enable compression

## 🔄 Update & Maintenance

### Regular Updates
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm update

# Run migrations
npm run db:push

# Restart application
npm restart
```

### Security Updates
- Monitor dependency vulnerabilities
- Update Node.js regularly
- Review security patches
- Audit third-party services

---

## 📞 Support & Contact

- Technical Issues: Create GitHub issue
- Platform Access: admin@thecueroom.xyz
- Emergency: Direct admin contact

**Remember**: This platform is exclusively for verified underground electronic music artists and DJs in India.