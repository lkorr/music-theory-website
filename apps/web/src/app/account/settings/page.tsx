import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { getAuthState, authenticatedFetch, logout } from '../../../lib/auth';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import '../../global.css';

interface UserPreferences {
  email_notifications: boolean;
  practice_reminders: boolean;
  progress_emails: boolean;
  marketing_emails: boolean;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  language: string;
}

interface UserInfo {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    email_notifications: true,
    practice_reminders: true,
    progress_emails: false,
    marketing_emails: false,
    theme: 'system',
    timezone: 'UTC',
    language: 'en'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info' | 'warning', text: string} | null>(null);
  
  useEffect(() => {
    const authState = getAuthState();
    if (authState.user) {
      setUser(authState.user);
    }
  }, []);

  const showMessage = (type: 'success' | 'error' | 'info' | 'warning', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch('/api/user/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        showMessage('success', 'Your preferences have been updated successfully');
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      showMessage('error', 'Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!window.confirm('This will permanently delete all your data. Are you absolutely sure?')) {
      return;
    }

    try {
      const response = await authenticatedFetch('/api/user/delete-account', {
        method: 'DELETE'
      });

      if (response.ok) {
        showMessage('info', 'Your account has been scheduled for deletion');
        await logout();
        window.location.href = '/';
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete account');
    }
  };

  const handleExportData = async () => {
    try {
      const response = await authenticatedFetch('/api/user/export-data');
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-data-${user?.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showMessage('success', 'Your data export will download shortly');
      } else {
        throw new Error('Failed to export data');
      }
    } catch (error) {
      showMessage('error', 'Failed to export your data');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
        <div className="max-w-4xl mx-auto py-8 px-4">
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
              <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
              <p className="text-white/70">
                Customize your app experience and manage your account preferences.
              </p>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg border backdrop-blur-md ${
                message.type === 'success' ? 'bg-green-500/20 border-green-400/30 text-green-200' :
                message.type === 'warning' ? 'bg-orange-500/20 border-orange-400/30 text-orange-200' :
                message.type === 'info' ? 'bg-blue-500/20 border-blue-400/30 text-blue-200' :
                'bg-red-500/20 border-red-400/30 text-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Notification Preferences */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔔</span>
                  <h2 className="text-lg font-semibold text-white">Notifications</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label htmlFor="email-notifications" className="text-sm font-medium text-gray-900">
                      Email Notifications
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive important account and security notifications via email
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="email-notifications"
                      checked={preferences.email_notifications}
                      onChange={(e) => handlePreferenceChange('email_notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label htmlFor="practice-reminders" className="text-sm font-medium text-gray-900">
                        Practice Reminders
                      </label>
                      <p className="text-sm text-gray-600 mt-1">
                        Get reminded to practice when you haven't been active
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="practice-reminders"
                        checked={preferences.practice_reminders}
                        onChange={(e) => handlePreferenceChange('practice_reminders', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label htmlFor="progress-emails" className="text-sm font-medium text-gray-900">
                        Progress Reports
                      </label>
                      <p className="text-sm text-gray-600 mt-1">
                        Weekly progress summaries and achievements
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="progress-emails"
                        checked={preferences.progress_emails}
                        onChange={(e) => handlePreferenceChange('progress_emails', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label htmlFor="marketing-emails" className="text-sm font-medium text-gray-900">
                        Marketing Emails
                      </label>
                      <p className="text-sm text-gray-600 mt-1">
                        Updates about new features, tips, and special offers
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="marketing-emails"
                        checked={preferences.marketing_emails}
                        onChange={(e) => handlePreferenceChange('marketing_emails', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* App Preferences */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚙️</span>
                  <h2 className="text-lg font-semibold text-gray-900">App Preferences</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    id="theme"
                    value={preferences.theme}
                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose your preferred color scheme
                  </p>
                </div>

                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={preferences.timezone}
                    onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                  <p className="text-sm text-gray-600 mt-1">
                    Used for scheduling and progress reports
                  </p>
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    id="language"
                    value={preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                  </select>
                  <p className="text-sm text-gray-600 mt-1">
                    Interface language (coming soon)
                  </p>
                </div>
              </div>
            </div>

            {/* Save Preferences */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <button
                  onClick={handleSavePreferences}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Saving...' : 'Save All Preferences'}
                </button>
              </div>
            </div>

            {/* Data & Privacy */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌐</span>
                  <h2 className="text-lg font-semibold text-gray-900">Data & Privacy</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Export Your Data</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Download a copy of all your account data, progress, and settings
                  </p>
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Download Data Export
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      ℹ️ We respect your privacy. Read our Privacy Policy to learn how we protect your data.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-red-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-xl text-red-600">🗑️</span>
                  <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">
                    ⚠️ Account deletion is permanent and cannot be undone. All your progress and data will be lost.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-red-600 mb-2">Delete Account</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    This will permanently delete your account, all progress data, and cancel any active subscriptions.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <span>🗑️</span>
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}