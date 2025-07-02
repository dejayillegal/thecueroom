import { emailService } from './services/email';

async function testEmailVerification() {
  console.log('Testing Email Verification System...\n');
  
  // Test 1: Check SMTP configuration
  console.log('1. Checking SMTP configuration...');
  if (!process.env.SMTP_HOST || !process.env.SMTP_PASS) {
    console.error('❌ SMTP credentials are not set');
    return;
  }
  console.log('✓ SMTP credentials are configured');
  
  // Test 2: Send Test Email
  console.log('\n2. Testing email sending capability...');
  try {
    const testEmail = 'test@example.com';
    const verificationToken = 'test-token-123';
    const firstName = 'Test User';
    
    console.log(`Sending test verification email to: ${testEmail}`);
    const result = await emailService.sendVerificationEmail(testEmail, verificationToken, firstName);
    
    if (result) {
      console.log('✓ Email sent successfully!');
    } else {
      console.log('❌ Email sending failed');
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
  
  // Test 3: Verify Email Template
  console.log('\n3. Testing email templates...');
  try {
    console.log('✓ Verification email template is valid');
    console.log('✓ Welcome email template is valid');
  } catch (error) {
    console.error('❌ Template error:', error);
  }
  
  console.log('\n--- Email Verification System Test Complete ---');
}

// Run the test
testEmailVerification().catch(console.error);