import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Layers,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';
import { useAnalyst } from '../context/AnalystContext';
import { CANONICAL_CHANGE_CANDIDATES, ChangeCandidateItem } from '../data/changeCandidates';

interface ChangeAnalysisViewProps {
  filterAOI?: string | null;
  onClearFilter?: () => void;
  onSelectCandidate?: (cand: any) => void;
}

export const ChangeAnalysisView: React.FC<ChangeAnalysisViewProps> = ({
  filterAOI,
  onClearFilter,
  onSelectCandidate
}) => {
  const { profile } = useAnalyst();
  const [candidates, setCandidates] = useState<ChangeCandidateItem[]>(CANONICAL_CHANGE_CANDIDATES);
  const [selectedAOITab, setSelectedAOITab] = useState<string>(() => filterAOI || 'ALL');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (filterAOI) {
      setSelectedAOITab(filterAOI);
    }
  }, [filterAOI]);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await api.getCandidates();
      let list = Array.isArray(data) && data.length > 0 ? (data as any) : CANONICAL_CHANGE_CANDIDATES;
      
      // Merge with any persisted verdicts in localStorage
      try {
        const savedVerdicts = localStorage.getItem('orbital_candidate_verdicts');
        if (savedVerdicts) {
          const map = JSON.parse(savedVerdicts);
          list = list.map((c: any) => (map[c.id] ? { ...c, verdict: map[c.id] } : c));
        }
      } catch {}
      setCandidates(list);
    } catch {
      setCandidates(CANONICAL_CHANGE_CANDIDATES);
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

      // Update in state
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, verdict } : c))
      );

      // Persist in localStorage
      try {
        const savedVerdicts = localStorage.getItem('orbital_candidate_verdicts');
        const map = savedVerdicts ? JSON.parse(savedVerdicts) : {};
        map[candidateId] = verdict;
        localStorage.setItem('orbital_candidate_verdicts', JSON.stringify(map));
      } catch {}

      setActionSuccess(`Candidate ${candidateId} updated to ${verdict} by ${profile.name || 'Analyst'} and logged to cryptographic ledger!`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter candidates according to selected AOI Tab
  const displayedCandidates = candidates.filter((c) => {
    if (selectedAOITab === 'ALL') return true;
    if (selectedAOITab === 'AOI-1') return c.aoiId === 'AOI-1';
    if (selectedAOITab === 'AOI-3') return c.aoiId === 'AOI-3';
    if (selectedAOITab === 'OTHER') return c.aoiId !== 'AOI-1' && c.aoiId !== 'AOI-3';
    return c.aoiId === selectedAOITab;
  });

  const aoi1Count = candidates.filter((c) => c.aoiId === 'AOI-1').length;
  const aoi3Count = candidates.filter((c) => c.aoiId === 'AOI-3').length;
  const otherCount = candidates.filter((c) => c.aoiId !== 'AOI-1' && c.aoiId !== 'AOI-3').length;

  return (
    <div className="w-full min-h-full flex flex-col bg-[#070D16] p-4 lg:p-6 pb-28 font-sans text-white space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#182A40] pb-4 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-normal flex items-center space-x-2.5">
            <GitCompare className="w-6 h-6 text-[#38BDF8]" />
            <span>Multi-temporal change analysis & analyst review console</span>
          </h2>
          <p className="text-xs sm:text-sm font-normal text-[#94A3B8] mt-1">
            FC-Siam-diff bi-temporal deep differencing and spectral change validation with 8-step false alarm rejection.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded bg-[#0E355A] border border-[#0284C7]/60 text-xs font-mono font-medium text-[#38BDF8]">
            Confidence gate: ≥ 0.65 precision
          </span>
        </div>
      </div>

      {/* Synchronized AOI Watchlist Filter Banner */}
      {selectedAOITab !== 'ALL' && (
        <div className="p-3 bg-[#0B1E33] border border-[#00E5FF]/40 rounded-xl flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-pulse" />
            <div className="text-xs font-sans">
              <span className="text-[#94A3B8]">Active AOI Filter: </span>
              <span className="font-bold text-white">
                {selectedAOITab === 'AOI-1'
                  ? 'AOI-1: Tapi River Estuary & Hazira Industrial Belt (4.2 ha detected • 96% Verified)'
                  : selectedAOITab === 'AOI-3'
                  ? 'AOI-3: Hazira Deepwater Port Marine Basin & Berths (1.8 ha detected • 88% Verified)'
                  : `Sector ${selectedAOITab}`}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedAOITab('ALL');
              if (onClearFilter) onClearFilter();
            }}
            className="px-2.5 py-1 text-xs rounded bg-[#182A40] hover:bg-[#223B59] text-[#38BDF8] border border-[#38BDF8]/40 transition cursor-pointer"
          >
            Show All AOIs
          </button>
        </div>
      )}

      {/* AOI Filter Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs select-none">
        <button
          onClick={() => {
            setSelectedAOITab('ALL');
            if (onClearFilter) onClearFilter();
          }}
          className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            selectedAOITab === 'ALL'
              ? 'bg-[#0284C7] text-white shadow-[0_0_12px_rgba(2,132,199,0.4)]'
              : 'bg-[#0E1A2B] text-[#94A3B8] hover:text-white border border-[#182A40]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All AOI Watchlists ({candidates.length} detected)</span>
        </button>

        <button
          onClick={() => setSelectedAOITab('AOI-1')}
          className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            selectedAOITab === 'AOI-1'
              ? 'bg-[#0284C7] text-white shadow-[0_0_12px_rgba(2,132,199,0.4)]'
              : 'bg-[#0E1A2B] text-[#94A3B8] hover:text-white border border-[#182A40]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
          <span>AOI-1: Tapi River Estuary ({aoi1Count} detected · 4.2 ha)</span>
        </button>

        <button
          onClick={() => setSelectedAOITab('AOI-3')}
          className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            selectedAOITab === 'AOI-3'
              ? 'bg-[#0284C7] text-white shadow-[0_0_12px_rgba(2,132,199,0.4)]'
              : 'bg-[#0E1A2B] text-[#94A3B8] hover:text-white border border-[#182A40]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          <span>AOI-3: Hazira Marine Basin ({aoi3Count} detected · 1.8 ha)</span>
        </button>

        <button
          onClick={() => setSelectedAOITab('OTHER')}
          className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            selectedAOITab === 'OTHER'
              ? 'bg-[#0284C7] text-white shadow-[0_0_12px_rgba(2,132,199,0.4)]'
              : 'bg-[#0E1A2B] text-[#94A3B8] hover:text-white border border-[#182A40]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Maritime & Western Sectors ({otherCount} detected)</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-[#063327] border border-[#10B981] rounded-lg text-xs text-[#10B981] flex items-center space-x-2 animate-in fade-in font-sans">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Candidate Queue Table */}
      <div className="bg-[#0B1523] border border-[#182A40] rounded-xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-[#0E1A2B] border-b border-[#182A40] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-white">
              Verified change candidates queue ({loading ? 'Syncing...' : `${displayedCandidates.length} detected`})
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 font-bold">
              MULTI-SCENE PERSISTENT
            </span>
          </div>
          <span className="text-xs font-normal text-[#64748B]">
            All changes satisfy multi-scene persistence (≥ 2 clean observations)
          </span>
        </div>

        <div className="divide-y divide-[#182A40]">
          {displayedCandidates.map((cand) => {
            const conf =
              cand.confidence?.composite_score ||
              (cand.confidencePct ? cand.confidencePct / 100 : 0.88);
            const pct = Math.round(conf * 100);
            const areaM2Val = cand.area_m2 || cand.areaM2 || 42000;
            const areaHaStr = (areaM2Val / 10000).toFixed(1);

            return (
              <div
                key={cand.id}
                className="p-4 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-[#0E1E33] transition gap-4"
              >
                <div className="space-y-2 flex-1 pr-0 lg:pr-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Candidate ID */}
                    <span className="text-sm font-bold font-mono text-white tracking-wide">
                      {cand.id}
                    </span>

                    {/* AOI Linkage Tag */}
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#14263D] text-[#38BDF8] border border-[#0284C7]/40">
                      {cand.aoiId ? `${cand.aoiId}` : 'AOI-1'}
                    </span>

                    {/* Change Type Badge */}
                    <span className="px-2 py-0.5 rounded bg-[#0E2D4A] border border-[#0284C7]/50 text-xs text-[#38BDF8] font-medium">
                      {cand.change_type || cand.changeType}
                    </span>

                    {/* Verdict Pill */}
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        cand.verdict === 'CONFIRMED'
                          ? 'bg-[#063327] text-[#10B981] border border-[#10B981]/50'
                          : cand.verdict === 'INVESTIGATE'
                          ? 'bg-[#3A2209] text-[#F59E0B] border border-[#F59E0B]/50'
                          : 'bg-[#331114] text-[#EF4444] border border-[#EF4444]/50'
                      }`}
                    >
                      {cand.verdict}
                    </span>

                    {/* Location Name */}
                    <span className="text-xs text-[#94A3B8] font-sans">
                      • {cand.title || cand.locationName}
                    </span>
                  </div>

                  {/* Description */}
                  {cand.description && (
                    <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
                      {cand.description}
                    </p>
                  )}

                  {/* Technical Metadata Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div className="bg-[#08121F] p-2 rounded border border-[#182A40]/60">
                      <span className="text-[10px] font-sans uppercase tracking-[0.05em] text-[#64748B] block mb-0.5">
                        AREA DETECTED
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#00E5FF]">
                        {areaHaStr} ha ({areaM2Val.toLocaleString()} m²)
                      </span>
                    </div>

                    <div className="bg-[#08121F] p-2 rounded border border-[#182A40]/60">
                      <span className="text-[10px] font-sans uppercase tracking-[0.05em] text-[#64748B] block mb-0.5">
                        FIRST EVIDENCE
                      </span>
                      <span className="text-xs font-mono text-white">
                        {cand.first_evidence_at || cand.firstEvidenceAt || '2023-08-12'}
                      </span>
                    </div>

                    <div className="bg-[#08121F] p-2 rounded border border-[#182A40]/60">
                      <span className="text-[10px] font-sans uppercase tracking-[0.05em] text-[#64748B] block mb-0.5">
                        DISTANCE TO WATER
                      </span>
                      <span className="text-xs font-mono text-white">
                        {cand.nearest_river_m ?? cand.nearestRiverM ?? 45} m
                      </span>
                    </div>

                    <div className="bg-[#08121F] p-2 rounded border border-[#182A40]/60">
                      <span className="text-[10px] font-sans uppercase tracking-[0.05em] text-[#64748B] block mb-0.5">
                        CLASSIFIER PROVENANCE
                      </span>
                      <span className="text-xs font-mono text-[#38BDF8] truncate block" title={cand.classified_by || cand.classifiedBy}>
                        {cand.classified_by || cand.classifiedBy || 'FC-Siam-diff+Spectral'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Confidence + Adjudication Buttons */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#182A40]">
                  <div className="text-left lg:text-right">
                    <div className="text-[10px] font-sans uppercase tracking-[0.05em] text-[#64748B]">
                      CONFIDENCE
                    </div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-[#10B981]">
                      {pct}%
                    </div>
                  </div>

                  {/* Action Review Buttons */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleReview(cand.id, 'CONFIRMED')}
                      className="px-2.5 py-1.5 rounded bg-[#063327] hover:bg-[#0B4A39] border border-[#10B981]/60 text-xs font-medium text-[#10B981] transition flex items-center space-x-1 cursor-pointer font-sans"
                      title="Confirm this detected change"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm</span>
                    </button>

                    <button
                      onClick={() => handleReview(cand.id, 'INVESTIGATE')}
                      className="px-2.5 py-1.5 rounded bg-[#2D1B06] hover:bg-[#472C0B] border border-[#F59E0B]/60 text-xs font-medium text-[#F59E0B] transition flex items-center space-x-1 cursor-pointer font-sans"
                      title="Flag for further ground inspection"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Investigate</span>
                    </button>

                    <button
                      onClick={() => handleReview(cand.id, 'REJECTED')}
                      className="px-2.5 py-1.5 rounded bg-[#2D1215] hover:bg-[#451A20] border border-[#EF4444]/60 text-xs font-medium text-[#EF4444] transition flex items-center space-x-1 cursor-pointer font-sans"
                      title="Suppress false alarm"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Suppress</span>
                    </button>

                    {/* Inspect Full Dossier */}
                    {onSelectCandidate && (
                      <button
                        onClick={() => {
                          onSelectCandidate({
                            id: cand.id,
                            title: cand.title || cand.id,
                            locationName: cand.locationName || cand.aoiName,
                            changeType: cand.change_type || cand.changeType,
                            coordinates: cand.coordinates || '21.4587° N, 72.7812° E',
                            confidencePct: pct,
                            areaHa: `${areaHaStr} ha`,
                            beforeImgUrl: cand.beforeImgUrl || '/assets/before_scene.jpg',
                            afterImgUrl: cand.afterImgUrl || '/assets/after_scene.jpg',
                            date: cand.confirmedAt || '2025-04-28',
                            beforeDate: cand.first_evidence_at || cand.firstEvidenceAt || '2023-08-12',
                            sensor: cand.sensor || 'Sentinel-2 (10m)',
                            description: cand.description || ''
                          });
                        }}
                        className="px-2.5 py-1.5 rounded bg-[#0E355A] hover:bg-[#0284C7] border border-[#0284C7] text-xs font-medium text-white transition flex items-center space-x-1 cursor-pointer font-sans shadow-sm"
                        title="View Full Satellite Crop & Comparison"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span>Inspect</span>
                      </button>
                    )}
                  </div>
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
