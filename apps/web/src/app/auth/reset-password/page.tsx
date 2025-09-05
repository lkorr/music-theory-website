"use client";

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, Key } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<'loading' | 'idle' | 'success' | 'error' | 'invalid_token'>('loading');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const error = searchParams.get('error');

  useEffect(() => {
    // Handle URL parameters from email link
    if (error) {
      setStatus('error');
      switch (error) {
        case 'missing_params':
          setMessage('Invalid password reset link. Please request a new password reset.');
          break;
        case 'invalid_token':
          setStatus('invalid_token');
          setMessage('This password reset link has expired or is invalid. Please request a new password reset.');
          break;
        case 'server_error':
          setMessage('A server error occurred. Please try again later.');
          break;
        default:
          setMessage('An error occurred. Please try again or request a new password reset.');
      }
      return;
    }

    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid password reset link. Please request a new password reset.');
      return;
    }

    setStatus('idle');
  }, [token, email, error]);

  const validatePassword = (pwd: string) => {
    const validationErrors: string[] = [];
    
    if (pwd.length < 12) {
      validationErrors.push('Password must be at least 12 characters long');
    }
    
    if (!/[a-z]/.test(pwd)) {
      validationErrors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(pwd)) {
      validationErrors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(pwd)) {
      validationErrors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      validationErrors.push('Password must contain at least one special character');
    }

    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid reset link. Please request a new password reset.');
      return;
    }

    // Validate passwords
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setStatus('error');
      setErrors(passwordErrors);
      setMessage('Please fix the password requirements below:');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setErrors([]);
      setMessage('Passwords do not match');
      return;
    }

    setStatus('loading');
    setErrors([]);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password
        })
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Password has been reset successfully!');
      } else {
        if (response.status === 400 && data.error.includes('token')) {
          setStatus('invalid_token');
          setMessage('This password reset link has expired or is invalid. Please request a new password reset.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Password reset failed. Please try again.');
          if (data.details) {
            setErrors(Array.isArray(data.details) ? data.details : [data.details]);
          }
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-400" />;
      case 'error':
      case 'invalid_token':
        return <XCircle className="w-16 h-16 text-red-400" />;
      default:
        return <Key className="w-16 h-16 text-blue-400" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Resetting Password...';
      case 'success':
        return 'Password Reset Successfully! 🎉';
      case 'invalid_token':
        return 'Link Expired';
      case 'error':
        return 'Reset Failed';
      default:
        return 'Set New Password';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-4 text-center">
            {getStatusTitle()}
          </h1>

          {status === 'success' ? (
            // Success State
            <div className="text-center">
              <p className="text-white/80 mb-8 leading-relaxed">
                {DOMPurify.sanitize(message)}
              </p>
              <div className="space-y-4">
                <Link
                  to="/auth/login"
                  className="w-full inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Sign In with New Password
                </Link>
                <Link
                  to="/dashboard"
                  className="w-full inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : status === 'invalid_token' ? (
            // Invalid Token State
            <div className="text-center">
              <p className="text-white/80 mb-8 leading-relaxed">
                {DOMPurify.sanitize(message)}
              </p>
              <div className="space-y-4">
                <Link
                  to="/auth/forgot-password"
                  className="w-full inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Request New Password Reset
                </Link>
                <Link
                  to="/auth/login"
                  className="w-full inline-block bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            // Form State
            <>
              <p className="text-white/70 text-center mb-8">
                Enter your new password below. Make sure it's strong and secure.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-2">Password Requirements:</h3>
                  <ul className="text-xs text-white/70 space-y-1">
                    <li>• At least 12 characters long</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains at least one number</li>
                    <li>• Contains at least one special character</li>
                  </ul>
                </div>

                {/* Error Messages */}
                {status === 'error' && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-400 text-sm mb-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">{DOMPurify.sanitize(message)}</span>
                    </div>
                    {errors.length > 0 && (
                      <ul className="text-red-400 text-xs space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <Link
                to="/auth/login"
                className="text-white/60 hover:text-white transition-colors"
              >
                Back to Sign In
              </Link>
              <Link
                to="/auth/forgot-password"
                className="text-white/60 hover:text-white transition-colors"
              >
                Request New Reset
              </Link>
              <Link
                to="/"
                className="text-white/60 hover:text-white transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 text-center">
          <p className="text-white/40 text-xs">
            🔒 Secure password reset powered by Pailiaq
          </p>
        </div>
      </div>
    </div>
  );
}