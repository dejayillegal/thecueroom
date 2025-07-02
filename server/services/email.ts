import nodemailer from 'nodemailer';
import { createLogger } from '../utils/logger';

const logger = createLogger('EmailService');

// Free email hosting configuration for all platforms
class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Generic SMTP configuration (e.g. Brevo)
      if (
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
      ) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure:
            process.env.SMTP_SECURE === 'true' ||
            Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        this.isConfigured = true;
        logger.info('Email service configured with generic SMTP');
        return;
      }

      // Gmail SMTP configuration (free option)
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
          }
        });
        this.isConfigured = true;
        logger.info('Email service configured with Gmail SMTP');
        return;
      }

      // Outlook SMTP configuration (free alternative)
      if (process.env.OUTLOOK_USER && process.env.OUTLOOK_PASSWORD) {
        this.transporter = nodemailer.createTransport({
          service: 'hotmail',
          auth: {
            user: process.env.OUTLOOK_USER,
            pass: process.env.OUTLOOK_PASSWORD
          }
        });
        this.isConfigured = true;
        logger.info('Email service configured with Outlook SMTP');
        return;
      }

      // Zoho SMTP configuration (free alternative)
      if (process.env.ZOHO_USER && process.env.ZOHO_PASSWORD) {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.zoho.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.ZOHO_USER,
            pass: process.env.ZOHO_PASSWORD
          }
        });
        this.isConfigured = true;
        logger.info('Email service configured with Zoho SMTP');
        return;
      }

      // Development mode fallback (console logging)
      if (process.env.NODE_ENV === 'development') {
        this.transporter = nodemailer.createTransport({
          streamTransport: true,
          newline: 'unix',
          buffer: true
        });
        this.isConfigured = true;
        logger.info('Email service in development mode (console output)');
        return;
      }

      logger.warn('No email service configured - emails will not be sent');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  async sendVerificationEmail(email: string, firstName: string, verificationLink: string): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn('Email service not configured - skipping verification email');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || process.env.GMAIL_USER || 'support@thecueroom.xyz',
        to: email,
        subject: 'Welcome to TheCueRoom - Verify Your Email',
        html: this.getVerificationEmailTemplate(firstName, verificationLink)
      };

      if (process.env.NODE_ENV === 'development') {
        logger.info('Development email:', mailOptions);
        return true;
      }

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}:`, result.messageId);
      return true;
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, firstName: string, tempPassword: string): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn('Email service not configured - skipping password reset email');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || process.env.GMAIL_USER || 'support@thecueroom.xyz',
        to: email,
        subject: 'TheCueRoom - Password Reset',
        html: this.getPasswordResetEmailTemplate(firstName, tempPassword)
      };

      if (process.env.NODE_ENV === 'development') {
        logger.info('Development email:', mailOptions);
        return true;
      }

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}:`, result.messageId);
      return true;
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn('Email service not configured - skipping welcome email');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || process.env.GMAIL_USER || 'support@thecueroom.xyz',
        to: email,
        subject: 'Welcome to TheCueRoom - Your Account is Active!',
        html: this.getWelcomeEmailTemplate(firstName)
      };

      if (process.env.NODE_ENV === 'development') {
        logger.info('Development email:', mailOptions);
        return true;
      }

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${email}:`, result.messageId);
      return true;
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      return false;
    }
  }

  private getVerificationEmailTemplate(firstName: string, verificationLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - TheCueRoom</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Arial', sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #111111; border: 1px solid #333;">
          <div style="background: linear-gradient(135deg, #ff6b00 0%, #ff8500 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">TheCueRoom</h1>
            <p style="color: #fff; margin: 10px 0 0 0; opacity: 0.9;">Underground Music Community</p>
          </div>
          
          <div style="padding: 40px 30px; color: #ffffff;">
            <h2 style="color: #ff6b00; margin: 0 0 20px 0;">Welcome to the Underground, ${firstName}!</h2>
            
            <p style="margin: 0 0 20px 0; line-height: 1.6; color: #cccccc;">
              You've successfully registered for TheCueRoom, India's premier platform for techno and house music artists.
            </p>
            
            <p style="margin: 0 0 30px 0; line-height: 1.6; color: #cccccc;">
              To complete your registration and join our verified community, please verify your email address:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background: linear-gradient(135deg, #ff6b00 0%, #ff8500 100%); 
                        color: #ffffff; 
                        text-decoration: none; 
                        padding: 15px 30px; 
                        border-radius: 6px; 
                        font-weight: bold; 
                        display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="margin: 30px 0 0 0; line-height: 1.6; color: #888888; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <span style="color: #ff6b00; word-break: break-all;">${verificationLink}</span>
            </p>
            
            <p style="margin: 20px 0 0 0; line-height: 1.6; color: #888888; font-size: 14px;">
              This verification link will expire in 24 hours.
            </p>
          </div>
          
          <div style="background-color: #0a0a0a; padding: 20px 30px; border-top: 1px solid #333;">
            <p style="margin: 0; color: #666666; font-size: 12px; text-align: center;">
              © 2024 TheCueRoom. Underground Music Community Platform.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(firstName: string, tempPassword: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - TheCueRoom</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Arial', sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #111111; border: 1px solid #333;">
          <div style="background: linear-gradient(135deg, #ff6b00 0%, #ff8500 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">TheCueRoom</h1>
            <p style="color: #fff; margin: 10px 0 0 0; opacity: 0.9;">Password Reset</p>
          </div>
          
          <div style="padding: 40px 30px; color: #ffffff;">
            <h2 style="color: #ff6b00; margin: 0 0 20px 0;">Password Reset Request</h2>
            
            <p style="margin: 0 0 20px 0; line-height: 1.6; color: #cccccc;">
              Hi ${firstName},
            </p>
            
            <p style="margin: 0 0 20px 0; line-height: 1.6; color: #cccccc;">
              We've received a request to reset your password. Use this temporary password to log in:
            </p>
            
            <div style="background-color: #1a1a1a; border: 1px solid #333; padding: 20px; margin: 20px 0; text-align: center; border-radius: 6px;">
              <p style="margin: 0; color: #ff6b00; font-size: 18px; font-weight: bold; font-family: monospace;">
                ${tempPassword}
              </p>
            </div>
            
            <p style="margin: 20px 0 0 0; line-height: 1.6; color: #cccccc;">
              After logging in, please change your password immediately in your account settings for security.
            </p>
            
            <p style="margin: 20px 0 0 0; line-height: 1.6; color: #888888; font-size: 14px;">
              If you didn't request this password reset, please contact our support team immediately.
            </p>
          </div>
          
          <div style="background-color: #0a0a0a; padding: 20px 30px; border-top: 1px solid #333;">
            <p style="margin: 0; color: #666666; font-size: 12px; text-align: center;">
              © 2024 TheCueRoom. Underground Music Community Platform.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to TheCueRoom</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Arial', sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #111111; border: 1px solid #333;">
          <div style="background: linear-gradient(135deg, #ff6b00 0%, #ff8500 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">TheCueRoom</h1>
            <p style="color: #fff; margin: 10px 0 0 0; opacity: 0.9;">Welcome to the Underground</p>
          </div>
          
          <div style="padding: 40px 30px; color: #ffffff;">
            <h2 style="color: #ff6b00; margin: 0 0 20px 0;">Welcome ${firstName}!</h2>
            
            <p style="margin: 0 0 20px 0; line-height: 1.6; color: #cccccc;">
              Your account has been verified and you're now part of India's premier underground techno and house music community.
            </p>
            
            <h3 style="color: #ff6b00; margin: 30px 0 15px 0;">What you can do now:</h3>
            
            <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #cccccc; line-height: 1.8;">
              <li>Share your music and connect with fellow artists</li>
              <li>Post gigs and events in your city</li>
              <li>Discover new music and underground tracks</li>
              <li>Join community discussions and share insights</li>
              <li>Access curated playlists and industry news</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://thecueroom.xyz" 
                 style="background: linear-gradient(135deg, #ff6b00 0%, #ff8500 100%); 
                        color: #ffffff; 
                        text-decoration: none; 
                        padding: 15px 30px; 
                        border-radius: 6px; 
                        font-weight: bold; 
                        display: inline-block;">
                Enter TheCueRoom
              </a>
            </div>
            
            <p style="margin: 30px 0 0 0; line-height: 1.6; color: #888888; font-size: 14px;">
              Ready to make some noise in the underground? Let's go!
            </p>
          </div>
          
          <div style="background-color: #0a0a0a; padding: 20px 30px; border-top: 1px solid #333;">
            <p style="margin: 0; color: #666666; font-size: 12px; text-align: center;">
              © 2024 TheCueRoom. Underground Music Community Platform.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  isServiceConfigured(): boolean {
    return this.isConfigured;
  }
}

export const emailService = new EmailService();
