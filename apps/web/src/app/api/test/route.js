/**
 * Simple Test API Route
 * GET /api/test
 */

import { secureJsonResponse } from '../../../lib/security-headers.js';

export async function GET() {
  return secureJsonResponse({ 
    message: "API routing works!",
    timestamp: new Date().toISOString()
  });
}