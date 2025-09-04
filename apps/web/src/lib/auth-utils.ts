/**
 * Authentication Utilities for Middleware and Server-Side Operations
 * 
 * Provides utilities for validating JWT tokens and extracting user information
 * from requests in middleware and server-side contexts.
 */

import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { getUserByEmail } from './supabase.js';

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required for JWT signing');
}

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Extract authentication token from HTTP cookies
 */
export function getTokenFromCookie(request: NextRequest | Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth-token') {
      return value;
    }
  }
  return null;
}

/**
 * Verify JWT token and return user information
 */
export async function verifyAuthToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'midi-training-app',
      audience: 'midi-training-app-users'
    });

    if (!payload.email || !payload.userId) {
      return null;
    }

    return {
      id: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string || '',
      role: payload.role as string || 'USER'
    };
  } catch (error) {
    // Token verification failed
    return null;
  }
}

/**
 * Get authenticated user from request cookies
 * Used in middleware and server-side operations
 */
export async function getAuthFromCookie(request: NextRequest | Request): Promise<AuthUser | null> {
  const token = getTokenFromCookie(request);
  if (!token) {
    return null;
  }

  return await verifyAuthToken(token);
}

/**
 * Get authenticated user with fresh database data
 * Used when you need the most up-to-date user information
 */
export async function getAuthFromCookieWithFreshData(request: NextRequest | Request): Promise<AuthUser | null> {
  const token = getTokenFromCookie(request);
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'midi-training-app',
      audience: 'midi-training-app-users'
    });

    if (!payload.email) {
      return null;
    }

    // Get fresh user data from database
    const user = await getUserByEmail(payload.email as string);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role || 'USER'
    };
  } catch (error) {
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser | null, requiredRole: string): boolean {
  if (!user) return false;
  
  const roleHierarchy = ['USER', 'PREMIUM', 'ADMIN'];
  const userRoleIndex = roleHierarchy.indexOf(user.role);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  
  return userRoleIndex >= requiredRoleIndex;
}

/**
 * Extract client IP address from request headers
 */
export function getClientIP(request: NextRequest | Request): string {
  const headers = [
    'x-forwarded-for',
    'x-real-ip', 
    'cf-connecting-ip',
    'x-client-ip'
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // Handle comma-separated IPs (x-forwarded-for can have multiple IPs)
      return value.split(',')[0].trim();
    }
  }

  return 'unknown';
}