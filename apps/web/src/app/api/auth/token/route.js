import { getToken } from '@auth/core/jwt';
import { createAuditLog } from '../../../../lib/supabase.js';
import { createRateLimitMiddleware } from '../../../../lib/rateLimit.js';

// SECURITY: Enhanced token endpoint with rate limiting and audit logging

export async function GET(request) {
	const clientIP = getClientIP(request);
	const userAgent = request.headers.get('user-agent') || 'Unknown';

	try {
		// Apply rate limiting
		const rateLimitResult = await applyRateLimit(request, 'api');
		if (rateLimitResult) {
			return rateLimitResult;
		}

		// Check environment - only allow mock in development
		if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AUTH === 'true') {
			console.warn('⚠️ MOCK AUTH ENABLED - DO NOT USE IN PRODUCTION');
			
			// Log mock token usage
			await createAuditLog({
				action: 'SECURITY_ALERT',
				metadata: {
					type: 'mock_auth_used',
					ip_address: clientIP,
					user_agent: userAgent
				},
				severity: 'WARN',
				category: 'security'
			});

			return new Response(
				JSON.stringify({
					jwt: 'mock.jwt.token',
					user: {
						id: 'user123',
						email: 'user@example.com',
						name: 'Test User',
					},
				}),
				{
					headers: {
						'Content-Type': 'application/json',
						...createSecurityHeaders()
					},
				}
			);
		}

		// Production authentication - requires proper Auth.js setup
		const [token, jwt] = await Promise.all([
			getToken({
				req: request,
				secret: process.env.AUTH_SECRET,
				secureCookie: process.env.AUTH_URL?.startsWith('https'),
				raw: true,
			}),
			getToken({
				req: request,
				secret: process.env.AUTH_SECRET,
				secureCookie: process.env.AUTH_URL?.startsWith('https'),
			}),
		]);

		if (!jwt) {
			// Log unauthorized access attempt
			await createAuditLog({
				action: 'SECURITY_ALERT',
				metadata: {
					type: 'unauthorized_token_request',
					ip_address: clientIP,
					user_agent: userAgent
				},
				severity: 'WARN',
				category: 'security'
			});

			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: {
					'Content-Type': 'application/json',
					...createSecurityHeaders()
				},
			});
		}

		// Log successful token retrieval
		await createAuditLog({
			user_id: jwt.sub,
			action: 'USER_TOKEN_RETRIEVED',
			metadata: {
				ip_address: clientIP,
				user_agent: userAgent
			},
			severity: 'INFO',
			category: 'auth'
		});

		return new Response(
			JSON.stringify({
				jwt: token,
				user: {
					id: jwt.sub,
					email: jwt.email,
					name: jwt.name,
				},
			}),
			{
				headers: {
					'Content-Type': 'application/json',
					...createSecurityHeaders()
				},
			}
		);

	} catch (error) {
		console.error('Token endpoint error:', error);

		// Log system error
		await createAuditLog({
			action: 'SECURITY_ALERT',
			metadata: {
				type: 'token_endpoint_error',
				error: error.message,
				ip_address: clientIP,
				user_agent: userAgent
			},
			severity: 'ERROR',
			category: 'security'
		});

		return new Response(
			JSON.stringify({ error: 'Authentication service unavailable' }),
			{
				status: 503,
				headers: {
					'Content-Type': 'application/json',
					...createSecurityHeaders()
				},
			}
		);
	}
}

/**
 * Apply rate limiting
 */
async function applyRateLimit(request, type) {
	try {
		const rateLimitMiddleware = createRateLimitMiddleware(type);
		const context = {};
		
		const result = await rateLimitMiddleware(request, context);
		return result;
	} catch (error) {
		console.error('Rate limiting error:', error);
		return null;
	}
}

/**
 * Extract client IP address
 */
function getClientIP(request) {
	const headers = [
		'x-forwarded-for',
		'x-real-ip',
		'cf-connecting-ip',
		'x-client-ip'
	];

	for (const header of headers) {
		const value = request.headers.get(header);
		if (value) {
			return value.split(',')[0].trim();
		}
	}

	return 'unknown';
}

/**
 * Create security headers
 */
function createSecurityHeaders() {
	return {
		'X-Content-Type-Options': 'nosniff',
		'X-Frame-Options': 'DENY',
		'X-XSS-Protection': '1; mode=block',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		'Cache-Control': 'no-store, no-cache, must-revalidate, private'
	};
}
