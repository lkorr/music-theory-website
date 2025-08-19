-- MIDI Training App - Security-Focused Database Schema
-- Execute this SQL in Supabase SQL Editor

-- Create custom types (enums)
CREATE TYPE user_role AS ENUM ('FREE', 'PREMIUM', 'PRO', 'TEACHER', 'ADMIN');
CREATE TYPE token_type AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'TWO_FACTOR_RECOVERY');
CREATE TYPE audit_action AS ENUM (
  'USER_REGISTERED', 'USER_LOGIN', 'USER_LOGOUT', 'USER_LOGIN_FAILED',
  'PASSWORD_CHANGED', 'EMAIL_VERIFIED', 'ACCOUNT_LOCKED',
  'TWO_FACTOR_ENABLED', 'TWO_FACTOR_DISABLED', 'USER_UPDATED',
  'USER_DELETED', 'PROGRESS_RECORDED', 'SUSPICIOUS_ACTIVITY',
  'SECURITY_ALERT', 'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_UPDATED',
  'SUBSCRIPTION_CANCELLED'
);
CREATE TYPE log_severity AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL');
CREATE TYPE subscription_plan AS ENUM ('FREE', 'PREMIUM', 'PRO', 'TEACHER');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'INCOMPLETE', 'TRIAL');

-- Users table - Core authentication and user data
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified TIMESTAMPTZ,
    password VARCHAR(255),
    name VARCHAR(100),
    image VARCHAR(500),
    role user_role DEFAULT 'FREE' NOT NULL,
    
    -- Security fields
    login_attempts INTEGER DEFAULT 0 NOT NULL,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    password_changed_at TIMESTAMPTZ,
    
    -- Two-factor authentication
    two_factor_enabled BOOLEAN DEFAULT false NOT NULL,
    two_factor_secret VARCHAR(255),
    backup_codes TEXT[],
    
    -- Privacy & GDPR compliance
    terms_accepted_at TIMESTAMPTZ,
    privacy_accepted_at TIMESTAMPTZ,
    marketing_opt_in BOOLEAN DEFAULT false NOT NULL,
    data_processing_consent BOOLEAN DEFAULT false NOT NULL,
    
    -- Account lifecycle
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- OAuth accounts table
CREATE TABLE accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    
    -- OAuth tokens
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type VARCHAR(50),
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    
    -- Security tracking
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_used_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(provider, provider_account_id)
);

-- Sessions table for authentication
CREATE TABLE sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL,
    
    -- Security tracking
    ip_address INET,
    user_agent VARCHAR(500),
    device_info JSONB,
    
    -- Session metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_activity TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Verification tokens for email/password reset
CREATE TABLE verification_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    type token_type DEFAULT 'EMAIL_VERIFICATION' NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    attempts INTEGER DEFAULT 0 NOT NULL,
    
    -- Security tracking
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    used_at TIMESTAMPTZ,
    ip_address INET,
    
    UNIQUE(identifier, token)
);

-- Audit logs for security and compliance
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    
    -- What happened
    action audit_action NOT NULL,
    entity VARCHAR(100),
    entity_id TEXT,
    
    -- Context and metadata
    metadata JSONB,
    
    -- Security context
    ip_address INET,
    user_agent VARCHAR(500),
    
    -- Compliance
    severity log_severity DEFAULT 'INFO' NOT NULL,
    category VARCHAR(50) NOT NULL,
    
    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Practice progress tracking
CREATE TABLE practice_progress (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Progress tracking
    module_type VARCHAR(50) NOT NULL,
    level_id VARCHAR(100) NOT NULL,
    
    -- Performance metrics
    score INTEGER NOT NULL,
    time_spent INTEGER NOT NULL,
    attempts INTEGER DEFAULT 1 NOT NULL,
    
    -- Detailed stats
    correct_answers INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    average_time FLOAT NOT NULL,
    
    -- Metadata
    difficulty VARCHAR(20) NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    
    UNIQUE(user_id, module_type, level_id, completed_at)
);

-- Subscriptions for paywall
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Subscription details
    plan subscription_plan NOT NULL,
    status subscription_status NOT NULL,
    
    -- Billing
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    
    -- Subscription lifecycle
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance and security
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_login_at ON users(last_login_at);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_users_locked_until ON users(locked_until);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_provider ON accounts(provider);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires);
CREATE INDEX idx_sessions_session_token ON sessions(session_token);
CREATE INDEX idx_sessions_last_activity ON sessions(last_activity);

CREATE INDEX idx_verification_tokens_expires ON verification_tokens(expires);
CREATE INDEX idx_verification_tokens_type ON verification_tokens(type);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);

CREATE INDEX idx_practice_progress_user_id ON practice_progress(user_id);
CREATE INDEX idx_practice_progress_module_type ON practice_progress(module_type);
CREATE INDEX idx_practice_progress_completed_at ON practice_progress(completed_at);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Apply update trigger to subscriptions table
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Database schema created successfully!' as result;