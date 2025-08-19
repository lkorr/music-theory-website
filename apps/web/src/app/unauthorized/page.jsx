/**
 * Unauthorized Access Page
 * 
 * This page is shown when users try to access content they don't have permission for.
 */

import { Link } from 'react-router';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-8">🚫</div>
        
        <h1 className="text-4xl font-bold text-white mb-4">
          Access Denied
        </h1>
        
        <p className="text-white/70 text-lg mb-8">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
          
          <Link
            to="/"
            className="block bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}