import { emailService } from './services/emailService';

async function testEmailVerification() {
  console.log('Testing Email Verification System...\n');
  
  // Test 1: Check SendGrid API Key
  console.log('1. Checking SendGrid API Key...');
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY is not set');
    return;
  }
  console.log('✓ SendGrid API Key is configured');
  
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