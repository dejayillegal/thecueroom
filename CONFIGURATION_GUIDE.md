# TheCueRoom Configuration Guide

> **Complete configuration reference for all platform settings and features**

## Table of Contents

- [Environment Variables](#environment-variables)
- [Database Configuration](#database-configuration)
- [Authentication Settings](#authentication-settings)
- [External Services](#external-services)
- [Feature Flags](#feature-flags)
- [Performance Settings](#performance-settings)
- [Security Configuration](#security-configuration)
- [Development vs Production](#development-vs-production)
- [Advanced Configuration](#advanced-configuration)

## Environment Variables

### Core Configuration

```bash
# ===========================================
# APPLICATION SETTINGS
# ===========================================

# Environment mode (development, production, test)
NODE_ENV=development

# Server port (default: 5000)
PORT=5000

# Application URL (for callbacks and links)
APP_URL=http://localhost:5000

# Enable debug logging
DEBUG=true

# Timezone for the application
TZ=Asia/Kolkata
```

### Database Configuration

```bash
# ===========================================
# DATABASE SETTINGS
# ===========================================

# Primary database connection string
DATABASE_URL=postgresql://username:password@host:port/database

# Database connection components
PGHOST=localhost
PGPORT=5432
PGUSER=username
PGPASSWORD=password
PGDATABASE=thecueroom

# Connection pool settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_TIMEOUT=30000

# SSL settings for production
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=true
```

### Authentication Configuration

```bash
# ===========================================
# AUTHENTICATION SETTINGS
# ===========================================

# Replit Auth configuration
REPL_ID=your-repl-id-here
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-domain.replit.app,localhost:5000

# Session configuration
SESSION_SECRET=your-super-secret-session-key
SESSION_TTL=604800000  # 7 days in milliseconds
SESSION_NAME=thecueroom_session

# Cookie settings
COOKIE_SECURE=false  # Set to true in production
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=lax
```

### External Services

```bash
# ===========================================
# EXTERNAL SERVICE KEYS
# ===========================================

# OpenAI for AI features
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000

# Email service configuration
SENDGRID_API_KEY=SG.your-sendgrid-key
FROM_EMAIL=support@thecueroom.xyz
FROM_NAME=TheCueRoom

# Alternative email providers (e.g. Brevo)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=9108c5001@smtp-brevo.com
SMTP_PASS=your-smtp-password
```

### Feature Flags

```bash
# ===========================================
# FEATURE TOGGLES
# ===========================================

# AI-powered features
ENABLE_AI_MODERATION=true
ENABLE_AI_MEME_GENERATION=true
ENABLE_AI_CONTENT_SUGGESTIONS=true

# Communication features
ENABLE_EMAIL_VERIFICATION=true
ENABLE_PUSH_NOTIFICATIONS=false
ENABLE_SMS_NOTIFICATIONS=false

# Community features
ENABLE_USER_REGISTRATION=true
ENABLE_POST_COMMENTS=true
ENABLE_POST_REACTIONS=true
ENABLE_MEME_UPLOADS=true

# Admin features
ENABLE_ADMIN_PANEL=true
ENABLE_USER_MANAGEMENT=true
ENABLE_CONTENT_MODERATION=true
ENABLE_ANALYTICS=true

# Performance features
ENABLE_CACHING=true
ENABLE_RATE_LIMITING=true
ENABLE_COMPRESSION=true
```

## Database Configuration

### Connection Settings

#### Local PostgreSQL

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE thecueroom;
CREATE USER thecueroom_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE thecueroom TO thecueroom_user;

# Configure connection
DATABASE_URL=postgresql://thecueroom_user:your_password@localhost:5432/thecueroom
```

#### Neon Database (Recommended)

```bash
# Sign up at https://neon.tech
# Create new project
# Copy connection string

DATABASE_URL=postgresql://username:password@ep-cool-name-123456.us-east-1.aws.neon.tech/dbname?sslmode=require

# Additional Neon settings
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

#### Railway Database

```bash
# Connect Railway CLI
railway login
railway link

# Get database URL
railway variables

DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

### Schema Management

```bash
# Database schema version
DB_SCHEMA_VERSION=1.0.0

# Migration settings
AUTO_MIGRATE=false  # Set to true for development
MIGRATION_TIMEOUT=30000

# Backup settings
DB_BACKUP_ENABLED=true
DB_BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
DB_BACKUP_RETENTION_DAYS=30
```

## Authentication Settings

### Replit Auth Configuration

```bash
# Replit-specific settings
REPL_ID=abcd1234-5678-9012-3456-789012345678
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-project.username.replit.app

# OAuth scopes
OAUTH_SCOPES=openid email profile offline_access

# Token refresh settings
TOKEN_REFRESH_ENABLED=true
TOKEN_REFRESH_THRESHOLD=300  # 5 minutes before expiry
```

### Session Management

```bash
# Session store configuration
SESSION_STORE=database  # Options: memory, database, redis
SESSION_TABLE_NAME=sessions

# Session security
SESSION_REGENERATE_ON_LOGIN=true
SESSION_ROLLING=true
SESSION_MAX_AGE=604800000  # 7 days

# Session cleanup
SESSION_CLEANUP_INTERVAL=3600000  # 1 hour
SESSION_CLEANUP_MAX_AGE=2592000000  # 30 days
```

## External Services

### OpenAI Configuration

```bash
# API settings
OPENAI_API_KEY=sk-your-key-here
OPENAI_ORGANIZATION=org-your-org-id
OPENAI_BASE_URL=https://api.openai.com/v1

# Model configuration
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
OPENAI_TOP_P=1.0

# Rate limiting
OPENAI_RATE_LIMIT=100  # requests per minute
OPENAI_TIMEOUT=30000   # 30 seconds

# Moderation settings
MODERATION_ENABLED=true
MODERATION_THRESHOLD=0.8
MODERATION_ACTIONS=flag,block,notify
```

### Email Service Configuration

#### SendGrid

```bash
SENDGRID_API_KEY=SG.your-key-here
SENDGRID_SENDER_EMAIL=support@thecueroom.xyz
SENDGRID_SENDER_NAME=TheCueRoom
SENDGRID_TEMPLATE_ID_WELCOME=d-your-template-id
SENDGRID_TEMPLATE_ID_VERIFICATION=d-your-template-id
```

#### SMTP (Brevo or other providers)

```bash
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false  # true for 465, false for other ports
SMTP_USER=9108c5001@smtp-brevo.com
SMTP_PASS=your-smtp-password

# Email templates
EMAIL_TEMPLATE_PATH=./server/templates/email
EMAIL_TEMPLATE_ENGINE=handlebars
```

### RSS Feed Configuration

```bash
# RSS feed sources
RSS_FEED_SOURCES=30  # Number of sources
RSS_REFRESH_INTERVAL=21600000  # 6 hours in milliseconds

# Feed processing
RSS_MAX_ITEMS_PER_SOURCE=10
RSS_CONTENT_MAX_LENGTH=500
RSS_TIMEOUT=10000  # 10 seconds

# Feed caching
RSS_CACHE_ENABLED=true
RSS_CACHE_TTL=3600000  # 1 hour
```

## Feature Flags

### AI Features

```bash
# Content moderation
AI_MODERATION_ENABLED=true
AI_MODERATION_MODEL=text-moderation-latest
AI_MODERATION_THRESHOLD=0.8

# Content generation
AI_MEME_GENERATION=true
AI_CONTENT_SUGGESTIONS=true
AI_AUTO_TAGGING=false

# AI response settings
AI_RESPONSE_TIMEOUT=30000
AI_RETRY_ATTEMPTS=3
AI_FALLBACK_ENABLED=true
```

### Community Features

```bash
# User interactions
COMMENTS_ENABLED=true
REACTIONS_ENABLED=true
MENTIONS_ENABLED=true
HASHTAGS_ENABLED=true

# Content limits
MAX_POST_LENGTH=2000
MAX_COMMENT_LENGTH=500
MAX_UPLOADS_PER_POST=5
MAX_FILE_SIZE=5242880  # 5MB

# Community moderation
AUTO_MODERATION=true
MANUAL_MODERATION=false
PROFANITY_FILTER=true
SPAM_DETECTION=true
```

## Performance Settings

### Caching Configuration

```bash
# Cache settings
CACHE_ENABLED=true
CACHE_PROVIDER=memory  # Options: memory, redis, database
CACHE_TTL=3600000      # 1 hour default

# Cache keys
CACHE_PREFIX=thecueroom:
CACHE_POSTS_TTL=1800000     # 30 minutes
CACHE_USERS_TTL=3600000     # 1 hour
CACHE_NEWS_TTL=21600000     # 6 hours

# Memory cache limits
MEMORY_CACHE_MAX_ITEMS=1000
MEMORY_CACHE_MAX_SIZE=100MB
```

### Rate Limiting

```bash
# API rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW=900000   # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Endpoint-specific limits
RATE_LIMIT_LOGIN=5         # per 15 minutes
RATE_LIMIT_POSTS=10        # per 15 minutes
RATE_LIMIT_COMMENTS=20     # per 15 minutes
RATE_LIMIT_UPLOADS=5       # per 15 minutes

# Rate limit storage
RATE_LIMIT_STORE=memory    # Options: memory, redis, database
```

### Compression and Optimization

```bash
# Response compression
COMPRESSION_ENABLED=true
COMPRESSION_LEVEL=6
COMPRESSION_THRESHOLD=1024  # 1KB

# Static asset settings
STATIC_CACHE_MAX_AGE=31536000  # 1 year
STATIC_COMPRESSION=true

# Image optimization
IMAGE_OPTIMIZATION=true
IMAGE_MAX_WIDTH=1920
IMAGE_MAX_HEIGHT=1080
IMAGE_QUALITY=85
```

## Security Configuration

### Security Headers

```bash
# Security settings
SECURITY_HEADERS_ENABLED=true
HELMET_ENABLED=true

# CORS configuration
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:5000,https://yourdomain.com
CORS_CREDENTIALS=true

# Content Security Policy
CSP_ENABLED=true
CSP_REPORT_ONLY=false
CSP_DIRECTIVES="default-src 'self'; script-src 'self' 'unsafe-inline'"
```

### Input Validation

```bash
# Validation settings
VALIDATION_ENABLED=true
SANITIZATION_ENABLED=true

# File upload security
UPLOAD_SECURITY_ENABLED=true
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,mp3,mp4
BLOCKED_FILE_TYPES=exe,bat,sh,php,js
MAX_UPLOAD_SIZE=5242880  # 5MB

# Content filtering
PROFANITY_FILTER=true
XSS_PROTECTION=true
SQL_INJECTION_PROTECTION=true
```

## Development vs Production

### Development Configuration

```bash
# Development settings
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug

# Hot reloading
HOT_RELOAD=true
WATCH_FILES=true

# Development security (relaxed)
COOKIE_SECURE=false
CORS_ORIGIN=*
CSP_REPORT_ONLY=true

# Development database
DATABASE_URL=postgresql://localhost:5432/thecueroom_dev
AUTO_MIGRATE=true
```

### Production Configuration

```bash
# Production settings
NODE_ENV=production
DEBUG=false
LOG_LEVEL=warn

# Production security (strict)
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
CORS_ORIGIN=https://yourdomain.com
CSP_REPORT_ONLY=false

# Production database
DATABASE_URL=postgresql://prod-host:5432/thecueroom
AUTO_MIGRATE=false
DB_SSL=true

# Production performance
COMPRESSION_ENABLED=true
CACHE_ENABLED=true
RATE_LIMIT_ENABLED=true
```

## Advanced Configuration

### Logging Configuration

```bash
# Log settings
LOG_LEVEL=info  # debug, info, warn, error
LOG_FORMAT=json
LOG_FILE_ENABLED=true
LOG_FILE_PATH=./logs/app.log

# Log rotation
LOG_ROTATION_ENABLED=true
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5
LOG_DATE_PATTERN=YYYY-MM-DD

# Structured logging
LOG_CORRELATION_ID=true
LOG_REQUEST_ID=true
LOG_USER_ID=true
```

### Monitoring and Analytics

```bash
# Application monitoring
MONITORING_ENABLED=true
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true

# Performance monitoring
RESPONSE_TIME_THRESHOLD=1000  # 1 second
MEMORY_USAGE_THRESHOLD=80     # 80%
CPU_USAGE_THRESHOLD=80        # 80%

# Error tracking
ERROR_TRACKING_ENABLED=true
ERROR_REPORTING_ENABLED=true
ERROR_NOTIFICATION_EMAIL=admin@thecueroom.xyz
```

### Backup and Recovery

```bash
# Backup configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30

# Backup storage
BACKUP_STORAGE=local  # Options: local, s3, gcs
BACKUP_PATH=./backups
BACKUP_COMPRESSION=true

# Recovery settings
RECOVERY_POINT_OBJECTIVE=24  # hours
RECOVERY_TIME_OBJECTIVE=2    # hours
```

### Custom Configuration

```bash
# Custom feature toggles
CUSTOM_THEMES_ENABLED=false
CUSTOM_PLUGINS_ENABLED=false
BETA_FEATURES_ENABLED=false

# Experimental features
EXPERIMENTAL_AI_FEATURES=false
EXPERIMENTAL_REAL_TIME=false
EXPERIMENTAL_PWA=false

# Integration settings
WEBHOOK_ENABLED=false
WEBHOOK_SECRET=your-webhook-secret
API_VERSION=v1
```

## Configuration Validation

### Environment Validation Script

```bash
# Validate configuration
npm run config:validate

# Check required variables
npm run config:check-required

# Test external services
npm run config:test-services

# Generate configuration report
npm run config:report
```

### Configuration Testing

```bash
# Test database connection
npm run test:db

# Test authentication
npm run test:auth

# Test external APIs
npm run test:external

# Test all configurations
npm run test:config
```

---

**Configuration Complete! ⚙️**

Your TheCueRoom platform is now properly configured for your environment. Remember to keep sensitive values secure and use different configurations for development and production environments.