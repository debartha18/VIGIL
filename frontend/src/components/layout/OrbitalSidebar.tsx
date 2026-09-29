import React from 'react';
import {
  Home,
  Search,
  Globe,
  Image as ImageIcon,
  GitCompare,
  Crosshair,
  Grid,
  FileText,
  X
} from 'lucide-react';

export type OrbitalTab =
  | 'overview'
  | 'semantic-search'
  | 'satellite-map'
  | 'image-search'
  | 'change-analysis'
  | 'aoi-monitor'
  | 'archive'
  | 'audit-log';

interface OrbitalSidebarProps {
  activeTab: OrbitalTab;
  onSelectTab: (tab: OrbitalTab) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const OrbitalSidebar: React.FC<OrbitalSidebarProps> = ({
  activeTab,
  onSelectTab,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const menuItems: { id: OrbitalTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Mission Overview', icon: <Home className="w-4 h-4" /> },
    { id: 'semantic-search', label: 'Semantic Search', icon: <Search className="w-4 h-4" /> },
    { id: 'satellite-map', label: 'Satellite Altimetry Map', icon: <Globe className="w-4 h-4" /> },
    { id: 'image-search', label: 'Image Search', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'change-analysis', label: 'Change Analysis', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'aoi-monitor', label: 'AOI Monitor', icon: <Crosshair className="w-4 h-4" /> },
    { id: 'archive', label: 'Archive', icon: <Grid className="w-4 h-4" /> },
    { id: 'audit-log', label: 'Audit Log', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* 1. Desktop Permanent Sidebar (hidden on mobile, visible md+) */}
      <aside className="hidden md:flex w-56 bg-[#070D16] border-r border-[#182A40] flex-col justify-between select-none shrink-0 z-20 font-sans">
        {/* Navigation list */}
        <div className="py-4 px-2.5 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#0E355A] text-[#38BDF8] border border-[#0284C7]/60 shadow-[0_0_12px_rgba(2,132,199,0.25)]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1A2B]/60'
                }`}
              >
                <span className={isActive ? 'text-[#38BDF8]' : 'text-[#64748B]'}>
                  {item.icon}
                </span>
                <span className="tracking-normal">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Footer Quote with Satellite Graphic */}
        <div className="p-4 border-t border-[#182A40]/70 flex items-center space-x-3">
          <div className="text-[#64748B] shrink-0">
            {/* Stylized Satellite Icon */}
            <svg className="w-6 h-6 text-[#475569]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M13 7 9 3 5 7l4 4" />
              <path d="m17 11 4 4-4 4-4-4" />
              <path d="m8 12 4 4" />
              <path d="m16 8-4-4" />
              <path d="M12 12 9 15" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
          <div className="text-[11px] leading-tight text-[#64748B]">
            <span className="block font-semibold text-[#94A3B8]">Space Intelligence</span>
            <span>for a safer tomorrow</span>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Slide-in Drawer with Backdrop (visible only < md when opened) */}
      {/* Backdrop Overlay */}
      <div
        onClick={onCloseMobile}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Panel */}
      <div
        className={`fixed inset-y-0 left-0 w-64 max-w-[82vw] bg-[#070D16] border-r border-[#182A40] flex flex-col justify-between select-none z-50 md:hidden font-sans shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Drawer Header with Logo & Close Button */}
        <div className="h-16 px-4 border-b border-[#182A40] flex items-center justify-between shrink-0 bg-[#070E18]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 flex items-center justify-center text-[#00E5FF]">
              <svg className="w-7 h-7 text-[#00E5FF]" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="11" fill="#0E2238" stroke="#00E5FF" strokeWidth="1.8" />
                <path
                  d="M6 18C6 24.6274 11.3726 30 18 30C24.6274 30 30 24.6274 30 18C30 11.3726 24.6274 6 18 6"
                  stroke="#00E5FF"
                  strokeWidth="1.8"
                  strokeDasharray="4 2"
                />
                <ellipse cx="18" cy="18" rx="16" ry="5.5" transform="rotate(-25 18 18)" stroke="#22D3EE" strokeWidth="1.6" />
                <circle cx="28" cy="12" r="2.2" fill="#00E5FF" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide">VIGIL</div>
              <div className="text-[10px] text-[#22D3EE] font-mono leading-none">Orbital Intelligence</div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="w-8 h-8 rounded-lg bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-[#94A3B8] hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Navigation List */}
        <div className="py-4 px-3 space-y-1.5 overflow-y-auto flex-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center space-x-3.5 px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#0E355A] text-[#38BDF8] border border-[#0284C7]/60 shadow-[0_0_12px_rgba(2,132,199,0.25)]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1A2B]/60'
                }`}
              >
                <span className={isActive ? 'text-[#38BDF8]' : 'text-[#64748B]'}>
                  {item.icon}
                </span>
                <span className="tracking-normal">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Drawer Footer Quote */}
        <div className="p-4 border-t border-[#182A40]/70 flex items-center space-x-3 shrink-0 bg-[#070E18]">
          <div className="text-[#64748B] shrink-0">
            <svg className="w-6 h-6 text-[#475569]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M13 7 9 3 5 7l4 4" />
              <path d="m17 11 4 4-4 4-4-4" />
              <path d="m8 12 4 4" />
              <path d="m16 8-4-4" />
              <path d="M12 12 9 15" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
          <div className="text-[11px] leading-tight text-[#64748B]">
            <span className="block font-semibold text-[#94A3B8]">Space Intelligence</span>
            <span>for a safer tomorrow</span>
          </div>
        </div>
      </div>
    </>
  );
};
