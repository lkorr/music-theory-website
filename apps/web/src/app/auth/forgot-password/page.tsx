"use client";

import { useState } from 'react';
import { Link } from 'react-router';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Password reset instructions sent to your email.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Reset Your Password
            </h1>
            <p className="text-white/70">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {status === 'success' ? (
            // Success State
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Check Your Email
              </h2>
              <p className="text-white/80 mb-8">
                {DOMPurify.sanitize(message)}
              </p>
              <div className="space-y-4">
                <Link
                  to="/auth/login"
                  className="w-full inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
                >
                  Back to Sign In
                </Link>
                <button
                  onClick={() => {
                    setStatus('idle');
                    setEmail('');
                    setMessage('');
                  }}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Send Another Email
                </button>
              </div>
            </div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {/* Error Message */}
              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{DOMPurify.sanitize(message)}</span>
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Reset Instructions
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <Link
                to="/auth/login"
                className="text-white/60 hover:text-white transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Sign In
              </Link>
              <Link
                to="/auth/register"
                className="text-white/60 hover:text-white transition-colors"
              >
                Create New Account
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