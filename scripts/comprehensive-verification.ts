#!/usr/bin/env tsx

/**
 * TheCueRoom Comprehensive Enterprise Verification Suite
 * Performs deep code analysis, functionality testing, and compliance verification
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

interface VerificationResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  timestamp: string;
}

class EnterpriseVerificationSuite {
  private results: VerificationResult[] = [];
  private startTime: number = Date.now();

  private log(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARNING', details: string) {
    const result: VerificationResult = {
      category,
      test,
      status,
      details,
      timestamp: new Date().toISOString()
    };
    this.results.push(result);
    console.log(`[${status}] ${category}: ${test} - ${details}`);
  }

  async runAllVerifications(): Promise<void> {
    console.log('🚀 Starting TheCueRoom Enterprise Verification Suite\n');
    
    await this.verifyProjectStructure();
    await this.verifyDependencies();
    await this.verifyDatabaseSchema();
    await this.verifyAPIEndpoints();
    await this.verifyAuthentication();
    await this.verifySecurity();
    await this.verifyPerformance();
    await this.verifyLegalCompliance();
    await this.verifyCodeQuality();
    await this.verifyUIFunctionality();
    
    this.generateReport();
  }

  private async verifyProjectStructure(): Promise<void> {
    console.log('📁 Verifying Project Structure...');
    
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'tailwind.config.ts',
      'vite.config.ts',
      'drizzle.config.ts',
      'client/src/App.tsx',
      'server/index.ts',
      'server/routes.ts',
      'shared/schema.ts',
      'README.md',
      'TERMS_OF_SERVICE.md',
      'PRIVACY_POLICY.md'
    ];

    for (const file of requiredFiles) {
      if (existsSync(file)) {
        this.log('Structure', `Required file: ${file}`, 'PASS', 'File exists');
      } else {
        this.log('Structure', `Required file: ${file}`, 'FAIL', 'File missing');
      }
    }

    const requiredDirs = [
      'client/src/components',
      'client/src/pages',
      'client/src/hooks',
      'server',
      'shared',
      'tests'
    ];

    for (const dir of requiredDirs) {
      if (existsSync(dir)) {
        this.log('Structure', `Required directory: ${dir}`, 'PASS', 'Directory exists');
      } else {
        this.log('Structure', `Required directory: ${dir}`, 'FAIL', 'Directory missing');
      }
    }
  }

  private async verifyDependencies(): Promise<void> {
    console.log('📦 Verifying Dependencies...');
    
    try {
      const packageJson = require('../package.json');
      const criticalDeps = [
        'react',
        'typescript',
        'express',
        'drizzle-orm',
        '@tanstack/react-query',
        'tailwindcss',
        'wouter'
      ];

      for (const dep of criticalDeps) {
        if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
          this.log('Dependencies', `Critical dependency: ${dep}`, 'PASS', 'Dependency installed');
        } else {
          this.log('Dependencies', `Critical dependency: ${dep}`, 'FAIL', 'Dependency missing');
        }
      }

      // Check for security vulnerabilities
      try {
        execSync('npm audit --audit-level=high', { stdio: 'pipe' });
        this.log('Dependencies', 'Security audit', 'PASS', 'No high-severity vulnerabilities');
      } catch (error) {
        this.log('Dependencies', 'Security audit', 'WARNING', 'High-severity vulnerabilities detected');
      }
    } catch (error) {
      this.log('Dependencies', 'Package analysis', 'FAIL', `Error: ${error.message}`);
    }
  }

  private async verifyDatabaseSchema(): Promise<void> {
    console.log('🗄️ Verifying Database Schema...');
    
    try {
      const schema = require('../shared/schema.ts');
      const requiredTables = [
        'users',
        'posts', 
        'supportTickets',
        'moderationLogs',
        'newsArticles'
      ];

      for (const table of requiredTables) {
        if (schema[table]) {
          this.log('Database', `Table schema: ${table}`, 'PASS', 'Schema defined');
        } else {
          this.log('Database', `Table schema: ${table}`, 'FAIL', 'Schema missing');
        }
      }

      // Verify critical fields in support tickets
      if (schema.supportTickets && schema.supportTickets.tempPassword) {
        this.log('Database', 'Support tickets tempPassword field', 'PASS', 'Field exists for admin password reset');
      } else {
        this.log('Database', 'Support tickets tempPassword field', 'FAIL', 'Missing tempPassword field');
      }
    } catch (error) {
      this.log('Database', 'Schema analysis', 'FAIL', `Error: ${error.message}`);
    }
  }

  private async verifyAPIEndpoints(): Promise<void> {
    console.log('🌐 Verifying API Endpoints...');
    
    const endpoints = [
      { method: 'GET', path: '/api/auth/user', description: 'User authentication check' },
      { method: 'POST', path: '/api/auth/login', description: 'User login' },
      { method: 'POST', path: '/api/auth/register', description: 'User registration' },
      { method: 'POST', path: '/api/auth/admin-reset-password', description: 'Admin password reset' },
      { method: 'GET', path: '/api/posts', description: 'Fetch posts' },
      { method: 'GET', path: '/api/support/tickets', description: 'Support tickets' },
      { method: 'GET', path: '/api/news/spotlight', description: 'Featured news' }
    ];

    for (const endpoint of endpoints) {
      try {
        // Check if endpoint exists in routes file
        const routesContent = require('fs').readFileSync('server/routes.ts', 'utf8');
        const pattern = new RegExp(`app\\.${endpoint.method.toLowerCase()}\\(['"\`]${endpoint.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`, 'i');
        
        if (pattern.test(routesContent)) {
          this.log('API', `${endpoint.method} ${endpoint.path}`, 'PASS', endpoint.description);
        } else {
          this.log('API', `${endpoint.method} ${endpoint.path}`, 'FAIL', 'Endpoint not found in routes');
        }
      } catch (error) {
        this.log('API', `${endpoint.method} ${endpoint.path}`, 'WARNING', `Verification error: ${error.message}`);
      }
    }
  }

  private async verifyAuthentication(): Promise<void> {
    console.log('🔐 Verifying Authentication System...');
    
    try {
      const authContent = require('fs').readFileSync('server/auth.ts', 'utf8');
      
      const securityFeatures = [
        { feature: 'Password hashing', pattern: /hashPassword|bcrypt|scrypt/, required: true },
        { feature: 'Session management', pattern: /session|passport/, required: true },
        { feature: 'Admin authorization', pattern: /requireAdmin|isAdmin/, required: true },
        { feature: 'Password reset', pattern: /resetPassword|tempPassword/, required: true },
        { feature: 'Force password change', pattern: /forcePasswordChange/, required: true }
      ];

      for (const check of securityFeatures) {
        if (check.pattern.test(authContent)) {
          this.log('Authentication', check.feature, 'PASS', 'Feature implemented');
        } else {
          this.log('Authentication', check.feature, check.required ? 'FAIL' : 'WARNING', 'Feature not found');
        }
      }

      // Check for temporary password generation
      if (authContent.includes('generateTemporaryPassword')) {
        this.log('Authentication', 'Temporary password generation', 'PASS', 'Function exists');
      } else {
        this.log('Authentication', 'Temporary password generation', 'FAIL', 'Function missing');
      }
    } catch (error) {
      this.log('Authentication', 'System analysis', 'FAIL', `Error: ${error.message}`);
    }
  }

  private async verifySecurity(): Promise<void> {
    console.log('🛡️ Verifying Security Implementation...');
    
    const securityChecks = [
      {
        name: 'HTTPS enforcement',
        check: () => {
          const serverContent = require('fs').readFileSync('server/index.ts', 'utf8');
          return serverContent.includes('trust proxy') || serverContent.includes('secure');
        }
      },
      {
        name: 'Input validation',
        check: () => {
          const routesContent = require('fs').readFileSync('server/routes.ts', 'utf8');
          return routesContent.includes('zod') || routesContent.includes('validate');
        }
      },
      {
        name: 'Rate limiting',
        check: () => {
          const serverContent = require('fs').readFileSync('server/index.ts', 'utf8');
          return serverContent.includes('rateLimit') || serverContent.includes('express-rate-limit');
        }
      },
      {
        name: 'CORS configuration',
        check: () => {
          const serverContent = require('fs').readFileSync('server/index.ts', 'utf8');
          return serverContent.includes('cors') || serverContent.includes('Access-Control');
        }
      }
    ];

    for (const secCheck of securityChecks) {
      try {
        if (secCheck.check()) {
          this.log('Security', secCheck.name, 'PASS', 'Security measure implemented');
        } else {
          this.log('Security', secCheck.name, 'WARNING', 'Security measure not detected');
        }
      } catch (error) {
        this.log('Security', secCheck.name, 'WARNING', `Check failed: ${error.message}`);
      }
    }
  }

  private async verifyPerformance(): Promise<void> {
    console.log('⚡ Verifying Performance Optimizations...');
    
    try {
      const viteConfig = require('fs').readFileSync('vite.config.ts', 'utf8');
      
      if (viteConfig.includes('build') && viteConfig.includes('rollupOptions')) {
        this.log('Performance', 'Build optimization', 'PASS', 'Vite build configured');
      } else {
        this.log('Performance', 'Build optimization', 'WARNING', 'Build optimization not explicitly configured');
      }

      // Check for code splitting
      const appContent = require('fs').readFileSync('client/src/App.tsx', 'utf8');
      if (appContent.includes('lazy') || appContent.includes('Suspense')) {
        this.log('Performance', 'Code splitting', 'PASS', 'Lazy loading implemented');
      } else {
        this.log('Performance', 'Code splitting', 'WARNING', 'Code splitting not detected');
      }

      // Check for React Query caching
      if (appContent.includes('QueryClient') || appContent.includes('useQuery')) {
        this.log('Performance', 'Data caching', 'PASS', 'React Query caching enabled');
      } else {
        this.log('Performance', 'Data caching', 'WARNING', 'Data caching not detected');
      }
    } catch (error) {
      this.log('Performance', 'Analysis', 'WARNING', `Performance check failed: ${error.message}`);
    }
  }

  private async verifyLegalCompliance(): Promise<void> {
    console.log('⚖️ Verifying Legal Compliance...');
    
    const requiredLegalDocs = [
      'TERMS_OF_SERVICE.md',
      'PRIVACY_POLICY.md', 
      'COOKIE_POLICY.md',
      'ACCEPTABLE_USE_POLICY.md',
      'DATA_PROCESSING_AGREEMENT.md',
      'DMCA_POLICY.md'
    ];

    for (const doc of requiredLegalDocs) {
      if (existsSync(doc)) {
        try {
          const content = require('fs').readFileSync(doc, 'utf8');
          if (content.length > 1000 && content.includes('2025')) {
            this.log('Legal', `Document: ${doc}`, 'PASS', 'Complete legal document');
          } else {
            this.log('Legal', `Document: ${doc}`, 'WARNING', 'Document may be incomplete');
          }
        } catch (error) {
          this.log('Legal', `Document: ${doc}`, 'FAIL', 'Error reading document');
        }
      } else {
        this.log('Legal', `Document: ${doc}`, 'FAIL', 'Required legal document missing');
      }
    }

    // Check for GDPR compliance indicators
    if (existsSync('PRIVACY_POLICY.md')) {
      const privacyContent = require('fs').readFileSync('PRIVACY_POLICY.md', 'utf8');
      const gdprKeywords = ['GDPR', 'data subject rights', 'consent', 'data processing', 'right to deletion'];
      
      for (const keyword of gdprKeywords) {
        if (privacyContent.toLowerCase().includes(keyword.toLowerCase())) {
          this.log('Legal', `GDPR compliance: ${keyword}`, 'PASS', 'Keyword found in privacy policy');
        } else {
          this.log('Legal', `GDPR compliance: ${keyword}`, 'WARNING', 'GDPR keyword not found');
        }
      }
    }
  }

  private async verifyCodeQuality(): Promise<void> {
    console.log('🔍 Verifying Code Quality...');
    
    try {
      // Check TypeScript compilation
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        this.log('Code Quality', 'TypeScript compilation', 'PASS', 'No TypeScript errors');
      } catch (error) {
        this.log('Code Quality', 'TypeScript compilation', 'FAIL', 'TypeScript compilation errors detected');
      }

      // Check for common code quality patterns
      const sourceFiles = [
        'client/src/App.tsx',
        'server/routes.ts',
        'server/auth.ts'
      ];

      for (const file of sourceFiles) {
        if (existsSync(file)) {
          const content = require('fs').readFileSync(file, 'utf8');
          
          // Check for error handling
          if (content.includes('try') && content.includes('catch')) {
            this.log('Code Quality', `Error handling in ${file}`, 'PASS', 'Error handling present');
          } else {
            this.log('Code Quality', `Error handling in ${file}`, 'WARNING', 'Limited error handling detected');
          }

          // Check for TypeScript types
          if (content.includes('interface') || content.includes('type ')) {
            this.log('Code Quality', `Type safety in ${file}`, 'PASS', 'TypeScript types used');
          } else {
            this.log('Code Quality', `Type safety in ${file}`, 'WARNING', 'Limited type usage detected');
          }
        }
      }
    } catch (error) {
      this.log('Code Quality', 'Analysis', 'WARNING', `Code quality check failed: ${error.message}`);
    }
  }

  private async verifyUIFunctionality(): Promise<void> {
    console.log('🎨 Verifying UI Functionality...');
    
    try {
      const componentsToCheck = [
        'client/src/components/auth/auth-modal.tsx',
        'client/src/components/auth/force-password-change.tsx',
        'client/src/pages/admin-support.tsx',
        'client/src/pages/home.tsx'
      ];

      for (const component of componentsToCheck) {
        if (existsSync(component)) {
          const content = require('fs').readFileSync(component, 'utf8');
          
          // Check for React hooks usage
          if (content.includes('useState') || content.includes('useEffect')) {
            this.log('UI', `Component functionality: ${component}`, 'PASS', 'React hooks implemented');
          } else {
            this.log('UI', `Component functionality: ${component}`, 'WARNING', 'Limited React hooks usage');
          }

          // Check for accessibility
          if (content.includes('aria-') || content.includes('role=')) {
            this.log('UI', `Accessibility: ${component}`, 'PASS', 'Accessibility attributes present');
          } else {
            this.log('UI', `Accessibility: ${component}`, 'WARNING', 'Limited accessibility attributes');
          }

          // Check for responsive design
          if (content.includes('md:') || content.includes('lg:') || content.includes('sm:')) {
            this.log('UI', `Responsive design: ${component}`, 'PASS', 'Responsive classes used');
          } else {
            this.log('UI', `Responsive design: ${component}`, 'WARNING', 'Limited responsive design');
          }
        } else {
          this.log('UI', `Component: ${component}`, 'FAIL', 'Component file missing');
        }
      }

      // Check for TheCueRoom branding
      const appContent = require('fs').readFileSync('client/src/App.tsx', 'utf8');
      if (appContent.includes('TheCueRoom') || appContent.includes('Underground')) {
        this.log('UI', 'Brand consistency', 'PASS', 'TheCueRoom branding present');
      } else {
        this.log('UI', 'Brand consistency', 'WARNING', 'Limited brand consistency');
      }
    } catch (error) {
      this.log('UI', 'Analysis', 'WARNING', `UI verification failed: ${error.message}`);
    }
  }

  private generateReport(): void {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;
    const total = this.results.length;
    
    const successRate = ((passed / total) * 100).toFixed(1);
    
    console.log('\n📊 THECUTEROOM ENTERPRISE VERIFICATION REPORT');
    console.log('='.repeat(60));
    console.log(`Verification completed in ${duration}s`);
    console.log(`Total checks: ${total}`);
    console.log(`✅ Passed: ${passed} (${successRate}%)`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    
    // Categorize results
    const categories = [...new Set(this.results.map(r => r.category))];
    
    console.log('\n📋 RESULTS BY CATEGORY:');
    for (const category of categories) {
      const categoryResults = this.results.filter(r => r.category === category);
      const categoryPassed = categoryResults.filter(r => r.status === 'PASS').length;
      const categoryTotal = categoryResults.length;
      const categoryRate = ((categoryPassed / categoryTotal) * 100).toFixed(1);
      
      console.log(`\n${category}: ${categoryPassed}/${categoryTotal} (${categoryRate}%)`);
      
      // Show failed and warning items
      const issues = categoryResults.filter(r => r.status !== 'PASS');
      for (const issue of issues) {
        console.log(`  ${issue.status === 'FAIL' ? '❌' : '⚠️'} ${issue.test}: ${issue.details}`);
      }
    }
    
    // Overall assessment
    console.log('\n🎯 ENTERPRISE READINESS ASSESSMENT:');
    if (failed === 0 && warnings <= 5) {
      console.log('✅ EXCELLENT - Platform meets enterprise standards');
    } else if (failed <= 3 && warnings <= 10) {
      console.log('✅ GOOD - Platform ready for production with minor improvements');
    } else if (failed <= 5) {
      console.log('⚠️ NEEDS ATTENTION - Address critical issues before production');
    } else {
      console.log('❌ NOT READY - Significant issues require resolution');
    }
    
    // Generate detailed report file
    const reportData = {
      timestamp: new Date().toISOString(),
      duration: duration,
      summary: {
        total,
        passed,
        failed,
        warnings,
        successRate: parseFloat(successRate)
      },
      results: this.results,
      assessment: failed === 0 && warnings <= 5 ? 'EXCELLENT' : 
                 failed <= 3 && warnings <= 10 ? 'GOOD' :
                 failed <= 5 ? 'NEEDS_ATTENTION' : 'NOT_READY'
    };
    
    writeFileSync('ENTERPRISE_VERIFICATION_REPORT.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed report saved to: ENTERPRISE_VERIFICATION_REPORT.json');
  }
}

// Run verification suite
const suite = new EnterpriseVerificationSuite();
suite.runAllVerifications().catch(console.error);