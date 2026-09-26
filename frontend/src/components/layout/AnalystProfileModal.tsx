import React, { useState } from 'react';
import { useAnalyst, AnalystProfile } from '../../context/AnalystContext';
import { X, UserCheck, Save, RotateCcw, Building } from 'lucide-react';

export const AnalystProfileModal: React.FC = () => {
  const { profile, updateProfile, resetProfile, isProfileModalOpen, setIsProfileModalOpen } = useAnalyst();

  const [formData, setFormData] = useState<AnalystProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Keep form data synced when opened
  React.useEffect(() => {
    if (isProfileModalOpen) {
      setFormData(profile);
      setSavedSuccess(false);
    }
  }, [isProfileModalOpen, profile]);

  if (!isProfileModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsProfileModalOpen(false);
    }, 900);
  };

  const handleReset = () => {
    resetProfile();
    setIsProfileModalOpen(false);
  };

  // Initials generator
  const initials = (formData.name || 'Analyst')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-[#0B1523] border border-[#182A40] rounded-2xl shadow-2xl overflow-hidden font-sans text-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="h-16 bg-[#070D16] border-b border-[#182A40] px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#0E355A] border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Operator Profile & Credentials</h2>
              <p className="text-xs text-[#94A3B8]">
                Personalize your operator identity across the console and audit logs
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="w-8 h-8 rounded-lg bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-[#94A3B8] hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="p-6 bg-[#09121E] border-b border-[#182A40] flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-[#0E2238] border-2 border-[#00E5FF] flex items-center justify-center text-lg font-bold font-mono text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.35)]">
                {initials || 'A'}
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-[#09121E]" title="Active on Watch" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-white">{formData.name || 'Unnamed Analyst'}</span>
                <span className="px-2 py-0.5 rounded bg-[#0E355A] border border-[#00E5FF]/40 text-[10px] font-mono text-[#38BDF8]">
                  {formData.callSign || 'CALL-SIGN'}
                </span>
              </div>
              <div className="text-xs text-[#22D3EE] font-medium mt-0.5">{formData.role || 'Imagery Intelligence'}</div>
              <div className="text-[11px] text-[#64748B] mt-0.5 flex items-center space-x-1.5">
                <Building className="w-3 h-3 text-[#64748B]" />
                <span className="truncate max-w-xs">{formData.department}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded bg-[#063327] border border-[#10B981]/50 text-[10px] font-mono text-[#10B981] font-semibold">
              {formData.clearance}
            </span>
            <div className="text-[10px] text-[#64748B] mt-1 font-mono">STATUS: ACTIVE</div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Operator Full Name */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B] mb-1.5 font-medium">
                Your Full Name / Rank
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Debarghya or Major A. Sen"
                className="w-full bg-[#070D16] border border-[#182A40] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-sm text-white placeholder-[#475569] outline-none transition"
              />
              <span className="text-[10px] text-[#64748B] mt-1 block">
                This name will replace "Analyst" in the top right corner.
              </span>
            </div>

            {/* Operational Call Sign / Service ID */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B] mb-1.5 font-medium">
                Service Call Sign / ID
              </label>
              <input
                type="text"
                value={formData.callSign}
                onChange={(e) => setFormData({ ...formData, callSign: e.target.value })}
                placeholder="e.g. DGIS-IMINT-01"
                className="w-full bg-[#070D16] border border-[#182A40] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-[#475569] outline-none transition"
              />
              <span className="text-[10px] text-[#64748B] mt-1 block">
                Used in cryptographic signing of candidate reviews.
              </span>
            </div>

            {/* Specialization / Role */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B] mb-1.5 font-medium">
                Operational Role
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Imagery Intelligence (IMINT)"
                className="w-full bg-[#070D16] border border-[#182A40] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-sm text-white placeholder-[#475569] outline-none transition"
              />
            </div>

            {/* Security Clearance */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B] mb-1.5 font-medium">
                Security Clearance Level
              </label>
              <select
                value={formData.clearance}
                onChange={(e) => setFormData({ ...formData, clearance: e.target.value })}
                className="w-full bg-[#070D16] border border-[#182A40] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-sm text-white outline-none transition cursor-pointer"
              >
                <option value="SECRET // NOFORN">SECRET // NOFORN</option>
                <option value="TOP SECRET // DEFENCE">TOP SECRET // DEFENCE</option>
                <option value="RESTRICTED // SIH26227">RESTRICTED // SIH26227</option>
                <option value="OFFICIAL-USE ONLY">OFFICIAL-USE ONLY</option>
              </select>
            </div>
          </div>

          {/* Department / Directorate */}
          <div>
            <label className="block text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B] mb-1.5 font-medium">
              Department / Directorate
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g. Directorate General of Information Systems (DGIS)"
              className="w-full bg-[#070D16] border border-[#182A40] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-sm text-white placeholder-[#475569] outline-none transition"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#182A40]">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 rounded-lg bg-[#0E1A2B] hover:bg-[#15273F] text-[#94A3B8] hover:text-white border border-[#182A40] text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[#94A3B8] hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#00E5FF] hover:bg-[#38BDF8] text-[#070D16] font-semibold text-xs flex items-center space-x-2 transition shadow-[0_0_15px_rgba(0,229,255,0.35)] cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savedSuccess ? 'Saved Successfully!' : 'Save & Apply Name'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
