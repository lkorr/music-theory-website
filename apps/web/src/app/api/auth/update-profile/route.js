/**
 * Update User Profile API
 * POST /api/auth/update-profile
 * 
 * Allows authenticated users to update their profile information
 */

import { jwtVerify } from 'jose';
import { supabaseAdmin } from '../../../../lib/supabase.js';

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required for JWT signing');
}
const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

/**
 * Verify JWT token and get user
 */
async function verifyJWT(request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return { valid: false };

  const cookies = cookieHeader.split(';');
  let token = null;
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth-token') {
      token = value;
      break;
    }
  }
  
  if (!token) return { valid: false };
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'midi-training-app',
      audience: 'midi-training-app-users'
    });
    
    return { valid: true, user: { email: payload.email, id: payload.userId } };
  } catch (error) {
    return { valid: false };
  }
}

export async function POST(request) {
  try {
    // Verify JWT token and get user
    const authResult = await verifyJWT(request);
    if (!authResult.valid || !authResult.user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const user = authResult.user;
    const body = await request.json();
    
    const { name } = body;

    // Validate input
    if (!name || typeof name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Name is required and must be a string' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      return new Response(
        JSON.stringify({ error: 'Name cannot be empty' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (trimmedName.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Name must be 50 characters or less' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if mock auth is enabled
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      // Mock mode - just return success
      console.log(`Mock updateProfile: ${user.email} -> name: "${trimmedName}"`);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Profile updated successfully',
          user: {
            email: user.email,
            name: trimmedName
          }
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update user in database
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ 
        name: trimmedName,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select('id, email, name')
      .single();

    if (error) {
      console.error('Database error updating profile:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update profile' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: data.id,
          email: data.email,
          name: data.name
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error updating profile:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Method not allowed for other HTTP methods
export async function GET() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405,
      headers: { 
        'Content-Type': 'application/json',
        'Allow': 'POST'
      }
    }
  );
}

export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;