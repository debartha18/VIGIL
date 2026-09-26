import React from 'react';
import { Candidate } from '../types/kshitij';
import { Search, Layers } from 'lucide-react';

interface CommandViewProps {
  onSelectCandidate: (candidate: Candidate) => void;
  candidates: Candidate[];
}

export const CommandView: React.FC<CommandViewProps> = ({ onSelectCandidate, candidates }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-bg-0 relative overflow-hidden">
      {/* Map Area Placeholder (Enhanced in Phase 2) */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center bg-[#080D14]">
        {/* Synthetic Map Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#131A24_1px,transparent_1px),linear-gradient(to_bottom,#131A24_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

        {/* Center overlay indicator */}
        <div className="z-10 text-center space-y-3 font-sans">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#0E1A2B]/80 border border-[#182A40] text-xs text-[#00E5FF] backdrop-blur">
            <Layers className="w-3.5 h-3.5" />
            <span>AOI: 50×50 km Sentinel-2 L2A (10m)</span>
          </div>
          <p className="text-[#94A3B8] text-xs max-w-md">
            Interactive map & semantic search engine active. Ready for search queries.
          </p>
        </div>

        {/* Semantic Search Bar floating overlay */}
        <div className="absolute top-4 left-6 right-6 max-w-3xl mx-auto z-20 font-sans">
          <div className="bg-[#0B1523]/90 border border-[#182A40] rounded-lg p-2 shadow-2xl backdrop-blur flex items-center space-x-3">
            <Search className="w-4 h-4 text-[#00E5FF] ml-2 shrink-0" />
            <input
              type="text"
              readOnly
              value="new construction near rivers and roads"
              className="bg-transparent border-none outline-none text-white text-xs w-full cursor-default"
              placeholder="Describe what you want to find..."
            />
            <button className="bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 text-xs font-medium px-3 py-1.5 rounded transition">
              Search earth
            </button>
          </div>
        </div>

        {/* Floating Candidates list preview */}
        <div className="absolute bottom-4 right-6 w-80 bg-[#0B1523]/95 border border-[#182A40] rounded-lg shadow-xl p-3 z-20 font-sans text-xs max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-[#182A40] mb-2">
            <span className="text-[#64748B] text-[11px] uppercase tracking-[0.05em]">Detected candidates</span>
            <span className="text-[#00E5FF] font-mono font-bold">{candidates.length}</span>
          </div>
          <div className="space-y-1.5">
            {candidates.slice(0, 5).map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCandidate(c)}
                className="p-2 rounded bg-[#0E1A2B]/60 border border-[#182A40]/60 hover:border-[#00E5FF]/50 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <div className="text-white font-medium text-[11px]">{c.changeType}</div>
                  <div className="text-[10px] text-[#94A3B8]">Observed: <span className="font-mono">{c.firstEvidenceAt}</span></div>
                </div>
                <div className="text-right">
                  <div className="text-[#10B981] font-mono font-bold text-[11px]">
                    {(c.confidence.overall * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-[#94A3B8] font-mono">{c.areaM2.toLocaleString()} m²</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
