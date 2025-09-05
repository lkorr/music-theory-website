/**
 * Email Verification API Endpoint
 * POST /api/auth/verify-email
 * 
 * Verifies user email addresses using secure tokens
 */

import { getUserByEmail, updateUserEmailVerified } from '../../../../lib/supabase.js';
import { verifyEmailToken } from '../../../../lib/email-tokens.js';
import { sendWelcomeEmail } from '../../../../lib/email.ts';
import { secureJsonResponse } from '../../../../lib/security-headers.js';

export async function POST(request) {
  try {
    const { token, email } = await request.json();

    // Validate input
    if (!token || !email) {
      return secureJsonResponse({
        success: false,
        error: 'Token and email are required'
      }, { status: 400 });
    }

    // Verify the email token
    const tokenValid = verifyEmailToken(email, token);
    if (!tokenValid) {
      return secureJsonResponse({
        success: false,
        error: 'Invalid or expired verification token'
      }, { status: 400 });
    }

    // Get user from database
    const user = await getUserByEmail(email);
    if (!user) {
      return secureJsonResponse({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Check if already verified
    if (user.emailVerified) {
      return secureJsonResponse({
        success: true,
        message: 'Email already verified',
        alreadyVerified: true
      });
    }

    // Update user as email verified
    await updateUserEmailVerified(user.id, true);

    // Send welcome email
    try {
      await sendWelcomeEmail({
        email: user.email,
        name: user.name || 'Music Learner'
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the verification if email fails
    }

    return secureJsonResponse({
      success: true,
      message: 'Email verified successfully! Welcome to Pailiaq Music Training.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return secureJsonResponse({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Allow GET requests for email verification links from emails
export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const email = url.searchParams.get('email');

  if (!token || !email) {
    // Redirect to verification page with error
    return Response.redirect(`${url.origin}/auth/verify-email?error=missing_params`);
  }

  try {
    // Verify the token
    const tokenValid = verifyEmailToken(email, token);
    if (!tokenValid) {
      return Response.redirect(`${url.origin}/auth/verify-email?error=invalid_token&email=${encodeURIComponent(email)}`);
    }

    // Get user from database
    const user = await getUserByEmail(email);
    if (!user) {
      return Response.redirect(`${url.origin}/auth/verify-email?error=user_not_found`);
    }

    // Check if already verified
    if (user.emailVerified) {
      return Response.redirect(`${url.origin}/auth/verify-email?success=already_verified`);
    }

    // Update user as email verified
    await updateUserEmailVerified(user.id, true);

    // Send welcome email
    try {
      await sendWelcomeEmail({
        email: user.email,
        name: user.name || 'Music Learner'
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Redirect to success page
    return Response.redirect(`${url.origin}/auth/verify-email?success=verified`);

  } catch (error) {
    console.error('Email verification error:', error);
    return Response.redirect(`${url.origin}/auth/verify-email?error=server_error`);
  }
}