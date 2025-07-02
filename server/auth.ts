import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { emailService } from "./services/email";
import { loggingService } from "./services/loggingService";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Generates a secure temporary password for admin resets
 * @returns {string} 8-character readable password
 */
export function generateTemporaryPassword(): string {
  // Use readable characters (no ambiguous ones like 0, O, l, I, 1)
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const specialChars = '!@#$%';
  
  let password = '';
  
  // Ensure at least one uppercase, one lowercase, one number, one special
  password += chars.substring(26, 52).charAt(Math.floor(Math.random() * 26)); // uppercase
  password += chars.substring(0, 26).charAt(Math.floor(Math.random() * 26)); // lowercase  
  password += chars.substring(52).charAt(Math.floor(Math.random() * 7)); // number
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length)); // special
  
  // Fill remaining 4 characters
  for (let i = 4; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Sends password reset email with temporary password
 * @param {string} email - User email
 * @param {string} firstName - User first name
 * @param {string} tempPassword - Temporary password
 * @returns {Promise<boolean>} Email send success
 */
export async function sendPasswordResetEmail(email: string, firstName: string, tempPassword: string): Promise<boolean> {
  try {
    const subject = "TheCueRoom - Password Reset by Admin";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">TheCueRoom Password Reset</h2>
        <p>Hello ${firstName},</p>
        <p>An administrator has reset your password for security reasons.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Your Temporary Password:</h3>
          <p style="font-family: monospace; font-size: 18px; font-weight: bold; color: #1f2937; background: white; padding: 10px; border-radius: 4px; display: inline-block;">${tempPassword}</p>
        </div>
        <p><strong>Important Security Instructions:</strong></p>
        <ul>
          <li>Login with this temporary password immediately</li>
          <li>You will be required to change your password upon login</li>
          <li>This temporary password expires after first use</li>
          <li>If you didn't request this reset, contact our admin team immediately</li>
        </ul>
        <p>Welcome back to the underground!</p>
        <p>- TheCueRoom Admin Team</p>
      </div>
    `;
    
    // Development mode - always return success with console logging
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== ADMIN PASSWORD RESET EMAIL ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Temporary Password: ${tempPassword}`);
      console.log('=======================================\n');
      return true;
    }
    
    const { sendPasswordResetEmail: sendEmail } = await import('./services/email.js');
    return await sendEmail(email, firstName, tempPassword);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    
    // In development, still return true to allow testing
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Simulating successful email send');
      return true;
    }
    
    return false;
  }
}

/**
 * Generates creative usernames inspired by underground techno/house culture
 * @returns {string} A unique username combining music culture references
 */
function generateUsername(): string {
  const undergroundPrefixes = [
    'Minimal', 'Acid', 'Deep', 'Tech', 'Dark', 'Sub', 'Raw', 'Underground', 'Warehouse', 'Bass',
    'Analog', 'Digital', 'Modular', 'Resonant', 'Distorted', 'Filtered', 'Delayed', 'Reverb',
    'Hypnotic', 'Groovy', 'Pulsing', 'Driving', 'Banging', 'Proper', 'Mental', 'Sick',
    'Berghain', 'Fabric', 'Tresor', 'Detroit', 'Berlin', 'Basement', 'After', 'Late',
    'Sleepless', 'Caffeine', 'Nocturnal', 'Dawn', 'Midnight', 'Afterhours', 'Endless'
  ];
  
  const technoTerms = [
    'Reverb', 'Delay', 'Filter', 'Resonance', 'Cutoff', 'Attack', 'Decay', 'Release',
    'LFO', 'VCA', 'VCF', 'VCO', 'ENV', 'MOD', 'OSC', 'AMP', 'ADSR', 'FM',
    'Patch', 'Sync', 'Gate', 'Trigger', 'Clock', 'Step', 'Sequence', 'Pattern',
    'Loop', 'Sample', 'Break', 'Drop', 'Build', 'Peak', 'Breakdown', 'Outro',
    'Kick', 'Snare', 'Hat', 'Clap', 'Ride', 'Crash', 'Tom', 'Perc',
    'Warehouse', 'Bunker', 'Tunnel', 'Underground', 'Basement', 'Loft', 'Floor'
  ];
  
  const classicNumbers = [
    '303', '808', '909', '707', '606', '727', '787', '626', 
    '120', '128', '132', '138', '140', '145', '150', '174', '180',
    '127', '255', '64', '32', '16', '8', '4', '2'
  ];
  
  const funnyModifiers = [
    'Kid', 'Lord', 'Master', 'King', 'Queen', 'Boss', 'Chief', 'Captain',
    'Professor', 'Doctor', 'Wizard', 'Guru', 'Ninja', 'Pirate', 'Robot',
    'Alien', 'Ghost', 'Vampire', 'Zombie', 'Cyborg', 'Android', 'Machine'
  ];
  
  // Different username generation patterns for variety
  const patterns = [
    // Pattern 1: Prefix + TechnoTerm + Number (e.g., MinimalReverb303)
    () => {
      const prefix = undergroundPrefixes[Math.floor(Math.random() * undergroundPrefixes.length)];
      const term = technoTerms[Math.floor(Math.random() * technoTerms.length)];
      const number = classicNumbers[Math.floor(Math.random() * classicNumbers.length)];
      return `${prefix}${term}${number}`;
    },
    
    // Pattern 2: FunnyModifier + ClassicNumber (e.g., FilterKid808)
    () => {
      const term = technoTerms[Math.floor(Math.random() * technoTerms.length)];
      const modifier = funnyModifiers[Math.floor(Math.random() * funnyModifiers.length)];
      const number = classicNumbers[Math.floor(Math.random() * classicNumbers.length)];
      return `${term}${modifier}${number}`;
    },
    
    // Pattern 3: Underground venue + BPM (e.g., WarehouseDrop140)
    () => {
      const venue = ['Warehouse', 'Basement', 'Underground', 'Bunker', 'Loft', 'Factory'][Math.floor(Math.random() * 6)];
      const action = ['Drop', 'Beat', 'Pulse', 'Bang', 'Kick', 'Bass'][Math.floor(Math.random() * 6)];
      const bpm = ['120', '128', '132', '138', '140', '145', '150', '174'][Math.floor(Math.random() * 8)];
      return `${venue}${action}${bpm}`;
    },
    
    // Pattern 4: Adjective + Equipment + Random (e.g., SickMoog247)
    () => {
      const adjective = ['Sick', 'Mental', 'Proper', 'Banging', 'Heavy', 'Deep'][Math.floor(Math.random() * 6)];
      const gear = ['Moog', 'Roland', 'Korg', 'Nord', 'Virus', 'Access'][Math.floor(Math.random() * 6)];
      const random = Math.floor(Math.random() * 999) + 1;
      return `${adjective}${gear}${random}`;
    },
    
    // Pattern 5: Time + TechnoTerm + Number (e.g., AfterhoursFilter909)
    () => {
      const time = ['Afterhours', 'Midnight', 'Dawn', 'Late', 'Early', 'Night'][Math.floor(Math.random() * 6)];
      const term = technoTerms[Math.floor(Math.random() * technoTerms.length)];
      const number = classicNumbers[Math.floor(Math.random() * classicNumbers.length)];
      return `${time}${term}${number}`;
    }
  ];
  
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  return selectedPattern();
}

export function setupAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: 'Invalid email or password' });
          }
          if (!user.emailVerified) {
            return done(null, false, { message: 'Please verify your email before logging in' });
          }
          if (user.isSuspended) {
            return done(null, false, { message: 'Your account has been suspended' });
          }
          
          // Check if user needs to change password (temporary password)
          if (user.forcePasswordChange) {
            return done(null, user, { forcePasswordChange: true });
          }
          
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error('Deserialization error:', error);
      done(null, false);
    }
  });

  // Generate username endpoint
  app.post("/api/auth/generate-username", async (req, res) => {
    try {
      let username = generateUsername();
      let attempts = 0;
      
      // Ensure uniqueness
      while (attempts < 10) {
        const existingUser = await storage.getUserByUsername(username);
        if (!existingUser) break;
        username = generateUsername();
        attempts++;
      }
      
      res.json({ username });
    } catch (error) {
      console.error("Username generation error:", error);
      res.status(500).json({ message: "Failed to generate username" });
    }
  });

  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        stageName, 
        dateOfBirth, 
        city, 
        verificationLink, 
        securityQuestion, 
        username 
      } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Generate verification token
      const verificationToken = randomBytes(32).toString('hex');
      
      // Generate unique user ID
      const userId = `user_${randomBytes(8).toString('hex')}`;

      // Create user
      const user = await storage.createUser({
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        stageName,
        dateOfBirth,
        city,
        username,
        verificationLinks: { primary: verificationLink },
        securityQuestion,
        securityAnswer: securityQuestion, // In real app, this would be the answer, not the question
        verificationToken,
        emailVerified: false,
        isVerified: false,
        isAdmin: false,
        isSuspended: false,
      });

      // Send verification email
      try {
        const emailSent = await emailService.sendVerificationEmail(email, verificationToken, stageName || firstName);
        
        if (emailSent) {
          await loggingService.logRegistration(user.id, req);
          
          // Development mode: provide verification URL in response
          if (process.env.NODE_ENV === 'development') {
            console.log(`\n=== VERIFICATION EMAIL DETAILS ===`);
            console.log(`Email: ${email}`);
            console.log(`Verification URL: http://localhost:5000/api/verify-email?token=${verificationToken}`);
            console.log(`=====================================\n`);
            
            res.status(201).json({ 
              message: "Registration successful! Check console for verification link (development mode).",
              userId: user.id,
              verificationUrl: `/api/verify-email?token=${verificationToken}` // For dev testing
            });
          } else {
            res.status(201).json({ 
              message: "Registration successful! Please check your email to verify your account before logging in.",
              userId: user.id 
            });
          }
        } else {
          console.error(`Failed to send verification email to ${email}`);
          
          res.status(201).json({ 
            message: "Registration successful! However, there was an issue sending the verification email. Please contact admin for manual verification.",
            userId: user.id 
          });
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
        
        res.status(201).json({ 
          message: "Registration successful! However, there was an issue sending the verification email. Please contact admin for manual verification.",
          userId: user.id 
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      // Check if user needs to change password (temporary password)
      if (user.forcePasswordChange) {
        return res.status(202).json({
          message: "Temporary password detected. You must change your password to continue.",
          forcePasswordChange: true,
          userId: user.id,
          email: user.email
        });
      }
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login error" });
        }
        res.json({
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          artistName: user.artistName,
          isVerified: user.isVerified,
          isAdmin: user.isAdmin,
          profileImageUrl: user.profileImageUrl,
        });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  // Email verification endpoint
  app.get("/api/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h2>❌ Verification Failed</h2>
              <p>Verification token is missing.</p>
              <a href="/" style="color: #8b5cf6;">Return to Homepage</a>
            </body>
          </html>
        `);
      }
      
      const user = await storage.verifyEmail(token as string);
      
      if (!user) {
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h2>❌ Verification Failed</h2>
              <p>Invalid or expired verification token.</p>
              <a href="/" style="color: #8b5cf6;">Return to Homepage</a>
            </body>
          </html>
        `);
      }

      await loggingService.logEmailVerification(user.id, req);
      
      res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>✅ Email Verified Successfully!</h2>
            <p>Your email has been verified. Your account is now pending admin approval.</p>
            <p>You will receive another email once your account is activated.</p>
            <a href="/" style="color: #8b5cf6; text-decoration: none; padding: 10px 20px; background: #f0f0f0; border-radius: 5px;">Go to Login</a>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>❌ Verification Failed</h2>
            <p>An error occurred during verification.</p>
            <a href="/" style="color: #8b5cf6;">Return to Homepage</a>
          </body>
        </html>
      `);
    }
  });

  // Development endpoint to bypass email verification
  app.post("/api/auth/bypass-verification", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "This endpoint is only available in development" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUserVerification(user.id, true);
      res.json({ message: "Email verification bypassed for development", user: updatedUser });
    } catch (error) {
      console.error("Bypass verification error:", error);
      res.status(500).json({ message: "Bypass failed" });
    }
  });

  // Forgot password endpoint - initiate password reset via email
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists for security
        return res.json({ message: "If an account with that email exists, you will receive a password reset link." });
      }
      
      // Generate password reset token
      const resetToken = randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Store reset token in user record
      await storage.updateUserResetToken(user.id, resetToken, resetExpiry);
      
      // In development, log the reset URL
      if (process.env.NODE_ENV === 'development') {
        console.log(`Password reset URL: http://localhost:5000/api/auth/reset-password?token=${resetToken}&email=${email}`);
      }
      
      // In production, would send actual email here
      console.log(`Password reset email would be sent to ${email} with token: ${resetToken}`);
      
      res.json({ message: "If an account with that email exists, you will receive a password reset link." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Password reset request failed" });
    }
  });

  // Reset password endpoint - complete password reset with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, email, newPassword } = req.body;
      
      if (!token || !email || !newPassword) {
        return res.status(400).json({ message: "Token, email, and new password are required" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      
      const user = await storage.verifyResetToken(token, email);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Hash new password and update user
      const hashedPassword = await hashPassword(newPassword);
      await storage.resetUserPassword(user.id, hashedPassword);
      
      // Clear reset token
      await storage.clearUserResetToken(user.id);
      
      res.json({ message: "Password reset successfully. You can now log in with your new password." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Password reset failed" });
    }
  });

  // Get security question endpoint
  app.post("/api/auth/get-security-question", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found with this email address" });
      }
      
      if (!user.securityQuestion) {
        return res.status(400).json({ message: "No security question set for this account" });
      }
      
      res.json({ securityQuestion: user.securityQuestion });
    } catch (error) {
      console.error("Get security question error:", error);
      res.status(500).json({ message: "Failed to retrieve security question" });
    }
  });

  // Reset password with security question endpoint
  app.post("/api/auth/reset-password-security", async (req, res) => {
    try {
      const { email, securityAnswer, newPassword } = req.body;
      
      if (!email || !securityAnswer || !newPassword) {
        return res.status(400).json({ message: "Email, security answer, and new password are required" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found with this email address" });
      }
      
      if (!user.securityAnswer) {
        return res.status(400).json({ message: "No security answer set for this account" });
      }
      
      // Compare security answers (case-insensitive)
      const userAnswer = user.securityAnswer.toLowerCase().trim();
      const providedAnswer = securityAnswer.toLowerCase().trim();
      
      if (userAnswer !== providedAnswer) {
        return res.status(401).json({ message: "Security answer is incorrect" });
      }
      
      // Hash new password and update user
      const hashedPassword = await hashPassword(newPassword);
      await storage.resetUserPassword(user.id, hashedPassword);
      
      res.json({ message: "Password reset successfully using security question. You can now log in with your new password." });
    } catch (error) {
      console.error("Security question reset error:", error);
      res.status(500).json({ message: "Security question password reset failed" });
    }
  });

  // Force password change endpoint (for temporary passwords)
  app.post("/api/auth/change-temporary-password", async (req, res) => {
    try {
      const { email, currentPassword, newPassword } = req.body;
      
      if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Validate new password strength
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      if (!(await comparePasswords(currentPassword, user.password))) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Ensure user has force password change flag
      if (!user.forcePasswordChange) {
        return res.status(400).json({ message: "Password change not required for this account" });
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password and remove force change flag
      await storage.updateUserPassword(user.id, hashedNewPassword, false);

      // Log the password change
      await loggingService.logPasswordChange(user.id, 'temporary_password_changed');

      res.json({ 
        message: "Password changed successfully. You can now log in with your new password.",
        success: true 
      });
    } catch (error) {
      console.error('Error changing temporary password:', error);
      res.status(500).json({ message: 'Failed to change password' });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = req.user;
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      stageName: user.stageName,
      bio: user.bio,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      profileImageUrl: user.profileImageUrl,
      verificationLinks: user.verificationLinks,
      avatar: user.avatar,
      avatarConfig: user.avatarConfig,
    });
  });

  // Update user profile endpoint
  app.put("/api/auth/profile", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, stageName, bio, avatar, avatarConfig } = req.body;
      
      // Validation
      if (!firstName?.trim() || !lastName?.trim() || !stageName?.trim()) {
        return res.status(400).json({ message: 'First name, last name, and stage name are required' });
      }
      
      if (bio && bio.length > 1000) {
        return res.status(400).json({ message: 'Bio cannot exceed 1000 characters' });
      }
      
      // Update profile including avatar data
      const updatedUser = await storage.updateUserProfile(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        stageName: stageName.trim(),
        bio: bio?.trim() || null,
        avatar: avatar || null,
        avatarConfig: avatarConfig || null
      });
      
      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        stageName: updatedUser.stageName,
        bio: updatedUser.bio,
        isVerified: updatedUser.isVerified,
        isAdmin: updatedUser.isAdmin,
        profileImageUrl: updatedUser.profileImageUrl,
        verificationLinks: updatedUser.verificationLinks,
        avatar: updatedUser.avatar,
        avatarConfig: updatedUser.avatarConfig,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Change password endpoint
  app.put("/api/auth/change-password", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      // Validation
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters long' });
      }
      
      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify current password
      const isCurrentPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);
      
      // Update password
      await storage.resetUserPassword(userId, hashedNewPassword);
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Email verification endpoint
  app.get("/api/auth/verify/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const user = await storage.verifyEmail(token);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      res.json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });
}

export function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}