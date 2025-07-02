#!/usr/bin/env tsx

import { spawn } from 'child_process';
import { performance } from 'perf_hooks';
import { writeFileSync, existsSync } from 'fs';
import { getServiceConfiguration, validateServiceConfiguration } from '../server/config/services';
import { performComprehensiveHealthCheck } from '../server/utils/healthChecks';

interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  duration: number;
  coverage?: number;
  errors: string[];
  warnings: string[];
}

interface TestReport {
  timestamp: string;
  environment: string;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalDuration: number;
  overallCoverage: number;
  suites: TestResult[];
  healthCheck: any;
  configuration: any;
  defectRate: number;
  qualityScore: number;
}

class TestOrchestrator {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<TestReport> {
    console.log('🧪 Starting Comprehensive Test Suite Execution');
    console.log('===============================================');
    
    this.startTime = performance.now();
    
    // Pre-test system validation
    await this.validateEnvironment();
    
    // Run all test categories
    await this.runUnitTests();
    await this.runIntegrationTests();
    await this.runSecurityTests();
    await this.runPerformanceTests();
    await this.runAccessibilityTests();
    await this.runCrossPlatformTests();
    await this.runEndToEndTests();
    
    // Generate comprehensive report
    const report = await this.generateReport();
    
    // Validate quality requirements
    this.validateQualityRequirements(report);
    
    return report;
  }

  private async validateEnvironment(): Promise<void> {
    console.log('\n🔍 Validating Test Environment');
    
    // Check service configuration
    const configValidation = validateServiceConfiguration();
    if (!configValidation.valid) {
      throw new Error(`Configuration validation failed: ${configValidation.errors.join(', ')}`);
    }
    
    // Check health of all services
    const healthCheck = await performComprehensiveHealthCheck();
    if (healthCheck.overall !== 'healthy') {
      console.warn('⚠️  Some services are not optimal, proceeding with caution');
    }
    
    console.log('✅ Environment validation complete');
  }

  private async runUnitTests(): Promise<void> {
    console.log('\n🔬 Running Unit Tests');
    const result = await this.executeTestCommand('jest tests/unit --coverage --verbose');
    this.results.push({
      suite: 'Unit Tests',
      ...result
    });
  }

  private async runIntegrationTests(): Promise<void> {
    console.log('\n🔗 Running Integration Tests');
    const result = await this.executeTestCommand('jest tests/integration --testTimeout=30000');
    this.results.push({
      suite: 'Integration Tests',
      ...result
    });
  }

  private async runSecurityTests(): Promise<void> {
    console.log('\n🔒 Running Security Tests');
    const result = await this.executeTestCommand('jest tests/security --testTimeout=60000');
    this.results.push({
      suite: 'Security Tests',
      ...result
    });
  }

  private async runPerformanceTests(): Promise<void> {
    console.log('\n⚡ Running Performance Tests');
    const result = await this.executeTestCommand('jest tests/performance --testTimeout=120000');
    this.results.push({
      suite: 'Performance Tests',
      ...result
    });
  }

  private async runAccessibilityTests(): Promise<void> {
    console.log('\n♿ Running Accessibility Tests');
    const result = await this.executeTestCommand('playwright test tests/accessibility --timeout=60000');
    this.results.push({
      suite: 'Accessibility Tests',
      ...result
    });
  }

  private async runCrossPlatformTests(): Promise<void> {
    console.log('\n🌐 Running Cross-Platform Tests');
    const result = await this.executeTestCommand('jest tests/cross-platform --testTimeout=90000');
    this.results.push({
      suite: 'Cross-Platform Tests',
      ...result
    });
  }

  private async runEndToEndTests(): Promise<void> {
    console.log('\n🎭 Running End-to-End Tests');
    const result = await this.executeTestCommand('playwright test tests/e2e --timeout=120000');
    this.results.push({
      suite: 'End-to-End Tests',
      ...result
    });
  }

  private async executeTestCommand(command: string): Promise<Omit<TestResult, 'suite'>> {
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    
    return new Promise((resolve) => {
      const [cmd, ...args] = command.split(' ');
      const process = spawn(cmd, args, { 
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true 
      });
      
      let output = '';
      let passed = 0;
      let failed = 0;
      let coverage = 0;
      
      process.stdout?.on('data', (data) => {
        const text = data.toString();
        output += text;
        console.log(text);
        
        // Parse Jest output
        const passMatch = text.match(/(\d+) passing/);
        const failMatch = text.match(/(\d+) failing/);
        const coverageMatch = text.match(/All files\s+\|\s+(\d+\.?\d*)/);
        
        if (passMatch) passed += parseInt(passMatch[1]);
        if (failMatch) failed += parseInt(failMatch[1]);
        if (coverageMatch) coverage = parseFloat(coverageMatch[1]);
      });
      
      process.stderr?.on('data', (data) => {
        const text = data.toString();
        console.error(text);
        
        if (text.includes('Error:') || text.includes('FAIL')) {
          errors.push(text.trim());
        } else if (text.includes('Warning:') || text.includes('WARN')) {
          warnings.push(text.trim());
        }
      });
      
      process.on('close', (code) => {
        const duration = performance.now() - startTime;
        
        // Parse final results from output
        const testResults = this.parseTestOutput(output);
        
        resolve({
          passed: testResults.passed || passed,
          failed: testResults.failed || failed,
          duration,
          coverage: testResults.coverage || coverage,
          errors,
          warnings
        });
      });
    });
  }

  private parseTestOutput(output: string): { passed: number; failed: number; coverage?: number } {
    // Parse Jest output
    const jestMatch = output.match(/Tests:\s+(\d+) failed.*?(\d+) passed.*?(\d+) total/s);
    if (jestMatch) {
      return {
        failed: parseInt(jestMatch[1]) || 0,
        passed: parseInt(jestMatch[2]) || 0
      };
    }
    
    // Parse Playwright output
    const playwrightMatch = output.match(/(\d+) passed.*?(\d+) failed/);
    if (playwrightMatch) {
      return {
        passed: parseInt(playwrightMatch[1]) || 0,
        failed: parseInt(playwrightMatch[2]) || 0
      };
    }
    
    // Fallback parsing
    const passedMatch = output.match(/(\d+)\s+(?:test(?:s)?|spec(?:s)?)\s+passed/i);
    const failedMatch = output.match(/(\d+)\s+(?:test(?:s)?|spec(?:s)?)\s+failed/i);
    const coverageMatch = output.match(/All files.*?(\d+\.?\d*)%/);
    
    return {
      passed: passedMatch ? parseInt(passedMatch[1]) : 0,
      failed: failedMatch ? parseInt(failedMatch[1]) : 0,
      coverage: coverageMatch ? parseFloat(coverageMatch[1]) : undefined
    };
  }

  private async generateReport(): Promise<TestReport> {
    const endTime = performance.now();
    const totalDuration = endTime - this.startTime;
    
    const totalTests = this.results.reduce((sum, r) => sum + r.passed + r.failed, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    
    const coverageValues = this.results.map(r => r.coverage).filter(Boolean) as number[];
    const overallCoverage = coverageValues.length > 0 
      ? coverageValues.reduce((sum, c) => sum + c, 0) / coverageValues.length 
      : 0;
    
    const defectRate = totalTests > 0 ? (totalFailed / totalTests) * 100 : 0;
    const qualityScore = this.calculateQualityScore(totalPassed, totalFailed, overallCoverage, defectRate);
    
    const healthCheck = await performComprehensiveHealthCheck();
    const configuration = getServiceConfiguration();
    
    const report: TestReport = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      totalTests,
      totalPassed,
      totalFailed,
      totalDuration,
      overallCoverage,
      suites: this.results,
      healthCheck,
      configuration,
      defectRate,
      qualityScore
    };
    
    // Save report to file
    const reportPath = `test-reports/comprehensive-test-report-${Date.now()}.json`;
    this.ensureDirectoryExists('test-reports');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Test report saved to: ${reportPath}`);
    
    return report;
  }

  private calculateQualityScore(passed: number, failed: number, coverage: number, defectRate: number): number {
    const passRate = passed / (passed + failed) * 100;
    const qualityMetrics = {
      passRate: Math.min(passRate, 100) * 0.4,        // 40% weight
      coverage: Math.min(coverage, 100) * 0.3,         // 30% weight
      defectInverse: Math.max(0, 100 - defectRate) * 0.2, // 20% weight
      completeness: passed > 100 ? 10 : (passed / 100) * 10 // 10% weight
    };
    
    return Object.values(qualityMetrics).reduce((sum, metric) => sum + metric, 0);
  }

  private validateQualityRequirements(report: TestReport): void {
    console.log('\n📋 Quality Requirements Validation');
    console.log('==================================');
    
    const requirements = [
      { name: 'Defect Rate', value: report.defectRate, max: 0.1, unit: '%' },
      { name: 'Test Pass Rate', value: (report.totalPassed / report.totalTests) * 100, min: 99.9, unit: '%' },
      { name: 'Code Coverage', value: report.overallCoverage, min: 95, unit: '%' },
      { name: 'Quality Score', value: report.qualityScore, min: 95, unit: '/100' }
    ];
    
    let allRequirementsMet = true;
    
    for (const req of requirements) {
      const passed = req.max ? req.value <= req.max : req.value >= (req.min || 0);
      const status = passed ? '✅' : '❌';
      
      console.log(`${status} ${req.name}: ${req.value.toFixed(2)}${req.unit}`);
      
      if (!passed) {
        allRequirementsMet = false;
        console.error(`   Required: ${req.max ? `≤ ${req.max}` : `≥ ${req.min}`}${req.unit}`);
      }
    }
    
    if (!allRequirementsMet) {
      throw new Error('Quality requirements not met. Platform not ready for production.');
    }
    
    console.log('\n🎉 All quality requirements met! Platform approved for production.');
  }

  private ensureDirectoryExists(dir: string): void {
    if (!existsSync(dir)) {
      require('fs').mkdirSync(dir, { recursive: true });
    }
  }

  public printSummary(report: TestReport): void {
    console.log('\n🎯 COMPREHENSIVE TEST RESULTS SUMMARY');
    console.log('====================================');
    console.log(`Environment: ${report.environment}`);
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Total Duration: ${(report.totalDuration / 1000).toFixed(2)}s`);
    console.log('');
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`✅ Passed: ${report.totalPassed}`);
    console.log(`❌ Failed: ${report.totalFailed}`);
    console.log(`📊 Coverage: ${report.overallCoverage.toFixed(2)}%`);
    console.log(`🐛 Defect Rate: ${report.defectRate.toFixed(3)}%`);
    console.log(`⭐ Quality Score: ${report.qualityScore.toFixed(1)}/100`);
    console.log('');
    
    console.log('Test Suite Breakdown:');
    report.suites.forEach(suite => {
      const total = suite.passed + suite.failed;
      const passRate = total > 0 ? (suite.passed / total * 100).toFixed(1) : '0';
      console.log(`  ${suite.suite}: ${suite.passed}/${total} (${passRate}%) - ${(suite.duration / 1000).toFixed(2)}s`);
    });
    
    console.log('');
    console.log(`🏥 System Health: ${report.healthCheck.overall}`);
    console.log(`🗄️  Database: ${report.healthCheck.services.find((s: any) => s.service === 'database')?.status}`);
    console.log(`📧 Email: ${report.healthCheck.services.find((s: any) => s.service === 'email')?.status}`);
    console.log(`🤖 AI: ${report.healthCheck.services.find((s: any) => s.service === 'ai')?.status}`);
    console.log(`💾 Storage: ${report.healthCheck.services.find((s: any) => s.service === 'storage')?.status}`);
  }
}

async function main() {
  try {
    const orchestrator = new TestOrchestrator();
    const report = await orchestrator.runAllTests();
    
    orchestrator.printSummary(report);
    
    if (report.defectRate <= 0.1 && report.qualityScore >= 95) {
      console.log('\n🚀 PLATFORM APPROVED FOR PRODUCTION DEPLOYMENT');
      process.exit(0);
    } else {
      console.log('\n🔧 PLATFORM REQUIRES FIXES BEFORE DEPLOYMENT');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}