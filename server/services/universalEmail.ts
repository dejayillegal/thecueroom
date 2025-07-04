// server/services/emailService.ts

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

  /** Simple config check */
  async testConnection(): Promise<{ success: boolean; provider: 'smtp'; error?: string }> {
    try {
      await this.transporter.verify();
      return { success: true, provider: 'smtp' };
    } catch (err: any) {
      return { success: false, provider: 'smtp', error: err.message };
    }
  }
}

export const emailService = new EmailService();
