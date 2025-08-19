import { getToken } from '@auth/core/jwt';

// SECURITY: Fixed cross-origin messaging vulnerability
// Only posts messages to specific allowed origins

export async function GET(request) {
	// Define allowed origins for cross-origin communication
	const ALLOWED_ORIGINS = [
		process.env.WEB_URL || 'http://localhost:3000',
		process.env.MOBILE_URL || 'http://localhost:8081',
		process.env.EXPO_PUBLIC_PROXY_BASE_URL,
	].filter(Boolean);

	// Get the origin from the referrer or use the first allowed origin
	const referrer = request.headers.get('referer');
	const targetOrigin = ALLOWED_ORIGINS.find(origin => 
		referrer?.startsWith(origin)
	) || ALLOWED_ORIGINS[0];

	// Check for mock auth in development
	if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AUTH === 'true') {
		const mockMessage = {
			type: 'AUTH_SUCCESS',
			jwt: 'mock.jwt.token',
			user: {
				id: 'user123',
				email: 'user@example.com',
				name: 'Test User',
			},
		};

		return new Response(
			`
			<html>
				<body>
					<script>
						const targetOrigin = '${targetOrigin}';
						window.parent.postMessage(${JSON.stringify(mockMessage)}, targetOrigin);
					</script>
				</body>
			</html>
			`,
			{
				headers: {
					'Content-Type': 'text/html',
				},
			}
		);
	}

	// Production authentication
	try {
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
			return new Response(
				`
				<html>
					<body>
						<script>
							const targetOrigin = '${targetOrigin}';
							window.parent.postMessage({ type: 'AUTH_ERROR', error: 'Unauthorized' }, targetOrigin);
						</script>
					</body>
				</html>
				`,
				{
					status: 401,
					headers: {
						'Content-Type': 'text/html',
					},
				}
			);
		}

		const message = {
			type: 'AUTH_SUCCESS',
			jwt: token,
			user: {
				id: jwt.sub,
				email: jwt.email,
				name: jwt.name,
			},
		};

		return new Response(
			`
			<html>
				<body>
					<script>
						const targetOrigin = '${targetOrigin}';
						const message = ${JSON.stringify(message)};
						window.parent.postMessage(message, targetOrigin);
					</script>
				</body>
			</html>
			`,
			{
				headers: {
					'Content-Type': 'text/html',
				},
			}
		);
	} catch (error) {
		console.error('Authentication error:', error);
		return new Response(
			`
			<html>
				<body>
					<script>
						const targetOrigin = '${targetOrigin}';
						window.parent.postMessage({ type: 'AUTH_ERROR', error: 'Authentication service unavailable' }, targetOrigin);
					</script>
				</body>
			</html>
			`,
			{
				status: 503,
				headers: {
					'Content-Type': 'text/html',
				},
			}
		);
	}
}
