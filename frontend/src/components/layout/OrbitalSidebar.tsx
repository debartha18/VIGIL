import React from 'react';
import {
  Home,
  Search,
  Image as ImageIcon,
  GitCompare,
  Crosshair,
  Grid,
  FileText
} from 'lucide-react';

export type OrbitalTab =
  | 'overview'
  | 'semantic-search'
  | 'image-search'
  | 'change-analysis'
  | 'aoi-monitor'
  | 'archive'
  | 'audit-log';

interface OrbitalSidebarProps {
  activeTab: OrbitalTab;
  onSelectTab: (tab: OrbitalTab) => void;
}

export const OrbitalSidebar: React.FC<OrbitalSidebarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const menuItems: { id: OrbitalTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Mission Overview', icon: <Home className="w-4 h-4" /> },
    { id: 'semantic-search', label: 'Semantic Search', icon: <Search className="w-4 h-4" /> },
    { id: 'image-search', label: 'Image Search', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'change-analysis', label: 'Change Analysis', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'aoi-monitor', label: 'AOI Monitor', icon: <Crosshair className="w-4 h-4" /> },
    { id: 'archive', label: 'Archive', icon: <Grid className="w-4 h-4" /> },
    { id: 'audit-log', label: 'Audit Log', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-56 bg-[#070D16] border-r border-[#182A40] flex flex-col justify-between select-none shrink-0 z-20 font-sans">
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
  );
};
