// server/services/universalEmail.ts

import nodemailer from 'nodemailer';
import { getServiceConfiguration } from '../config/services';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    content: string;    // base64
    filename: string;
    type: string;
  }>;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: 'smtp';
  timestamp: number;
}

export class EmailService {
  private config = getServiceConfiguration().email;
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendEmail(params: EmailParams): Promise<EmailResult> {
    const start = Date.now();
    try {
      const info = await this.transporter.sendMail({
        from: this.config.from, 
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
        attachments: params.attachments?.map(att => ({
          filename: att.filename,
          content: Buffer.from(att.content, 'base64'),
          contentType: att.type,
        })),
      });

      return {
        success: true,
        provider: 'smtp',
        messageId: info.messageId,
        timestamp: Date.now() - start,
      };
    } catch (err: any) {
      console.error('SMTP send error:', err);
      return {
        success: false,
        provider: 'smtp',
        error: err.message || 'Unknown SMTP error',
        timestamp: Date.now() - start,
      };
    }
  }

  generateVerificationToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  async sendVerificationEmail(email: string, token: string, username: string): Promise<boolean> {
  const baseUrl = process.env.SITE_URL || 'http://localhost:5000';
  const verificationUrl = `${baseUrl}/api/verify-email?token=${token}`;

  const html = `
    <div style="font-family: sans-serif; line-height:1.4;">
      <h1>Welcome, ${username}!</h1>
      <p>Click below to verify your TheCueRoom account:</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>If that doesn’t work, paste this URL in your browser:</p>
      <p>${verificationUrl}</p>
    </div>
  `;

  const text = `Welcome, ${username}!\n\nVerify your account:\n${verificationUrl}`;

  const result = await this.sendEmail({ to: email, subject: 'Verify your TheCueRoom account', text, html });
  return result.success;
  } 


  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    const html = `
      <div style="font-family: sans-serif; line-height:1.4;">
        <h1>Hi ${username}, you’re all set!</h1>
        <p>Your TheCueRoom account is now active. Dive into the underground scene!</p>
      </div>
    `;
    const result = await this.sendEmail({
      to: email,
      subject: 'Your TheCueRoom account is active!',
      html,
    });
    return result.success;
  }

  /** Simple config check */
  async testConnection(): Promise<{ success: boolean; provider: 'smtp'; error?: string }> {
    try {
      await this.transporter.verify();
      return { success: true, provider: 'smtp' };
    } catch (err: any) {
      return { success: false, provider: 'smtp', error: err.message };
    }
  }
  
  getProviderInfo(): {
    provider: 'smtp';
    configured: boolean;
    from: string;
    fromName: string;
    retryAttempts: number;
  } {
    const c = this.config;
    const configured =
      Boolean(process.env.SMTP_HOST) &&
      Boolean(process.env.SMTP_USER) &&
      Boolean(process.env.SMTP_PASS);
    
    return {
      provider: 'smtp',
      configured,
      from: c.from,
      fromName: c.fromName,
      retryAttempts: c.retryAttempts,
    };
  }
}

export const emailService = new EmailService();
