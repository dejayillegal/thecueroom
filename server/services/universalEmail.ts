import sgMail from '@sendgrid/mail';
import { getServiceConfiguration } from '../config/services';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
  }>;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
  timestamp: number;
}

export class UniversalEmailService {
  private config = getServiceConfiguration().email;
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

  async sendEmail(params: EmailParams): Promise<EmailResult> {
    const startTime = Date.now();
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const result = await this.attemptSend(params);
        return {
          ...result,
          timestamp: Date.now() - startTime
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Email attempt ${attempt} failed:`, errorMessage);
        
        if (attempt === this.retryAttempts) {
          return {
            success: false,
            error: errorMessage,
            provider: this.config.provider,
            timestamp: Date.now() - startTime
          };
        }
        
        // Wait before retry with exponential backoff
        await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
      }
    }

    return {
      success: false,
      error: 'All retry attempts exhausted',
      provider: this.config.provider,
      timestamp: Date.now() - startTime
    };
  }

  private async attemptSend(params: EmailParams): Promise<EmailResult> {
    switch (this.config.provider) {
      case 'sendgrid':
        return this.sendWithSendGrid(params);
      case 'mailgun':
        return this.sendWithMailgun(params);
      case 'resend':
        return this.sendWithResend(params);
      case 'ses':
        return this.sendWithSES(params);
      default:
        throw new Error(`Unsupported email provider: ${this.config.provider}`);
    }
  }

  private async sendWithSendGrid(params: EmailParams): Promise<EmailResult> {
    if (!this.config.apiKey) {
      throw new Error('SendGrid API key not configured');
    }

    sgMail.setApiKey(this.config.apiKey);
    
    const msg = {
      to: params.to,
      from: {
        email: this.config.from,
        name: this.config.fromName
      },
      subject: params.subject,
      html: params.html,
      text: params.text,
      attachments: params.attachments?.map(att => ({
        content: att.content,
        filename: att.filename,
        type: att.type,
        disposition: 'attachment'
      }))
    };

    const [response] = await sgMail.send(msg);
    
    return {
      success: true,
      messageId: response.headers['x-message-id'] as string,
      provider: 'sendgrid',
      timestamp: 0
    };
  }

  private async sendWithMailgun(params: EmailParams): Promise<EmailResult> {
    const Mailgun = (await import('mailgun.js')).default;
    const formData = (await import('form-data')).default;
    
    if (!this.config.apiKey || !process.env.MAILGUN_DOMAIN) {
      throw new Error('Mailgun API key or domain not configured');
    }

    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: 'api',
      key: this.config.apiKey,
      url: process.env.MAILGUN_URL || 'https://api.mailgun.net'
    });

    const messageData = {
      from: `${this.config.fromName} <${this.config.from}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      attachment: params.attachments?.map(att => ({
        data: Buffer.from(att.content, 'base64'),
        filename: att.filename,
        contentType: att.type
      }))
    };

    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, messageData);
    
    return {
      success: true,
      messageId: response.id,
      provider: 'mailgun',
      timestamp: 0
    };
  }

  private async sendWithResend(params: EmailParams): Promise<EmailResult> {
    const { Resend } = await import('resend');
    
    if (!this.config.apiKey) {
      throw new Error('Resend API key not configured');
    }

    const resend = new Resend(this.config.apiKey);
    
    const emailData = {
      from: `${this.config.fromName} <${this.config.from}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      attachments: params.attachments?.map(att => ({
        content: att.content,
        filename: att.filename,
        contentType: att.type
      }))
    };

    const response = await resend.emails.send(emailData);
    
    return {
      success: true,
      messageId: response.data?.id,
      provider: 'resend',
      timestamp: 0
    };
  }

  private async sendWithSES(params: EmailParams): Promise<EmailResult> {
    const AWS = await import('aws-sdk');
    
    if (!process.env.AWS_SES_ACCESS_KEY || !process.env.AWS_SES_SECRET_KEY) {
      throw new Error('AWS SES credentials not configured');
    }

    const ses = new AWS.SES({
      accessKeyId: process.env.AWS_SES_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SES_SECRET_KEY,
      region: process.env.AWS_SES_REGION || 'us-east-1'
    });

    const emailParams = {
      Source: `${this.config.fromName} <${this.config.from}>`,
      Destination: {
        ToAddresses: [params.to]
      },
      Message: {
        Subject: {
          Data: params.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: params.html,
            Charset: 'UTF-8'
          },
          Text: {
            Data: params.text || this.stripHtml(params.html),
            Charset: 'UTF-8'
          }
        }
      }
    };

    const response = await ses.sendEmail(emailParams).promise();
    
    return {
      success: true,
      messageId: response.MessageId,
      provider: 'ses',
      timestamp: 0
    };
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testConnection(): Promise<{ success: boolean; provider: string; error?: string }> {
    try {
      // Send a test email to a test address if in development
      if (process.env.NODE_ENV === 'development' && process.env.TEST_EMAIL) {
        const result = await this.sendEmail({
          to: process.env.TEST_EMAIL,
          subject: 'TheCueRoom Email Service Test',
          html: '<p>This is a test email to verify email service configuration.</p>',
          text: 'This is a test email to verify email service configuration.'
        });
        
        return {
          success: result.success,
          provider: this.config.provider,
          error: result.error
        };
      }
      
      // In production, just validate configuration
      switch (this.config.provider) {
        case 'sendgrid':
          if (!this.config.apiKey || !this.config.apiKey.startsWith('SG.')) {
            throw new Error('Invalid SendGrid API key format');
          }
          break;
        case 'mailgun':
          if (!this.config.apiKey || !process.env.MAILGUN_DOMAIN) {
            throw new Error('Mailgun API key or domain missing');
          }
          break;
        case 'resend':
          if (!this.config.apiKey || !this.config.apiKey.startsWith('re_')) {
            throw new Error('Invalid Resend API key format');
          }
          break;
        case 'ses':
          if (!process.env.AWS_SES_ACCESS_KEY || !process.env.AWS_SES_SECRET_KEY) {
            throw new Error('AWS SES credentials missing');
          }
          break;
        default:
          throw new Error(`Unknown email provider: ${this.config.provider}`);
      }
      
      return {
        success: true,
        provider: this.config.provider
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        provider: this.config.provider,
        error: errorMessage
      };
    }
  }

  getProviderInfo() {
    return {
      provider: this.config.provider,
      configured: !!this.config.apiKey,
      from: this.config.from,
      fromName: this.config.fromName,
      retryAttempts: this.retryAttempts
    };
  }
}

// Export singleton instance
export const emailService = new UniversalEmailService();