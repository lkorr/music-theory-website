/**
 * Input Validation and Sanitization
 * 
 * SECURITY: This file provides secure input validation following OWASP guidelines
 * to prevent injection attacks and ensure data integrity.
 */

import DOMPurify from 'isomorphic-dompurify';

// Type definitions
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: string | null;
}

export interface RegistrationValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: RegistrationData | null;
}

export interface LoginValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: LoginData | null;
}

export interface RegistrationData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserRegistrationInput {
  email?: string;
  password?: string;
  name?: string;
  acceptTerms?: boolean;
}

export interface LoginInput {
  email?: string;
  password?: string;
}

/**
 * Email validation with security considerations
 * 
 * @param email - Email to validate
 * @returns Validation result
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      errors: ['Email is required'],
      sanitized: null
    };
  }

  // Sanitize and normalize
  const sanitized = email.toLowerCase().trim();

  // Length validation
  if (sanitized.length > 254) {
    errors.push('Email address is too long (maximum 254 characters)');
  }

  // Format validation (RFC 5322 compliant regex)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(sanitized)) {
    errors.push('Please enter a valid email address');
  }

  // Security checks
  if (sanitized.includes('..')) {
    errors.push('Email address contains invalid consecutive dots');
  }

  if (sanitized.startsWith('.') || sanitized.endsWith('.')) {
    errors.push('Email address cannot start or end with a dot');
  }

  // Domain validation
  const domain = sanitized.split('@')[1];
  if (domain) {
    if (domain.length > 253) {
      errors.push('Email domain is too long');
    }
    
    if (domain.includes('..')) {
      errors.push('Email domain contains invalid consecutive dots');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : null
  };
}

/**
 * Name validation and sanitization
 * 
 * @param name - Name to validate
 * @returns Validation result
 */
export function validateName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      errors: ['Name is required'],
      sanitized: null
    };
  }

  // Sanitize HTML and normalize whitespace
  let sanitized = DOMPurify.sanitize(name.trim(), { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });

  // Remove extra whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Length validation
  if (sanitized.length < 1) {
    errors.push('Name cannot be empty');
  }

  if (sanitized.length > 100) {
    errors.push('Name is too long (maximum 100 characters)');
  }

  // Character validation (allow letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
  if (!nameRegex.test(sanitized)) {
    errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
  }

  // Security checks
  if (/^\s*$/.test(sanitized)) {
    errors.push('Name cannot be empty or contain only whitespace');
  }

  // Prevent potential injection attempts
  const suspiciousPatterns = [
    '<script', 'javascript:', 'data:', 'vbscript:', 'onload=', 'onerror='
  ];

  for (const pattern of suspiciousPatterns) {
    if (sanitized.toLowerCase().includes(pattern)) {
      errors.push('Name contains invalid characters');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : null
  };
}

/**
 * General text input sanitization
 * 
 * @param input - Text input to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized text
 */
export function sanitizeTextInput(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags and normalize whitespace
  let sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate and sanitize user registration data
 * 
 * @param userData - User registration data
 * @returns Validation result with sanitized data
 */
export function validateRegistrationData(userData: UserRegistrationInput): RegistrationValidationResult {
  const { email, password, name, acceptTerms } = userData || {};
  const errors: string[] = [];
  const sanitizedData: Partial<RegistrationData> = {};

  // Validate email
  const emailValidation = validateEmail(email || '');
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  } else if (emailValidation.sanitized) {
    sanitizedData.email = emailValidation.sanitized;
  }

  // Validate password (using password validation from password.js)
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  } else if (password.length > 128) {
    errors.push('Password is too long (maximum 128 characters)');
  } else {
    sanitizedData.password = password; // Don't sanitize passwords
  }

  // Validate name (optional)
  if (name) {
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    } else if (nameValidation.sanitized) {
      sanitizedData.name = nameValidation.sanitized;
    }
  }

  // Validate terms acceptance
  if (!acceptTerms) {
    errors.push('You must accept the terms and conditions');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData as RegistrationData : null
  };
}

/**
 * Validate and sanitize login data
 * 
 * @param loginData - Login credentials
 * @returns Validation result
 */
export function validateLoginData(loginData: LoginInput): LoginValidationResult {
  const { email, password } = loginData || {};
  const errors: string[] = [];
  const sanitizedData: Partial<LoginData> = {};

  // Validate email
  const emailValidation = validateEmail(email || '');
  if (!emailValidation.isValid) {
    errors.push('Please enter a valid email address');
  } else if (emailValidation.sanitized) {
    sanitizedData.email = emailValidation.sanitized;
  }

  // Validate password (minimal validation for login)
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length > 128) {
    errors.push('Password is too long');
  } else {
    sanitizedData.password = password;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData as LoginData : null
  };
}

/**
 * Validate IP address format
 * 
 * @param ip - IP address to validate
 * @returns True if valid IP address
 */
export function validateIPAddress(ip: string): boolean {
  if (!ip || typeof ip !== 'string') {
    return false;
  }

  // IPv4 regex
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Sanitize User-Agent string for storage
 * 
 * @param userAgent - User-Agent string
 * @returns Sanitized User-Agent
 */
export function sanitizeUserAgent(userAgent: string): string {
  if (!userAgent || typeof userAgent !== 'string') {
    return 'Unknown';
  }

  // Truncate very long user agents
  let sanitized = userAgent.substring(0, 500);

  // Remove potential XSS vectors
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  return sanitized || 'Unknown';
}

/**
 * Rate limiting key generation
 * 
 * @param ip - Client IP address
 * @param identifier - Additional identifier (email, user ID, etc.)
 * @returns Rate limiting key
 */
export function generateRateLimitKey(ip: string, identifier: string = ''): string {
  const sanitizedIp = validateIPAddress(ip) ? ip : 'unknown';
  const sanitizedIdentifier = sanitizeTextInput(identifier, 50);
  
  return `${sanitizedIp}:${sanitizedIdentifier}`;
}