# Database Security Documentation
**MIDI Training App - Security-Focused Database Schema**

## Security Features Implemented

### 🔒 **Core Security Principles**

#### **1. Defense in Depth**
- Multiple layers of security controls
- Database-level constraints + application-level validation
- Audit logging for all critical operations

#### **2. Principle of Least Privilege**
- Role-based access control (FREE, PREMIUM, PRO, TEACHER, ADMIN)
- Granular permissions per user role
- OAuth providers for reduced password exposure

#### **3. Zero Trust Architecture**
- All actions logged and auditable
- Session tracking with device fingerprinting
- IP address monitoring for anomaly detection

---

## 🛡️ **Security Features by Category**

### **Authentication Security**

#### **Password Protection**
- `password` field for Argon2 hashing (NOT plain text)
- `passwordChangedAt` tracking for security policies
- `loginAttempts` + `lockedUntil` for brute force protection
- Nullable password field supports OAuth-only accounts

#### **Account Lockout Protection**
```sql
-- Automatic lockout after 5 failed attempts
loginAttempts     Int       @default(0)
lockedUntil       DateTime? -- Account unlocks automatically
```

#### **Two-Factor Authentication**
```sql
twoFactorEnabled  Boolean   @default(false)
twoFactorSecret   String?   -- TOTP secret (encrypted)
backupCodes       String[]  -- Recovery codes
```

### **Session Security**

#### **Advanced Session Tracking**
```sql
ipAddress    String? @db.Inet     -- IP address validation
userAgent    String?              -- Browser fingerprinting  
deviceInfo   Json?                -- Device characteristics
lastActivity DateTime             -- Automatic timeouts
```

#### **Session Hijacking Prevention**
- Unique session tokens (`sessionToken` field)
- IP address binding (optional enforcement)
- Device fingerprinting for anomaly detection
- Automatic expiration (`expires` field)

### **Data Protection**

#### **GDPR Compliance**
```sql
-- Privacy consent tracking
termsAcceptedAt       DateTime?
privacyAcceptedAt     DateTime?
marketingOptIn        Boolean @default(false)
dataProcessingConsent Boolean @default(false)

-- Right to be forgotten
deletedAt DateTime? -- Soft delete preserves referential integrity
```

#### **Data Classification**
- **Sensitive**: passwords, 2FA secrets, OAuth tokens
- **Personal**: email, name, IP addresses  
- **Public**: progress stats, leaderboard data
- **System**: audit logs, session data

### **Audit & Compliance**

#### **Comprehensive Audit Logging**
```sql
model AuditLog {
  action    AuditAction  -- What happened
  entity    String?      -- What was affected
  metadata  Json?        -- Before/after values
  ipAddress String?      -- Where it came from
  severity  LogSeverity  -- Risk level
  category  String       -- "auth", "data", "security"
}
```

#### **Security Event Categories**
- **Authentication**: Login/logout, password changes
- **Authorization**: Role changes, permission grants
- **Data Access**: Record access, modifications
- **Security**: Suspicious activity, failed attempts

---

## 🔍 **Database Security Controls**

### **Constraint-Based Security**

#### **Input Validation**
```sql
email      String @unique @db.VarChar(255)  -- Length limits
name       String? @db.VarChar(100)         -- Prevent XSS
userAgent  String? @db.VarChar(500)         -- Reasonable limits
```

#### **Data Integrity**
- Foreign key constraints prevent orphaned records
- Unique constraints prevent duplicate accounts
- Check constraints for valid enum values
- NOT NULL constraints for required fields

### **Index-Based Security**

#### **Performance & Security Indexes**
```sql
@@index([email])        -- Fast user lookup
@@index([lockedUntil])  -- Quick lockout checks
@@index([lastLoginAt])  -- Session management
@@index([ipAddress])    -- IP-based analysis
@@index([severity])     -- Security alert queries
```

### **Token Security**

#### **Verification Token Protection**
```sql
model VerificationToken {
  token     String @unique    -- Cryptographically secure
  type      TokenType         -- Purpose-specific tokens
  expires   DateTime          -- Time-bound validity
  attempts  Int @default(0)   -- Brute force prevention
}
```

#### **Token Types**
- `EMAIL_VERIFICATION`: Account activation
- `PASSWORD_RESET`: Secure password recovery
- `TWO_FACTOR_RECOVERY`: 2FA backup access

---

## 🚨 **Security Monitoring**

### **Automated Threat Detection**

#### **Suspicious Activity Patterns**
- Multiple failed logins from same IP
- Login from unusual geographic location
- Session from multiple devices simultaneously
- Rapid-fire API requests (rate limiting)

#### **Alert Triggers**
```sql
enum LogSeverity {
  DEBUG     -- Development info
  INFO      -- Normal operations
  WARN      -- Potential issues
  ERROR     -- Failed operations
  CRITICAL  -- Security incidents
}
```

### **Compliance Reporting**

#### **Audit Trail Requirements**
- **Who**: User ID or system action
- **What**: Specific action taken  
- **When**: Timestamp with timezone
- **Where**: IP address and location
- **Why**: Business context in metadata

---

## 💳 **Subscription Security**

### **Payment Data Protection**
```sql
model Subscription {
  stripeCustomerId     String? @unique    -- External reference only
  stripeSubscriptionId String? @unique    -- No card data stored
  plan                 SubscriptionPlan   -- Local authorization
  status               SubscriptionStatus -- Real-time sync
}
```

#### **PCI DSS Compliance**
- **No payment data stored** locally
- Stripe handles all sensitive payment information
- Only store external reference IDs
- Regular subscription status synchronization

---

## 🔧 **Implementation Best Practices**

### **Database Connection Security**
```env
# Connection pooling for performance
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_URL_UNPOOLED=postgresql://user:pass@host:5432/db

# Always use SSL in production
?sslmode=require
```

### **Query Security**
- **Parameterized queries only** (Prisma handles this)
- **No dynamic SQL construction**
- **Input validation** at application layer
- **Output encoding** for XSS prevention

### **Backup & Recovery**
- **Automated daily backups** (Supabase handles this)
- **Point-in-time recovery** capability
- **Encrypted backups** at rest and in transit
- **Regular restore testing**

---

## 🎯 **Security Validation Checklist**

### **Pre-Production Security Review**

#### **Authentication Security**
- [ ] Password hashing with Argon2 (NOT bcrypt)
- [ ] Account lockout after failed attempts
- [ ] Session timeout configuration
- [ ] 2FA implementation and testing
- [ ] OAuth provider security review

#### **Data Protection**
- [ ] All sensitive fields encrypted at rest
- [ ] GDPR compliance features tested
- [ ] Data retention policies implemented
- [ ] Soft delete functionality working

#### **Audit & Monitoring**
- [ ] All security events logged
- [ ] Alert thresholds configured
- [ ] Log retention policies set
- [ ] Security dashboard functional

#### **Infrastructure Security**
- [ ] Database firewall configured
- [ ] SSL/TLS enforced for all connections
- [ ] Backup encryption verified
- [ ] Access controls tested

---

## 🚀 **Next Implementation Steps**

1. **Set up Supabase project**
2. **Run database migrations**
3. **Configure Row Level Security (RLS)**
4. **Implement authentication endpoints**
5. **Add security middleware**
6. **Set up monitoring and alerts**

This schema provides enterprise-grade security while maintaining simplicity for a music education app. Every field and constraint has been designed with security as a primary consideration.