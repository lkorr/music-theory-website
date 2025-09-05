import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { getAuthState } from '../../lib/auth';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import '../global.css';

interface UserInfo {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
}

export default function AccountDashboard() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get current user from auth state
    const authState = getAuthState();
    if (authState.user) {
      setUser(authState.user);
    }
    setIsLoading(false);
  }, []);

  const accountSections = [
    {
      title: 'Profile',
      description: 'Manage your personal information and preferences',
      icon: '👤',
      href: '/account/profile',
      color: 'blue'
    },
    {
      title: 'Security',
      description: 'Password, two-factor auth, and login history',
      icon: '🛡️',
      href: '/account/security',
      color: 'green'
    },
    {
      title: 'Billing & Subscription',
      description: 'Manage your subscription and payment methods',
      icon: '💳',
      href: '/account/billing',
      color: 'purple'
    },
    {
      title: 'Settings',
      description: 'App preferences and account settings',
      icon: '⚙️',
      href: '/account/settings',
      color: 'orange'
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Account Dashboard</h1>
              <p className="text-white/70">
                Welcome back, {user?.name || user?.email}! Manage your account settings and subscription.
              </p>
            </div>

            {/* Account Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {accountSections.map((section) => (
                <Link 
                  key={section.href}
                  to={section.href}
                  className="group block"
                >
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 transition-all duration-300 transform group-hover:scale-105 group-hover:bg-white/20">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-white/10">
                        <span className="text-2xl">{section.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {section.title}
                        </h3>
                        <p className="text-sm text-white/70">
                          {section.description}
                        </p>
                      </div>
                      <div className="text-white/60 group-hover:text-white transition-colors">
                        →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Account Status */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="text-center space-y-3">
                <h3 className="text-lg font-semibold text-white">
                  Account Status
                </h3>
                <div className="flex flex-wrap justify-center gap-6 text-sm text-white/80">
                  <div>
                    <strong className="text-white">Email:</strong> {user?.email}
                  </div>
                  <div>
                    <strong className="text-white">Role:</strong> {user?.role || 'FREE'}
                  </div>
                  <div>
                    <strong className="text-white">Member since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}