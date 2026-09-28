import React, { useState } from 'react';
import {
  ExternalLink,
  Check,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Ruler,
  Database,
  CloudSun,
  BarChart2,
  Sparkles,
  Layers,
  Cpu,
  Compass
} from 'lucide-react';
import { api } from '../../services/api';

interface ChangeAnalysisCardProps {
  onViewFullReport?: () => void;
  candidateTitle?: string;
  changeType?: string;
  coordinates?: string;
  areaHa?: string;
  timeGap?: string;
  confidence?: number;
  beforeImgUrl?: string;
  afterImgUrl?: string;
  candidateId?: string;
}

type CardSubTab = 'overview' | 'explanation' | 'false-change' | 'quantification' | 'provenance' | 'analytics';

export const ChangeAnalysisCard: React.FC<ChangeAnalysisCardProps> = ({
  onViewFullReport,
  candidateTitle = 'Hazira Deepwater Wharf & Piling Deck',
  changeType = 'New construction',
  coordinates = '21.4587° N, 72.7812° E',
  areaHa = '4.2 ha',
  timeGap = '32 months',
  confidence = 94,
  beforeImgUrl = '/assets/before_scene.jpg',
  afterImgUrl = '/assets/after_scene.jpg',
  candidateId = 'CAND-2026-001',
}) => {
  const [activeTab, setActiveTab] = useState<CardSubTab>('overview');
  const [selectedTimelineDate, setSelectedTimelineDate] = useState<string>('2025-04-28');
  const [analystVerdict, setAnalystVerdict] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sensorMode, setSensorMode] = useState<'OPTICAL' | 'SAR'>('OPTICAL');

  // Multi-temporal milestones along continuous timeline
  const timelineMilestones = [
    { date: '2023-08-12', label: 'Baseline', month: 'Aug 2023', img: beforeImgUrl, hasBox: false },
    { date: '2024-02-18', label: 'Excavation', month: 'Feb 2024', img: '/assets/card_5_land.jpg', hasBox: false },
    { date: '2024-08-19', label: 'Piling', month: 'Aug 2024', img: '/assets/card_4_bridge.jpg', hasBox: true },
    { date: '2025-04-28', label: 'Superstructure', month: 'Apr 2025', img: afterImgUrl, hasBox: true },
  ];

  const activePhase = timelineMilestones.find((p) => p.date === selectedTimelineDate) || timelineMilestones[3];

  const handleQuickReview = async (verdict: 'CONFIRMED' | 'REJECTED') => {
    setIsSubmitting(true);
    try {
      await api.submitReviewDecision({
        candidateId,
        analyst: 'Analyst // DGIS Ground Station',
        verdict,
        comment: `Recorded from Change Analysis Console: ${verdict}`,
      });
      setAnalystVerdict(verdict);
    } catch {
      setAnalystVerdict(verdict);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHighConfidence = confidence >= 75;
  const isMarginal = confidence >= 65 && confidence < 75;

  return (
    <div className="w-full h-full bg-[#0B1523] border border-[#182A40] rounded-xl p-3 flex flex-col justify-between select-none overflow-y-auto font-sans text-white text-xs">
      {/* 1. Header with Tab Switcher */}
      <div className="flex items-center justify-between pb-2 border-b border-[#182A40]/80 shrink-0">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-[#38BDF8]" />
          <h2 className="text-xs font-semibold text-white tracking-normal font-sans">
            Change analysis
          </h2>
        </div>

        {/* View Full Report trigger */}
        <button
          onClick={onViewFullReport}
          className="h-7 flex items-center space-x-1.5 px-2.5 rounded-lg border border-[#0284C7]/50 text-xs text-[#38BDF8] hover:bg-[#0E2D4A] hover:border-[#38BDF8] transition cursor-pointer font-sans"
        >
          <span>Full report</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Subtab Navigation Pills */}
      <div className="flex items-center space-x-1 py-1.5 border-b border-[#182A40]/60 text-[11px] overflow-x-auto no-scrollbar shrink-0 font-sans">
        <button
          onClick={() => setActiveTab('overview')}
          className={`h-6 px-2.5 rounded-md transition font-medium cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'bg-[#0E355A] text-[#38BDF8] border border-[#0284C7]'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1A2B]'
          }`}
        >
          Visual pair
        </button>
        <button
          onClick={() => setActiveTab('explanation')}
          className={`h-6 px-2.5 rounded-md flex items-center space-x-1.5 transition font-medium cursor-pointer shrink-0 ${
            activeTab === 'explanation'
              ? 'bg-[#0E355A] text-[#38BDF8] border border-[#0284C7]'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1A2B]'
          }`}
        >
          <HelpCircle className="w-3 h-3 text-[#38BDF8]" />
          <span>Why detected?</span>
        </button>
        <button
          onClick={() => setActiveTab('false-change')}
          className={`h-6 px-2.5 rounded-md flex items-center space-x-1.5 transition font-medium cursor-pointer shrink-0 ${
            activeTab === 'false-change'
              ? 'bg-[#0E355A] text-[#38BDF8] border border-[#0284C7]'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1A2B]'
          }`}
        >
          <ShieldCheck className="w-3 h-3 text-[#10B981]" />
          <span>False-change check</span>
        </button>
        <button
          onClick={() => setActiveTab('quantification')}
          className={`h-6 px-2.5 rounded-md flex items-center space-x-1.5 transition font-medium cursor-pointer shrink-0 ${
            activeTab === 'quantification'
              ? 'bg-[#0E355A] text-[#38BDF8] border border-[#0284C7]'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1A2B]'
          }`}
        >
          <Ruler className="w-3 h-3 text-[#38BDF8]" />
          <span>Metrics</span>
        </button>
        <button
          onClick={() => setActiveTab('provenance')}
          className={`h-6 px-2.5 rounded-md flex items-center space-x-1.5 transition font-medium cursor-pointer shrink-0 ${
            activeTab === 'provenance'
              ? 'bg-[#0E355A] text-[#38BDF8] border border-[#0284C7]'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1A2B]'
          }`}
        >
          <Database className="w-3 h-3" />
          <span>Provenance</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`h-6 px-2.5 rounded-md flex items-center space-x-1.5 transition font-medium cursor-pointer shrink-0 ${
            activeTab === 'analytics'
              ? 'bg-[#0E355A] text-[#38BDF8] border border-[#0284C7]'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1A2B]'
          }`}
        >
          <BarChart2 className="w-3 h-3 text-[#10B981]" />
          <span>Analytics</span>
        </button>
      </div>

      {/* Main Tab Content with 16px Spacing */}
      <div className="flex-1 flex flex-col justify-between py-2 min-h-0 space-y-4">
        {activeTab === 'overview' && (
          <div className="space-y-3.5">
            {/* Sensor Switcher: Optical vs SAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px]">
              <div className="flex items-center space-x-2 text-[#94A3B8]">
                <span className="text-[10px] uppercase tracking-[0.05em] text-[#64748B]">SENSOR</span>
                <div className="flex items-center bg-[#070D16] p-0.5 rounded-lg border border-[#182A40]">
                  <button
                    onClick={() => setSensorMode('OPTICAL')}
                    className={`h-6 px-2 sm:px-2.5 rounded-md text-[10px] font-medium transition cursor-pointer ${
                      sensorMode === 'OPTICAL' ? 'bg-[#0284C7] text-white' : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Sentinel-2 Optical (10m)
                  </button>
                  <button
                    onClick={() => setSensorMode('SAR')}
                    className={`h-6 px-2 sm:px-2.5 rounded-md text-[10px] font-medium transition cursor-pointer ${
                      sensorMode === 'SAR' ? 'bg-[#0284C7] text-white' : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Sentinel-1 SAR Radar
                  </button>
                </div>
              </div>

              {/* Image Quality Badge */}
              <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-[#070D16] border border-[#182A40] text-[10px] text-[#10B981] self-start sm:self-auto">
                <CloudSun className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Cloud 2.1% · High quality</span>
              </div>
            </div>

            {/* Before / After Photographic Satellite Image Thumbnails */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* BEFORE Tile */}
              <div
                onClick={() => setSelectedTimelineDate('2023-08-12')}
                className="flex flex-col space-y-1 cursor-pointer group"
                title="Click to view 2023 baseline"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white font-mono font-medium">T1: 2023-08-12</span>
                  <span className="text-[#64748B] text-[9px] uppercase tracking-[0.05em]">Baseline</span>
                </div>
                <div className="relative aspect-[16/10] bg-[#070D16] rounded-lg border border-[#182A40] group-hover:border-[#0284C7] overflow-hidden transition">
                  <img
                    src={beforeImgUrl}
                    alt="Before scene"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute bottom-1 left-1 text-[8px] font-mono text-white/90 bg-[#070D16]/80 px-1.5 py-0.5 rounded border border-[#182A40]/60 backdrop-blur">
                    0 250 500 m
                  </div>
                </div>
              </div>

              {/* AFTER Tile */}
              <div
                onClick={onViewFullReport}
                className="flex flex-col space-y-1 cursor-pointer group"
                title="Click to open interactive split curtain comparator"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white font-mono font-medium">T2: {selectedTimelineDate}</span>
                  <span className="text-[#38BDF8] text-[9px] uppercase tracking-[0.05em] font-medium">
                    {sensorMode === 'SAR' ? 'SAR Backscatter' : 'Active obs'}
                  </span>
                </div>
                <div className="relative aspect-[16/10] bg-[#070D16] rounded-lg border border-[#182A40] group-hover:border-[#0284C7] overflow-hidden transition">
                  <img
                    src={sensorMode === 'SAR' ? '/assets/card_3_port.jpg' : activePhase.img}
                    alt="Active observation"
                    className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${
                      sensorMode === 'SAR' ? 'filter grayscale contrast-150' : ''
                    }`}
                  />
                  {activePhase.hasBox && (
                    <div className="absolute top-[26%] right-[16%] w-[32%] h-[46%] border-2 border-[#EF4444] bg-[#EF4444]/15 rounded-md shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse" />
                  )}
                  <div className="absolute bottom-1 left-1 text-[8px] font-mono text-white/90 bg-[#070D16]/80 px-1.5 py-0.5 rounded border border-[#182A40]/60 backdrop-blur">
                    0 250 500 m
                  </div>
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-[#070D16]/85 border border-[#182A40] text-[8px] font-mono text-[#38BDF8]">
                    {sensorMode === 'SAR' ? 'SAR C-Band VV/VH' : activePhase.label}
                  </div>
                </div>
              </div>
            </div>

            {/* Continuous Temporal Timeline Scrubber (2023 - 2025) */}
            <div className="bg-[#070D16] p-2.5 rounded-lg border border-[#182A40] space-y-2">
              <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
                <span className="font-mono text-white/80">2023</span>
                <span className="text-[#64748B] text-[9px] uppercase tracking-[0.05em]">SCRUB SATELLITE MILESTONES</span>
                <span className="font-mono text-white/80">2025</span>
              </div>
              <div className="relative flex items-center justify-between px-3 pt-1 pb-1 before:content-[''] before:absolute before:left-4 before:right-4 before:h-0.5 before:bg-[#1E3A5F]">
                {timelineMilestones.map((milestone) => {
                  const isSelected = selectedTimelineDate === milestone.date;
                  return (
                    <button
                      key={milestone.date}
                      onClick={() => setSelectedTimelineDate(milestone.date)}
                      className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                          isSelected
                            ? 'bg-[#0284C7] border-white shadow-[0_0_8px_#0284C7] scale-125'
                            : 'bg-[#0B1523] border-[#182A40] group-hover:border-[#0284C7]'
                        }`}
                      />
                      <span className={`text-[9px] mt-1 transition font-mono ${isSelected ? 'text-[#38BDF8] font-medium' : 'text-[#64748B]'}`}>
                        {milestone.month}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Why was this detected? (Explainable AI Panel - Structured 3-Second Scannable Rows) */}
        {activeTab === 'explanation' && (
          <div className="bg-[#070D16] p-3 rounded-lg border border-[#182A40] space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#182A40] pb-2">
              <span className="text-[10px] font-sans uppercase tracking-[0.05em] text-[#64748B]">WHY DETECTED?</span>
              <span className="text-xs font-semibold text-[#10B981]">{changeType}</span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Row 1 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0B1523] border border-[#182A40]/80">
                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-md bg-[#0284C7]/20 border border-[#0284C7]/40 flex items-center justify-center text-[#38BDF8] shrink-0">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Spectral albedo shift</div>
                    <div className="text-[10px] text-[#94A3B8]">High reflectance deck construction</div>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-[#10B981]">+0.28 NDBI</span>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0B1523] border border-[#182A40]/80">
                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-md bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Temporal persistence</div>
                    <div className="text-[10px] text-[#94A3B8]">Consistent across consecutive passes</div>
                  </div>
                </div>
                <span className="font-mono text-xs text-white">4 passes</span>
              </div>

              {/* Row 3 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0B1523] border border-[#182A40]/80">
                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-md bg-[#38BDF8]/20 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shrink-0">
                    <Layers className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Scene classification purity</div>
                    <div className="text-[10px] text-[#94A3B8]">Excludes cloud, shadow & haze</div>
                  </div>
                </div>
                <span className="font-mono text-xs text-[#10B981]">98.4% valid</span>
              </div>

              {/* Row 4 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0B1523] border border-[#182A40]/80">
                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5 rounded-md bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#A78BFA] shrink-0">
                    <Compass className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Co-registration error</div>
                    <div className="text-[10px] text-[#94A3B8]">Sub-pixel alignment residual</div>
                  </div>
                </div>
                <span className="font-mono text-xs text-white">0.18 px</span>
              </div>
            </div>

            {/* Model Architecture Footer */}
            <div className="pt-2 border-t border-[#182A40] flex items-center justify-between text-[10px] text-[#64748B]">
              <div className="flex items-center space-x-1.5">
                <Cpu className="w-3 h-3 text-[#38BDF8]" />
                <span>Detection model: FC-Siam-diff v1.2</span>
              </div>
              <span>Anchor: RemoteCLIP-RS</span>
            </div>
          </div>
        )}

        {/* Tab 3: False-Change Analysis Panel (8-Tier Structured Grid) */}
        {activeTab === 'false-change' && (
          <div className="bg-[#070D16] p-3 rounded-lg border border-[#182A40] space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#182A40] pb-1.5">
              <span className="text-[10px] font-sans uppercase tracking-[0.05em] text-[#64748B]">FALSE-CHANGE CHECK (8-TIER)</span>
              <span className="text-xs font-semibold text-[#10B981]">All 8 gates passed</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {[
                { label: 'Cloud & shadow contamination', val: '2.1% ≤ 15% threshold', pass: true },
                { label: 'Seasonal vegetation cycle', val: 'Anniversary NDVI delta normal', pass: true },
                { label: 'Geometric co-registration shift', val: '0.18 px ≤ 0.80 px limit', pass: true },
                { label: 'Solar illumination angle', val: 'Solar zenith diff < 2.4°', pass: true },
                { label: 'Atmospheric optical depth', val: 'AOD normalized (S2 BOA)', pass: true },
                { label: 'Sensor look-angle difference', val: 'Sentinel-1 & 2 cross-aligned', pass: true },
                { label: 'Tidal stage / water level flux', val: 'Low-tide baseline applied', pass: true },
                { label: 'Transient maritime vessel motion', val: 'Ship kinematic filter active', pass: true },
              ].map((tier, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 px-2 rounded bg-[#0B1523]/80 border border-[#182A40]/40">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <span className="text-[#94A3B8] text-[11px]">{tier.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-[#64748B]">{tier.val}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#063327] border border-[#10B981]/40 text-[#10B981]">
                      Pass
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 p-1.5 bg-[#063327]/60 border border-[#10B981]/40 rounded-lg text-center text-[#10B981] font-medium text-xs">
              Overall status: Real change confirmed
            </div>
          </div>
        )}

        {/* Tab 4: Change Quantification Metrics */}
        {activeTab === 'quantification' && (
          <div className="bg-[#070D16] p-3 rounded-lg border border-[#182A40] space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#182A40] pb-1.5">
              <span className="text-[10px] font-sans uppercase tracking-[0.05em] text-[#64748B]">QUANTIFICATION METRICS</span>
              <span className="text-xs font-mono text-[#38BDF8]">{candidateTitle.slice(0, 24)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#0B1523] p-2 rounded-lg border border-[#182A40]">
                <div className="text-[10px] uppercase tracking-[0.05em] text-[#64748B]">CHANGED AREA</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">{areaHa}</div>
              </div>
              <div className="bg-[#0B1523] p-2 rounded-lg border border-[#182A40]">
                <div className="text-[10px] uppercase tracking-[0.05em] text-[#64748B]">NEW STRUCTURES</div>
                <div className="text-sm font-bold font-mono text-[#10B981] mt-0.5">17 units</div>
              </div>
              <div className="bg-[#0B1523] p-2 rounded-lg border border-[#182A40]">
                <div className="text-[10px] uppercase tracking-[0.05em] text-[#64748B]">ROAD EXPANSION</div>
                <div className="text-sm font-bold font-mono text-[#38BDF8] mt-0.5">1.8 km</div>
              </div>
              <div className="bg-[#0B1523] p-2 rounded-lg border border-[#182A40]">
                <div className="text-[10px] uppercase tracking-[0.05em] text-[#64748B]">CHANGE DENSITY</div>
                <div className="text-sm font-bold font-mono text-[#F59E0B] mt-0.5">14.6%</div>
              </div>
              <div className="bg-[#0B1523] p-2 rounded-lg border border-[#182A40]">
                <div className="text-[10px] uppercase tracking-[0.05em] text-[#64748B]">CONFIDENCE</div>
                <div className="text-sm font-bold font-mono text-[#10B981] mt-0.5">{confidence}%</div>
              </div>
              <div className="bg-[#0B1523] p-2 rounded-lg border border-[#182A40]">
                <div className="text-[10px] uppercase tracking-[0.05em] text-[#64748B]">TIME DIFFERENCE</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">{timeGap}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Data Provenance */}
        {activeTab === 'provenance' && (
          <div className="bg-[#070D16] p-3 rounded-lg border border-[#182A40] space-y-2 animate-in fade-in text-xs">
            <div className="flex items-center justify-between border-b border-[#182A40] pb-1.5">
              <span className="text-[10px] font-sans uppercase tracking-[0.05em] text-[#64748B]">DATA PROVENANCE</span>
              <span className="text-xs font-mono text-[#38BDF8]">Sentinel-2A L2A</span>
            </div>

            <div className="space-y-1.5 text-[#94A3B8]">
              <div className="flex justify-between py-0.5 border-b border-[#182A40]/40">
                <span className="text-[#64748B]">Satellite</span>
                <span className="text-white font-medium">Sentinel-2A MSI / Sentinel-1B SAR</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#182A40]/40">
                <span className="text-[#64748B]">Acquisition</span>
                <span className="text-white font-mono">28 Apr 2025 · 05:46:51 UTC</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#182A40]/40">
                <span className="text-[#64748B]">Processing level</span>
                <span className="text-[#10B981]">L2A (Bottom-Of-Atmosphere)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#182A40]/40">
                <span className="text-[#64748B]">Resolution</span>
                <span className="text-white font-mono">10 m (B2, B3, B4, B8)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#182A40]/40">
                <span className="text-[#64748B]">CRS projection</span>
                <span className="text-white font-mono">EPSG:32644 (UTM Zone 44N)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#182A40]/40">
                <span className="text-[#64748B]">Tile ID</span>
                <span className="text-white font-mono truncate max-w-[150px]">S2A_MSIL2A_20250428_017</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[#64748B]">SHA-256 hash</span>
                <span className="text-[#38BDF8] font-mono truncate max-w-[150px]">e3b0c44298fc1c149afbf4c8...</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: System Analytics (Directly Embedded in Card for Flexible Viewing) */}
        {activeTab === 'analytics' && (
          <div className="bg-[#070D16] p-3 rounded-lg border border-[#182A40] space-y-3 animate-in fade-in text-xs">
            <div className="flex items-center justify-between border-b border-[#182A40] pb-1.5">
              <span className="text-[10px] font-sans uppercase tracking-[0.05em] text-[#64748B]">SYSTEM ANALYTICS</span>
              <span className="text-xs font-semibold text-[#10B981]">Engine status: Optimal</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#0B1523] p-2 rounded-lg border border-[#182A40]">
                <div className="text-[10px] uppercase tracking-[0.05em] text-[#64748B]">GPU COMPUTE</div>
                <div className="text-lg font-bold font-mono text-[#10B981] mt-1">42%</div>
                <div className="text-[9px] text-[#64748B] mt-0.5">RTX 4090 DGIS</div>
              </div>
              <div className="bg-[#0B1523] p-2 rounded-lg border border-[#182A40]">
                <div className="text-[10px] uppercase tracking-[0.05em] text-[#64748B]">PRECISION</div>
                <div className="text-lg font-bold font-mono text-[#38BDF8] mt-1">94.8%</div>
                <div className="text-[9px] text-[#64748B] mt-0.5">Verified F1: 0.91</div>
              </div>
              <div className="bg-[#0B1523] p-2 rounded-lg border border-[#182A40]">
                <div className="text-[10px] uppercase tracking-[0.05em] text-[#64748B]">THROUGHPUT</div>
                <div className="text-lg font-bold font-mono text-[#F59E0B] mt-1">1.4s</div>
                <div className="text-[9px] text-[#64748B] mt-0.5">Avg tile latency</div>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-[#0B1523] border border-[#182A40] space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#94A3B8]">Memory buffer</span>
                <span className="font-mono text-white">4.8 GB / 24 GB</span>
              </div>
              <div className="w-full bg-[#182A40] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#0284C7] h-full rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>
        )}

        {/* Detection Alert Bar with Primary Confidence Hero Metric and Demoted Secondary Badges */}
        <div className="flex items-center justify-between bg-[#0E1B2D] border border-[#182A40] rounded-xl px-3 py-2 shrink-0">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-6 h-6 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <div className="leading-tight truncate font-sans">
              <div className="text-xs font-semibold text-white truncate max-w-[190px]">{candidateTitle}</div>
              <div className="text-[10px] text-[#94A3B8] flex items-center space-x-1 mt-0.5">
                <span className="text-[#64748B]">Verification:</span>
                <span className="text-[#10B981] font-medium flex items-center space-x-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span>Pass</span>
                </span>
                <span className="text-[#64748B]">·</span>
                <span className="text-[#94A3B8]">{changeType}</span>
              </div>
            </div>
          </div>

          {/* Primary Hero Metric: Confidence Score */}
          <div className={`px-3 py-1 rounded-lg border text-right shrink-0 ${
            isHighConfidence
              ? 'border-[#10B981]/40 bg-[#063327]/60 text-[#10B981]'
              : isMarginal
              ? 'border-[#F59E0B]/40 bg-[#2D1E07]/60 text-[#F59E0B]'
              : 'border-[#EF4444]/40 bg-[#2D1215]/60 text-[#EF4444]'
          }`}>
            <div className="text-[9px] font-sans uppercase tracking-[0.05em] text-[#64748B]">Confidence</div>
            <div className="text-xl font-mono font-bold leading-none mt-0.5">{confidence}%</div>
          </div>
        </div>

        {/* Bottom Details + Analyst Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1.5 border-t border-[#182A40]/80 text-xs shrink-0 font-sans">
          <div className="text-[#94A3B8] flex items-center space-x-1.5">
            <span className="text-[10px] font-sans uppercase tracking-[0.05em] text-[#64748B]">LOCATION</span>
            <span className="text-white font-mono">{coordinates}</span>
          </div>

          {/* Quick Review Buttons */}
          {analystVerdict ? (
            <div className={`h-7 px-3 rounded-lg font-medium flex items-center space-x-1.5 text-xs font-sans ${
              analystVerdict === 'CONFIRMED'
                ? 'bg-[#063327] text-[#10B981] border border-[#10B981]/50'
                : 'bg-[#2D1215] text-[#EF4444] border border-[#EF4444]/50'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{analystVerdict === 'CONFIRMED' ? 'Confirmed' : 'Suppressed'}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 font-sans">
              <button
                onClick={() => handleQuickReview('CONFIRMED')}
                disabled={isSubmitting}
                className="h-7 px-3.5 rounded-lg bg-[#063327] hover:bg-[#0E4738] border border-[#10B981]/60 text-[#10B981] font-medium transition flex items-center space-x-1.5 cursor-pointer text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm</span>
              </button>
              <button
                onClick={() => handleQuickReview('REJECTED')}
                disabled={isSubmitting}
                className="h-7 px-3.5 rounded-lg bg-[#2D1215] hover:bg-[#451B21] border border-[#EF4444]/60 text-[#EF4444] font-medium transition flex items-center space-x-1.5 cursor-pointer text-xs"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Suppress</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
