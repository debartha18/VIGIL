import React from 'react';
import {
  Compass,
  Crosshair,
  CheckSquare,
  Sparkles,
  Archive,
  BarChart3,
  Shield,
  FileText
} from 'lucide-react';

export type ScreenId =
  | 'command'
  | 'candidate-detail'
  | 'review-queue'
  | 'discover'
  | 'archive-ingest'
  | 'evaluation'
  | 'audit-trail'
  | 'report-export';

interface SidebarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  pendingReviewCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onSelectScreen,
  pendingReviewCount = 0,
}) => {
  const navItems: { id: ScreenId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'command', label: 'Command View', icon: <Compass className="w-4 h-4" /> },
    { id: 'candidate-detail', label: 'Candidate Detail', icon: <Crosshair className="w-4 h-4" /> },
    {
      id: 'review-queue',
      label: 'Review Queue',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
    },
    { id: 'discover', label: 'Discover & Clusters', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'archive-ingest', label: 'Archive & Ingest', icon: <Archive className="w-4 h-4" /> },
    { id: 'evaluation', label: 'Evaluation & Models', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'audit-trail', label: 'Audit Trail', icon: <Shield className="w-4 h-4" /> },
    { id: 'report-export', label: 'Report & Export', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-56 bg-bg-1 border-r border-line flex flex-col justify-between select-none z-20">
      <div className="py-3 px-2 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-text-1 tracking-wider">
          Intelligence Workspace
        </div>
        {navItems.map((item) => {
          const active = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-mono transition-all ${
                active
                  ? 'bg-bg-2 text-cyan font-medium border border-line shadow-sm'
                  : 'text-text-1 hover:text-text-0 hover:bg-bg-2/50'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <span className={active ? 'text-cyan' : 'text-text-1'}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-amber/20 text-amber border border-amber/30 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-line text-[11px] font-mono text-text-1 space-y-1 bg-bg-0/30">
        <div className="flex justify-between">
          <span>PIPELINE:</span>
          <span className="text-green font-semibold">ONLINE</span>
        </div>
        <div className="flex justify-between">
          <span>RESOLUTION:</span>
          <span className="text-text-0">10m / PIXEL</span>
        </div>
      </div>
    </aside>
  );
};
