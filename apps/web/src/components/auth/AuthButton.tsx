/**
 * Authentication Button Component
 * 
 * Shows "Sign In" for unauthenticated users or "Dashboard" for authenticated users
 * Can be used in headers across the site for consistent authentication navigation
 */

import { Link } from "react-router";
import { useAuth } from "./ProtectedRoute";
import UserSettingsDropdown from "./UserSettingsDropdown";

interface AuthButtonProps {
  className?: string;
  showRegister?: boolean;
}

interface CompactAuthButtonProps {
  className?: string;
}

/**
 * AuthButton Component
 * 
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @param props.showRegister - Whether to show register button alongside sign in
 * @returns Authentication button(s)
 */
export default function AuthButton({ className = "", showRegister = false }: AuthButtonProps): React.ReactNode {
  const authState = useAuth();

  // Show loading state while checking auth
  if (authState.isLoading) {
    return (
      <div className={`animate-pulse bg-white/10 rounded-full w-20 h-10 ${className}`} />
    );
  }

  // If user is authenticated, show settings dropdown
  if (authState.isAuthenticated) {
    return <UserSettingsDropdown className={className} />;
  }

  // If user is not authenticated, show Sign In (and optionally Register)
  return (
    <div className="flex items-center space-x-4">
      <Link
        to="/auth/login"
        className={`px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 ${className}`}
      >
        Sign In
      </Link>
      {showRegister && (
        <Link
          to="/auth/register"
          className={`px-6 py-3 bg-blue-600/80 backdrop-blur-md rounded-full text-white font-medium hover:bg-blue-600 transition-all duration-300 border border-blue-500/50 ${className}`}
        >
          Get Started
        </Link>
      )}
    </div>
  );
}

/**
 * Compact version for smaller spaces
 */
export function CompactAuthButton({ className = "" }: CompactAuthButtonProps): React.ReactNode {
  const authState = useAuth();

  if (authState.isLoading) {
    return (
      <div className={`animate-pulse bg-white/10 rounded-lg w-16 h-8 ${className}`} />
    );
  }

  if (authState.isAuthenticated) {
    return <UserSettingsDropdown className={className} compact={true} />;
  }

  return (
    <Link
      to="/auth/login"
      className={`px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg text-white/90 text-sm font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 ${className}`}
    >
      Sign In
    </Link>
  );
}