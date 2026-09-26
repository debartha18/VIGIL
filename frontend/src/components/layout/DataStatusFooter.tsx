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
    <footer className="h-7 bg-[#0B1523] border-t border-[#182A40] px-4 flex items-center justify-between text-[11px] font-sans text-[#94A3B8] select-none z-20">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-1.5">
          <span className="text-[#00E5FF] font-semibold text-[11px] uppercase tracking-[0.05em]">DATA STATUS:</span>
        </div>

        <div className="flex items-center space-x-1.5" title="Ingested Sentinel-2 L2A scenes">
          <Database className="w-3 h-3 text-[#64748B]" />
          <span className="text-[#64748B] text-[11px] uppercase tracking-[0.05em]">SCENES:</span>
          <span className="text-white font-mono font-medium">{data.scenes}</span>
        </div>

        <div className="flex items-center space-x-1.5" title="Temporal coverage span">
          <Calendar className="w-3 h-3 text-[#64748B]" />
          <span className="text-[#64748B] text-[11px] uppercase tracking-[0.05em]">TEMPORAL COVERAGE:</span>
          <span className="text-white font-mono">
            {data.dateRange[0]} → {data.dateRange[1]}
          </span>
        </div>

        <div className="flex items-center space-x-1.5" title="Embedding vector index coverage">
          <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
          <span className="text-[#64748B] text-[11px] uppercase tracking-[0.05em]">INDEXED:</span>
          <span className="text-[#10B981] font-mono font-medium">{data.indexedPct}%</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <HardDrive className="w-3 h-3 text-[#64748B]" />
          <span className="text-[#64748B] text-[11px] uppercase tracking-[0.05em]">STORAGE:</span>
          <span className="text-white font-mono font-medium">{data.storage}</span>
        </div>
        <span className="text-[#182A40]">|</span>
        <span className="text-[10px] text-[#64748B] font-mono">SIH26227 // EVAL PROTOCOL</span>
      </div>
    </footer>
  );
};
