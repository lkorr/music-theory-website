/**
 * Simple Test API Route
 * GET /api/test
 */

export async function GET() {
  return new Response(
    JSON.stringify({ 
      message: "API routing works!",
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}