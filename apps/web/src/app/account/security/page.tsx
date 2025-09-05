import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { getAuthState, authenticatedFetch } from '../../../lib/auth';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import '../../global.css';

interface UserInfo {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
}

interface SecurityEvent {
  id: string;
  action: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  success: boolean;
  location?: string;
}

interface ActiveSession {
  id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_activity: string;
  is_current: boolean;
}

export default function SecurityPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info' | 'warning', text: string} | null>(null);
  
  useEffect(() => {
    const authState = getAuthState();
    if (authState.user) {
      setUser(authState.user);
    }
  }, []);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const showMessage = (type: 'success' | 'error' | 'info' | 'warning', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadSecurityData = async () => {
    try {
      setIsLoading(true);
      
      // Load security events (login history, etc.)
      const eventsResponse = await authenticatedFetch('/api/user/security/events');
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setSecurityEvents(eventsData.events || []);
      }

      // Load active sessions
      const sessionsResponse = await authenticatedFetch('/api/user/security/sessions');
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setActiveSessions(sessionsData.sessions || []);
      }

      // Check 2FA status
      const twoFactorResponse = await authenticatedFetch('/api/user/security/2fa/status');
      if (twoFactorResponse.ok) {
        const twoFactorData = await twoFactorResponse.json();
        setTwoFactorEnabled(twoFactorData.enabled || false);
      }

    } catch (error) {
      console.error('Failed to load security data:', error);
      showMessage('error', 'Failed to load security information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      if (twoFactorEnabled) {
        // Disable 2FA
        const response = await authenticatedFetch('/api/user/security/2fa/disable', {
          method: 'POST'
        });

        if (response.ok) {
          setTwoFactorEnabled(false);
          showMessage('warning', 'Two-Factor Authentication disabled. Your account is now less secure.');
        }
      } else {
        // Enable 2FA - would typically show setup modal
        showMessage('info', '2FA setup will be available soon');
      }
    } catch (error) {
      showMessage('error', 'Failed to update 2FA settings');
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const response = await authenticatedFetch(`/api/user/security/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
        showMessage('success', 'Session terminated successfully');
      }
    } catch (error) {
      showMessage('error', 'Failed to terminate session');
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.toLowerCase().includes('mobile')) return '📱';
    if (userAgent.toLowerCase().includes('tablet')) return '📱';
    return '💻';
  };

  const formatUserAgent = (userAgent: string) => {
    // Simple user agent parsing for display
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
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
              <h1 className="text-3xl font-bold text-white mb-2">Security Settings</h1>
              <p className="text-white/70">
                Manage your account security, view login activity, and configure two-factor authentication.
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

            {/* Two-Factor Authentication */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🛡️</span>
                  <h2 className="text-lg font-semibold text-white">Two-Factor Authentication</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-white">Two-Factor Authentication (2FA)</h3>
                    <p className="text-sm text-white/70 mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md ${
                      twoFactorEnabled 
                        ? 'bg-green-500/20 text-green-200' 
                        : 'bg-gray-500/20 text-gray-200'
                    }`}>
                      {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={handleToggle2FA}
                      className={`px-4 py-2 text-sm rounded-lg border transition-colors backdrop-blur-md ${
                        twoFactorEnabled
                          ? 'border-red-400/50 text-red-300 hover:bg-red-500/20'
                          : 'border-green-400/50 text-green-300 hover:bg-green-500/20'
                      }`}
                    >
                      {twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                    </button>
                  </div>
                </div>

                {!twoFactorEnabled && (
                  <div className="p-4 bg-orange-500/20 border border-orange-400/30 rounded-lg backdrop-blur-md">
                    <p className="text-orange-200 text-sm">
                      ⚠️ Your account is not protected by 2FA. Enable it to increase security.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌐</span>
                  <h2 className="text-lg font-semibold text-white">Active Sessions</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-white/70">
                  These are the devices and locations where your account is currently logged in.
                </p>
                
                {activeSessions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Device & Browser</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Location</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Last Activity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {activeSessions.map((session) => {
                          const deviceIcon = getDeviceIcon(session.user_agent);
                          return (
                            <tr key={session.id}>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <span className="text-lg">{deviceIcon}</span>
                                  <div>
                                    <div className="text-sm font-medium text-white">
                                      {formatUserAgent(session.user_agent)}
                                    </div>
                                    {session.is_current && (
                                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-200">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-white/80">
                                {session.ip_address}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-white/80">
                                {new Date(session.last_activity).toLocaleString()}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {!session.is_current && (
                                  <button
                                    onClick={() => handleTerminateSession(session.id)}
                                    className="px-3 py-1 text-sm border border-red-400/50 text-red-300 rounded-lg hover:bg-red-500/20 transition-colors backdrop-blur-md"
                                  >
                                    Terminate
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-md">
                    <p className="text-blue-200 text-sm">
                      ℹ️ No active sessions found or session tracking not yet implemented.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Security Events / Login History */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-lg font-semibold text-white">Recent Security Events</h2>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-white/70">
                  Recent login attempts and security-related activities on your account.
                </p>
                
                {securityEvents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Event</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">IP Address</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {securityEvents.slice(0, 10).map((event) => (
                          <tr key={event.id}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">
                                {event.action}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono text-white/70">
                                {event.ip_address}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                event.success 
                                  ? 'bg-green-500/20 text-green-200' 
                                  : 'bg-red-500/20 text-red-200'
                              }`}>
                                {event.success ? 'Success' : 'Failed'}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white/80">
                              {new Date(event.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-md">
                    <p className="text-blue-200 text-sm">
                      ℹ️ No security events found or event logging not yet implemented.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}