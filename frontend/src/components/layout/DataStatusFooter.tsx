import React from 'react';
import { SystemHealth } from '../../types/kshitij';
import { HardDrive, Calendar, Database, CheckCircle2 } from 'lucide-react';

interface DataStatusFooterProps {
  health: SystemHealth | null;
}

export const DataStatusFooter: React.FC<DataStatusFooterProps> = ({ health }) => {
  const data = health?.dataStatus || {
    scenes: 0,
    dateRange: ['2021-01-01', '2026-09-01'],
    indexedPct: 100,
    storage: 'LOCAL (SQLITE+FAISS)',
  };

  return (
    <footer className="h-7 bg-surface border-t border-border px-4 flex items-center justify-between text-[11px] font-sans text-text-2 select-none z-20">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-1.5">
          <span className="text-text font-medium text-[11px] uppercase tracking-[0.05em]">DATA STATUS:</span>
        </div>

        <div className="flex items-center space-x-1.5" title="Ingested Sentinel-2 L2A scenes">
          <Database className="w-3 h-3 text-text-2" />
          <span className="text-text-2 text-[11px] uppercase tracking-[0.05em]">SCENES:</span>
          <span className="text-text font-mono font-medium">{data.scenes}</span>
        </div>

        <div className="flex items-center space-x-1.5" title="Temporal coverage span">
          <Calendar className="w-3 h-3 text-text-2" />
          <span className="text-text-2 text-[11px] uppercase tracking-[0.05em]">TEMPORAL COVERAGE:</span>
          <span className="text-text font-mono">
            {data.dateRange[0]} → {data.dateRange[1]}
          </span>
        </div>

        <div className="flex items-center space-x-1.5" title="Embedding vector index coverage">
          <CheckCircle2 className="w-3 h-3 text-ok" />
          <span className="text-text-2 text-[11px] uppercase tracking-[0.05em]">INDEXED:</span>
          <span className="text-ok font-mono font-medium">{data.indexedPct}%</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <HardDrive className="w-3 h-3 text-text-2" />
          <span className="text-text-2 text-[11px] uppercase tracking-[0.05em]">STORAGE:</span>
          <span className="text-text font-mono font-medium">{data.storage}</span>
        </div>
        <span className="text-border">|</span>
        <span className="text-[10px] text-text-2 font-mono">DGIS // EVAL PROTOCOL</span>
      </div>
    </footer>
  );
};
