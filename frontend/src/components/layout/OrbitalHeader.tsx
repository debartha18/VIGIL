import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  LogOut,
  Settings,
  ShieldAlert,
  ChevronDown,
  UserCheck,
  Menu,
  Bot
} from 'lucide-react';
import { useAnalyst } from '../../context/AnalystContext';
import { useAuth } from '../../context/AuthContext';
import { OITAdminModal } from './OITAdminModal';
import { UserProfileModal } from './UserProfileModal';

interface OrbitalHeaderProps {
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
  onToggleNav?: () => void;
  isNavOpen?: boolean;
}

export const OrbitalHeader: React.FC<OrbitalHeaderProps> = ({ onOpenAuth, onToggleNav, isNavOpen = false }) => {
  const { profile, setIsProfileModalOpen } = useAnalyst();
  const { user, isAuthenticated, logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.full_name || user?.name || profile.name || 'Analyst';
  const displayId = user?.username ? `@${user.username}` : (user?.oit_user_id || 'USR-2026');
  const role = user?.role || 'user';
  const isAdmin = role === 'admin' || role === 'oit_admin';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    setShowLogoutConfirm(false);
    await logout();
  };

  return (
    <header className="h-14 bg-surface border-b border-border px-3 sm:px-5 flex items-center justify-between select-none z-30 shrink-0 font-sans">
      {/* Left: Three-line Hamburger Button + Orbital Intel Logo & Subtitle */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Three-line Hamburger Button (Desktop & Mobile) */}
        <button
          type="button"
          onClick={onToggleNav}
          className="p-1.5 sm:p-2 -ml-1 rounded-md text-text-2 hover:text-text hover:bg-raised transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer flex items-center justify-center"
          aria-label={isNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isNavOpen}
          title={isNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <Menu className="w-5 h-5 text-accent stroke-[2.2]" />
        </button>

        <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 shrink-0">
          {/* Custom Orbital Globe Icon */}
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-accent" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="11" fill="var(--raised)" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M6 18C6 24.6274 11.3726 30 18 30C24.6274 30 30 24.6274 30 18C30 11.3726 24.6274 6 18 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeDasharray="4 2"
            />
            <ellipse
              cx="18"
              cy="18"
              rx="16"
              ry="5.5"
              transform="rotate(-25 18 18)"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <circle cx="28" cy="12" r="2.2" fill="currentColor" />
          </svg>
        </div>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-text flex items-center space-x-2 font-sans tracking-tight">
            <span>Orbital Intel</span>
          </h1>
          <p className="hidden sm:block text-[11px] font-normal leading-tight text-text-2 font-sans">
            Semantic retrieval & multi-temporal change analysis of satellite imagery
          </p>
        </div>
      </div>

      {/* Right side: Authenticated User Badge & Dropdown or Public Sign In/Up */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Launch Orbital Intel AI Button */}
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-orbital-ai'));
          }}
          className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#0E2238] hover:bg-[#122B48] border border-[#00E5FF]/40 hover:border-[#00E5FF] text-[#00E5FF] transition cursor-pointer text-xs font-mono font-medium shadow-sm hover:shadow-[0_0_12px_rgba(0,229,255,0.3)] active:scale-95"
          title="Open Orbital Intel AI Copilot"
        >
          <Bot className="w-3.5 h-3.5 animate-pulse text-[#00E5FF]" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="group relative flex items-center space-x-3 cursor-pointer hover:opacity-95 transition"
              title="Click to view user account, profile, and session options"
            >
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-mono font-semibold text-xs transition border border-border bg-raised text-accent shadow-subtle"
                >
                  {initials || <User className="w-4 h-4" />}
                </div>
                {/* Active beacon indicator */}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-ok border border-surface" />
              </div>

              <div className="text-left leading-tight">
                <div className="text-xs font-medium text-text group-hover:text-accent transition flex items-center space-x-1.5">
                  <span className="truncate max-w-[120px]">{displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-text-2 group-hover:text-text transition" />
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="text-[10px] font-mono text-text-2">{displayId}</span>
                  <span
                    className="text-[9px] px-1 py-0.2 rounded font-mono font-medium uppercase bg-raised text-text-2 border border-border"
                  >
                    {isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
              </div>
            </div>

            {/* User Account Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-11 w-64 bg-surface border border-border rounded-md shadow-subtle py-1.5 z-50 text-xs font-sans animate-in fade-in duration-150">
                {/* User Identity Info Header */}
                <div className="px-3.5 py-2 border-b border-border space-y-1">
                  <div className="font-semibold text-text text-xs">{displayName}</div>
                  <div className="text-[11px] font-mono text-text-2">{user?.email || 'user@orbitalintel.io'}</div>
                  <div className="flex items-center space-x-2 pt-1">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-raised text-text-2 border border-border"
                    >
                      {isAdmin ? 'Administrator' : 'Standard User'}
                    </span>
                    <span className="text-[10px] text-ok font-mono bg-raised px-1.5 py-0.5 rounded border border-border">
                      Active Session
                    </span>
                  </div>
                </div>

                {/* Menu Actions */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsUserProfileModalOpen(true);
                    }}
                    className="w-full px-3.5 py-1.5 hover:bg-raised text-left flex items-center space-x-2.5 text-text-2 hover:text-text transition cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-accent" />
                    <span>User Profile & Account</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full px-3.5 py-1.5 hover:bg-raised text-left flex items-center space-x-2.5 text-text-2 hover:text-text transition cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-accent" />
                    <span>Operator Clearance (DGIS)</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsAdminModalOpen(true);
                      }}
                      className="w-full px-3.5 py-1.5 hover:bg-raised text-left flex items-center space-x-2.5 text-accent hover:text-text transition cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-accent" />
                      <span>Administration Console</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsUserProfileModalOpen(true);
                    }}
                    className="w-full px-3.5 py-1.5 hover:bg-raised text-left flex items-center space-x-2.5 text-text-2 hover:text-text transition cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-text-2" />
                    <span>Workstation Settings</span>
                  </button>
                </div>

                {/* Sign Out Option */}
                <div className="pt-1 border-t border-border">
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full px-3.5 py-1.5 hover:bg-raised text-left flex items-center space-x-2.5 text-flag transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenAuth?.('signin')}
              className="h-8 px-2.5 sm:px-3 rounded bg-surface hover:bg-raised border border-border text-xs font-medium text-text hover:text-accent transition cursor-pointer flex items-center space-x-1.5 shrink-0"
            >
              <User className="w-3.5 h-3.5 text-text-2" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => onOpenAuth?.('signup')}
              className="hidden sm:inline-flex h-8 px-3.5 rounded bg-accent hover:bg-accent/90 text-xs font-semibold text-[#0E1116] transition cursor-pointer shadow-subtle shrink-0"
            >
              <span>Create Account</span>
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="w-80 bg-surface border border-border rounded-md p-5 space-y-4 shadow-subtle text-text"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-raised border border-border flex items-center justify-center text-flag">
                <LogOut className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="font-semibold text-sm">Sign Out from Orbital Intel?</div>
                <div className="text-[11px] text-text-2">Your session will be terminated.</div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="h-7 px-3 rounded bg-surface border border-border text-text-2 hover:text-text text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="h-7 px-3.5 rounded bg-flag hover:bg-flag/90 text-white text-xs font-medium cursor-pointer transition shadow-subtle"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
      />

      {/* Admin User Management Modal */}
      {isAdminModalOpen && (
        <OITAdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />
      )}
    </header>
  );
};
