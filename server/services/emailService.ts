import { MailService } from '@sendgrid/mail';
import { randomBytes } from 'crypto';

// if (!process.env.SENDGRID_API_KEY) {
//   throw new Error("SENDGRID_API_KEY environment variable must be set");
// }

// const mailService = new MailService();
// mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private fromEmail = "support@thecueroom.xyz";

  async sendEmail(params: EmailParams): Promise<boolean> {
    try {
      await mailService.send({
        to: params.to,
        from: params.from || this.fromEmail,
        subject: params.subject,
        text: params.text || "",
        html: params.html || "",
      });
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      
      // Development fallback - log email content for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('\n=== EMAIL WOULD BE SENT ===');
        console.log('To:', params.to);
        console.log('Subject:', params.subject);
        console.log('Text:', params.text || 'No text content');
        console.log('==============================\n');
        return true; // Return success for development testing
      }
      
      return false;
    }
  }

  generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  async sendVerificationEmail(email: string, token: string, username: string): Promise<boolean> {
    const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000';
    const verificationUrl = `${baseUrl}/api/verify-email?token=${token}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background: #8b5cf6; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to TheCueRoom</h1>
            </div>
            <div class="content">
              <h2>Hello ${username},</h2>
              <p>Thank you for joining TheCueRoom, India's underground techno and house music community!</p>
              <p>To complete your registration and activate your account, please click the verification link below:</p>
              <a href="${verificationUrl}" class="button">Verify Your Email</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              <p><strong>Important:</strong> This link will expire in 24 hours.</p>
              <p>Once verified, your account will be reviewed by our admin team for final approval to maintain our exclusive underground community.</p>
            </div>
            <div class="footer">
              <p>If you didn't create this account, please ignore this email.</p>
              <p>&copy; 2025 TheCueRoom - Underground Music Community</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Welcome to TheCueRoom!

Hello ${username},

Thank you for joining TheCueRoom, India's underground techno and house music community!

To complete your registration and activate your account, please visit:
${verificationUrl}

This link will expire in 24 hours.

Once verified, your account will be reviewed by our admin team for final approval to maintain our exclusive underground community.

If you didn't create this account, please ignore this email.

© 2025 TheCueRoom - Underground Music Community
    `;

    return await this.sendEmail({
      to: email,
      from: this.fromEmail,
      subject: "Verify Your TheCueRoom Account",
      text: textContent,
      html: htmlContent,
    });
  }

  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to TheCueRoom!</h1>
            </div>
            <div class="content">
              <h2>Hello ${username},</h2>
              <p>Your account has been activated and approved! Welcome to India's underground techno and house music community.</p>
              <p>You can now:</p>
              <ul>
                <li>Share your music and connect with fellow artists</li>
                <li>Discover underground events and gigs</li>
                <li>Join community discussions</li>
                <li>Access exclusive content and playlists</li>
              </ul>
              <p>Start exploring the platform and connect with the underground scene!</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 TheCueRoom - Underground Music Community</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      from: this.fromEmail,
      subject: "Your TheCueRoom Account is Active!",
      html: htmlContent,
    });
  }
}

export const emailService = new EmailService();