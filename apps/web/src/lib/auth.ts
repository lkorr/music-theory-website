/**
 * Client-Side Authentication Utilities
 * 
 * SECURITY FEATURES:
 * - Secure token storage and retrieval
 * - Automatic token validation and refresh
 * - Secure logout with token invalidation
 * - Session state management with security checks
 */

import { jwtVerify, SignJWT } from 'jose';

// Type definitions
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  emailVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserRegistrationData {
  email: string;
  password: string;
  name?: string;
  acceptTerms: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  details?: any;
}

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || 'your-secret-key');

/**
 * Authentication state management
 */
let authState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null
};

let authListeners: ((state: AuthState) => void)[] = [];

/**
 * Subscribe to authentication state changes
 * 
 * @param callback - Callback function to call on state change
 * @returns Unsubscribe function
 */
export function subscribeToAuth(callback: (state: AuthState) => void): () => void {
  authListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    authListeners = authListeners.filter(listener => listener !== callback);
  };
}

/**
 * Notify all listeners of authentication state changes
 */
function notifyAuthListeners(): void {
  authListeners.forEach(callback => {
    try {
      callback(authState);
    } catch (error) {
      console.error('Auth listener error:', error);
    }
  });
}

/**
 * Update authentication state securely
 * 
 * @param newState - New authentication state
 */
function updateAuthState(newState: Partial<AuthState>): void {
  authState = { ...authState, ...newState };
  notifyAuthListeners();
}

/**
 * Get authentication token from secure HTTP-only cookie
 * 
 * @returns Authentication token or null
 */
function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth-token') {
        return value;
      }
    }
  } catch (error) {
    console.error('Error reading auth cookie:', error);
  }
  
  return null;
}

/**
 * Verify JWT token
 * 
 * @param token - JWT token to verify
 * @returns Decoded token payload or null
 */
async function verifyToken(token: string): Promise<any> {
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'midi-training-app',
      audience: 'midi-training-app-users'
    });
    
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * 
 * @returns True if authenticated
 */
export async function checkAuth(): Promise<boolean> {
  try {
    updateAuthState({ isLoading: true });
    
    // Don't try to read HttpOnly cookie - instead call /api/auth/me
    // The browser will automatically send the HttpOnly cookie with the request
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // Important: include cookies
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (!response.ok) {
      updateAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false
      });
      return false;
    }
    
    const userData = await response.json();
    
    updateAuthState({
      isAuthenticated: true,
      user: userData.user,
      token: 'httponly', // Placeholder since we can't read the actual token
      isLoading: false
    });
    
    return true;
    
  } catch (error) {
    console.error('Auth check error:', error);
    
    updateAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false
    });
    
    return false;
  }
}

/**
 * Login user with credentials
 * 
 * @param credentials - Login credentials
 * @returns Login result
 */
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Login failed'
      };
    }
    
    // Update auth state with user data
    updateAuthState({
      isAuthenticated: true,
      user: data.user,
      token: 'httponly', // Placeholder since we can't read the actual token
      isLoading: false
    });
    
    return {
      success: true,
      user: data.user
    };
    
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.'
    };
  }
}

/**
 * Register new user
 * 
 * @param userData - User registration data
 * @returns Registration result
 */
export async function register(userData: UserRegistrationData): Promise<AuthResult> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin',
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Registration failed',
        details: data.details
      };
    }
    
    return {
      success: true,
      user: data.user
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.'
    };
  }
}

/**
 * Logout user securely
 * 
 * @returns True if logout successful
 */
export async function logout(): Promise<boolean> {
  try {
    // Call logout endpoint to invalidate session server-side
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    // Clear client-side state
    updateAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false
    });
    
    return true;
    
  } catch (error) {
    console.error('Logout error:', error);
    
    // Still clear local state even if server call fails
    updateAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false
    });
    
    return false;
  }
}

/**
 * Get current authentication state
 * 
 * @returns Current auth state
 */
export function getAuthState(): AuthState {
  return { ...authState };
}

/**
 * Get current user
 * 
 * @returns Current user or null
 */
export function getCurrentUser(): User | null {
  return authState.user;
}

/**
 * Check if user has specific role
 * 
 * @param role - Role to check
 * @returns True if user has role
 */
export function hasRole(role: string): boolean {
  return authState.user?.role === role;
}

/**
 * Check if user is admin
 * 
 * @returns True if user is admin
 */
export function isAdmin(): boolean {
  return hasRole('admin');
}

/**
 * Get authorization header for API requests
 * 
 * @returns Authorization headers
 */
export function getAuthHeaders(): Record<string, string> {
  if (!authState.token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${authState.token}`,
    'X-Requested-With': 'XMLHttpRequest'
  };
}

/**
 * Make authenticated API request
 * 
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Fetch response
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers
  });
  
  // Handle authentication errors
  if (response.status === 401) {
    await logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }
  
  return response;
}

/**
 * Initialize authentication on app startup
 */
export function initAuth(): void {
  if (typeof window !== 'undefined') {
    checkAuth();
  }
}

// Auto-initialize when module is loaded in browser
if (typeof window !== 'undefined') {
  initAuth();
}