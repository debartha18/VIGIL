import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  Building,
  Radio,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { OitUser } from '../../types/kshitij';

interface OITAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OITAdminModal: React.FC<OITAdminModalProps> = ({ isOpen, onClose }) => {
  const { user, listAdminUsers, toggleUserActive } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'security'>('users');
  const [usersList, setUsersList] = useState<OitUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await listAdminUsers();
      setUsersList(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = async (targetUser: OitUser) => {
    if (targetUser.id === user?.id) {
      setActionMessage('Cannot deactivate your own logged-in administrator account.');
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    const nextState = !targetUser.is_active;
    await toggleUserActive(targetUser.id, nextState);
    setUsersList((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: nextState } : u))
    );
    setActionMessage(`User ${targetUser.oit_user_id} set to ${nextState ? 'Active' : 'Inactive'}.`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0B1523] border border-[#182A40] rounded-2xl shadow-2xl p-6 space-y-5 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#182A40]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#A855F7]/15 border border-[#A855F7]/40 flex items-center justify-center text-[#C084FC]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
                <span>OIT Administration Console</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#C084FC] font-mono">
                  Administrator Access
                </span>
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Manage user access permissions, clearance status, and operational security
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#070D16] border border-[#182A40] hover:border-[#94A3B8] flex items-center justify-center text-[#94A3B8] hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between border-b border-[#182A40]/80 pb-2 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`h-7 px-3 rounded-lg flex items-center space-x-1.5 transition font-medium cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#0E355A] text-[#38BDF8] border border-[#0284C7]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>OIT User Registry</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`h-7 px-3 rounded-lg flex items-center space-x-1.5 transition font-medium cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-[#0E355A] text-[#38BDF8] border border-[#0284C7]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Security Protocols</span>
            </button>
          </div>

          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="h-7 px-2.5 rounded-lg bg-[#070D16] border border-[#182A40] text-[#94A3B8] hover:text-white flex items-center space-x-1 text-xs cursor-pointer"
            title="Refresh user list"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Action alert message */}
        {actionMessage && (
          <div className="p-2.5 rounded-lg bg-[#0E2A4A] border border-[#0284C7]/60 text-xs text-[#38BDF8] flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10B981]" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Content Tab 1: User Registry */}
        {activeTab === 'users' && (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            <div className="space-y-2">
              {usersList.map((u) => {
                const isAdmin = u.role === 'oit_admin';
                return (
                  <div
                    key={u.id}
                    className="p-3.5 rounded-xl bg-[#070D16] border border-[#182A40] flex items-center justify-between space-x-4"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                          isAdmin
                            ? 'bg-[#A855F7]/15 border-[#A855F7]/50 text-[#C084FC]'
                            : 'bg-[#0284C7]/15 border-[#0284C7]/50 text-[#38BDF8]'
                        }`}
                      >
                        {(u.full_name || u.name || u.username || 'User').substring(0, 2).toUpperCase()}
                      </div>

                      <div className="leading-tight truncate">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white text-xs">{u.full_name || u.name || u.username}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase ${
                              isAdmin
                                ? 'bg-[#A855F7]/20 text-[#C084FC] border border-[#A855F7]/40'
                                : 'bg-[#0284C7]/20 text-[#38BDF8] border border-[#0284C7]/40'
                            }`}
                          >
                            {isAdmin ? 'OIT Administrator' : 'OIT Analyst'}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-[#94A3B8] mt-0.5">
                          <span>{u.oit_user_id}</span>
                          <span className="mx-1 text-[#64748B]">·</span>
                          <span className="truncate">{u.email}</span>
                        </div>
                        <div className="text-[10px] text-[#64748B] flex items-center space-x-1.5 mt-0.5">
                          <Building className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{u.organization}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium flex items-center space-x-1 ${
                          u.is_active
                            ? 'bg-[#063327] text-[#10B981] border border-[#10B981]/50'
                            : 'bg-[#2D1215] text-[#EF4444] border border-[#EF4444]/50'
                        }`}
                      >
                        {u.is_active ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                        <span>{u.is_active ? 'Active' : 'Inactive'}</span>
                      </span>

                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleToggle(u)}
                          className={`h-7 px-2.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                            u.is_active
                              ? 'bg-[#2D1215]/80 hover:bg-[#451B21] border-[#EF4444]/50 text-[#EF4444]'
                              : 'bg-[#063327]/80 hover:bg-[#0E4738] border-[#10B981]/50 text-[#10B981]'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Tab 2: Security & Air-Gap Protocols */}
        {activeTab === 'security' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#070D16] border border-[#182A40] space-y-2">
              <div className="font-semibold text-white flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#10B981]" />
                <span>OIT Cryptographic & Password Policy</span>
              </div>
              <div className="space-y-1 text-[#94A3B8] leading-relaxed">
                <div>• Passwords salted with 16-byte random salt & hashed via 100,000 PBKDF2-HMAC-SHA256 iterations.</div>
                <div>• Session tokens generate with 32-byte cryptographic entropy (`secrets.token_urlsafe`).</div>
                <div>• Default active shift duration: 8 hours; Remember me duration: 30 days.</div>
                <div>• All authentication attempts recorded to tamper-evident append-only audit ledger.</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#070D16] border border-[#182A40] space-y-2">
              <div className="font-semibold text-white flex items-center space-x-2">
                <Radio className="w-4 h-4 text-[#38BDF8]" />
                <span>Role-Based Access Control (RBAC) Matrix</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-[#94A3B8]">
                <div className="flex justify-between py-1 border-b border-[#182A40]/40">
                  <span className="text-white font-medium">OIT Analyst (oit_user)</span>
                  <span>Full access to EO Search, Image Retrival, Change Detection & Dossiers</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#182A40]/40">
                  <span className="text-white font-medium">OIT Administrator (oit_admin)</span>
                  <span>User Management, Account Activation, System Security Configuration</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-[#182A40] flex items-center justify-between text-xs text-[#64748B]">
          <span className="font-mono text-[11px]">DGIS User Directory v2.4 // Air-Gapped</span>
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-lg bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-white text-xs font-medium transition cursor-pointer"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
