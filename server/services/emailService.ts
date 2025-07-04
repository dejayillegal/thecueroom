// server/services/emailService.ts

import nodemailer from 'nodemailer';

interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private fromEmail = process.env.FROM_EMAIL || 'support@thecueroom.xyz';

  private transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendEmail(params: EmailParams): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from:    params.from || this.fromEmail,
        to:      params.to,
        subject: params.subject,
        text:    params.text,
        html:    params.html,
      });
      return true;
    } catch (err) {
      console.error('SMTP email error:', err);
      // in development we still return true so sign-up flows don’t block
      if (process.env.NODE_ENV === 'development') return true;
      return false;
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

    return this.sendEmail({ to: email, subject: 'Verify your TheCueRoom account', text, html });
  }

  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    const html = `
      <div style="font-family: sans-serif; line-height:1.4;">
        <h1>Hi ${username}, you’re all set!</h1>
        <p>Your TheCueRoom account is now active. Dive into the underground scene!</p>
      </div>
    `;
    return this.sendEmail({ to: email, subject: 'Your TheCueRoom account is active!', html });
  }
}

export const emailService = new EmailService();
