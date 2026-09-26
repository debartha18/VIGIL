import React, { useState, useEffect } from 'react';
import { GitCompare, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAnalyst } from '../context/AnalystContext';

export const ChangeAnalysisView: React.FC<{ onSelectCandidate?: (cand: any) => void }> = () => {
  const { profile } = useAnalyst();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await api.getCandidates();
      setCandidates(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (candidateId: string, verdict: 'CONFIRMED' | 'REJECTED' | 'INVESTIGATE') => {
    try {
      await api.submitReviewDecision({
        candidateId,
        analyst: `${profile.name || 'Analyst'} // ${profile.callSign || 'DGIS'}`,
        verdict,
        comment: `Analyst decision recorded via Change Analysis Station by ${profile.name}: ${verdict}`
      });
      setActionSuccess(`Candidate ${candidateId} updated to ${verdict} by ${profile.name} and written to cryptographic audit ledger!`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadCandidates();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-[#070D16] p-4 lg:p-6 pb-28 font-sans text-white space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#182A40] pb-4">
        <div>
          <h2 className="text-[26px] font-semibold text-white tracking-normal flex items-center space-x-2.5">
            <GitCompare className="w-6 h-6 text-[#38BDF8]" />
            <span>Multi-temporal change analysis & analyst review console</span>
          </h2>
          <p className="text-sm font-normal text-[#94A3B8] mt-1">
            FC-Siam-diff bi-temporal deep differencing and spectral change validation with 8-step false alarm rejection.
          </p>
        </div>
        <span className="px-3 py-1 rounded bg-[#0E355A] border border-[#0284C7]/60 text-xs font-medium text-[#38BDF8]">
          Confidence gate: ≥ 0.65 precision
        </span>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-[#063327] border border-[#10B981] rounded-lg text-xs text-[#10B981] flex items-center space-x-2 animate-in fade-in font-sans">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Candidate Queue Table */}
      <div className="bg-[#0B1523] border border-[#182A40] rounded-xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-[#0E1A2B] border-b border-[#182A40] flex items-center justify-between">
          <span className="text-sm font-semibold text-white">
            Verified change candidates queue ({loading ? 'Syncing...' : `${candidates.length} detected`})
          </span>
          <span className="text-xs font-normal text-[#64748B]">All changes satisfy multi-scene persistence (≥ 2 clean observations)</span>
        </div>

        <div className="divide-y divide-[#182A40]">
          {candidates.map((cand) => {
            const conf = cand.confidence?.composite_score || 0.85;
            const pct = Math.round(conf * 100);

            return (
              <div key={cand.id} className="p-4 flex items-center justify-between hover:bg-[#0E1E33] transition">
                <div className="space-y-2 flex-1 pr-6">
                  <div className="flex items-center space-x-2.5">
                    {/* Card Title (Candidate ID): 15px, medium, mono font */}
                    <span className="text-[15px] font-medium font-mono text-white">{cand.id}</span>
                    <span className="px-2 py-0.5 rounded bg-[#0E2D4A] border border-[#0284C7]/50 text-xs text-[#38BDF8] font-medium">
                      {cand.change_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      cand.verdict === 'CONFIRMED'
                        ? 'bg-[#063327] text-[#10B981] border border-[#10B981]/50'
                        : 'bg-[#3A2209] text-[#F59E0B] border border-[#F59E0B]/50'
                    }`}>
                      {cand.verdict}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div>
                      {/* Small label: 11px, uppercase, letter-spaced, muted */}
                      <span className="text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B] block mb-0.5">AREA DETECTED</span>
                      {/* Data value: mono font */}
                      <span className="text-xs font-mono text-white">{(cand.area_m2 / 10000).toFixed(1)} ha ({cand.area_m2.toLocaleString()} m²)</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B] block mb-0.5">FIRST EVIDENCE</span>
                      <span className="text-xs font-mono text-white">{cand.first_evidence_at}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B] block mb-0.5">DISTANCE TO WATER</span>
                      <span className="text-xs font-mono text-white">{cand.nearest_river_m} m</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B] block mb-0.5">CLASSIFIER PROVENANCE</span>
                      <span className="text-xs font-mono text-[#00E5FF]">{cand.classified_by}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <div className="text-right pr-2">
                    {/* Small label: 11px, uppercase, letter-spaced */}
                    <div className="text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B]">CONFIDENCE</div>
                    {/* Key metric: 20-22px, bold, mono font */}
                    <div className="text-[22px] font-bold font-mono text-[#10B981]">{pct}%</div>
                  </div>

                  {/* Quick Action Buttons: sentence case, UI font */}
                  <button
                    onClick={() => handleReview(cand.id, 'CONFIRMED')}
                    className="px-3.5 py-1.5 rounded bg-[#063327] hover:bg-[#0B4A39] border border-[#10B981]/60 text-xs font-medium text-[#10B981] transition flex items-center space-x-1.5 cursor-pointer font-sans"
                    title="Confirm Change"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm</span>
                  </button>

                  <button
                    onClick={() => handleReview(cand.id, 'REJECTED')}
                    className="px-3.5 py-1.5 rounded bg-[#2D1215] hover:bg-[#451A20] border border-[#EF4444]/60 text-xs font-medium text-[#EF4444] transition flex items-center space-x-1.5 cursor-pointer font-sans"
                    title="Suppress False Alarm"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Suppress</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChangeAnalysisView;
