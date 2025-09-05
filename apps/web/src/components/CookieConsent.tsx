"use client";

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { X, Cookie, Settings } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface CookieConsentProps {
  onPreferencesChange?: (preferences: CookiePreferences) => void;
}

const COOKIE_CONSENT_KEY = 'pailiaq-cookie-consent';
const COOKIE_PREFERENCES_KEY = 'pailiaq-cookie-preferences';

/**
 * GDPR-compliant Cookie Consent Banner
 * 
 * Features:
 * - Initial consent banner with accept all/customize options
 * - Detailed preferences modal for granular control
 * - Persistent storage of user preferences
 * - Compliance with EU Cookie Law and GDPR
 */
export default function CookieConsent({ onPreferencesChange }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    
    if (!hasConsented) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else if (savedPreferences) {
      // Load saved preferences
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
        onPreferencesChange?.(parsed);
      } catch (error) {
        console.error('Failed to parse cookie preferences:', error);
      }
    }
  }, [onPreferencesChange]);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectOptional = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    
    savePreferences(essentialOnly);
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowPreferences(true);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowPreferences(false);
    setShowBanner(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    onPreferencesChange?.(prefs);
    
    // Apply preferences to actual cookie/tracking management
    applyPreferences(prefs);
  };

  const applyPreferences = (prefs: CookiePreferences) => {
    // In a real implementation, you would:
    // - Enable/disable Google Analytics based on prefs.analytics
    // - Enable/disable marketing pixels based on prefs.marketing  
    // - Enable/disable functional cookies based on prefs.functional
    
    // For now, we'll just log the preferences
    console.log('Cookie preferences applied:', prefs);
    
    // Example: Google Analytics
    if (prefs.analytics && typeof window !== 'undefined') {
      // Enable Google Analytics
      console.log('Analytics enabled');
    }
    
    if (prefs.marketing && typeof window !== 'undefined') {
      // Enable marketing cookies
      console.log('Marketing cookies enabled');
    }
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Cookie consent banner
  if (showBanner && !showPreferences) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/20 p-4 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* Cookie icon and main text */}
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
              <div className="text-white">
                <h3 className="font-semibold mb-2">We use cookies to enhance your experience</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  We use essential cookies to make our site work. We'd also like to set optional cookies to help us improve our website and analyze how it's used. 
                  You can manage your cookie preferences or learn more in our{' '}
                  <Link to="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              <button
                onClick={handleCustomize}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-colors text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                Manage Preferences
              </button>
              
              <button
                onClick={handleRejectOptional}
                className="px-4 py-2 bg-gray-600/80 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Essential Only
              </button>
              
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cookie preferences modal
  if (showPreferences) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-[#1a1a2e] border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Cookie className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Cookie Preferences</h2>
            </div>
            <button
              onClick={() => setShowPreferences(false)}
              className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-white/80 mb-6 leading-relaxed">
            We use different types of cookies to optimize your experience on our music training platform. 
            You can choose which categories you're comfortable with, but please note that disabling some cookies may affect functionality.
          </p>

          {/* Cookie categories */}
          <div className="space-y-4 mb-8">
            {/* Essential Cookies */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Essential Cookies</h3>
                  <p className="text-sm text-white/70 mb-3">
                    Required for the website to function properly. These cookies enable core functionality like authentication, security, and accessibility features.
                  </p>
                  <p className="text-xs text-white/50">
                    Examples: Authentication tokens, security settings, accessibility preferences
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <div className="w-12 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <p className="text-xs text-green-400 mt-1 text-center">Always On</p>
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Analytics Cookies</h3>
                  <p className="text-sm text-white/70 mb-3">
                    Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                  </p>
                  <p className="text-xs text-white/50">
                    Examples: Google Analytics, page views, session duration, popular features
                  </p>
                </div>
                <button
                  onClick={() => togglePreference('analytics')}
                  className="ml-4 flex-shrink-0"
                >
                  <div className={`w-12 h-6 ${preferences.analytics ? 'bg-blue-600' : 'bg-gray-600'} rounded-full flex items-center transition-colors relative`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${preferences.analytics ? 'translate-x-7' : 'translate-x-1'}`}></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Marketing Cookies</h3>
                  <p className="text-sm text-white/70 mb-3">
                    Used to deliver personalized advertisements and track the effectiveness of marketing campaigns.
                  </p>
                  <p className="text-xs text-white/50">
                    Examples: Facebook Pixel, Google Ads, retargeting pixels
                  </p>
                </div>
                <button
                  onClick={() => togglePreference('marketing')}
                  className="ml-4 flex-shrink-0"
                >
                  <div className={`w-12 h-6 ${preferences.marketing ? 'bg-blue-600' : 'bg-gray-600'} rounded-full flex items-center transition-colors relative`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${preferences.marketing ? 'translate-x-7' : 'translate-x-1'}`}></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Functional Cookies</h3>
                  <p className="text-sm text-white/70 mb-3">
                    Enable enhanced functionality and personalization, such as remembering your preferences and settings.
                  </p>
                  <p className="text-xs text-white/50">
                    Examples: Theme preferences, volume settings, exercise configurations
                  </p>
                </div>
                <button
                  onClick={() => togglePreference('functional')}
                  className="ml-4 flex-shrink-0"
                >
                  <div className={`w-12 h-6 ${preferences.functional ? 'bg-blue-600' : 'bg-gray-600'} rounded-full flex items-center transition-colors relative`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${preferences.functional ? 'translate-x-7' : 'translate-x-1'}`}></div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pt-4 border-t border-white/20">
            <p className="text-xs text-white/60">
              Learn more about our data practices in our{' '}
              <Link to="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                Privacy Policy
              </Link>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 bg-gray-600/80 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Hook to get current cookie preferences
export function useCookiePreferences(): CookiePreferences | null {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse cookie preferences:', error);
      }
    }
  }, []);

  return preferences;
}

// Utility function to check if a specific cookie category is allowed
export function isCookieAllowed(category: keyof CookiePreferences): boolean {
  if (typeof window === 'undefined') return false;
  
  const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (!saved) return false;
  
  try {
    const preferences = JSON.parse(saved);
    return preferences[category] === true;
  } catch (error) {
    console.error('Failed to check cookie preference:', error);
    return false;
  }
}