import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { getAuthState, authenticatedFetch } from '../../../lib/auth';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import '../../global.css';

// Environment configuration check
const isBillingEnabled = process.env.ENABLE_BILLING === 'true';
const isTestMode = process.env.NODE_ENV === 'development' || process.env.SHOW_TEST_MODE_WARNING === 'true';

interface UserInfo {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
}

interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  plan_name: string;
  plan_id: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
}

const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'forever' as const,
    features: [
      'Access to basic levels',
      'Limited practice sessions',
      'Basic progress tracking',
    ],
    icon: '🎵',
    color: 'gray'
  },
  {
    id: 'pro_monthly',
    name: 'Pro',
    price: 9.99,
    interval: 'month' as const,
    features: [
      'All practice modules unlocked',
      'Unlimited practice sessions',
      'Advanced analytics',
      'Progress export',
      'Priority support'
    ],
    icon: '⚡',
    color: 'blue'
  },
  {
    id: 'premium_yearly',
    name: 'Premium',
    price: 99.99,
    interval: 'year' as const,
    originalPrice: 119.88,
    features: [
      'Everything in Pro',
      '2 months free (yearly billing)',
      'Exclusive advanced content',
      'Personal progress coaching',
      'Early access to new features'
    ],
    icon: '👑',
    color: 'purple'
  }
];

export default function BillingPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [usageStats] = useState({
    sessionsUsed: 5,
    sessionsLimit: 10,
    levelsUnlocked: 3,
    totalLevels: 20
  });
  
  useEffect(() => {
    const authState = getAuthState();
    if (authState.user) {
      setUser(authState.user);
    }
    loadBillingData();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadBillingData = async () => {
    try {
      setIsLoading(true);
      
      // Load current subscription
      const subResponse = await authenticatedFetch('/api/billing/subscription');
      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData.subscription);
      }

    } catch (error) {
      console.error('Failed to load billing data:', error);
      showMessage('error', 'Failed to load billing information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    // Security: Check if billing is enabled
    if (!isBillingEnabled) {
      showMessage('error', 'Billing is currently disabled. Please contact support for assistance.');
      return;
    }

    try {
      const response = await authenticatedFetch('/api/billing/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ plan_id: planId })
      });

      if (response.ok) {
        const { checkout_url } = await response.json();
        window.location.href = checkout_url;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || 'Failed to create checkout session';
        
        // Provide user-friendly error messages based on status
        if (response.status === 503) {
          showMessage('error', 'Payment system is temporarily unavailable. Please try again later.');
        } else if (response.status === 429) {
          showMessage('error', 'Too many requests. Please wait a moment and try again.');
        } else {
          showMessage('error', errorMessage);
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showMessage('error', 'Unable to connect to payment system. Please check your connection and try again.');
    }
  };

  const getCurrentPlan = () => {
    if (!subscription) return SUBSCRIPTION_PLANS[0]; // Free plan
    return SUBSCRIPTION_PLANS.find(plan => plan.id === subscription.plan_id) || SUBSCRIPTION_PLANS[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-200 bg-green-500/20';
      case 'past_due': return 'text-orange-200 bg-orange-500/20';
      case 'canceled': return 'text-red-200 bg-red-500/20';
      default: return 'text-gray-200 bg-gray-500/20';
    }
  };

  const currentPlan = getCurrentPlan();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
        <div className="max-w-6xl mx-auto py-8 px-4">
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
              <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
              <p className="text-white/70">
                Manage your subscription, payment methods, and billing history.
              </p>
            </div>

            {/* Security/Development Warnings */}
            {isTestMode && (
              <div className="p-4 rounded-lg border bg-yellow-500/20 border-yellow-400/30 text-yellow-200 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-300">⚠️</span>
                  <span className="font-semibold">Test Mode Active</span>
                </div>
                <p className="text-sm">
                  You are in development/test mode. No real payments will be processed.
                  {!isBillingEnabled && ' Billing is currently disabled.'}
                </p>
              </div>
            )}

            {!isBillingEnabled && (
              <div className="p-4 rounded-lg border bg-blue-500/20 border-blue-400/30 text-blue-200 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-300">ℹ️</span>
                  <span className="font-semibold">Billing Disabled</span>
                </div>
                <p className="text-sm">
                  Subscription features are currently disabled. Contact support for assistance with upgrading your account.
                </p>
              </div>
            )}

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg border backdrop-blur-md ${
                message.type === 'success' 
                  ? 'bg-green-500/20 border-green-400/30 text-green-200' 
                  : 'bg-red-500/20 border-red-400/30 text-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Current Subscription Status */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentPlan.icon}</span>
                  <h2 className="text-lg font-semibold text-white">Current Plan: {currentPlan.name}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md ${getStatusColor(subscription?.status || 'free')}`}>
                    {subscription?.status || 'Free'}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {subscription ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-white/80">Amount:</span>
                      <span className="font-semibold text-white">
                        ${subscription.amount / 100}/{subscription.interval}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Next Billing:</span>
                      <span className="text-white">
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </span>
                    </div>
                    {subscription.cancel_at_period_end && (
                      <div className="p-4 bg-orange-500/20 border border-orange-400/30 rounded-lg backdrop-blur-md">
                        <p className="text-orange-200">
                          ⚠️ Your subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-600 transition-colors backdrop-blur-md">
                        Change Plan
                      </button>
                      <button className="px-4 py-2 border border-red-400/50 text-red-300 rounded-lg hover:bg-red-500/20 transition-colors backdrop-blur-md">
                        Cancel Subscription
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-white/70">You're currently on the free plan with limited access.</p>
                    <button 
                      onClick={() => handleUpgrade('pro_monthly')}
                      disabled={!isBillingEnabled}
                      className={`px-4 py-2 rounded-lg transition-colors backdrop-blur-md ${
                        !isBillingEnabled
                          ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-blue-600/80 text-white hover:bg-blue-600'
                      }`}
                    >
                      {!isBillingEnabled ? 'Upgrade Unavailable' : 'Upgrade to Pro'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-lg font-semibold text-white">Usage This Period</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white/80">Practice Sessions</span>
                      <span className="font-semibold text-white">
                        {usageStats.sessionsUsed} / {usageStats.sessionsLimit || '∞'}
                      </span>
                    </div>
                    {usageStats.sessionsLimit > 0 && (
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(usageStats.sessionsUsed / usageStats.sessionsLimit) * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white/80">Levels Unlocked</span>
                      <span className="font-semibold text-white">
                        {usageStats.levelsUnlocked} / {usageStats.totalLevels}
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(usageStats.levelsUnlocked / usageStats.totalLevels) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Plans */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-lg font-semibold text-white">Available Plans</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <div 
                      key={plan.id}
                      className={`border rounded-2xl p-6 text-center backdrop-blur-md transition-all duration-300 hover:scale-105 ${
                        currentPlan.id === plan.id 
                          ? 'border-blue-400/50 bg-blue-500/10' 
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="text-3xl">{plan.icon}</div>
                        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                        <div>
                          <div className="text-3xl font-bold text-white">
                            ${plan.price}
                            {plan.interval !== 'forever' && (
                              <span className="text-lg font-normal text-white/70">
                                /{plan.interval}
                              </span>
                            )}
                          </div>
                          {plan.originalPrice && (
                            <div className="text-sm text-white/50 line-through">
                              ${plan.originalPrice}/year
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 text-left">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="text-sm text-white/80">✓ {feature}</div>
                          ))}
                        </div>
                        {currentPlan.id === plan.id ? (
                          <div className="px-4 py-2 bg-green-500/20 text-green-200 rounded-lg backdrop-blur-md">
                            Current Plan
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpgrade(plan.id)}
                            disabled={plan.id === 'free' || !isBillingEnabled}
                            className={`w-full px-4 py-2 rounded-lg transition-colors backdrop-blur-md ${
                              plan.id === 'free' || !isBillingEnabled
                                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed opacity-50'
                                : 'bg-blue-600/80 text-white hover:bg-blue-600'
                            }`}
                          >
                            {plan.id === 'free' 
                              ? 'Free' 
                              : !isBillingEnabled 
                                ? 'Unavailable' 
                                : 'Upgrade'
                            }
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coming Soon Sections */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">More Features Coming Soon</h3>
                <p className="text-white/70">
                  Payment methods, billing history, and advanced subscription management features will be available soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}