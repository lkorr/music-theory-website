/**
 * Client-Side CSRF Token Management
 * 
 * Provides utilities for fetching and managing CSRF tokens on the client-side
 * to protect against Cross-Site Request Forgery attacks.
 */

let cachedToken: string | null = null;
let tokenExpiration: number = 0;
const TOKEN_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Fetch a fresh CSRF token from the server
 */
async function fetchCSRFToken(): Promise<string> {
  try {
    const response = await fetch('/api/csrf', {
      method: 'GET',
      credentials: 'include', // Include cookies
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.token) {
      throw new Error('No CSRF token received from server');
    }

    return data.token;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
}

/**
 * Get a CSRF token with caching
 * Caches the token for performance and fetches a new one when expired
 */
export async function getCSRFToken(): Promise<string> {
  const now = Date.now();
  
  // Return cached token if still valid
  if (cachedToken && now < tokenExpiration) {
    return cachedToken;
  }

  try {
    // Fetch fresh token
    cachedToken = await fetchCSRFToken();
    tokenExpiration = now + TOKEN_CACHE_DURATION;
    
    return cachedToken;
  } catch (error) {
    // Clear cache on error
    cachedToken = null;
    tokenExpiration = 0;
    throw error;
  }
}

/**
 * Clear cached CSRF token
 * Useful when authentication state changes or on logout
 */
export function clearCSRFTokenCache(): void {
  cachedToken = null;
  tokenExpiration = 0;
}

/**
 * Wrapper around fetch that automatically includes CSRF token
 * Use this for all authenticated API requests
 */
export async function securedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  const method = options.method?.toLowerCase() || 'get';
  const skipCSRF = ['get', 'head', 'options'].includes(method);

  if (skipCSRF) {
    return fetch(url, {
      ...options,
      credentials: 'include', // Always include cookies for auth
    });
  }

  try {
    // Get CSRF token for state-changing requests
    const csrfToken = await getCSRFToken();

    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        'X-CSRF-Token': csrfToken,
      },
    });
  } catch (error) {
    console.error('CSRF token fetch failed, proceeding without token:', error);
    
    // Fallback: proceed without CSRF token (server will reject if needed)
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }
}

/**
 * Create a form data object with CSRF token included
 * Use this for forms that submit via JavaScript
 */
export async function createSecuredFormData(data: Record<string, any>): Promise<FormData> {
  const formData = new FormData();
  
  // Add CSRF token
  try {
    const csrfToken = await getCSRFToken();
    formData.append('csrf_token', csrfToken);
  } catch (error) {
    console.warn('Failed to add CSRF token to form data:', error);
  }

  // Add all other data
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  return formData;
}

/**
 * Get CSRF token for inclusion in forms (server-side rendering)
 * This is used by the SecureForm component
 */
export function getCSRFTokenSync(): string {
  // This will be populated by the SecureForm component from server data
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag?.getAttribute('content') || '';
}

/**
 * Set CSRF token from server-side rendered data
 * Call this in your app initialization
 */
export function setCSRFTokenFromMeta(): void {
  const token = getCSRFTokenSync();
  if (token) {
    cachedToken = token;
    tokenExpiration = Date.now() + TOKEN_CACHE_DURATION;
  }
}

/**
 * Handle CSRF-related errors
 * Returns true if the error was handled, false if it should be re-thrown
 */
export function handleCSRFError(error: any, retry?: () => Promise<any>): Promise<any> | null {
  // Check if it's a CSRF validation error
  if (error.status === 403 || 
      (error.message && error.message.includes('CSRF')) ||
      (error.code && error.code === 'CSRF_VALIDATION_FAILED')) {
    
    console.warn('CSRF token validation failed, clearing cache and retrying...');
    
    // Clear cached token and retry once
    clearCSRFTokenCache();
    
    if (retry) {
      return retry();
    }
  }
  
  return null;
}