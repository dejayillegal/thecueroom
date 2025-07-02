import { detectDatabaseProvider } from '../db';

export interface ServiceConfig {
  database: {
    provider: string;
    maxConnections: number;
    connectionTimeout: number;
    ssl: boolean;
    retryAttempts: number;
    poolConfig: {
      min: number;
      max: number;
      idleTimeoutMillis: number;
    };
  };
  email: {
    provider: string;
    apiKey: string;
    from: string;
    fromName: string;
    retryAttempts: number;
    timeout: number;
  };
  ai: {
    provider: string;
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
    timeout: number;
  };
  storage: {
    provider: string;
    config: any;
    maxFileSize: number;
    allowedTypes: string[];
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    tokenExpiry: number;
  };
}

export function getServiceConfiguration(): ServiceConfig {
  const dbProvider = detectDatabaseProvider();
  
  // Database configurations optimized per provider
  const databaseConfigs = {
    neon: { 
      maxConnections: 10, 
      connectionTimeout: 5000, 
      ssl: true,
      retryAttempts: 3,
      poolConfig: { min: 2, max: 10, idleTimeoutMillis: 30000 }
    },
    supabase: { 
      maxConnections: 15, 
      connectionTimeout: 3000, 
      ssl: true,
      retryAttempts: 3,
      poolConfig: { min: 3, max: 15, idleTimeoutMillis: 25000 }
    },
    railway: { 
      maxConnections: 8, 
      connectionTimeout: 4000, 
      ssl: true,
      retryAttempts: 2,
      poolConfig: { min: 2, max: 8, idleTimeoutMillis: 20000 }
    },
    aiven: { 
      maxConnections: 12, 
      connectionTimeout: 3500, 
      ssl: true,
      retryAttempts: 3,
      poolConfig: { min: 2, max: 12, idleTimeoutMillis: 35000 }
    },
    elephantsql: { 
      maxConnections: 5, 
      connectionTimeout: 6000, 
      ssl: true,
      retryAttempts: 2,
      poolConfig: { min: 1, max: 5, idleTimeoutMillis: 15000 }
    },
    local: { 
      maxConnections: 5, 
      connectionTimeout: 2000, 
      ssl: false,
      retryAttempts: 1,
      poolConfig: { min: 2, max: 5, idleTimeoutMillis: 10000 }
    },
    standard: { 
      maxConnections: 10, 
      connectionTimeout: 5000, 
      ssl: true,
      retryAttempts: 3,
      poolConfig: { min: 2, max: 10, idleTimeoutMillis: 30000 }
    }
  };

  // Email service auto-detection with priority order
  const emailProvider = detectEmailProvider();
  const aiProvider = detectAiProvider();
  const storageProvider = detectStorageProvider();

  return {
    database: {
      provider: dbProvider,
      ...databaseConfigs[dbProvider as keyof typeof databaseConfigs]
    },
    email: {
      provider: emailProvider,
      apiKey: getEmailApiKey(emailProvider),
      from: process.env.EMAIL_FROM || 'support@thecueroom.xyz',
      fromName: process.env.EMAIL_FROM_NAME || 'TheCueRoom',
      retryAttempts: 3,
      timeout: 30000
    },
    ai: {
      provider: aiProvider,
      apiKey: getAiApiKey(aiProvider),
      model: getAiModel(aiProvider),
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
      timeout: 30000
    },
    storage: {
      provider: storageProvider,
      config: getStorageConfig(storageProvider),
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    security: {
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '604800000'), // 1 week
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
      lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '900000'), // 15 minutes
      tokenExpiry: parseInt(process.env.TOKEN_EXPIRY || '3600000') // 1 hour
    }
  };
}

function detectEmailProvider(): string {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return 'smtp';
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) return 'mailgun';
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_')) return 'resend';
  if (process.env.AWS_SES_ACCESS_KEY && process.env.AWS_SES_SECRET_KEY) return 'ses';
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) return 'gmail';
  return 'smtp';
}

function detectAiProvider(): string {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) return 'openai';
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')) return 'anthropic';
  if (process.env.GOOGLE_AI_API_KEY) return 'google';
  return 'none'; // AI is optional
}

function detectStorageProvider(): string {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) return 'cloudinary';
  if (process.env.AWS_S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID) return 's3';
  if (process.env.SUPABASE_STORAGE_URL && process.env.SUPABASE_SERVICE_KEY) return 'supabase';
  return 'local';
}

function getEmailApiKey(provider: string): string {
  switch (provider) {
    case 'mailgun': return process.env.MAILGUN_API_KEY || '';
    case 'resend': return process.env.RESEND_API_KEY || '';
    case 'ses': return process.env.AWS_SES_ACCESS_KEY || '';
    default: return '';
  }
}

function getAiApiKey(provider: string): string {
  switch (provider) {
    case 'openai': return process.env.OPENAI_API_KEY || '';
    case 'anthropic': return process.env.ANTHROPIC_API_KEY || '';
    case 'google': return process.env.GOOGLE_AI_API_KEY || '';
    default: return '';
  }
}

function getAiModel(provider: string): string {
  switch (provider) {
    case 'openai': return process.env.OPENAI_MODEL || 'gpt-4o-mini';
    case 'anthropic': return process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307';
    case 'google': return process.env.GOOGLE_AI_MODEL || 'gemini-pro';
    default: return '';
  }
}

function getStorageConfig(provider: string): any {
  switch (provider) {
    case 'cloudinary':
      return {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
        folder: 'thecueroom'
      };
    case 's3':
      return {
        bucketName: process.env.AWS_S3_BUCKET_NAME,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
        signedUrlExpires: 3600
      };
    case 'supabase':
      return {
        url: process.env.SUPABASE_STORAGE_URL,
        key: process.env.SUPABASE_SERVICE_KEY,
        bucket: process.env.SUPABASE_STORAGE_BUCKET || 'uploads'
      };
    default:
      return {
        uploadDir: process.env.UPLOAD_DIR || './uploads',
        publicUrl: process.env.PUBLIC_URL || 'http://localhost:5000',
        createDirIfNotExists: true
      };
  }
}

export function validateServiceConfiguration(): { valid: boolean; errors: string[]; warnings: string[] } {
  const config = getServiceConfiguration();
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical validations
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  } else if (!isValidDatabaseUrl(process.env.DATABASE_URL)) {
    errors.push('DATABASE_URL format is invalid');
  }

  if (!process.env.SESSION_SECRET) {
    errors.push('SESSION_SECRET is required');
  } else if (process.env.SESSION_SECRET.length < 32) {
    errors.push('SESSION_SECRET must be at least 32 characters long');
  }

  // Email service validation
  if (config.email.provider === 'mailgun' && (!config.email.apiKey || !process.env.MAILGUN_DOMAIN)) {
    errors.push('MAILGUN_API_KEY and MAILGUN_DOMAIN are required for Mailgun email service');
  }

  // AI service validation (warnings only, AI is optional)
  if (config.ai.provider !== 'none' && !config.ai.apiKey) {
    warnings.push(`AI service ${config.ai.provider} configured but no API key provided`);
  }

  // Storage validation
  if (config.storage.provider === 'cloudinary' && (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY)) {
    warnings.push('Cloudinary storage configured but credentials missing, falling back to local storage');
  }

  // Environment-specific validations
  if (process.env.NODE_ENV === 'production') {
    const dbUrl = process.env.DATABASE_URL || '';
    if (!dbUrl.includes('ssl=true') && !dbUrl.includes('sslmode=require')) {
      warnings.push('SSL should be enabled for production database connections');
    }
    
    if (!process.env.EMAIL_FROM?.includes('@')) {
      errors.push('Valid sender email address required for production');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function isValidDatabaseUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:';
  } catch {
    return false;
  }
}

export function getHealthCheckEndpoints(): Record<string, string> {
  const config = getServiceConfiguration();
  
  return {
    database: '/api/health/database',
    email: '/api/health/email',
    ai: config.ai.provider !== 'none' ? '/api/health/ai' : '',
    storage: '/api/health/storage',
    overall: '/api/health'
  };
}

export function getServiceStatus() {
  const config = getServiceConfiguration();
  const validation = validateServiceConfiguration();
  
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: { provider: config.database.provider, status: 'configured' },
      email: { provider: config.email.provider, status: config.email.apiKey ? 'configured' : 'missing-credentials' },
      ai: { provider: config.ai.provider, status: config.ai.apiKey ? 'configured' : 'optional' },
      storage: { provider: config.storage.provider, status: 'configured' }
    },
    validation: {
      valid: validation.valid,
      errorCount: validation.errors.length,
      warningCount: validation.warnings.length
    }
  };
}