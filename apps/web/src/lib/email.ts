/**
 * Email Service Integration
 * 
 * Provides secure email functionality using SendGrid for transactional emails
 * including verification, password reset, and welcome messages.
 */

import * as sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else if (process.env.NODE_ENV === 'production') {
  throw new Error('SENDGRID_API_KEY is required in production');
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@pailiaq.com';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.AUTH_URL || 'https://pailiaq.com';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface VerificationEmailData {
  email: string;
  name: string;
  verificationToken: string;
}

export interface PasswordResetEmailData {
  email: string;
  name: string;
  resetToken: string;
}

export interface WelcomeEmailData {
  email: string;
  name: string;
}

/**
 * Send email using SendGrid
 */
export async function sendEmail(template: EmailTemplate): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid not configured, would send:', template);
      return true; // Return true in development to avoid blocking flow
    }

    const msg = {
      to: template.to,
      from: {
        email: FROM_EMAIL,
        name: 'Pailiaq Music Training'
      },
      subject: template.subject,
      text: template.text,
      html: template.html,
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${template.to}: ${template.subject}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Generate email verification template
 */
export function generateVerificationEmail(data: VerificationEmailData): EmailTemplate {
  const verificationUrl = `${BASE_URL}/auth/verify-email?token=${data.verificationToken}&email=${encodeURIComponent(data.email)}`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - Pailiaq Music Training</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          border-radius: 10px;
          padding: 40px;
          text-align: center;
        }
        .logo {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 20px;
          color: #60a5fa;
        }
        .button {
          display: inline-block;
          padding: 15px 30px;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
          transition: background-color 0.3s;
        }
        .button:hover {
          background-color: #2563eb;
        }
        .footer {
          margin-top: 30px;
          font-size: 0.9em;
          opacity: 0.8;
          border-top: 1px solid rgba(255,255,255,0.2);
          padding-top: 20px;
        }
        .security-note {
          background-color: rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">pailiaq</div>
        <h1>Welcome to Pailiaq Music Training!</h1>
        <p>Hi ${data.name},</p>
        <p>Thank you for signing up for our music training platform. To complete your registration and start your musical journey, please verify your email address.</p>
        
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
        
        <div class="security-note">
          <strong>🔒 Security Note:</strong><br>
          This verification link will expire in 24 hours for your security. If you didn't create an account with us, you can safely ignore this email.
        </div>
        
        <p>Once verified, you'll have access to:</p>
        <ul style="text-align: left; display: inline-block;">
          <li>Interactive ear training exercises</li>
          <li>Chord progression transcription practice</li>
          <li>Counterpoint composition training</li>
          <li>Progress tracking and leaderboards</li>
          <li>Personalized learning paths</li>
        </ul>
        
        <div class="footer">
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #60a5fa;">${verificationUrl}</p>
          <p>Need help? <a href="${BASE_URL}/contact" style="color: #60a5fa;">Contact our support team</a></p>
          <p>© ${new Date().getFullYear()} Pailiaq Music Training. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to Pailiaq Music Training!

Hi ${data.name},

Thank you for signing up for our music training platform. To complete your registration, please verify your email address by clicking this link:

${verificationUrl}

This verification link will expire in 24 hours for your security.

Once verified, you'll have access to interactive ear training, chord progression practice, counterpoint training, and much more!

If you didn't create an account with us, you can safely ignore this email.

Need help? Contact us at ${BASE_URL}/contact

© ${new Date().getFullYear()} Pailiaq Music Training
  `;

  return {
    to: data.email,
    subject: 'Verify Your Email - Welcome to Pailiaq Music Training',
    html,
    text
  };
}

/**
 * Generate password reset template
 */
export function generatePasswordResetEmail(data: PasswordResetEmailData): EmailTemplate {
  const resetUrl = `${BASE_URL}/auth/reset-password?token=${data.resetToken}&email=${encodeURIComponent(data.email)}`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - Pailiaq Music Training</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          border-radius: 10px;
          padding: 40px;
          text-align: center;
        }
        .logo {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 20px;
          color: #60a5fa;
        }
        .button {
          display: inline-block;
          padding: 15px 30px;
          background-color: #dc2626;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
        }
        .security-note {
          background-color: rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          font-size: 0.9em;
        }
        .footer {
          margin-top: 30px;
          font-size: 0.9em;
          opacity: 0.8;
          border-top: 1px solid rgba(255,255,255,0.2);
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">pailiaq</div>
        <h1>Reset Your Password</h1>
        <p>Hi ${data.name},</p>
        <p>We received a request to reset your password for your Pailiaq Music Training account. If you made this request, click the button below to set a new password:</p>
        
        <a href="${resetUrl}" class="button">Reset Password</a>
        
        <div class="security-note">
          <strong>🔒 Important Security Information:</strong><br>
          • This reset link will expire in 1 hour<br>
          • If you didn't request this reset, please ignore this email<br>
          • Your password will remain unchanged until you create a new one<br>
          • Consider changing your password if you suspect unauthorized access
        </div>
        
        <p>For your security, this link can only be used once and will expire soon.</p>
        
        <div class="footer">
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #60a5fa;">${resetUrl}</p>
          <p>Need help? <a href="${BASE_URL}/contact" style="color: #60a5fa;">Contact our support team</a></p>
          <p>© ${new Date().getFullYear()} Pailiaq Music Training. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Reset Your Password - Pailiaq Music Training

Hi ${data.name},

We received a request to reset your password. If you made this request, click this link to set a new password:

${resetUrl}

This reset link will expire in 1 hour for your security.

If you didn't request this reset, please ignore this email - your password will remain unchanged.

Need help? Contact us at ${BASE_URL}/contact

© ${new Date().getFullYear()} Pailiaq Music Training
  `;

  return {
    to: data.email,
    subject: 'Reset Your Password - Pailiaq Music Training',
    html,
    text
  };
}

/**
 * Generate welcome email template (after email verification)
 */
export function generateWelcomeEmail(data: WelcomeEmailData): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Pailiaq Music Training!</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          border-radius: 10px;
          padding: 40px;
          text-align: center;
        }
        .logo {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 20px;
          color: #60a5fa;
        }
        .button {
          display: inline-block;
          padding: 15px 30px;
          background-color: #16a34a;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .feature {
          background-color: rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }
        .feature-icon {
          font-size: 2em;
          margin-bottom: 10px;
        }
        .footer {
          margin-top: 30px;
          font-size: 0.9em;
          opacity: 0.8;
          border-top: 1px solid rgba(255,255,255,0.2);
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">pailiaq</div>
        <h1>🎉 Welcome to Your Musical Journey!</h1>
        <p>Hi ${data.name},</p>
        <p>Your email has been verified and your account is now active! We're excited to help you develop your musical skills through our interactive training platform.</p>
        
        <a href="${BASE_URL}/dashboard" class="button">Start Training Now</a>
        
        <div class="feature-grid">
          <div class="feature">
            <div class="feature-icon">🎵</div>
            <h3>Ear Training</h3>
            <p>Develop perfect pitch and interval recognition with our interactive exercises</p>
          </div>
          <div class="feature">
            <div class="feature-icon">🎹</div>
            <h3>Chord Training</h3>
            <p>Master chord construction and progression analysis</p>
          </div>
          <div class="feature">
            <div class="feature-icon">🎼</div>
            <h3>Counterpoint</h3>
            <p>Learn classical composition techniques with real-time feedback</p>
          </div>
          <div class="feature">
            <div class="feature-icon">📈</div>
            <h3>Progress Tracking</h3>
            <p>Monitor your improvement with detailed analytics and leaderboards</p>
          </div>
        </div>
        
        <h2>🚀 Getting Started Tips</h2>
        <ul style="text-align: left; display: inline-block; margin: 20px 0;">
          <li><strong>Start with Ear Training:</strong> Begin with basic interval recognition</li>
          <li><strong>Practice Daily:</strong> Even 10 minutes a day makes a difference</li>
          <li><strong>Join the Community:</strong> Check out leaderboards and compete with others</li>
          <li><strong>Explore Blog:</strong> Read our articles for theory insights and tips</li>
        </ul>
        
        <div class="footer">
          <p>Questions? We're here to help!</p>
          <p><a href="${BASE_URL}/contact" style="color: #60a5fa;">Contact Support</a> | <a href="${BASE_URL}/blog" style="color: #60a5fa;">Read Our Blog</a></p>
          <p>Follow us for tips and updates: <a href="#" style="color: #60a5fa;">Twitter</a> | <a href="#" style="color: #60a5fa;">YouTube</a></p>
          <p>© ${new Date().getFullYear()} Pailiaq Music Training. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to Pailiaq Music Training!

Hi ${data.name},

Your email has been verified and your account is now active! We're excited to help you develop your musical skills.

Start your training: ${BASE_URL}/dashboard

Available Training Modules:
• Ear Training - Develop perfect pitch and interval recognition
• Chord Training - Master chord construction and progressions  
• Counterpoint - Learn classical composition techniques
• Progress Tracking - Monitor improvement with analytics

Getting Started Tips:
- Start with basic ear training exercises
- Practice daily, even just 10 minutes helps
- Join the community leaderboards
- Check out our blog for learning tips

Questions? Contact us at ${BASE_URL}/contact

© ${new Date().getFullYear()} Pailiaq Music Training
  `;

  return {
    to: data.email,
    subject: '🎉 Welcome to Pailiaq Music Training - Your Account is Ready!',
    html,
    text
  };
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(data: VerificationEmailData): Promise<boolean> {
  const template = generateVerificationEmail(data);
  return await sendEmail(template);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
  const template = generatePasswordResetEmail(data);
  return await sendEmail(template);
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  const template = generateWelcomeEmail(data);
  return await sendEmail(template);
}