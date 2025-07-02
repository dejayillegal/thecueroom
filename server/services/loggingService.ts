import { storage } from '../storage';
import type { InsertUserLog } from '@shared/schema';

export class LoggingService {
  async logUserAction(
    userId: string,
    action: string,
    details: string,
    severity: 'debug' | 'info' | 'warn' | 'error' = 'info',
    req?: any
  ): Promise<void> {
    try {
      const logData: InsertUserLog = {
        userId,
        action,
        details,
        severity,
        ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown',
        userAgent: req?.headers?.['user-agent'] || req?.get?.('User-Agent') || 'unknown',
        metadata: {
          timestamp: new Date().toISOString(),
          url: req?.originalUrl || '',
          method: req?.method || '',
        },
      };

      await storage.createUserLog(logData);
    } catch (error) {
      console.error('Failed to log user action:', error);
    }
  }

  async logLogin(userId: string, req?: any): Promise<void> {
    await this.logUserAction(userId, 'login', 'User logged in', 'info', req);
  }

  async logLogout(userId: string, req?: any): Promise<void> {
    await this.logUserAction(userId, 'logout', 'User logged out', 'info', req);
  }

  async logRegistration(userId: string, req?: any): Promise<void> {
    await this.logUserAction(userId, 'registration', 'User registered', 'info', req);
  }

  async logProfileUpdate(userId: string, changes: string[], req?: any): Promise<void> {
    await this.logUserAction(
      userId,
      'profile_update',
      `Profile updated: ${changes.join(', ')}`,
      'info',
      req
    );
  }

  async logPasswordChange(userId: string, req?: any): Promise<void> {
    await this.logUserAction(userId, 'password_change', 'Password changed', 'info', req);
  }

  async logPostCreate(userId: string, postId: number, req?: any): Promise<void> {
    await this.logUserAction(
      userId,
      'post_create',
      `Created post ID: ${postId}`,
      'info',
      req
    );
  }

  async logCommentCreate(userId: string, commentId: number, postId: number, req?: any): Promise<void> {
    await this.logUserAction(
      userId,
      'comment_create',
      `Created comment ID: ${commentId} on post ID: ${postId}`,
      'info',
      req
    );
  }

  async logMemeGeneration(userId: string, memeId: number, req?: any): Promise<void> {
    await this.logUserAction(
      userId,
      'meme_generation',
      `Generated meme ID: ${memeId}`,
      'info',
      req
    );
  }

  async logEmailVerification(userId: string, req?: any): Promise<void> {
    await this.logUserAction(userId, 'email_verification', 'Email verified', 'info', req);
  }

  async logPasswordReset(userId: string, req?: any): Promise<void> {
    await this.logUserAction(userId, 'password_reset', 'Password reset requested', 'info', req);
  }

  async logAdminAction(userId: string, action: string, details: string, req?: any): Promise<void> {
    await this.logUserAction(userId, action, details, 'warn', req);
  }

  async logSuspension(userId: string, adminUserId: string, reason: string, req?: any): Promise<void> {
    await this.logUserAction(
      userId,
      'account_suspension',
      `Account suspended by admin ${adminUserId}. Reason: ${reason}`,
      'warn',
      req
    );
  }

  async logUnsuspension(userId: string, adminUserId: string, req?: any): Promise<void> {
    await this.logUserAction(
      userId,
      'account_unsuspension',
      `Account unsuspended by admin ${adminUserId}`,
      'info',
      req
    );
  }

  async logVerification(userId: string, adminUserId: string, req?: any): Promise<void> {
    await this.logUserAction(
      userId,
      'account_verification',
      `Account verified by admin ${adminUserId}`,
      'info',
      req
    );
  }

  async logError(userId: string, error: string, context: string, req?: any): Promise<void> {
    await this.logUserAction(
      userId,
      'error',
      `Error in ${context}: ${error}`,
      'error',
      req
    );
  }

  async logDebug(userId: string, message: string, context: string, req?: any): Promise<void> {
    await this.logUserAction(
      userId,
      'debug',
      `Debug in ${context}: ${message}`,
      'debug',
      req
    );
  }
}

export const loggingService = new LoggingService();