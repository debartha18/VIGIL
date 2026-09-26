import React from 'react';
import { ShieldCheck, User, Edit3 } from 'lucide-react';
import { useAnalyst } from '../../context/AnalystContext';

export const OrbitalHeader: React.FC = () => {
  const { profile, setIsProfileModalOpen } = useAnalyst();

  const initials = (profile.name || 'Analyst')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 bg-[#070D16] border-b border-[#182A40] px-5 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Orbital Intel Logo & Subtitle */}
      <div className="flex items-center space-x-3.5">
        <div className="relative flex items-center justify-center w-10 h-10">
          {/* Custom Orbital Globe Icon */}
          <svg className="w-9 h-9 text-[#00E5FF]" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="11" fill="#0E2238" stroke="#00E5FF" strokeWidth="1.8" />
            <path
              d="M6 18C6 24.6274 11.3726 30 18 30C24.6274 30 30 24.6274 30 18C30 11.3726 24.6274 6 18 6"
              stroke="#00E5FF"
              strokeWidth="1.8"
              strokeDasharray="4 2"
            />
            {/* Elliptical Orbit Ring */}
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
          <h1 className="text-lg font-bold text-white flex items-center space-x-2 font-sans tracking-tight">
            <span>Orbital Intel</span>
          </h1>
          <p className="text-[11px] font-normal leading-tight text-[#22D3EE] font-sans">
            Semantic retrieval & multi-temporal<br />
            change analysis of satellite imagery
          </p>
        </div>
      </div>

      {/* Middle-Left: Ministry of Defence / SIH26227 DGIS Emblem */}
      <div className="flex items-center space-x-3 pl-8 border-l border-[#182A40]/80">
        {/* National Emblem SVG */}
        <div className="w-8 h-8 flex items-center justify-center">
          <svg className="w-7 h-7 text-[#E2E8F0]" viewBox="0 0 24 24" fill="currentColor">
            {/* Ashoka Stambh stylized silhouette */}
            <path d="M12 2C10.89 2 10 2.89 10 4V6H7V8H17V6H14V4C14 2.89 13.11 2 12 2ZM6 9V11H18V9H6ZM7 12C6.45 12 6 12.45 6 13V18H9V14H15V18H18V13C18 12.45 17.55 12 17 12H7ZM5 19V21H19V19H5Z" />
          </svg>
        </div>

        <div className="text-left">
          <div className="text-xs font-bold text-white tracking-wide">
            SIH26227 &nbsp;•&nbsp; DGIS
          </div>
          <div className="text-[11px] text-[#94A3B8]">
            Ministry of Defence
          </div>
        </div>
      </div>

      {/* Right side containers */}
      <div className="flex items-center space-x-4">
        {/* Prototype / Demonstration Notice */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#0F2238] border border-[#1E3A5F] text-[10px] font-mono text-[#38BDF8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
          <span>Prototype // SIH26227 Demonstration</span>
        </div>

        {/* On-Premise Ready Badge */}
        <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-md bg-[#0B1D28] border border-[#144A3F]">
          <div className="w-6 h-6 rounded bg-[#063327] flex items-center justify-center text-[#10B981]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-left leading-tight">
            <div className="text-[11px] font-bold text-[#10B981] tracking-wide">
              On-Premise Ready
            </div>
            <div className="text-[10px] text-[#94A3B8]">
              Secure &nbsp;•&nbsp; Isolated &nbsp;•&nbsp; Deployable on Defence Network
            </div>
          </div>
        </div>

        {/* Clickable Analyst Profile Badge */}
        <div
          onClick={() => setIsProfileModalOpen(true)}
          className="group relative flex items-center space-x-3 pl-3 border-l border-[#182A40] cursor-pointer hover:opacity-95 transition"
          title="Click to edit your operator details (Name, Call Sign, Role, Department)"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-[#0E1A2B] border-2 border-[#00E5FF]/70 group-hover:border-[#00E5FF] flex items-center justify-center text-[#00E5FF] font-mono font-bold text-xs shadow-[0_0_10px_rgba(0,229,255,0.2)] transition">
              {initials || <User className="w-4 h-4" />}
            </div>
            {/* Active beacon indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#070D16]" />
          </div>

          <div className="text-left leading-tight">
            <div className="text-xs font-semibold text-white group-hover:text-[#00E5FF] transition flex items-center space-x-1.5">
              <span className="truncate max-w-[130px]">{profile.name || 'Analyst'}</span>
              <Edit3 className="w-3 h-3 text-[#64748B] group-hover:text-[#00E5FF] opacity-0 group-hover:opacity-100 transition" />
            </div>
            <div className="text-[10px] text-[#94A3B8] truncate max-w-[130px]">
              {profile.role || 'Imagery Intelligence'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
