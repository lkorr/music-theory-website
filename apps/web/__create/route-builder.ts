import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

// Get current directory
const __dirname = join(fileURLToPath(new URL('.', import.meta.url)), '../src/app/api');
if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// Recursively find all route.js and route.ts files
async function findRouteFiles(dir: string): Promise<string[]> {
  const files = await readdir(dir);
  let routes: string[] = [];

  for (const file of files) {
    try {
      const filePath = join(dir, file);
      const statResult = await stat(filePath);

      if (statResult.isDirectory()) {
        routes = routes.concat(await findRouteFiles(filePath));
      } else if (file === 'route.js' || file === 'route.ts') {
        // Handle root route.js or route.ts specially
        if (filePath === join(__dirname, 'route.js') || filePath === join(__dirname, 'route.ts')) {
          routes.unshift(filePath); // Add to beginning of array
        } else {
          routes.push(filePath);
        }
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  return routes;
}

// Helper function to transform file path to Hono route path
function getHonoPath(routeFile: string): { name: string; pattern: string }[] {
  const relativePath = routeFile.replace(__dirname, '');
  const parts = relativePath.split('/').filter(Boolean);
  const routeParts = parts.slice(0, -1); // Remove 'route.js' or 'route.ts'
  if (routeParts.length === 0) {
    return [{ name: 'root', pattern: '' }];
  }
  const transformedParts = routeParts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === '...'
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
  return transformedParts;
}

// Import and register all routes
async function registerRoutes() {
  console.log('🔧 Registering routes...');
  
  // Clear existing routes
  api.routes = [];

  // Manually register working routes to avoid dynamic import issues
  try {
    // Register exercises route
    const exercisesRoute = await import('../src/app/api/exercises/route.js');
    if (exercisesRoute.GET) {
      api.get('/exercises', async (c) => {
        return await exercisesRoute.GET(c.req.raw);
      });
      console.log('✅ Registered GET /exercises');
    }
    if (exercisesRoute.POST) {
      api.post('/exercises', async (c) => {
        return await exercisesRoute.POST(c.req.raw);
      });
      console.log('✅ Registered POST /exercises');
    }

    // Register exercises/[id] route
    const exerciseByIdRoute = await import('../src/app/api/exercises/[id]/route.js');
    if (exerciseByIdRoute.GET) {
      api.get('/exercises/:id', async (c) => {
        const params = c.req.param();
        return await exerciseByIdRoute.GET(c.req.raw, { params });
      });
      console.log('✅ Registered GET /exercises/:id');
    }

    // Register validate-counterpoint route
    const validateRoute = await import('../src/app/api/validate-counterpoint/route.js');
    if (validateRoute.POST) {
      api.post('/validate-counterpoint', async (c) => {
        return await validateRoute.POST(c.req.raw);
      });
      console.log('✅ Registered POST /validate-counterpoint');
    }

    // Register auth token route
    const authTokenRoute = await import('../src/app/api/auth/token/route.js');
    if (authTokenRoute.GET) {
      api.get('/auth/token', async (c) => {
        return await authTokenRoute.GET(c.req.raw);
      });
      console.log('✅ Registered GET /auth/token');
    }

    // Register auth expo-web-success route
    const authExpoRoute = await import('../src/app/api/auth/expo-web-success/route.js');
    if (authExpoRoute.GET) {
      api.get('/auth/expo-web-success', async (c) => {
        return await authExpoRoute.GET(c.req.raw);
      });
      console.log('✅ Registered GET /auth/expo-web-success');
    }

    // Register auth register route
    const authRegisterRoute = await import('../src/app/api/auth/register/route.js');
    if (authRegisterRoute.POST) {
      api.post('/auth/register', async (c) => {
        return await authRegisterRoute.POST(c.req.raw);
      });
      console.log('✅ Registered POST /auth/register');
    }
    if (authRegisterRoute.GET) {
      api.get('/auth/register', async (c) => {
        return await authRegisterRoute.GET(c.req.raw);
      });
      console.log('✅ Registered GET /auth/register');
    }

    // Register auth login route
    const authLoginRoute = await import('../src/app/api/auth/login/route.js');
    if (authLoginRoute.POST) {
      api.post('/auth/login', async (c) => {
        return await authLoginRoute.POST(c.req.raw);
      });
      console.log('✅ Registered POST /auth/login');
    }
    if (authLoginRoute.GET) {
      api.get('/auth/login', async (c) => {
        return await authLoginRoute.GET(c.req.raw);
      });
      console.log('✅ Registered GET /auth/login');
    }

    // Register auth me route
    const authMeRoute = await import('../src/app/api/auth/me/route.js');
    if (authMeRoute.GET) {
      api.get('/auth/me', async (c) => {
        return await authMeRoute.GET(c.req.raw);
      });
      console.log('✅ Registered GET /auth/me');
    }

    // Register auth update-profile route
    const authUpdateProfileRoute = await import('../src/app/api/auth/update-profile/route.js');
    if (authUpdateProfileRoute.POST) {
      api.post('/auth/update-profile', async (c) => {
        return await authUpdateProfileRoute.POST(c.req.raw);
      });
      console.log('✅ Registered POST /auth/update-profile');
    }

    // Register auth logout route
    const authLogoutRoute = await import('../src/app/api/auth/logout/route.js');
    if (authLogoutRoute.POST) {
      api.post('/auth/logout', async (c) => {
        return await authLogoutRoute.POST(c.req.raw);
      });
      console.log('✅ Registered POST /auth/logout');
    }

    // Register test route
    const testRoute = await import('../src/app/api/test/route.js');
    if (testRoute.GET) {
      api.get('/test', async (c) => {
        return await testRoute.GET(c.req.raw);
      });
      console.log('✅ Registered GET /test');
    }

    // Register progress save route
    const progressSaveRoute = await import('../src/app/api/progress/save/route.js');
    if (progressSaveRoute.POST) {
      api.post('/progress/save', async (c) => {
        return await progressSaveRoute.POST(c.req.raw);
      });
      console.log('✅ Registered POST /progress/save');
    }

    // Register dynamic progress level route
    const progressLevelRoute = await import('../src/app/api/progress/level/[moduleType]/[category]/[level]/route.js');
    if (progressLevelRoute.GET) {
      api.get('/progress/level/:moduleType/:category/:level', async (c) => {
        const params = c.req.param();
        return await progressLevelRoute.GET(c.req.raw, { params });
      });
      console.log('✅ Registered GET /progress/level/:moduleType/:category/:level');
    }

    // Register dynamic leaderboard level route
    const leaderboardLevelRoute = await import('../src/app/api/leaderboards/level/[moduleType]/[category]/[level]/route.js');
    if (leaderboardLevelRoute.GET) {
      api.get('/leaderboards/level/:moduleType/:category/:level', async (c) => {
        const params = c.req.param();
        return await leaderboardLevelRoute.GET(c.req.raw, { params });
      });
      console.log('✅ Registered GET /leaderboards/level/:moduleType/:category/:level');
    }

    // Register YouTube livestream status route
    const youtubeLiveStatusRoute = await import('../src/app/api/youtube/livestream-status/route.ts');
    if (youtubeLiveStatusRoute.GET) {
      api.get('/youtube/livestream-status', async (c) => {
        return await youtubeLiveStatusRoute.GET();
      });
      console.log('✅ Registered GET /youtube/livestream-status');
    }

    // Register newsletter subscription route
    const newsletterSubscribeRoute = await import('../src/app/api/newsletter/subscribe/route.ts');
    if (newsletterSubscribeRoute.POST) {
      api.post('/newsletter/subscribe', async (c) => {
        return await newsletterSubscribeRoute.POST(c.req.raw);
      });
      console.log('✅ Registered POST /newsletter/subscribe');
    }
    if (newsletterSubscribeRoute.GET) {
      api.get('/newsletter/subscribe', async (c) => {
        return await newsletterSubscribeRoute.GET();
      });
      console.log('✅ Registered GET /newsletter/subscribe');
    }

    console.log('🎉 Route registration completed');
  } catch (error) {
    console.error('❌ Error registering routes:', error);
  }
}

// Initial route registration
await registerRoutes();

// Hot reload routes in development
if (import.meta.env.DEV) {
  import.meta.glob('../src/app/api/**/route.js', {
    eager: true,
  });
  if (import.meta.hot) {
    import.meta.hot.accept((newSelf) => {
      registerRoutes().catch((err) => {
        console.error('Error reloading routes:', err);
      });
    });
  }
}

export { api, API_BASENAME };
