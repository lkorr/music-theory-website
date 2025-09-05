"use client";

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CheckCircle, XCircle, Mail, AlertCircle, Clock } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_verified'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const error = searchParams.get('error');
  const success = searchParams.get('success');

  useEffect(() => {
    // Handle URL parameters from redirect
    if (success === 'verified') {
      setStatus('success');
      setMessage('Your email has been verified successfully! Welcome to Pailiaq Music Training.');
      return;
    }

    if (success === 'already_verified') {
      setStatus('already_verified');
      setMessage('Your email is already verified. You can sign in to your account.');
      return;
    }

    if (error) {
      setStatus('error');
      switch (error) {
        case 'missing_params':
          setMessage('Invalid verification link. Please check your email for the correct link.');
          break;
        case 'invalid_token':
          setMessage('This verification link has expired or is invalid. Please request a new verification email.');
          break;
        case 'user_not_found':
          setMessage('No account found with this email address. Please register for a new account.');
          break;
        case 'server_error':
          setMessage('A server error occurred. Please try again later or contact support.');
          break;
        default:
          setMessage('An unknown error occurred. Please try again or contact support.');
      }
      return;
    }

    // If we have token and email from the URL, verify automatically
    if (token && email) {
      verifyEmail(token, email);
    } else {
      setStatus('error');
      setMessage('Missing verification parameters. Please check your email for the correct verification link.');
    }
  }, [token, email, error, success]);

  const verifyEmail = async (verificationToken: string, emailAddress: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: verificationToken,
          email: emailAddress
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.alreadyVerified) {
          setStatus('already_verified');
          setMessage('Your email is already verified. You can sign in to your account.');
        } else {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const resendVerification = async () => {
    if (!email || isResending) return;

    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Verification email sent! Please check your inbox and spam folder.');
      } else {
        setMessage(data.error || 'Failed to send verification email. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Clock className="w-16 h-16 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-400" />;
      case 'already_verified':
        return <CheckCircle className="w-16 h-16 text-green-400" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-400" />;
      default:
        return <AlertCircle className="w-16 h-16 text-yellow-400" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying Your Email...';
      case 'success':
        return 'Email Verified! 🎉';
      case 'already_verified':
        return 'Already Verified ✅';
      case 'error':
        return 'Verification Failed';
      default:
        return 'Email Verification';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
      case 'already_verified':
        return 'from-green-600/20 to-blue-600/20 border-green-500/30';
      case 'error':
        return 'from-red-600/20 to-orange-600/20 border-red-500/30';
      default:
        return 'from-blue-600/20 to-purple-600/20 border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-4">
            {getStatusTitle()}
          </h1>

          {/* Message */}
          <p className="text-white/80 mb-8 leading-relaxed">
            {DOMPurify.sanitize(message)}
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            {status === 'success' && (
              <>
                <Link
                  to="/auth/login"
                  className="w-full inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Sign In to Your Account
                </Link>
                <Link
                  to="/dashboard"
                  className="w-full inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Go to Dashboard
                </Link>
              </>
            )}

            {status === 'already_verified' && (
              <Link
                to="/auth/login"
                className="w-full inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Sign In to Your Account
              </Link>
            )}

            {status === 'error' && email && (
              <button
                onClick={resendVerification}
                disabled={isResending}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Resend Verification Email
                  </>
                )}
              </button>
            )}

            {status === 'error' && (
              <Link
                to="/contact"
                className="w-full inline-block bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Contact Support
              </Link>
            )}
          </div>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <Link
                to="/"
                className="text-white/60 hover:text-white transition-colors"
              >
                Back to Home
              </Link>
              <Link
                to="/auth/register"
                className="text-white/60 hover:text-white transition-colors"
              >
                Create New Account
              </Link>
              <Link
                to="/auth/login"
                className="text-white/60 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {status === 'success' && (
          <div className={`mt-6 bg-gradient-to-r ${getStatusColor()} rounded-xl p-4 text-center`}>
            <p className="text-white/90 text-sm">
              🎵 Ready to start your musical journey? Access all training modules and track your progress!
            </p>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-4 text-center">
          <p className="text-white/40 text-xs">
            🔒 Secure email verification powered by Pailiaq
          </p>
        </div>
      </div>
    </div>
  );
}