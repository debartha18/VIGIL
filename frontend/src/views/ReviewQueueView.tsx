import React from 'react';
import { Candidate } from '../types/kshitij';
import { CheckSquare, ArrowRight } from 'lucide-react';

interface ReviewQueueViewProps {
  candidates: Candidate[];
  onSelectCandidate: (c: Candidate) => void;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  candidates,
  onSelectCandidate,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#070D16] p-4 lg:p-6 pb-28 font-sans text-white overflow-y-auto space-y-6">
      <div className="flex items-center justify-between border-b border-[#182A40] pb-4">
        <div>
          <h2 className="text-[26px] font-semibold text-white flex items-center space-x-2">
            <CheckSquare className="w-6 h-6 text-[#00E5FF]" />
            <span>Analyst review queue</span>
          </h2>
          <p className="text-sm font-normal text-[#94A3B8] mt-1">
            Ranked by priority & confidence. Keyboard shortcuts: [J/K] Navigate, [C] Confirm, [R] Reject, [N] Review
          </p>
        </div>
        <div className="text-xs text-[#94A3B8]">
          Pending decisions: <span className="text-[#00E5FF] font-mono font-bold">{candidates.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {candidates.map((c, idx) => (
          <div
            key={c.id}
            className="bg-[#0B1523] border border-[#182A40] rounded-xl p-4 hover:border-[#00E5FF]/50 transition flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <span className="text-[#64748B] font-mono text-sm font-medium w-6">#{idx + 1}</span>
              <div>
                <div className="text-white font-semibold text-sm">{c.changeType}</div>
                <div className="text-xs text-[#94A3B8] mt-0.5">
                  ID: <span className="font-mono text-white">{c.id}</span> · Area: <span className="font-mono text-white">{c.areaM2.toLocaleString()} m²</span> · Earliest: <span className="font-mono text-white">{c.firstEvidenceAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right mr-2">
                <div className="text-[#10B981] font-mono font-bold text-sm">
                  {(c.confidence.overall * 100).toFixed(1)}%
                </div>
                <div className="text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B]">CONFIDENCE</div>
              </div>

              <button
                onClick={() => onSelectCandidate(c)}
                className="px-3.5 py-1.5 bg-[#0E1A2B] hover:bg-[#15273F] text-white border border-[#182A40] rounded-lg text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
              >
                <span>Inspect evidence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
