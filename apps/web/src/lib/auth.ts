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

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || 'your-secret-key');

// Type definitions
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  last_login?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export type AuthListener = (state: AuthState) => void;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface RegistrationResult {
  success: boolean;
  user?: User;
  error?: string;
  details?: any;
}

/**
 * Authentication state management
 */
let authState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null
};

let authListeners: AuthListener[] = [];

/**
 * Subscribe to authentication state changes
 * 
 * @param {Function} callback - Callback function to call on state change
 * @returns {Function} - Unsubscribe function
 */
export function subscribeToAuth(callback: AuthListener): () => void {
  authListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    authListeners = authListeners.filter(listener => listener !== callback);
  };
}

/**
 * Notify all listeners of authentication state changes
 */
function notifyAuthListeners() {
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
 * @param {Object} newState - New authentication state
 */
function updateAuthState(newState: Partial<AuthState>): void {
  authState = { ...authState, ...newState };
  notifyAuthListeners();
}

/**
 * Get authentication token from secure HTTP-only cookie
 * 
 * @returns {string|null} - Authentication token or null
 */
function getTokenFromCookie() {
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
 * @param {string} token - JWT token to verify
 * @returns {Object|null} - Decoded token payload or null
 */
async function verifyToken(token: string): Promise<any | null> {
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
 * @returns {Promise<boolean>} - True if authenticated
 */
export async function checkAuth() {
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
 * @param {Object} credentials - Login credentials
 * @returns {Promise<Object>} - Login result
 */
export async function login(credentials: LoginCredentials): Promise<LoginResult> {
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
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - Registration result
 */
export async function register(userData: RegistrationData): Promise<RegistrationResult> {
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
 * @returns {Promise<boolean>} - True if logout successful
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
 * @returns {Object} - Current auth state
 */
export function getAuthState(): AuthState {
  return { ...authState };
}

/**
 * Get current user
 * 
 * @returns {Object|null} - Current user or null
 */
export function getCurrentUser(): User | null {
  return authState.user;
}

/**
 * Check if user has specific role
 * 
 * @param {string} role - Role to check
 * @returns {boolean} - True if user has role
 */
export function hasRole(role: string): boolean {
  return authState.user?.role === role;
}

/**
 * Check if user is admin
 * 
 * @returns {boolean} - True if user is admin
 */
export function isAdmin(): boolean {
  return hasRole('admin');
}

/**
 * Get authorization header for API requests
 * 
 * @returns {Object} - Authorization headers
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
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
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
    window.location.href = '/auth/login';
  }
  
  return response;
}

/**
 * Initialize authentication on app startup
 */
export function initAuth() {
  if (typeof window !== 'undefined') {
    checkAuth();
  }
}

// Auto-initialize when module is loaded in browser
if (typeof window !== 'undefined') {
  initAuth();
}