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
  ShieldAlert,
  X
} from 'lucide-react';

export type OrbitalTab =
  | 'overview'
  | 'semantic-search'
  | 'border-analysis'
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
    { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" /> },
    { id: 'semantic-search', label: 'Semantic Search', icon: <Search className="w-4 h-4" /> },
    { id: 'border-analysis', label: 'Geospatial Analysis', icon: <ShieldAlert className="w-4 h-4" /> },
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
      <aside className="hidden md:flex w-56 bg-surface border-r border-border flex-col justify-between select-none shrink-0 z-20 font-sans">
        {/* Navigation list */}
        <div className="py-3 px-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded text-xs transition cursor-pointer ${
                  isActive
                    ? 'bg-raised text-accent font-medium border border-border shadow-subtle'
                    : 'text-text-2 hover:text-text hover:bg-raised/60'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-accent' : 'text-text-2'}`}>
                  {item.icon}
                </span>
                <span className="tracking-normal text-left leading-snug">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Functional System Status Footer */}
        <div className="p-3 border-t border-border flex items-center justify-between text-[11px] text-text-2 font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-ok" />
            <span className="text-text font-medium">VIGIL v2.4</span>
          </div>
          <span className="text-[10px]">Ready</span>
        </div>
      </aside>

      {/* 2. Mobile Slide-in Drawer with Backdrop (visible only < md when opened) */}
      {/* Backdrop Overlay */}
      <div
        onClick={onCloseMobile}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-200 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Panel */}
      <div
        className={`fixed inset-y-0 left-0 w-64 max-w-[82vw] bg-surface border-r border-border flex flex-col justify-between select-none z-50 md:hidden font-sans shadow-subtle transform transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Drawer Header with Logo & Close Button */}
        <div className="h-14 px-4 border-b border-border flex items-center justify-between shrink-0 bg-surface">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 flex items-center justify-center text-accent">
              <svg className="w-6 h-6 text-accent" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="11" fill="var(--raised)" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M6 18C6 24.6274 11.3726 30 18 30C24.6274 30 30 24.6274 30 18C30 11.3726 24.6274 6 18 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeDasharray="4 2"
                />
                <ellipse cx="18" cy="18" rx="16" ry="5.5" transform="rotate(-25 18 18)" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="28" cy="12" r="2.2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-text tracking-wide">VIGIL</div>
              <div className="text-[10px] text-text-2 font-mono leading-none">Orbital Intelligence</div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="w-7 h-7 rounded bg-surface hover:bg-raised border border-border text-text-2 hover:text-text flex items-center justify-center transition cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Navigation List */}
        <div className="py-3 px-2 space-y-1 overflow-y-auto flex-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded text-xs transition cursor-pointer ${
                  isActive
                    ? 'bg-raised text-accent font-medium border border-border'
                    : 'text-text-2 hover:text-text hover:bg-raised/60'
                }`}
              >
                <span className={isActive ? 'text-accent' : 'text-text-2'}>
                  {item.icon}
                </span>
                <span className="tracking-normal">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Drawer Footer */}
        <div className="p-3 border-t border-border flex items-center justify-between text-[11px] text-text-2 font-mono bg-surface">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-ok" />
            <span className="text-text font-medium">VIGIL v2.4</span>
          </div>
          <span className="text-[10px]">Connected</span>
        </div>
      </div>
    </>
  );
};
