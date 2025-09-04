/**
 * SecureForm Component
 * 
 * A wrapper around HTML forms that automatically includes CSRF protection
 * and provides enhanced security for form submissions.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { getCSRFToken, handleCSRFError } from '../lib/csrf-client';

interface SecureFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmitSecure?: (
    event: React.FormEvent<HTMLFormElement>, 
    formData: FormData
  ) => Promise<void> | void;
  showCSRFError?: boolean;
}

/**
 * Secure form component that automatically includes CSRF tokens
 */
export default function SecureForm({
  children,
  onSubmitSecure,
  onSubmit,
  showCSRFError = false,
  ...formProps
}: SecureFormProps) {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [csrfError, setCsrfError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch CSRF token on component mount
  useEffect(() => {
    fetchCSRFToken();
  }, []);

  const fetchCSRFToken = async () => {
    try {
      const token = await getCSRFToken();
      setCsrfToken(token);
      setCsrfError('');
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      setCsrfError('Security validation failed. Please refresh the page.');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setCsrfError('');

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      // Ensure CSRF token is included
      if (csrfToken) {
        formData.set('csrf_token', csrfToken);
      }

      if (onSubmitSecure) {
        await onSubmitSecure(event, formData);
      } else if (onSubmit) {
        onSubmit(event);
      } else {
        // Default form submission with CSRF token
        form.submit();
      }
    } catch (error: any) {
      // Handle CSRF-specific errors
      const handledError = handleCSRFError(error, async () => {
        // Retry with fresh token
        await fetchCSRFToken();
        if (onSubmitSecure) {
          const form = event.currentTarget;
          const formData = new FormData(form);
          formData.set('csrf_token', csrfToken);
          await onSubmitSecure(event, formData);
        }
      });

      if (handledError) {
        await handledError;
      } else {
        // Re-throw non-CSRF errors
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form {...formProps} onSubmit={handleSubmit}>
      {/* Hidden CSRF token field */}
      <input
        type="hidden"
        name="csrf_token"
        value={csrfToken}
        onChange={() => {}} // Controlled by component
      />

      {/* CSRF error display */}
      {showCSRFError && csrfError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">Security Error</h3>
              <div className="mt-2 text-sm">
                <p>{csrfError}</p>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={fetchCSRFToken}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {children}

      {/* Loading state overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </form>
  );
}

/**
 * Hook for manually handling CSRF tokens in custom forms
 */
export function useCSRFToken() {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoading(true);
        const token = await getCSRFToken();
        setCsrfToken(token);
        setError('');
      } catch (err) {
        console.error('Failed to fetch CSRF token:', err);
        setError('Failed to load security token');
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  const refetchToken = async () => {
    try {
      const token = await getCSRFToken();
      setCsrfToken(token);
      setError('');
    } catch (err) {
      console.error('Failed to refetch CSRF token:', err);
      setError('Failed to refresh security token');
    }
  };

  return {
    csrfToken,
    loading,
    error,
    refetchToken,
  };
}

/**
 * Higher-order component that adds CSRF protection to any form component
 */
export function withCSRFProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function CSRFProtectedComponent(props: P) {
    const { csrfToken } = useCSRFToken();

    return (
      <WrappedComponent
        {...props}
        csrfToken={csrfToken}
      />
    );
  };
}