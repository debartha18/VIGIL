import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  LogOut,
  Settings,
  ShieldAlert,
  ChevronDown,
  UserCheck,
  Menu
} from 'lucide-react';
import { useAnalyst } from '../../context/AnalystContext';
import { useAuth } from '../../context/AuthContext';
import { OITAdminModal } from './OITAdminModal';
import { UserProfileModal } from './UserProfileModal';

interface OrbitalHeaderProps {
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
  onToggleMobileNav?: () => void;
}

export const OrbitalHeader: React.FC<OrbitalHeaderProps> = ({ onOpenAuth, onToggleMobileNav }) => {
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
    <header className="h-16 bg-[#070D16] border-b border-[#182A40] px-3 sm:px-5 flex items-center justify-between select-none z-30 shrink-0 font-sans">
      {/* Left: Mobile Drawer Trigger + Orbital Intel Logo & Subtitle */}
      <div className="flex items-center space-x-2 sm:space-x-3.5">
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="md:hidden p-2 -ml-1 rounded-lg text-slate-300 hover:text-white hover:bg-[#182A40] transition-colors focus:outline-none"
          aria-label="Toggle navigation drawer"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-[#00E5FF]" />
        </button>

        <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 shrink-0">
          {/* Custom Orbital Globe Icon */}
          <svg className="w-8 h-8 sm:w-9 sm:h-9 text-[#00E5FF]" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="11" fill="#0E2238" stroke="#00E5FF" strokeWidth="1.8" />
            <path
              d="M6 18C6 24.6274 11.3726 30 18 30C24.6274 30 30 24.6274 30 18C30 11.3726 24.6274 6 18 6"
              stroke="#00E5FF"
              strokeWidth="1.8"
              strokeDasharray="4 2"
            />
            <ellipse
              cx="18"
              cy="18"
              rx="16"
              ry="5.5"
              transform="rotate(-25 18 18)"
              stroke="#22D3EE"
              strokeWidth="1.6"
            />
            <circle cx="28" cy="12" r="2.2" fill="#00E5FF" />
          </svg>
        </div>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2 font-sans tracking-tight">
            <span>Orbital Intel</span>
          </h1>
          <p className="hidden sm:block text-[11px] font-normal leading-tight text-[#22D3EE] font-sans">
            Semantic retrieval & multi-temporal<br />
            change analysis of satellite imagery
          </p>
        </div>
      </div>

      {/* Right side: Authenticated User Badge & Dropdown or Public Sign In/Up */}
      <div className="flex items-center space-x-3">
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="group relative flex items-center space-x-3 cursor-pointer hover:opacity-95 transition"
              title="Click to view user account, profile, and session options"
            >
              <div className="relative">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs shadow-md transition border-2 ${
                    isAdmin
                      ? 'bg-[#A855F7]/15 border-[#A855F7] text-[#C084FC] shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                      : 'bg-[#0E1A2B] border-[#00E5FF] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                  }`}
                >
                  {initials || <User className="w-4 h-4" />}
                </div>
                {/* Active beacon indicator */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#070D16]" />
              </div>

              <div className="text-left leading-tight">
                <div className="text-xs font-semibold text-white group-hover:text-[#38BDF8] transition flex items-center space-x-1.5">
                  <span className="truncate max-w-[120px]">{displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B] group-hover:text-white transition" />
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="text-[10px] font-mono text-[#94A3B8]">{displayId}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono font-medium uppercase ${
                      isAdmin
                        ? 'bg-[#A855F7]/20 text-[#C084FC] border border-[#A855F7]/40'
                        : 'bg-[#0284C7]/20 text-[#38BDF8] border border-[#0284C7]/40'
                    }`}
                  >
                    {isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
              </div>
            </div>

            {/* User Account Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-12 w-64 bg-[#0B1523] border border-[#182A40] rounded-xl shadow-2xl py-2 z-50 text-xs font-sans animate-in fade-in duration-150">
                {/* User Identity Info Header */}
                <div className="px-3.5 py-2.5 border-b border-[#182A40]/80 space-y-1">
                  <div className="font-semibold text-white text-xs">{displayName}</div>
                  <div className="text-[11px] font-mono text-[#94A3B8]">{user?.email || 'user@vigil.org'}</div>
                  <div className="flex items-center space-x-2 pt-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        isAdmin
                          ? 'bg-[#A855F7]/20 text-[#C084FC] border border-[#A855F7]/50'
                          : 'bg-[#0284C7]/20 text-[#38BDF8] border border-[#0284C7]/50'
                      }`}
                    >
                      {isAdmin ? 'Administrator' : 'Standard User'}
                    </span>
                    <span className="text-[10px] text-[#10B981] font-mono bg-[#063327] px-1.5 py-0.5 rounded border border-[#10B981]/40">
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
                    className="w-full px-3.5 py-2 hover:bg-[#0E1A2B] text-left flex items-center space-x-2.5 text-[#94A3B8] hover:text-white transition cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>User Profile & Account</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full px-3.5 py-2 hover:bg-[#0E1A2B] text-left flex items-center space-x-2.5 text-[#94A3B8] hover:text-white transition cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Operator Clearance (DGIS)</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsAdminModalOpen(true);
                      }}
                      className="w-full px-3.5 py-2 hover:bg-[#0E1A2B] text-left flex items-center space-x-2.5 text-[#C084FC] hover:text-white transition cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-[#A855F7]" />
                      <span>Administration Console</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsUserProfileModalOpen(true);
                    }}
                    className="w-full px-3.5 py-2 hover:bg-[#0E1A2B] text-left flex items-center space-x-2.5 text-[#94A3B8] hover:text-white transition cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Workstation Settings</span>
                  </button>
                </div>

                {/* Sign Out Option */}
                <div className="pt-1 border-t border-[#182A40]/80">
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full px-3.5 py-2 hover:bg-[#2D1215]/60 text-left flex items-center space-x-2.5 text-[#EF4444] transition cursor-pointer"
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
              className="h-8 px-2.5 sm:px-3 rounded-lg bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-xs font-semibold text-white hover:text-[#00E5FF] transition cursor-pointer flex items-center space-x-1.5 shrink-0"
            >
              <User className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => onOpenAuth?.('signup')}
              className="hidden sm:inline-flex h-8 px-3.5 rounded-lg bg-gradient-to-r from-[#0284C7] to-[#00E5FF] hover:from-[#0369A1] hover:to-[#00B4D8] text-xs font-semibold text-black transition cursor-pointer shadow-md shadow-[#00E5FF]/20 shrink-0"
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
            className="w-80 bg-[#0B1523] border border-[#182A40] rounded-xl p-5 space-y-4 shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444]">
                <LogOut className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="font-semibold text-sm">Sign Out from VIGIL?</div>
                <div className="text-[11px] text-[#94A3B8]">Your OIT session will be terminated.</div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="h-7 px-3 rounded-lg bg-[#0E1A2B] text-[#94A3B8] hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="h-7 px-3.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-medium cursor-pointer transition shadow"
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
