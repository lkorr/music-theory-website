/**
 * Consolidated Validation Utilities
 * 
 * This file re-exports all validation functions and provides additional
 * utilities for consistent validation across the application.
 */

// Re-export all existing validation functions
export * from './validation.js';

// Import specific functions for additional utilities
import {
  validateEmail,
  validateName,
  validateLoginData,
  validateRegistrationData,
  validateIPAddress,
  generateRateLimitKey,
  sanitizeTextInput,
  sanitizeUserAgent,
  type ValidationResult,
  type LoginValidationResult,
  type RegistrationValidationResult
} from './validation.js';

// Additional validation utilities for API routes

export interface GameSessionData {
  userId: string;
  sessionToken: string;
  moduleType: string;
  category: string;
  level: string;
  accuracy?: number;
  avgTime?: number;
  totalTime?: number;
  problemsSolved?: number;
  correctAnswers?: number;
  bestStreak?: number;
  completed?: boolean;
  passed?: boolean;
  startTime?: string;
  endTime?: string;
}

export interface SessionValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData: Partial<GameSessionData> | null;
}

/**
 * Validate game session data for progress endpoints
 */
export function validateGameSession(sessionData: any): SessionValidationResult {
  const errors: string[] = [];
  const sanitizedData: Partial<GameSessionData> = {};

  if (!sessionData || typeof sessionData !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid session data format'],
      sanitizedData: null
    };
  }

  const {
    moduleType,
    category,
    level,
    accuracy,
    avgTime,
    totalTime,
    problemsSolved,
    correctAnswers,
    bestStreak,
    completed,
    passed,
    startTime,
    endTime,
    sessionToken
  } = sessionData;

  // Required fields
  if (!moduleType || typeof moduleType !== 'string') {
    errors.push('Module type is required');
  } else {
    sanitizedData.moduleType = sanitizeTextInput(moduleType, 50);
  }

  if (!category || typeof category !== 'string') {
    errors.push('Category is required');
  } else {
    sanitizedData.category = sanitizeTextInput(category, 50);
  }

  if (!level || typeof level !== 'string') {
    errors.push('Level is required');
  } else {
    sanitizedData.level = sanitizeTextInput(level, 20);
  }

  if (!sessionToken || typeof sessionToken !== 'string') {
    errors.push('Session token is required');
  } else {
    sanitizedData.sessionToken = sanitizeTextInput(sessionToken, 100);
  }

  // Optional numeric fields with strict bounds checking
  if (accuracy !== undefined) {
    const acc = Number(accuracy);
    if (isNaN(acc) || !isFinite(acc) || acc < 0 || acc > 100) {
      errors.push('Accuracy must be a number between 0 and 100');
    } else {
      // Round to 2 decimal places to prevent precision issues
      sanitizedData.accuracy = Math.round(acc * 100) / 100;
    }
  }

  if (avgTime !== undefined) {
    const time = Number(avgTime);
    if (isNaN(time) || !isFinite(time) || time < 0 || time > 3600000) { // Max 1 hour in milliseconds
      errors.push('Average time must be between 0 and 3600000 milliseconds');
    } else {
      sanitizedData.avgTime = Math.round(time);
    }
  }

  if (totalTime !== undefined) {
    const time = Number(totalTime);
    if (isNaN(time) || !isFinite(time) || time < 0 || time > 86400000) { // Max 24 hours in milliseconds
      errors.push('Total time must be between 0 and 86400000 milliseconds');
    } else {
      sanitizedData.totalTime = Math.round(time);
    }
  }

  if (problemsSolved !== undefined) {
    const problems = Number(problemsSolved);
    if (isNaN(problems) || !isFinite(problems) || problems < 0 || problems > 10000) { // Reasonable max
      errors.push('Problems solved must be between 0 and 10000');
    } else if (!Number.isInteger(problems)) {
      errors.push('Problems solved must be a whole number');
    } else {
      sanitizedData.problemsSolved = problems;
    }
  }

  if (correctAnswers !== undefined) {
    const correct = Number(correctAnswers);
    if (isNaN(correct) || !isFinite(correct) || correct < 0 || correct > 10000) { // Reasonable max
      errors.push('Correct answers must be between 0 and 10000');
    } else if (!Number.isInteger(correct)) {
      errors.push('Correct answers must be a whole number');
    } else {
      sanitizedData.correctAnswers = correct;
    }
  }

  if (bestStreak !== undefined) {
    const streak = Number(bestStreak);
    if (isNaN(streak) || !isFinite(streak) || streak < 0 || streak > 10000) { // Reasonable max
      errors.push('Best streak must be between 0 and 10000');
    } else if (!Number.isInteger(streak)) {
      errors.push('Best streak must be a whole number');
    } else {
      sanitizedData.bestStreak = streak;
    }
  }

  // Logical validation: correctAnswers should not exceed problemsSolved
  if (sanitizedData.correctAnswers !== undefined && sanitizedData.problemsSolved !== undefined) {
    if (sanitizedData.correctAnswers > sanitizedData.problemsSolved) {
      errors.push('Correct answers cannot exceed problems solved');
    }
  }

  // Boolean fields
  if (completed !== undefined) {
    sanitizedData.completed = Boolean(completed);
  }

  if (passed !== undefined) {
    sanitizedData.passed = Boolean(passed);
  }

  // Date fields
  if (startTime !== undefined) {
    if (typeof startTime === 'string') {
      const date = new Date(startTime);
      if (isNaN(date.getTime())) {
        errors.push('Start time must be a valid date');
      } else {
        sanitizedData.startTime = date.toISOString();
      }
    } else {
      errors.push('Start time must be a string');
    }
  }

  if (endTime !== undefined) {
    if (typeof endTime === 'string') {
      const date = new Date(endTime);
      if (isNaN(date.getTime())) {
        errors.push('End time must be a valid date');
      } else {
        sanitizedData.endTime = date.toISOString();
      }
    } else {
      errors.push('End time must be a string');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData as GameSessionData : null
  };
}

/**
 * Validate profile update data
 */
export interface ProfileUpdateData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData: Partial<ProfileUpdateData> | null;
}

export function validateProfileUpdate(profileData: any): ProfileValidationResult {
  const errors: string[] = [];
  const sanitizedData: Partial<ProfileUpdateData> = {};

  if (!profileData || typeof profileData !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid profile data format'],
      sanitizedData: null
    };
  }

  const { name, email, currentPassword, newPassword } = profileData;

  // Validate name if provided
  if (name !== undefined) {
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    } else if (nameValidation.sanitized) {
      sanitizedData.name = nameValidation.sanitized;
    }
  }

  // Validate email if provided
  if (email !== undefined) {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    } else if (emailValidation.sanitized) {
      sanitizedData.email = emailValidation.sanitized;
    }
  }

  // Validate passwords if provided
  if (currentPassword !== undefined) {
    if (!currentPassword || typeof currentPassword !== 'string') {
      errors.push('Current password is required');
    } else if (currentPassword.length > 128) {
      errors.push('Current password is too long');
    } else {
      sanitizedData.currentPassword = currentPassword;
    }
  }

  if (newPassword !== undefined) {
    if (!newPassword || typeof newPassword !== 'string') {
      errors.push('New password is required');
    } else if (newPassword.length < 12) {
      errors.push('New password must be at least 12 characters long');
    } else if (newPassword.length > 128) {
      errors.push('New password is too long');
    } else {
      sanitizedData.newPassword = newPassword;
    }

    // If new password is provided, current password should be too
    if (newPassword && !currentPassword) {
      errors.push('Current password is required when setting a new password');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : null
  };
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate module and level parameters
 */
export interface ModuleLevelParams {
  moduleType: string;
  category: string;
  level: string;
}

export function validateModuleLevel(params: any): ValidationResult<ModuleLevelParams> {
  const errors: string[] = [];

  if (!params || typeof params !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid parameters'],
      sanitized: null
    };
  }

  const { moduleType, category, level } = params;

  if (!moduleType || typeof moduleType !== 'string') {
    errors.push('Module type is required');
  }

  if (!category || typeof category !== 'string') {
    errors.push('Category is required');
  }

  if (!level || typeof level !== 'string') {
    errors.push('Level is required');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      sanitized: null
    };
  }

  // Sanitize the parameters
  const sanitized: ModuleLevelParams = {
    moduleType: sanitizeTextInput(moduleType, 50),
    category: sanitizeTextInput(category, 50),
    level: sanitizeTextInput(level, 20)
  };

  return {
    isValid: true,
    errors: [],
    sanitized
  };
}

/**
 * Validate numeric range
 */
export function validateNumericRange(
  value: any,
  fieldName: string,
  min: number = 0,
  max: number = Infinity
): ValidationResult<number> {
  if (value === undefined || value === null) {
    return {
      isValid: false,
      errors: [`${fieldName} is required`],
      sanitized: null
    };
  }

  const num = Number(value);
  if (isNaN(num)) {
    return {
      isValid: false,
      errors: [`${fieldName} must be a valid number`],
      sanitized: null
    };
  }

  if (num < min || num > max) {
    return {
      isValid: false,
      errors: [`${fieldName} must be between ${min} and ${max}`],
      sanitized: null
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: num
  };
}

/**
 * Validate array of strings with length limits
 */
export function validateStringArray(
  value: any,
  fieldName: string,
  minLength: number = 0,
  maxLength: number = 100,
  maxItemLength: number = 255
): ValidationResult<string[]> {
  if (!Array.isArray(value)) {
    return {
      isValid: false,
      errors: [`${fieldName} must be an array`],
      sanitized: null
    };
  }

  if (value.length < minLength || value.length > maxLength) {
    return {
      isValid: false,
      errors: [`${fieldName} must contain between ${minLength} and ${maxLength} items`],
      sanitized: null
    };
  }

  const sanitized: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < value.length; i++) {
    const item = value[i];
    if (typeof item !== 'string') {
      errors.push(`${fieldName}[${i}] must be a string`);
      continue;
    }

    const sanitizedItem = sanitizeTextInput(item, maxItemLength);
    if (sanitizedItem.length === 0) {
      errors.push(`${fieldName}[${i}] cannot be empty`);
      continue;
    }

    sanitized.push(sanitizedItem);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : null
  };
}

// Export commonly used validation constants
export const VALIDATION_CONSTANTS = {
  MAX_EMAIL_LENGTH: 254,
  MAX_NAME_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 12,
  MAX_PASSWORD_LENGTH: 128,
  MAX_USER_AGENT_LENGTH: 500,
  MAX_TEXT_INPUT_LENGTH: 1000,
  MAX_SESSION_TOKEN_LENGTH: 100
} as const;