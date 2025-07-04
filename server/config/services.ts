// src/config/services.ts

import { detectDatabaseProvider } from "../db";

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
    // SMTP fields (for provider==='smtp')
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    // API-key fields (for other providers)
    apiKey?: string;
    mailgunDomain?: string;
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

  const databaseConfigs = {
    neon: {
      maxConnections: 10,
      connectionTimeout: 5000,
      ssl: true,
      retryAttempts: 3,
      poolConfig: { min: 2, max: 10, idleTimeoutMillis: 30000 },
    },
    supabase: {
      maxConnections: 15,
      connectionTimeout: 3000,
      ssl: true,
      retryAttempts: 3,
      poolConfig: { min: 3, max: 15, idleTimeoutMillis: 25000 },
    },
    railway: {
      maxConnections: 8,
      connectionTimeout: 4000,
      ssl: true,
      retryAttempts: 2,
      poolConfig: { min: 2, max: 8, idleTimeoutMillis: 20000 },
    },
    aiven: {
      maxConnections: 12,
      connectionTimeout: 3500,
      ssl: true,
      retryAttempts: 3,
      poolConfig: { min: 2, max: 12, idleTimeoutMillis: 35000 },
    },
    elephantsql: {
      maxConnections: 5,
      connectionTimeout: 6000,
      ssl: true,
      retryAttempts: 2,
      poolConfig: { min: 1, max: 5, idleTimeoutMillis: 15000 },
    },
    local: {
      maxConnections: 5,
      connectionTimeout: 2000,
      ssl: false,
      retryAttempts: 1,
      poolConfig: { min: 2, max: 5, idleTimeoutMillis: 10000 },
    },
    standard: {
      maxConnections: 10,
      connectionTimeout: 5000,
      ssl: true,
      retryAttempts: 3,
      poolConfig: { min: 2, max: 10, idleTimeoutMillis: 30000 },
    },
  };

  const emailProvider = detectEmailProvider();

  // build the email section
  const emailBase = {
    provider: emailProvider,
    from: process.env.FROM_EMAIL || "support@thecueroom.xyz",
    fromName: process.env.FROM_NAME || "TheCueRoom",
    retryAttempts: 3,
    timeout: 30000,
  };

  let emailConfig: ServiceConfig["email"];
  switch (emailProvider) {
    case "smtp":
      emailConfig = {
        ...emailBase,
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT
          ? Number(process.env.SMTP_PORT)
          : undefined,
        smtpUser: process.env.SMTP_USER,
        smtpPass: process.env.SMTP_PASS,
      };
      break;

    case "sendgrid":
      emailConfig = {
        ...emailBase,
        apiKey: process.env.SENDGRID_API_KEY,
      };
      break;

    case "mailgun":
      emailConfig = {
        ...emailBase,
        apiKey: process.env.MAILGUN_API_KEY,
        mailgunDomain: process.env.MAILGUN_DOMAIN,
      };
      break;

    case "resend":
      emailConfig = {
        ...emailBase,
        apiKey: process.env.RESEND_API_KEY,
      };
      break;

    case "ses":
      emailConfig = {
        ...emailBase,
        apiKey: process.env.AWS_SES_ACCESS_KEY,
      };
      break;

    default:
      // fallback to SMTP if nothing else matches
      emailConfig = {
        ...emailBase,
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT
          ? Number(process.env.SMTP_PORT)
          : undefined,
        smtpUser: process.env.SMTP_USER,
        smtpPass: process.env.SMTP_PASS,
      };
      break;
  }

  return {
    database: {
      provider: dbProvider,
      ...databaseConfigs[
        dbProvider as keyof typeof databaseConfigs
      ],
    },

    email: emailConfig,

    ai: {
      provider: detectAiProvider(),
      apiKey: getAiApiKey(),
      model: process.env.AI_MODEL || "gpt-4o-mini",
      maxTokens: Number(process.env.AI_MAX_TOKENS || "1000"),
      temperature: Number(process.env.AI_TEMPERATURE || "0.7"),
      timeout: 30000,
    },

    storage: {
      provider: detectStorageProvider(),
      config: getStorageConfig(),
      maxFileSize: Number(process.env.MAX_FILE_SIZE || "10485760"),
      allowedTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ],
    },

    security: {
      sessionTimeout: Number(process.env.SESSION_TIMEOUT || "604800000"),
      maxLoginAttempts: Number(process.env.MAX_LOGIN_ATTEMPTS || "5"),
      lockoutDuration: Number(
        process.env.LOCKOUT_DURATION || "900000",
      ),
      tokenExpiry: Number(process.env.TOKEN_EXPIRY || "3600000"),
    },
  };
}

//––– helper functions –––

function detectEmailProvider(): string {
  if (
    process.env.EMAIL_PROVIDER &&
    ["smtp", "sendgrid", "mailgun", "resend", "ses"].includes(
      process.env.EMAIL_PROVIDER,
    )
  ) {
    return process.env.EMAIL_PROVIDER;
  }
  // fallback priority
  if (process.env.SMTP_HOST) return "smtp";
  if (
    process.env.SENDGRID_API_KEY &&
    process.env.SENDGRID_API_KEY.startsWith("SG.")
  )
    return "sendgrid";
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN)
    return "mailgun";
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_"))
    return "resend";
  if (
    process.env.AWS_SES_ACCESS_KEY &&
    process.env.AWS_SES_SECRET_KEY
  )
    return "ses";
  return "smtp";
}

function detectAiProvider(): string {
  if (process.env.OPENAI_API_KEY?.startsWith("sk-")) return "openai";
  if (process.env.ANTHROPIC_API_KEY?.startsWith("sk-ant-"))
    return "anthropic";
  if (process.env.GOOGLE_AI_API_KEY) return "google";
  return "none";
}

function detectStorageProvider(): string {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY
  )
    return "cloudinary";
  if (
    process.env.AWS_S3_BUCKET_NAME &&
    process.env.AWS_ACCESS_KEY_ID
  )
    return "s3";
  if (
    process.env.SUPABASE_STORAGE_URL &&
    process.env.SUPABASE_SERVICE_KEY
  )
    return "supabase";
  return "local";
}

function getAiApiKey(): string {
  if (process.env.OPENAI_API_KEY?.startsWith("sk-"))
    return process.env.OPENAI_API_KEY;
  if (process.env.ANTHROPIC_API_KEY?.startsWith("sk-ant-"))
    return process.env.ANTHROPIC_API_KEY;
  if (process.env.GOOGLE_AI_API_KEY)
    return process.env.GOOGLE_AI_API_KEY;
  return "";
}

function getStorageConfig(): any {
  switch (detectStorageProvider()) {
    case "cloudinary":
      return {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
        folder: "thecueroom",
      };
    case "s3":
      return {
        bucketName: process.env.AWS_S3_BUCKET_NAME,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || "us-east-1",
        signedUrlExpires: 3600,
      };
    case "supabase":
      return {
        url: process.env.SUPABASE_STORAGE_URL,
        key: process.env.SUPABASE_SERVICE_KEY,
        bucket:
          process.env.SUPABASE_STORAGE_BUCKET || "uploads",
      };
    default:
      return {
        uploadDir: process.env.UPLOAD_DIR || "./uploads",
        publicUrl:
          process.env.PUBLIC_URL || "http://localhost:5000",
        createDirIfNotExists: true,
      };
  }
}
