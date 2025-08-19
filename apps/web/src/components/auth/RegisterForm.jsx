/**
 * Secure Registration Form Component
 * 
 * SECURITY FEATURES:
 * - Comprehensive client-side validation with server-side backup
 * - Real-time password strength indicator
 * - Input sanitization using DOMPurify
 * - CSRF protection via fetch credentials
 * - Secure password handling (no logging, immediate clearing)
 * - Rate limiting awareness
 * - XSS prevention through proper input handling
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import DOMPurify from 'isomorphic-dompurify';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  /**
   * Real-time password strength assessment
   */
  useEffect(() => {
    if (formData.password) {
      const strength = assessPasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [formData.password]);

  /**
   * Password strength calculator (client-side validation)
   */
  const assessPasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    // Length check
    if (password.length >= 12) {
      score += 25;
    } else if (password.length >= 8) {
      score += 15;
      feedback.push('Consider using 12+ characters for better security');
    } else {
      feedback.push('Password must be at least 8 characters');
    }

    // Character variety checks
    if (/[a-z]/.test(password)) score += 15;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push('Add uppercase letters');

    if (/[0-9]/.test(password)) score += 15;
    else feedback.push('Add numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 20;
    else feedback.push('Add special characters (!@#$%^&*)');

    // Common patterns check
    if (!/(.)\1{2,}/.test(password)) score += 10;
    else feedback.push('Avoid repeating characters');

    return { score: Math.min(score, 100), feedback };
  };

  /**
   * Comprehensive form validation with sanitization
   */
  const validateForm = () => {
    const newErrors = {};

    // Name validation with sanitization
    const sanitizedName = DOMPurify.sanitize(formData.name.trim());
    if (!sanitizedName) {
      newErrors.name = 'Name is required';
    } else if (sanitizedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (sanitizedName.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    // Email validation with sanitization
    const sanitizedEmail = DOMPurify.sanitize(formData.email.trim());
    if (!sanitizedEmail) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (no sanitization for passwords)
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (passwordStrength.score < 60) {
      newErrors.password = 'Password is too weak. Please follow the security guidelines.';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms acceptance validation
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Secure form submission with comprehensive error handling
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare sanitized request data
      const requestData = {
        name: DOMPurify.sanitize(formData.name.trim()),
        email: DOMPurify.sanitize(formData.email.trim().toLowerCase()),
        password: formData.password, // Never sanitize passwords
        acceptTerms: formData.acceptTerms
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // CSRF protection
        },
        credentials: 'same-origin', // CSRF protection
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error types securely
        if (response.status === 429) {
          setErrors({ general: 'Too many registration attempts. Please try again later.' });
        } else if (response.status === 409) {
          setErrors({ email: 'An account with this email already exists' });
        } else if (response.status === 400 && data.details) {
          // Handle validation errors from server
          const serverErrors = {};
          data.details.forEach(error => {
            if (error.field) {
              serverErrors[error.field] = error.message;
            }
          });
          setErrors(serverErrors);
        } else if (response.status >= 500) {
          setErrors({ general: 'Server error. Please try again later.' });
        } else {
          setErrors({ general: data.error || 'Registration failed' });
        }
        return;
      }

      // Clear passwords from memory immediately after successful registration
      setFormData(prev => ({ 
        ...prev, 
        password: '', 
        confirmPassword: '' 
      }));
      
      // Redirect to login with success message
      navigate('/auth/login?message=Registration successful! Please sign in.');

    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ 
        general: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Secure input change handler
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /**
   * Get password strength color
   */
  const getPasswordStrengthColor = () => {
    if (passwordStrength.score >= 80) return 'text-green-400';
    if (passwordStrength.score >= 60) return 'text-yellow-400';
    if (passwordStrength.score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  /**
   * Get password strength label
   */
  const getPasswordStrengthLabel = () => {
    if (passwordStrength.score >= 80) return 'Strong';
    if (passwordStrength.score >= 60) return 'Good';
    if (passwordStrength.score >= 40) return 'Fair';
    return 'Weak';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/70">Join our music training platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error Display */}
            {errors.general && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-white/90 text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/10 border ${
                  errors.name ? 'border-red-500/50' : 'border-white/20'
                } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
                placeholder="Your full name"
                required
                autoComplete="name"
                disabled={isLoading}
                maxLength={50}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white/90 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/10 border ${
                  errors.email ? 'border-red-500/50' : 'border-white/20'
                } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
                placeholder="your@email.com"
                required
                autoComplete="email"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-white/90 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 bg-white/10 border ${
                    errors.password ? 'border-red-500/50' : 'border-white/20'
                  } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
                  placeholder="Create a strong password"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 80 ? 'bg-green-500' :
                          passwordStrength.score >= 60 ? 'bg-yellow-500' :
                          passwordStrength.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${getPasswordStrengthColor()}`}>
                      {getPasswordStrengthLabel()}
                    </span>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="text-white/60 text-xs space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-white/90 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/10 border ${
                  errors.confirmPassword ? 'border-red-500/50' : 'border-white/20'
                } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                disabled={isLoading}
              />
              <label htmlFor="acceptTerms" className="text-white/90 text-sm">
                I accept the{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-red-400 text-sm -mt-4">{errors.acceptTerms}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || passwordStrength.score < 60 || !formData.acceptTerms}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <div className="text-white/60 text-sm">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 text-center">
          <p className="text-white/40 text-xs">
            🔒 Your information is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
}