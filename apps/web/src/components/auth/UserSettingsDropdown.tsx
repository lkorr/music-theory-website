/**
 * User Settings Dropdown Component
 * 
 * Dropdown menu for authenticated users with settings and logout options
 * Includes ability to change display name
 */

import { useState, useRef, useEffect } from 'react';
import { Link } from "react-router";
import { useAuth } from "./ProtectedRoute";

interface UserSettingsDropdownProps {
  className?: string;
  compact?: boolean;
}

interface NameChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (newName: string) => void;
}

/**
 * Modal for changing user's display name
 */
function NameChangeModal({ isOpen, onClose, currentName, onSave }: NameChangeModalProps) {
  const [newName, setNewName] = useState(currentName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName || '');
      setError(null);
    }
  }, [isOpen, currentName]);

  const handleSave = async () => {
    if (!newName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    if (newName.trim().length > 50) {
      setError('Name must be 50 characters or less');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName.trim()
        }),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update name');
      }

      onSave(newName.trim());
      onClose();
    } catch (error) {
      console.error('Error updating name:', error);
      setError(error instanceof Error ? error.message : 'Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Change Display Name</h2>
        
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
            Display Name
          </label>
          <input
            id="name"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your display name"
            maxLength={50}
            disabled={isSaving}
          />
          <p className="text-xs text-slate-400 mt-1">
            This name will appear on leaderboards (max 50 characters)
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !newName.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * User Settings Dropdown Component
 */
export default function UserSettingsDropdown({ className = "", compact = false }: UserSettingsDropdownProps) {
  const authState = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = authState.user;

  // Initialize current name from user data
  useEffect(() => {
    if (user) {
      setCurrentName(user.name || '');
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Refresh page to clear auth state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Still refresh on error to clear local state
      window.location.href = '/';
    }
  };

  const handleNameSave = (newName: string) => {
    setCurrentName(newName);
    // Update the user object in auth state if possible
    if (authState.user) {
      authState.user.name = newName;
    }
  };

  if (authState.isLoading) {
    return (
      <div className={`animate-pulse bg-white/10 rounded-lg ${compact ? 'w-16 h-8' : 'w-20 h-10'} ${className}`} />
    );
  }

  if (!authState.isAuthenticated || !user) {
    return null;
  }

  const displayName = currentName || user.email?.split('@')[0] || 'User';

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center justify-center ${compact ? 'w-8 h-8' : 'w-10 h-10'} bg-blue-600/80 backdrop-blur-md rounded-lg text-white hover:bg-blue-600 transition-all duration-300 border border-blue-500/50 ${className}`}
          title="Settings"
        >
          <svg 
            className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50">
            <div className="py-1">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-slate-700">
                <p className="text-sm font-medium text-white truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>

              {/* Menu Items */}
              <Link
                to="/account"
                className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account
              </Link>


              <div className="border-t border-slate-700 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <NameChangeModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        currentName={currentName}
        onSave={handleNameSave}
      />
    </>
  );
}