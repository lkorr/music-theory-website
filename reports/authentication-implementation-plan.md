# Authentication System Implementation Plan
**Security-First Approach with Minimal Technical Debt**

## Executive Summary

This plan provides a step-by-step roadmap to implement a production-ready authentication system for the MIDI Training App. The implementation prioritizes security, scalability, and maintainability while minimizing technical debt.

**Timeline**: 4-6 weeks  
**Priority**: CRITICAL - Blocks all user-dependent features  
**Security Level**: Production-grade with OWASP compliance

---

## Phase 0: Critical Security Fixes (Day 1-2)
**MUST BE COMPLETED BEFORE ANY OTHER WORK**

### Step 1: Remove Mock Authentication
```bash
# Files to modify immediately:
apps/web/src/app/api/auth/token/route.js
```

**Action Items:**
1. Delete all mock token generation code
2. Add environment check to prevent mock auth in production
3. Implement proper error handling for missing authentication

### Step 2: Fix Cross-Origin Security
```javascript
// Replace wildcard origin in:
// apps/web/src/app/api/auth/expo-web-success/route.js

const ALLOWED_ORIGINS = [
  process.env.WEB_URL,
  process.env.MOBILE_URL
].filter(Boolean);

window.parent.postMessage(message, ALLOWED_ORIGINS[0]);
```

### Step 3: Environment Variable Validation
Create `apps/web/src/config/auth.config.js`:
```javascript
const requiredEnvVars = [
  'AUTH_SECRET',
  'DATABASE_URL',
  'AUTH_URL'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  url: process.env.AUTH_URL,
  // ... other config
};
```

---

## Phase 1: Database Setup (Week 1)

### Step 4: Choose Database Provider
**Recommended: Supabase or PostgreSQL with Prisma**

```bash
# Install dependencies
npm install @supabase/supabase-js @prisma/client
npm install -D prisma
```

### Step 5: Design Database Schema
Create `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  emailVerified     DateTime?
  password          String?   // For credential auth
  name              String?
  image             String?
  role              UserRole  @default(USER)
  
  // Security fields
  loginAttempts     Int       @default(0)
  lockedUntil       DateTime?
  lastLoginAt       DateTime?
  lastLoginIp       String?
  twoFactorEnabled  Boolean   @default(false)
  twoFactorSecret   String?
  
  // Metadata
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime? // Soft delete
  
  // Relations
  accounts          Account[]
  sessions          Session[]
  auditLogs         AuditLog[]
  practiceProgress  PracticeProgress[]
  subscription      Subscription?
  
  @@index([email])
  @@index([createdAt])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  ipAddress    String?
  userAgent    String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([expires])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
  @@index([expires])
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String
  entity    String?
  entityId  String?
  metadata  Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  
  user User? @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

enum UserRole {
  USER
  PREMIUM
  PRO
  TEACHER
  ADMIN
}
```

### Step 6: Initialize Database
```bash
# Initialize Prisma
npx prisma init

# Create migration
npx prisma migrate dev --name init

# Generate client
npx prisma generate
```

---

## Phase 2: Auth Provider Configuration (Week 2)

### Step 7: Configure Auth.js with Prisma Adapter
Create `apps/web/src/lib/auth.js`:
```javascript
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth from "@auth/core";
import Google from "@auth/core/providers/google";
import Credentials from "@auth/core/providers/credentials";
import argon2 from "argon2";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
    
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      
      async authorize(credentials) {
        // Rate limiting check
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) {
          // Constant time to prevent user enumeration
          await argon2.hash("dummy");
          return null;
        }
        
        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("Account locked. Try again later.");
        }
        
        // Verify password
        const valid = await argon2.verify(user.password, credentials.password);
        
        if (!valid) {
          // Increment failed attempts
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: user.loginAttempts + 1,
              lockedUntil: user.loginAttempts >= 4 
                ? new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
                : null
            }
          });
          return null;
        }
        
        // Reset attempts on successful login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
            lastLoginIp: req.ip
          }
        });
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes
    updateAge: 5 * 60, // Update every 5 minutes
  },
  
  jwt: {
    secret: process.env.AUTH_SECRET,
    encryption: true,
  },
  
  cookies: {
    sessionToken: {
      name: "__Secure-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
    newUser: "/auth/welcome"
  },
  
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    
    async signIn({ user, account, profile }) {
      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "SIGN_IN",
          entity: "User",
          entityId: user.id,
          metadata: { provider: account.provider }
        }
      });
      return true;
    }
  },
  
  events: {
    async signOut({ session }) {
      if (session?.user?.id) {
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: "SIGN_OUT",
            entity: "User",
            entityId: session.user.id
          }
        });
      }
    }
  }
};

export const { auth, handlers, signIn, signOut } = NextAuth(authOptions);
```

---

## Phase 3: Security Middleware (Week 3)

### Step 8: Implement Security Headers
Create `apps/web/src/middleware/security.js`:
```javascript
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createHash } from "crypto";

// CSP Configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Rate limiting configurations
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many authentication attempts",
  standardHeaders: true,
  legacyHeaders: false,
  
  // Store in database for distributed systems
  store: new PrismaRateLimitStore(),
  
  keyGenerator: (req) => {
    // Use IP + User Agent for better fingerprinting
    const ip = req.ip || req.connection.remoteAddress;
    const ua = req.get("user-agent") || "";
    return createHash("sha256").update(ip + ua).digest("hex");
  },
});

export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: "Too many API requests",
});
```

### Step 9: Input Validation & Sanitization
Create `apps/web/src/lib/validation.js`:
```javascript
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";

// User registration schema
export const registerSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim()
    .max(255),
    
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Password must contain uppercase, lowercase, number, and special character"
    ),
    
  name: z
    .string()
    .min(1)
    .max(100)
    .transform(val => DOMPurify.sanitize(val)),
    
  acceptTerms: z
    .boolean()
    .refine(val => val === true, "You must accept the terms"),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

// CSRF Token validation
export function validateCSRFToken(token, sessionToken) {
  if (!token || !sessionToken) return false;
  
  const expected = createHash("sha256")
    .update(sessionToken + process.env.AUTH_SECRET)
    .digest("hex");
    
  return timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expected)
  );
}
```

---

## Phase 4: User Registration & Management (Week 4)

### Step 10: Registration Flow
Create `apps/web/src/app/api/auth/register/route.js`:
```javascript
import { registerSchema } from "@/lib/validation";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request) {
  try {
    // Parse and validate input
    const body = await request.json();
    const data = registerSchema.parse(body);
    
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (existing) {
      // Constant time response to prevent enumeration
      await argon2.hash("dummy");
      return Response.json(
        { error: "Registration failed" },
        { status: 400 }
      );
    }
    
    // Hash password with Argon2
    const hashedPassword = await argon2.hash(data.password, {
      type: argon2.argon2id,
      memoryCost: 19456, // 19 MB
      timeCost: 2,
      parallelism: 1,
    });
    
    // Create user with transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
        },
      });
      
      // Create verification token
      const token = crypto.randomBytes(32).toString("hex");
      await tx.verificationToken.create({
        data: {
          identifier: newUser.email,
          token,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });
      
      // Audit log
      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: "USER_REGISTERED",
          entity: "User",
          entityId: newUser.id,
          ipAddress: request.ip,
          userAgent: request.headers.get("user-agent"),
        },
      });
      
      // Send verification email
      await sendVerificationEmail(newUser.email, token);
      
      return newUser;
    });
    
    return Response.json({
      message: "Registration successful. Please check your email.",
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return Response.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
```

### Step 11: Email Verification
Create `apps/web/src/app/api/auth/verify-email/route.js`:
```javascript
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  
  if (!token) {
    return Response.redirect("/auth/error?error=InvalidToken");
  }
  
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });
  
  if (!verificationToken || verificationToken.expires < new Date()) {
    return Response.redirect("/auth/error?error=TokenExpired");
  }
  
  // Update user and clean up token
  await prisma.$transaction([
    prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: { token },
    }),
  ]);
  
  return Response.redirect("/auth/signin?verified=true");
}
```

---

## Phase 5: Session Management (Week 5)

### Step 12: Secure Session Handling
Create `apps/web/src/lib/session.js`:
```javascript
import { auth } from "./auth";
import { prisma } from "./prisma";

export async function getServerSession(request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }
  
  // Validate session in database
  const dbSession = await prisma.session.findFirst({
    where: {
      userId: session.user.id,
      expires: { gt: new Date() },
    },
  });
  
  if (!dbSession) {
    return null;
  }
  
  // Update session activity
  await prisma.session.update({
    where: { id: dbSession.id },
    data: { expires: new Date(Date.now() + 30 * 60 * 1000) },
  });
  
  return session;
}

export async function requireAuth(request) {
  const session = await getServerSession(request);
  
  if (!session) {
    throw new Response("Unauthorized", { status: 401 });
  }
  
  return session;
}

export async function invalidateAllSessions(userId) {
  await prisma.session.deleteMany({
    where: { userId },
  });
}
```

### Step 13: Two-Factor Authentication (Optional but Recommended)
Create `apps/web/src/lib/2fa.js`:
```javascript
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export async function generateTwoFactorSecret(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  const secret = speakeasy.generateSecret({
    name: `MIDI Training (${user.email})`,
    issuer: "MIDI Training App",
  });
  
  // Store encrypted secret
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: encrypt(secret.base32),
    },
  });
  
  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  
  return { secret: secret.base32, qrCode };
}

export async function verifyTwoFactorToken(userId, token) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user.twoFactorSecret) {
    return false;
  }
  
  const secret = decrypt(user.twoFactorSecret);
  
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2, // Allow 2 time windows for clock skew
  });
}
```

---

## Phase 6: Testing & Monitoring (Week 6)

### Step 14: Security Testing
Create `apps/web/src/tests/auth.security.test.js`:
```javascript
import { describe, it, expect } from "vitest";
import { testClient } from "./utils";

describe("Authentication Security", () => {
  it("should rate limit login attempts", async () => {
    const attempts = Array(6).fill(null).map(() => 
      testClient.post("/api/auth/login", {
        email: "test@example.com",
        password: "wrong",
      })
    );
    
    const results = await Promise.all(attempts);
    const blocked = results.filter(r => r.status === 429);
    
    expect(blocked.length).toBeGreaterThan(0);
  });
  
  it("should not reveal user existence", async () => {
    const existing = await testClient.post("/api/auth/login", {
      email: "existing@example.com",
      password: "wrong",
    });
    
    const nonExisting = await testClient.post("/api/auth/login", {
      email: "nonexisting@example.com",
      password: "wrong",
    });
    
    // Response time should be similar (constant time)
    expect(existing.responseTime).toBeCloseTo(nonExisting.responseTime, 100);
  });
  
  it("should enforce HTTPS in production", async () => {
    process.env.NODE_ENV = "production";
    const response = await testClient.get("/", {
      protocol: "http",
    });
    
    expect(response.headers["strict-transport-security"]).toBeDefined();
  });
});
```

### Step 15: Monitoring & Alerting
Create `apps/web/src/lib/monitoring.js`:
```javascript
export async function monitorAuthEvents() {
  // Failed login threshold
  const failedLogins = await prisma.auditLog.count({
    where: {
      action: "LOGIN_FAILED",
      createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
    },
  });
  
  if (failedLogins > 50) {
    await sendAlert("High number of failed login attempts detected");
  }
  
  // New user registrations
  const newUsers = await prisma.user.count({
    where: {
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  
  // Track metrics
  await trackMetric("auth.failed_logins", failedLogins);
  await trackMetric("auth.new_users", newUsers);
}
```

---

## Environment Configuration

### Required Environment Variables
Create `.env.production`:
```bash
# Security Keys (generate with: openssl rand -base64 32)
AUTH_SECRET=your-32-character-secret-key-here
ENCRYPTION_KEY=your-encryption-key-for-2fa-secrets

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
DATABASE_URL_UNPOOLED=postgresql://user:password@host:5432/dbname

# Auth URLs
AUTH_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_URL_INTERNAL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Service (SendGrid/Resend)
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@your-domain.com

# Security Settings
NODE_ENV=production
SECURE_COOKIES=true
CSRF_SECRET=your-csrf-secret

# Rate Limiting (Redis)
REDIS_URL=redis://localhost:6379

# Monitoring (Sentry)
SENTRY_DSN=your-sentry-dsn
```

---

## Deployment Checklist

### Pre-Deployment Security Audit
- [ ] All environment variables configured
- [ ] Mock authentication removed
- [ ] HTTPS enforced on all endpoints
- [ ] Rate limiting enabled
- [ ] CSRF protection active
- [ ] Input validation on all forms
- [ ] SQL injection prevention (Prisma parameterized queries)
- [ ] XSS protection (Content-Security-Policy headers)
- [ ] Secure session configuration
- [ ] Password hashing with Argon2
- [ ] Email verification required
- [ ] Audit logging enabled
- [ ] Security headers configured
- [ ] Error messages don't leak information
- [ ] Dependencies updated and audited

### Performance Optimization
- [ ] Database indexes created
- [ ] Session cleanup job scheduled
- [ ] Old audit logs pruning
- [ ] Redis caching for sessions
- [ ] CDN for static assets
- [ ] Compression enabled

### Monitoring Setup
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Security alerts configured
- [ ] Backup strategy implemented
- [ ] Incident response plan documented

---

## Migration Path from Current System

### Step 1: Parallel Implementation
1. Keep existing mock auth for development
2. Implement new auth system alongside
3. Use feature flags to switch between systems

### Step 2: Data Migration
```javascript
// One-time migration script
async function migrateExistingUsers() {
  const mockUsers = await fetchMockUsers();
  
  for (const mockUser of mockUsers) {
    await prisma.user.create({
      data: {
        email: mockUser.email,
        name: mockUser.name,
        emailVerified: new Date(), // Auto-verify existing users
        // Send password reset email instead of storing mock passwords
      },
    });
  }
}
```

### Step 3: Gradual Rollout
1. Enable for internal testing (1 week)
2. Beta users opt-in (1 week)
3. New users default (1 week)
4. Migrate all existing users
5. Remove old system

---

## Long-Term Maintenance

### Regular Security Updates
- Weekly dependency updates
- Monthly security audits
- Quarterly penetration testing
- Annual third-party security review

### Compliance Considerations
- GDPR: User data export/deletion
- CCPA: Privacy policy updates
- SOC 2: Audit trail maintenance
- HIPAA: If handling health data

### Scaling Considerations
- Database read replicas for sessions
- Redis cluster for rate limiting
- JWT signing key rotation
- Geographic session distribution

---

## Success Metrics

### Security KPIs
- Failed login attempts < 1%
- Account recovery success > 95%
- Session hijacking incidents = 0
- Average authentication time < 200ms
- 2FA adoption > 30%

### User Experience KPIs
- Registration completion > 80%
- Login success rate > 98%
- Password reset completion > 90%
- Session timeout complaints < 5%

---

## Risk Mitigation

### High-Risk Scenarios
1. **Database Breach**: Argon2 hashing + encryption at rest
2. **Session Hijacking**: Secure cookies + IP validation
3. **Brute Force**: Rate limiting + account lockout
4. **Social Engineering**: 2FA + security questions
5. **Supply Chain Attack**: Dependency scanning + SRI

### Incident Response Plan
1. Immediate: Disable affected accounts
2. Within 1 hour: Investigate scope
3. Within 4 hours: Patch vulnerability
4. Within 24 hours: User notification
5. Within 72 hours: Full incident report

---

## Conclusion

This implementation plan provides a comprehensive, security-first approach to building a production-ready authentication system. By following these steps, the MIDI Training App will have:

- **Bank-grade security** with proper encryption and hashing
- **Scalable architecture** ready for millions of users
- **Minimal technical debt** through proper planning
- **Compliance readiness** for various regulations
- **Excellent user experience** with modern auth flows

The total implementation time of 4-6 weeks includes testing and security audits, ensuring a robust system that will serve as a solid foundation for all future features.