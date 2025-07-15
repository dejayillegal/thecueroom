import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.js";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { emailService } from "./services/emailService";
import { loggingService } from "./services/loggingService";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) return false;
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    if (hashedBuf.length !== suppliedBuf.length) return false;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch {
    return false;
  }
}

/**
 * Generates a secure temporary password for admin resets
 */
export function generateTemporaryPassword(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const specialChars = '!@#$%';
  let pwd = '';
  // one of each required type
  pwd += chars.slice(26,52)[Math.floor(Math.random() * 26)]; // uppercase
  pwd += chars.slice(0,26)[Math.floor(Math.random() * 26)];  // lowercase
  pwd += chars.slice(52)[Math.floor(Math.random() * chars.slice(52).length)]; // digit
  pwd += specialChars[Math.floor(Math.random() * specialChars.length)];       // special
  // fill rest
  while (pwd.length < 8) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Sends a password-reset email (used by admins)
 */
export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  tempPassword: string
): Promise<boolean> {
  try {
    const subject = "TheCueRoom – Password Reset by Admin";
    const htmlContent = `
      <div style="font-family: Arial; max-width:600px; margin:auto;">
        <h2 style="color:#8B5CF6;">Password Reset</h2>
        <p>Hello ${firstName},</p>
        <p>An administrator has reset your password.</p>
        <pre style="background:#f3f4f6; padding:1em; border-radius:6px;">
          Temporary Password: <strong>${tempPassword}</strong>
        </pre>
        <p>Please log in and change it immediately.</p>
        <p>– TheCueRoom Team</p>
      </div>
    `;
    // Call with a single options object, then return true/false based on the result
    const result = await emailService.sendEmail({
      to: email,
      subject,
      html: htmlContent,
    });
    // Assume EmailResult has a `success` boolean field
    return (result as any).success === true;
  } catch (err) {
    console.error("Error sending reset email:", err);
    return false;
  }
}

/** 
 * Generates a random 8-char username (letters + digits)
 */
function generateUsername(): string {
  return 'user' + Math.random().toString(36).substring(2, 10);
}

export function setupAuth(app: Express): void {
  // Session store
  const PgStore = connectPg(session);
  const sessionSettings = {
    store: new PgStore({ pool: (storage as any).pool, tableName: 'session' }),
    secret: process.env.SESSION_SECRET || 'change-this',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        if (!user.emailVerified) {
          return done(null, false, { message: 'Please verify your email first' });
        }
        if (user.isSuspended) {
          return done(null, false, { message: 'Your account is suspended' });
        }
        if (user.forcePasswordChange) {
          return done(null, user, { forcePasswordChange: true });
        }
        return done(null, user);
      } catch (e) {
        return done(e);
      }
    }
  ));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (e) {
      console.error("Deserialize error:", e);
      done(null, false);
    }
  });

  // ─────────────────────
  // AUTH ROUTES
  // ─────────────────────

  // Login
  app.post("/api/auth/login", (req, res, next) =>
    passport.authenticate("local", (err, user, info) => {
      if (err)   return res.status(500).json({ message: "Auth error" });
      if (!user) return res.status(401).json({ message: info?.message || "Denied" });
      if ((user as any).forcePasswordChange) {
        return res.status(202).json({
          message: "Must change temporary password",
          forcePasswordChange: true
        });
      }
      req.login(user, (e) => {
        if (e) return res.status(500).json({ message: "Login error" });
        res.json({
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
          isAdmin: user.isAdmin
        });
      });
    })(req, res, next)
  );

  // Logout
  app.post("/api/auth/logout", (req, res, next) => {
    req.logout(err => {
      if (err) return next(err);
      req.session.destroy(e => {
        if (e) return next(e);
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out" });
      });
    });
  });

  // Dev-only bypass email verification
  app.post("/api/auth/bypass-verification", async (req, res) => {
    if (process.env.NODE_ENV !== 'development')
      return res.status(403).json({ message: "Dev only endpoint" });
    const { email } = req.body;
    const u = await storage.getUserByEmail(email);
    if (!u) return res.status(404).json({ message: "No such user" });
    const up = await storage.updateUserVerification(u.id, true);
    res.json({ message: "Bypassed!", user: up });
  });

  // Forgot Password – send reset link
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email required" });
      const user = await storage.getUserByEmail(email);
      // Always respond success, even if user not found
      if (user) {
        const token = randomBytes(32).toString("hex");
        const exp   = new Date(Date.now() + 3600000);
        await storage.updateUserResetToken(user.id, token, exp);
        if (process.env.NODE_ENV !== 'development') {
          await emailService.sendResetLink(email, token);
        } else {
          console.log(`[DEV] Reset URL: /api/auth/reset-password?token=${token}&email=${email}`);
        }
      }
      res.json({ message: "If account exists, reset link sent." });
    } catch (e) {
      console.error("Forgot password error:", e);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Reset Password – with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, email, newPassword } = req.body;
      if (!token || !email || !newPassword)
        return res.status(400).json({ message: "All fields required" });
      if (newPassword.length < 6)
        return res.status(400).json({ message: "Password too short" });
      const user = await storage.verifyResetToken(token, email);
      if (!user) return res.status(400).json({ message: "Invalid/expired token" });
      const hashed = await hashPassword(newPassword);
      await storage.resetUserPassword(user.id, hashed);
      await storage.clearUserResetToken(user.id);
      res.json({ message: "Password reset. You may now log in." });
    } catch (e) {
      console.error("Reset password error:", e);
      res.status(500).json({ message: "Reset failed" });
    }
  });

  // … all other routes unchanged …

}

// Middleware guards
export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
}
export function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.isAdmin) return next();
  res.status(403).json({ message: "Admin only" });
}
