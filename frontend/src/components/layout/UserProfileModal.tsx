import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Building,
  Globe,
  Shield,
  Save,
  CheckCircle2,
  Calendar,
  Lock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [country, setCountry] = useState(user?.country || '');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || user.name || '');
      setOrganization(user.organization || '');
      setCountry(user.country || '');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const initials = (user.full_name || user.username || 'User')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isAdmin = user.role === 'admin' || user.role === 'oit_admin';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFeedback({ type: 'error', message: 'Full name cannot be empty.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const ok = await updateProfile({
        full_name: fullName.trim(),
        organization: organization.trim(),
        country: country.trim()
      });

      if (ok) {
        setFeedback({ type: 'success', message: 'Profile updated successfully.' });
        setTimeout(() => {
          setFeedback(null);
          onClose();
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: 'Failed to update profile. Please try again.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error updating profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recently';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#0B1523] border border-[#182A40] rounded-2xl shadow-2xl overflow-hidden font-sans text-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="h-16 bg-[#070D16] border-b border-[#182A40] px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#0E355A] border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">User Profile & Account</h2>
              <p className="text-xs text-[#94A3B8]">
                Manage your VIGIL personal information and platform details
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-[#94A3B8] hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Identity Banner */}
        <div className="p-6 bg-[#09121E] border-b border-[#182A40] flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-mono shadow-md border-2 ${
                  isAdmin
                    ? 'bg-[#A855F7]/15 border-[#A855F7] text-[#C084FC] shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-[#0E2238] border-[#00E5FF] text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                }`}
              >
                {initials}
              </div>
              <span
                className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-[#09121E]"
                title="Active Session"
              />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-white">{user.full_name || user.username}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                    isAdmin
                      ? 'bg-[#A855F7]/20 border border-[#A855F7]/50 text-[#C084FC]'
                      : 'bg-[#0284C7]/20 border border-[#0284C7]/50 text-[#38BDF8]'
                  }`}
                >
                  {isAdmin ? 'Administrator' : 'Standard User'}
                </span>
              </div>
              <div className="text-xs text-[#94A3B8] mt-0.5 flex items-center space-x-2">
                <span>@{user.username}</span>
                <span>•</span>
                <span>{user.email}</span>
              </div>
              <div className="text-[11px] text-[#64748B] mt-1 flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {formatDate(user.created_at)}</span>
                </span>
                {user.country && (
                  <span className="flex items-center space-x-1">
                    <Globe className="w-3 h-3" />
                    <span>{user.country}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#063327] border border-[#10B981]/50 text-[10px] font-mono text-[#10B981] font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              <span>Status: Active</span>
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {feedback && (
            <div
              className={`p-3 rounded-xl border flex items-center space-x-2.5 text-xs font-sans ${
                feedback.type === 'success'
                  ? 'bg-[#063327]/60 border-[#10B981]/40 text-[#10B981]'
                  : 'bg-[#2D1215]/60 border-[#EF4444]/40 text-[#EF4444]'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Full Name <span className="text-[#00E5FF]">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full h-9 px-3 rounded-lg bg-[#070D16] border border-[#182A40] text-white text-xs font-sans placeholder-[#475569] focus:outline-none focus:border-[#00E5FF] transition"
              />
            </div>

            {/* Username (read-only) */}
            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1.5 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Username (Permanent)</span>
              </label>
              <input
                type="text"
                value={user.username}
                disabled
                className="w-full h-9 px-3 rounded-lg bg-[#070D16]/60 border border-[#182A40]/50 text-[#64748B] text-xs font-mono cursor-not-allowed"
              />
            </div>

            {/* Email Address (read-only) */}
            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1.5 flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span>Email Address (Verified)</span>
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full h-9 px-3 rounded-lg bg-[#070D16]/60 border border-[#182A40]/50 text-[#64748B] text-xs font-mono cursor-not-allowed"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1.5 flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>System Role</span>
              </label>
              <input
                type="text"
                value={isAdmin ? 'Administrator (Full Access)' : 'Standard User (General Access)'}
                disabled
                className="w-full h-9 px-3 rounded-lg bg-[#070D16]/60 border border-[#182A40]/50 text-[#64748B] text-xs font-sans cursor-not-allowed"
              />
            </div>

            {/* Organization */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5 flex items-center space-x-1">
                <Building className="w-3 h-3 text-[#38BDF8]" />
                <span>Organization / University</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Earth Observation Lab, IIT"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-[#070D16] border border-[#182A40] text-white text-xs font-sans placeholder-[#475569] focus:outline-none focus:border-[#00E5FF] transition"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5 flex items-center space-x-1">
                <Globe className="w-3 h-3 text-[#38BDF8]" />
                <span>Country / Region</span>
              </label>
              <input
                type="text"
                placeholder="e.g. India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-[#070D16] border border-[#182A40] text-white text-xs font-sans placeholder-[#475569] focus:outline-none focus:border-[#00E5FF] transition"
              />
            </div>
          </div>

          {/* Account Security Information Note */}
          <div className="p-3 bg-[#070D16]/60 rounded-xl border border-[#182A40] flex items-start space-x-2.5 text-xs text-[#94A3B8]">
            <Sparkles className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              Your account password is secured using industry-standard salted PBKDF2-HMAC-SHA256 hashing. Passwords are never transmitted in clear text or stored unencrypted.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-[#94A3B8] hover:text-white text-xs font-medium cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="h-9 px-5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#00E5FF] hover:from-[#0369A1] hover:to-[#00B4D8] text-black font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-[#00E5FF]/20 cursor-pointer transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-black" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
