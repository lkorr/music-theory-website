import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { getAuthState, authenticatedFetch, checkAuth } from '../../../lib/auth';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import '../../global.css';

interface UserInfo {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
  last_login_at?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  useEffect(() => {
    const authState = getAuthState();
    if (authState.user) {
      setUser(authState.user);
      setFormData({
        name: authState.user.name || '',
        email: authState.user.email || ''
      });
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpdateProfile = async () => {
    if (!formData.name.trim()) {
      showMessage('error', 'Name is required');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      showMessage('error', 'Valid email is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authenticatedFetch('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      showMessage('success', 'Your profile has been updated successfully');

      // Refresh user data
      await checkAuth();
      const refreshedAuthState = getAuthState();
      if (refreshedAuthState.user) {
        setUser(refreshedAuthState.user);
        setFormData({
          name: refreshedAuthState.user.name || '',
          email: refreshedAuthState.user.email || ''
        });
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    showMessage('error', 'Password change functionality will be available soon');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="space-y-6">
            {/* Back Button */}
            <div>
              <Link
                to="/account"
                className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors"
              >
                ← Back to Account
              </Link>
            </div>

            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
              <p className="text-white/70">
                Manage your personal information and account details.
              </p>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            {/* Personal Information Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-lg font-semibold text-white">Personal Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-md"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-md"
                  />
                  {formData.email !== user?.email && (
                    <div className="mt-2 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-md">
                      <p className="text-sm text-blue-200">
                        ℹ️ Changing your email will require verification
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleUpdateProfile}
                  disabled={isLoading || (formData.name === user?.name && formData.email === user?.email)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </div>

            {/* Account Security Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-lg font-semibold text-white">Account Security</h2>
              </div>
              <div className="p-6">
                <div>
                  <h3 className="font-medium text-white mb-2">Password</h3>
                  <p className="text-sm text-white/70 mb-3">
                    Last updated: Never (or we don't track this yet)
                  </p>
                  <button
                    onClick={handleChangePassword}
                    className="px-4 py-2 border border-orange-400/50 text-orange-300 rounded-lg hover:bg-orange-500/20 transition-colors backdrop-blur-md"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            {/* Account Information Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-lg font-semibold text-white">Account Information</h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="font-medium text-white">User ID:</span>
                  <span className="text-sm font-mono text-white/70">{user?.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="font-medium text-white">Account Type:</span>
                  <span className="text-white/80">{user?.role || 'FREE'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="font-medium text-white">Member Since:</span>
                  <span className="text-white/80">
                    {user?.created_at 
                      ? new Date(user.created_at).toLocaleDateString()
                      : 'Unknown'
                    }
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium text-white">Last Login:</span>
                  <span className="text-white/80">
                    {user?.last_login_at 
                      ? new Date(user.last_login_at).toLocaleString()
                      : 'Current session'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}