/**
 * Supabase Client Configuration
 * 
 * SECURITY: This file provides secure server-side database access
 * with proper service role permissions for authentication operations.
 */

import { createClient } from '@supabase/supabase-js';
import { isMockAuthSafelyEnabled } from './environment-validation.js';

// Check if mock auth is safely enabled (development only with safeguards)
const useMockAuth = isMockAuthSafelyEnabled();

// Validate required environment variables (skip in mock mode)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!useMockAuth && (!supabaseUrl || !supabaseServiceKey)) {
  throw new Error(
    'Missing required Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
  );
}

// Create admin client for server-side operations (only if not using mock auth)
export const supabaseAdmin = useMockAuth ? null : createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

// Create client-side client (anon key) (only if not using mock auth)
export const supabase = useMockAuth ? null : createClient(
  supabaseUrl, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

/**
 * Utility functions for secure database operations
 */

// Get user by email (server-side only)
export async function getUserByEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email parameter');
  }

  // Mock mode for development
  if (useMockAuth) {
    console.log(`Mock getUserByEmail: ${email}`);
    // Return a mock user for any email in development
    return {
      id: 'mock-user-id',
      email: email.toLowerCase().trim(),
      name: 'Mock User',
      role: 'FREE',
      password: '$argon2id$v=19$m=19456,t=2,p=1$mockSaltMockSaltMockSaltMockSalt$mockHashMockHashMockHashMockHashMockHashMockHash',
      created_at: new Date().toISOString(),
      last_login_at: null,
      login_attempts: 0,
      locked_until: null,
      deleted_at: null,
      email_verified: false,
      email_verified_at: null
    };
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (error) {
    console.error('Database error in getUserByEmail:', error);
    throw new Error('Database query failed');
  }

  return data;
}

// Create new user (server-side only)
export async function createUser(userData) {
  const { email, password_hash, name } = userData;

  if (!email || !password_hash) {
    throw new Error('Email and password hash are required');
  }

  // Mock mode for development
  if (useMockAuth) {
    console.log(`Mock createUser: ${email}`);
    return {
      id: 'mock-user-id-' + Date.now(),
      email: email.toLowerCase().trim(),
      name: name?.trim() || null,
      role: 'FREE',
      created_at: new Date().toISOString()
    };
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      email: email.toLowerCase().trim(),
      password: password_hash,
      name: name?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('id, email, name, role, created_at')
    .single();

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('User with this email already exists');
    }
    console.error('Database error in createUser:', error);
    throw new Error('Failed to create user');
  }

  return data;
}

// Update user login tracking (server-side only)
export async function updateLoginTracking(userId, ipAddress, success = true) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Mock mode for development
  if (useMockAuth) {
    console.log(`Mock updateLoginTracking: ${userId}, success: ${success}`);
    return; // No-op in mock mode
  }

  const updateData = {
    updated_at: new Date().toISOString()
  };

  if (success) {
    updateData.last_login_at = new Date().toISOString();
    updateData.last_login_ip = ipAddress;
    updateData.login_attempts = 0;
    updateData.locked_until = null;
  } else {
    // Increment failed attempts
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('login_attempts')
      .eq('id', userId)
      .single();

    const attempts = (user?.login_attempts || 0) + 1;
    updateData.login_attempts = attempts;

    // Lock account after 5 failed attempts for 30 minutes
    if (attempts >= 5) {
      const lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      updateData.locked_until = lockUntil.toISOString();
    }
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update(updateData)
    .eq('id', userId);

  if (error) {
    console.error('Database error in updateLoginTracking:', error);
    throw new Error('Failed to update login tracking');
  }
}

// Create audit log entry (server-side only)
export async function createAuditLog(logData) {
  const {
    user_id,
    action,
    entity = 'User',
    entity_id,
    metadata = {},
    ip_address,
    user_agent,
    severity = 'INFO',
    category = 'auth'
  } = logData;

  if (!action) {
    throw new Error('Action is required for audit log');
  }

  // Mock mode for development
  if (useMockAuth) {
    console.log(`Mock createAuditLog: ${action} for user ${user_id}`);
    return; // No-op in mock mode
  }

  const { error } = await supabaseAdmin
    .from('audit_logs')
    .insert({
      user_id: user_id || null,
      action,
      entity,
      entity_id: entity_id || null,
      metadata,
      ip_address,
      user_agent,
      severity,
      category,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Database error in createAuditLog:', error);
    // Don't throw error for audit logs to prevent auth failure
  }
}

// Check if user account is locked
export async function isAccountLocked(userId) {
  if (!userId) {
    return false;
  }

  // Mock mode for development
  if (useMockAuth) {
    console.log(`Mock isAccountLocked: ${userId}`);
    return false; // Never locked in mock mode
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('locked_until')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Database error in isAccountLocked:', error);
    return false; // Fail open for database errors
  }

  if (!data?.locked_until) {
    return false;
  }

  const lockUntil = new Date(data.locked_until);
  const now = new Date();

  return lockUntil > now;
}

// Update user profile (server-side only)
export async function updateUser(userId, updateData) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
    throw new Error('Update data is required');
  }

  // Mock mode for development
  if (useMockAuth) {
    console.log(`Mock updateUser: ${userId}`, updateData);
    return {
      id: userId,
      email: updateData.email || 'mock@example.com',
      name: updateData.name || 'Mock User',
      role: 'FREE',
      created_at: new Date().toISOString(),
      last_login_at: null,
      updated_at: new Date().toISOString()
    };
  }

  // Add updated_at timestamp
  const dataToUpdate = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(dataToUpdate)
    .eq('id', userId)
    .select('id, email, name, role, created_at, last_login_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('Email address is already in use');
    }
    console.error('Database error in updateUser:', error);
    throw new Error('Failed to update user');
  }

  if (!data) {
    throw new Error('User not found');
  }

  return data;
}

// Update user email verification status
export async function updateUserEmailVerified(userId, verified = true) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Mock mode for development
  if (useMockAuth) {
    console.log(`Mock updateUserEmailVerified: ${userId}, verified: ${verified}`);
    return {
      id: userId,
      emailVerified: verified,
      updated_at: new Date().toISOString()
    };
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      email_verified: verified,
      email_verified_at: verified ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select('id, email_verified, email_verified_at')
    .single();

  if (error) {
    console.error('Database error in updateUserEmailVerified:', error);
    throw new Error('Failed to update email verification status');
  }

  if (!data) {
    throw new Error('User not found');
  }

  return data;
}

// Update user password
export async function updateUserPassword(userId, passwordHash) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!passwordHash) {
    throw new Error('Password hash is required');
  }

  // Mock mode for development
  if (useMockAuth) {
    console.log(`Mock updateUserPassword: ${userId}`);
    return {
      id: userId,
      updated_at: new Date().toISOString()
    };
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      password: passwordHash,
      updated_at: new Date().toISOString(),
      // Clear login attempts and lock status when password is reset
      login_attempts: 0,
      locked_until: null
    })
    .eq('id', userId)
    .select('id, updated_at')
    .single();

  if (error) {
    console.error('Database error in updateUserPassword:', error);
    throw new Error('Failed to update password');
  }

  if (!data) {
    throw new Error('User not found');
  }

  return data;
}