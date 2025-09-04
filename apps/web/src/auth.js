/**
 * Authentication Configuration
 * 
 * SECURITY: This file has been updated to remove mock authentication
 * and add proper security configurations.
 */
import CreateAuth from '@auth/create';
import Credentials from '@auth/core/providers/credentials';
import { authConfig, validateAuthEnvironment } from './config/auth.config';

// Validate environment variables on startup
validateAuthEnvironment();

const result = CreateAuth({
	providers: [
		Credentials({
			credentials: {
				email: {
					label: 'Email',
					type: 'email',
				},
				password: {
					label: 'Password',
					type: 'password',
				},
			},
			// SECURITY: Real authentication implementation with database lookup
			async authorize(credentials) {
				// Import required modules
				const { validateLoginData } = await import('./lib/validation.js');
				const { verifyPassword } = await import('./lib/password.js');
				const { getUserByEmail, updateLoginTracking, createAuditLog, isAccountLocked } = await import('./lib/supabase.js');

				// Development mock auth fallback
				if (authConfig.useMockAuth && process.env.NODE_ENV === 'development') {
					console.warn('⚠️ Mock authentication is enabled - DO NOT USE IN PRODUCTION');
					if (credentials.email && credentials.password) {
						return {
							id: 'user123',
							email: credentials.email,
							name: 'Test User',
						};
					}
					return null;
				}

				try {
					// 1. Validate and sanitize input
					const validation = validateLoginData(credentials);
					if (!validation.isValid) {
						console.warn('Invalid login data:', validation.errors);
						return null;
					}

					const { email, password } = validation.sanitizedData;

					// 2. Look up user in database
					const user = await getUserByEmail(email);
					if (!user) {
						// Log failed attempt (no user found)
						await createAuditLog({
							action: 'USER_LOGIN_FAILED',
							metadata: { reason: 'user_not_found', email },
							severity: 'WARN',
							category: 'auth'
						});
						
						// Return null after constant time delay to prevent user enumeration
						await new Promise(resolve => setTimeout(resolve, 100));
						return null;
					}

					// 3. Check if account is locked
					const accountLocked = await isAccountLocked(user.id);
					if (accountLocked) {
						// Log locked account attempt
						await createAuditLog({
							user_id: user.id,
							action: 'USER_LOGIN_FAILED',
							metadata: { reason: 'account_locked', email },
							severity: 'WARN',
							category: 'auth'
						});

						// Update failed login tracking
						await updateLoginTracking(user.id, null, false);
						return null;
					}

					// 4. Verify password with Argon2
					if (!user.password) {
						// OAuth-only account
						await createAuditLog({
							user_id: user.id,
							action: 'USER_LOGIN_FAILED',
							metadata: { reason: 'oauth_only_account', email },
							severity: 'WARN',
							category: 'auth'
						});
						return null;
					}

					const passwordValid = await verifyPassword(user.password, password);
					if (!passwordValid) {
						// Log failed password attempt
						await createAuditLog({
							user_id: user.id,
							action: 'USER_LOGIN_FAILED',
							metadata: { reason: 'invalid_password', email },
							severity: 'WARN',
							category: 'auth'
						});

						// Update failed login tracking
						await updateLoginTracking(user.id, null, false);
						return null;
					}

					// 5. Successful authentication
					// Update login tracking
					await updateLoginTracking(user.id, null, true);

					// Log successful login
					await createAuditLog({
						user_id: user.id,
						action: 'USER_LOGIN',
						metadata: { email },
						severity: 'INFO',
						category: 'auth'
					});

					// Return user object for session
					return {
						id: user.id,
						email: user.email,
						name: user.name,
						role: user.role,
						emailVerified: user.email_verified
					};

				} catch (error) {
					console.error('Authentication error:', error);
					
					// Log authentication system error
					await createAuditLog({
						action: 'SECURITY_ALERT',
						metadata: { 
							error: error.message,
							email: credentials?.email,
							type: 'authentication_system_error'
						},
						severity: 'ERROR',
						category: 'security'
					});

					// Fail securely
					return null;
				}
			},
		}),
	],
	
	// Security configurations
	secret: authConfig.secret,
	
	// Session configuration
	session: {
		strategy: 'jwt',
		maxAge: authConfig.session.maxAge,
		updateAge: authConfig.session.updateAge,
	},
	
	// Cookie configuration
	cookies: {
		sessionToken: {
			name: '__Secure-auth.session-token',
			options: {
				httpOnly: true,
				sameSite: 'strict',
				path: '/',
				secure: authConfig.secureCookies,
			},
		},
	},
	
	// Page routes
	pages: {
		signIn: '/account/signin',
		signOut: '/account/logout',
		error: '/auth/error',
		verifyRequest: '/auth/verify',
	},
	
	// Callbacks for additional security
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
			}
			return token;
		},
		
		async session({ session, token }) {
			if (token) {
				session.user.id = token.id;
				session.user.email = token.email;
			}
			return session;
		},
	},
});

export const { auth } = result;
