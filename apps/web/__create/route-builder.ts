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

// Recursively find all route.js files
async function findRouteFiles(dir: string): Promise<string[]> {
  const files = await readdir(dir);
  let routes: string[] = [];

  for (const file of files) {
    try {
      const filePath = join(dir, file);
      const statResult = await stat(filePath);

      if (statResult.isDirectory()) {
        routes = routes.concat(await findRouteFiles(filePath));
      } else if (file === 'route.js') {
        // Handle root route.js specially
        if (filePath === join(__dirname, 'route.js')) {
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
  const routeParts = parts.slice(0, -1); // Remove 'route.js'
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

    // Register auth logout route
    const authLogoutRoute = await import('../src/app/api/auth/logout/route.js');
    if (authLogoutRoute.POST) {
      api.post('/auth/logout', async (c) => {
        return await authLogoutRoute.POST(c.req.raw);
      });
      console.log('✅ Registered POST /auth/logout');
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
