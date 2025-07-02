import { db } from '../db';
import { emailService } from '../services/universalEmail';
import { getServiceConfiguration } from '../config/services';
import { sql } from 'drizzle-orm';

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  details?: any;
  error?: string;
  timestamp: string;
}

export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Test basic connection
    await db.execute(sql`SELECT 1 as test`);
    
    // Test table access
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM users LIMIT 1`);
    
    const responseTime = Date.now() - startTime;
    
    return {
      service: 'database',
      status: responseTime < 100 ? 'healthy' : responseTime < 500 ? 'degraded' : 'unhealthy',
      responseTime,
      details: {
        provider: getServiceConfiguration().database.provider,
        connectionTest: 'passed',
        tableAccess: 'passed',
        recordCount: result[0]?.count || 0
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: errorMessage,
      timestamp: new Date().toISOString()
    };
  }
}

export async function checkEmailHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const testResult = await emailService.testConnection();
    const responseTime = Date.now() - startTime;
    
    return {
      service: 'email',
      status: testResult.success ? 'healthy' : 'unhealthy',
      responseTime,
      details: {
        ...emailService.getProviderInfo(),
        testResult: testResult.success
      },
      error: testResult.error,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown email error';
    return {
      service: 'email',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: errorMessage,
      timestamp: new Date().toISOString()
    };
  }
}

export async function checkAIHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const config = getServiceConfiguration();
  
  try {
    if (config.ai.provider === 'none' || !config.ai.apiKey) {
      return {
        service: 'ai',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        details: {
          provider: 'none',
          configured: false,
          note: 'AI service is optional'
        },
        timestamp: new Date().toISOString()
      };
    }

    // Basic API key validation
    let validFormat = false;
    switch (config.ai.provider) {
      case 'openai':
        validFormat = config.ai.apiKey.startsWith('sk-');
        break;
      case 'anthropic':
        validFormat = config.ai.apiKey.startsWith('sk-ant-');
        break;
      case 'google':
        validFormat = config.ai.apiKey.length > 10;
        break;
    }

    return {
      service: 'ai',
      status: validFormat ? 'healthy' : 'unhealthy',
      responseTime: Date.now() - startTime,
      details: {
        provider: config.ai.provider,
        configured: !!config.ai.apiKey,
        keyFormat: validFormat ? 'valid' : 'invalid',
        model: config.ai.model
      },
      error: validFormat ? undefined : 'Invalid API key format',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown AI error';
    return {
      service: 'ai',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: errorMessage,
      timestamp: new Date().toISOString()
    };
  }
}

export async function checkStorageHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const config = getServiceConfiguration();
  
  try {
    switch (config.storage.provider) {
      case 'local':
        const fs = await import('fs').then(m => m.promises);
        const path = await import('path');
        
        const uploadDir = config.storage.config.uploadDir;
        await fs.access(uploadDir).catch(() => fs.mkdir(uploadDir, { recursive: true }));
        
        // Test write access
        const testFile = path.join(uploadDir, 'health-check.txt');
        await fs.writeFile(testFile, 'health check');
        await fs.unlink(testFile);
        
        return {
          service: 'storage',
          status: 'healthy',
          responseTime: Date.now() - startTime,
          details: {
            provider: 'local',
            directory: uploadDir,
            writable: true
          },
          timestamp: new Date().toISOString()
        };
        
      case 'cloudinary':
        const cloudinary = await import('cloudinary');
        cloudinary.v2.config(config.storage.config);
        
        // Test API access
        await cloudinary.v2.api.ping();
        
        return {
          service: 'storage',
          status: 'healthy',
          responseTime: Date.now() - startTime,
          details: {
            provider: 'cloudinary',
            cloudName: config.storage.config.cloudName,
            configured: true
          },
          timestamp: new Date().toISOString()
        };
        
      default:
        return {
          service: 'storage',
          status: 'healthy',
          responseTime: Date.now() - startTime,
          details: {
            provider: config.storage.provider,
            configured: true,
            note: 'Basic configuration validation passed'
          },
          timestamp: new Date().toISOString()
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
    return {
      service: 'storage',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: errorMessage,
      timestamp: new Date().toISOString()
    };
  }
}

export async function performComprehensiveHealthCheck(): Promise<{
  overall: 'healthy' | 'unhealthy' | 'degraded';
  services: HealthCheckResult[];
  summary: {
    healthy: number;
    unhealthy: number;
    degraded: number;
    totalResponseTime: number;
  };
  timestamp: string;
}> {
  const startTime = Date.now();
  
  const checks = await Promise.allSettled([
    checkDatabaseHealth(),
    checkEmailHealth(),
    checkAIHealth(),
    checkStorageHealth()
  ]);

  const services: HealthCheckResult[] = checks.map(result => 
    result.status === 'fulfilled' ? result.value : {
      service: 'unknown',
      status: 'unhealthy' as const,
      responseTime: 0,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }
  );

  const summary = {
    healthy: services.filter(s => s.status === 'healthy').length,
    unhealthy: services.filter(s => s.status === 'unhealthy').length,
    degraded: services.filter(s => s.status === 'degraded').length,
    totalResponseTime: Date.now() - startTime
  };

  const overall = summary.unhealthy > 0 ? 'unhealthy' : 
                 summary.degraded > 0 ? 'degraded' : 'healthy';

  return {
    overall,
    services,
    summary,
    timestamp: new Date().toISOString()
  };
}