/**
 * Protected Route Component
 * 
 * SECURITY FEATURES:
 * - Real-time authentication verification
 * - Automatic redirect to login on unauthorized access
 * - Loading states to prevent content flash
 * - Role-based access control
 * - Secure session validation
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { checkAuth, subscribeToAuth, getAuthState } from '../../lib/auth.js';

/**
 * Protected Route Wrapper Component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @param {string} props.redirectTo - Custom redirect path for unauthorized users
 * @param {React.ReactNode} props.fallback - Custom loading component
 * @returns {React.ReactNode} - Protected content or redirect
 */
export default function ProtectedRoute({ 
  children, 
  allowedRoles = null, 
  redirectTo = '/auth/login',
  fallback = null 
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [authState, setAuthState] = useState(getAuthState());

  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = subscribeToAuth(setAuthState);

    // Initial auth check if not already loaded
    if (authState.isLoading) {
      checkAuth();
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Handle authentication state changes
    if (!authState.isLoading) {
      if (!authState.isAuthenticated) {
        // User is not authenticated, redirect to login
        const currentPath = location.pathname + location.search;
        const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
        navigate(loginUrl, { replace: true });
        return;
      }

      // Check role-based access if roles are specified
      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = authState.user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
          // User doesn't have required role, redirect to unauthorized page
          navigate('/unauthorized', { replace: true });
          return;
        }
      }
    }
  }, [authState, navigate, location, redirectTo, allowedRoles]);

  // Show loading state while checking authentication
  if (authState.isLoading) {
    return fallback || <AuthLoadingFallback />;
  }

  // Show loading state while redirecting
  if (!authState.isAuthenticated) {
    return fallback || <AuthLoadingFallback />;
  }

  // Check role access again (defensive programming)
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = authState.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <UnauthorizedFallback />;
    }
  }

  // User is authenticated and authorized, render protected content
  return children;
}

/**
 * Default loading fallback component
 */
function AuthLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
        <p className="text-white/70">Verifying authentication...</p>
      </div>
    </div>
  );
}

/**
 * Default unauthorized fallback component
 */
function UnauthorizedFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-white/70 mb-6">
          You don't have permission to access this page.
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

/**
 * Higher-order component for protecting routes
 * 
 * @param {React.Component} Component - Component to protect
 * @param {Object} options - Protection options
 * @returns {React.Component} - Protected component
 */
export function withAuth(Component, options = {}) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Hook for accessing authentication state in protected components
 * 
 * @returns {Object} - Authentication state and utilities
 */
export function useAuth() {
  const [authState, setAuthState] = useState(getAuthState());

  useEffect(() => {
    const unsubscribe = subscribeToAuth(setAuthState);
    return unsubscribe;
  }, []);

  return authState;
}

/**
 * Hook for role-based conditional rendering
 * 
 * @param {string|string[]} roles - Required role(s)
 * @returns {boolean} - True if user has required role(s)
 */
export function useHasRole(roles) {
  const authState = useAuth();
  
  if (!authState.isAuthenticated || !authState.user) {
    return false;
  }

  const userRole = authState.user.role;
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return roleArray.includes(userRole);
}

/**
 * Admin-only route protection
 */
export function AdminRoute({ children, ...props }) {
  return (
    <ProtectedRoute allowedRoles={['admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * User route protection (any authenticated user)
 */
export function UserRoute({ children, ...props }) {
  return (
    <ProtectedRoute allowedRoles={['user', 'admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
}