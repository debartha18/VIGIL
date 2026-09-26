import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Clock,
  Eye,
  Columns,
  Play,
  Pause,
  Printer,
  FileCheck
} from 'lucide-react';
import { SearchResultItem } from '../search/SemanticSearchResults';
import { useAnalyst } from '../../context/AnalystContext';

interface CandidateDetailModalProps {
  item: SearchResultItem | null;
  onClose: () => void;
}

type ComparisonMode = 'split' | 'flicker' | 'difference' | 'side-by-side';

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({ item, onClose }) => {
  const { profile } = useAnalyst();
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [showMask, setShowMask] = useState<boolean>(true);
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('split');
  const [selectedObsDate, setSelectedObsDate] = useState<string>('2025-04-28');

  // Flicker Mode states
  const [flickerFrame, setFlickerFrame] = useState<'before' | 'after'>('before');
  const [isFlickering, setIsFlickering] = useState<boolean>(true);
  const [flickerSpeedMs, setFlickerSpeedMs] = useState<number>(1000); // 1.0s default

  useEffect(() => {
    if (comparisonMode !== 'flicker' || !isFlickering) return;

    const interval = setInterval(() => {
      setFlickerFrame(prev => (prev === 'before' ? 'after' : 'before'));
    }, flickerSpeedMs);

    return () => clearInterval(interval);
  }, [comparisonMode, isFlickering, flickerSpeedMs]);

  if (!item) return null;

  const observations = [
    { sceneId: 'S2A_20230115', date: '2023-01-15', state: 'NO CHANGE', usable: true },
    { sceneId: 'S2A_20230312', date: '2023-03-12', state: 'NO CHANGE', usable: true },
    { sceneId: 'S2B_20230825', date: '2023-08-25', state: 'UNUSABLE', usable: false, reason: 'Cloud cover 55%' },
    { sceneId: 'S2A_20240120', date: '2024-01-20', state: 'EARLY SIGNAL', usable: true, marker: 'FIRST EVIDENCE' },
    { sceneId: 'S2B_20240418', date: '2024-04-18', state: 'CHANGE DETECTED', usable: true, marker: 'CHANGE CONFIRMED' },
    { sceneId: 'S2A_20250214', date: '2025-02-14', state: 'PERSISTS', usable: true },
    { sceneId: 'S2B_20250428', date: '2025-04-28', state: 'PERSISTS', usable: true },
  ];

  const falseChangeSteps = [
    { step: 1, name: 'Raw Difference', metric: 'Normalized difference magnitude', val: '0.84', threshold: '> 0.15', pass: true },
    { step: 2, name: 'Cloud / Haze Mask (SCL)', metric: 'SCL cloud probability fraction', val: '0.02', threshold: '< 0.15', pass: true },
    { step: 3, name: 'Cloud Shadow Check', metric: 'SCL shadow probability fraction', val: '0.01', threshold: '< 0.12', pass: true },
    { step: 4, name: 'Seasonal Phenology Check', metric: 'Anniversary-date phenology delta', val: '0.76', threshold: '> 0.20 (non-cyclical)', pass: true },
    { step: 5, name: 'Illumination Normalization', metric: 'Radiometric matching residual', val: '0.03', threshold: 'Normalized', pass: true },
    { step: 6, name: 'Co-Registration Residual', metric: 'Phase-correlation offset', val: '0.18 px', threshold: '< 0.80 px', pass: true },
    { step: 7, name: 'Multi-Temporal Persistence', metric: 'Confirmed clean observations', val: '4 scenes', threshold: '>= 2 scenes', pass: true },
    { step: 8, name: 'Final Pipeline Verdict', metric: 'All 7 verification tiers passed', val: 'CONFIRMED', threshold: 'All pass', pass: true },
  ];

  const rejectedAlarms = [
    { id: 'REJ-01', reason: 'FILTERED · CLOUD SHADOW', metric: 'SCL Shadow = 0.42', scene: 'S2A_20230825', type: 'Cloud shadow on agricultural parcel' },
    { id: 'REJ-02', reason: 'FILTERED · SEASONAL VEGETATION', metric: 'Anniversary Delta = 0.08', scene: 'S2B_20231104', type: 'Cyclical post-monsoon greening' },
    { id: 'REJ-03', reason: 'FILTERED · RESERVOIR LEVEL', metric: 'Water Drawdown Baseline', scene: 'S2A_20240120', type: 'Seasonal reservoir shoreline shift' },
    { id: 'REJ-04', reason: 'FILTERED · MISREGISTRATION', metric: 'Residual = 1.48 px', scene: 'S2B_20240418', type: 'High-contrast terrain parallax offset' },
  ];

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 lg:p-6 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[94vh] bg-[#0B1523] border border-[#182A40] rounded-2xl flex flex-col shadow-2xl overflow-hidden text-white font-sans print:h-auto print:max-w-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Top Header */}
        <div className="h-14 bg-[#070D16] border-b border-[#182A40] px-6 flex items-center justify-between shrink-0 print:border-b-2 print:border-black print:bg-white print:text-black">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] print:hidden" />
            <h2 className="text-sm font-semibold text-white tracking-normal print:text-black print:text-base">
              Defence intelligence dossier // <span className="font-mono">{item.id}</span> — {item.title}
            </h2>
            <span className="px-2 py-0.5 rounded bg-[#063327] border border-[#10B981]/50 text-[11px] text-[#10B981] font-medium print:border print:border-black print:text-black print:bg-transparent">
              Verified real change (<span className="font-mono font-bold">{item.confidencePct}%</span>)
            </span>
          </div>

          <div className="flex items-center space-x-2.5 print:hidden">
            <button
              onClick={handlePrintReport}
              className="px-3 py-1.5 bg-[#0E355A] hover:bg-[#0284C7] border border-[#0284C7] rounded text-xs text-white flex items-center space-x-1.5 transition font-medium shadow-[0_0_10px_rgba(2,132,199,0.3)] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export dossier (Print / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#0E1B2D] hover:bg-[#1E3550] border border-[#182A40] flex items-center justify-center text-[#94A3B8] hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Classification Header (visible only when printed) */}
        <div className="hidden print:block p-4 border-b border-gray-300 font-sans text-xs">
          <div className="text-center font-bold text-sm tracking-widest text-red-700">RESTRICTED // PROTOCOL SIH26227 // DGIS EVALUATION</div>
          <div className="flex justify-between mt-2 text-gray-700">
            <span><b>SUBJECT:</b> Semantic Retrieval & Multi-Temporal Change Dossier</span>
            <span><b>REVIEWING OFFICER:</b> {profile.name} ({profile.callSign})</span>
            <span><b>DATE:</b> 2026-09-22</span>
            <span><b>SYSTEM:</b> ORBITAL INTEL (Air-Gapped)</span>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 space-y-6 print:p-0 print:space-y-4 print:text-black">
          {/* Mode Switcher Tab Bar */}
          <div className="flex items-center justify-between bg-[#070D16] border border-[#182A40] rounded-xl p-2 print:hidden">
            <div className="flex items-center space-x-1">
              <span className="text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B] px-2 font-medium">Mode:</span>
              <button
                onClick={() => setComparisonMode('split')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
                  comparisonMode === 'split'
                    ? 'bg-[#0E355A] text-[#00E5FF] border border-[#0284C7]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1F33]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Split view (Swipe)</span>
              </button>

              <button
                onClick={() => setComparisonMode('flicker')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
                  comparisonMode === 'flicker'
                    ? 'bg-[#0E355A] text-[#00E5FF] border border-[#0284C7]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1F33]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Blink flicker (1Hz)</span>
              </button>

              <button
                onClick={() => setComparisonMode('difference')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
                  comparisonMode === 'difference'
                    ? 'bg-[#0E355A] text-[#00E5FF] border border-[#0284C7]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1F33]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Difference mask</span>
              </button>

              <button
                onClick={() => setComparisonMode('side-by-side')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
                  comparisonMode === 'side-by-side'
                    ? 'bg-[#0E355A] text-[#00E5FF] border border-[#0284C7]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1F33]'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side-by-side</span>
              </button>
            </div>

            <div className="flex items-center space-x-3 text-xs pr-2">
              <button
                onClick={() => setShowMask(!showMask)}
                className={`px-2.5 py-1 rounded border text-xs font-medium transition cursor-pointer ${
                  showMask
                    ? 'bg-[#0E355A] border-[#0284C7] text-[#38BDF8]'
                    : 'bg-[#0E1B2D] border-[#182A40] text-[#64748B]'
                }`}
              >
                {showMask ? '✓ Change annotation on' : 'Annotation off'}
              </button>
            </div>
          </div>

          {/* 1. Comparison Canvas (Changes depending on selected mode) */}
          <div className="bg-[#070D16] border border-[#182A40] rounded-xl p-4 print:border-gray-300 print:bg-white">
            {/* Mode 1: Split View / Swipe */}
            {comparisonMode === 'split' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>Drag slider or click viewport to inspect Before vs After boundaries</span>
                  <span className="text-[#00E5FF] font-medium font-sans">Slider: <span className="font-mono">{sliderPos}%</span></span>
                </div>
                <div
                  className="relative w-full h-80 rounded-lg overflow-hidden bg-[#0A1828] border border-[#182A40] cursor-ew-resize select-none"
                  onMouseMove={(e) => {
                    if (e.buttons === 1) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                      setSliderPos(Math.round((x / rect.width) * 100));
                    }
                  }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                    setSliderPos(Math.round((x / rect.width) * 100));
                  }}
                >
                  {/* After Layer (Full width behind) */}
                  <div className="absolute inset-0">
                    <img
                      src={item.afterImgUrl || '/assets/after_scene.jpg'}
                      alt="After Scene"
                      className="w-full h-full object-cover"
                    />
                    {showMask && (
                      <div className="absolute top-[28%] right-[18%] w-[28%] h-[42%] border-2 border-[#EF4444] bg-[#EF4444]/20 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.6)] flex items-center justify-center animate-pulse">
                        <span className="text-[11px] bg-[#EF4444] text-white px-2 py-0.5 rounded font-medium shadow font-sans">
                          New structure: <span className="font-mono">{item.areaHa || '2.4 ha'}</span>
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-3 text-[11px] bg-black/75 px-2.5 py-1 rounded text-[#00E5FF] border border-[#182A40] backdrop-blur font-sans">
                      After: <span className="font-mono">2025-04-28</span> (Sentinel-2 L2A)
                    </div>
                  </div>

                  {/* Before Layer (Clipped to sliderPos) */}
                  <div
                    className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-[#00E5FF] shadow-2xl"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <div className="w-[1100px] h-full relative">
                      <img
                        src={item.beforeImgUrl || '/assets/before_scene.jpg'}
                        alt="Before Scene"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-3 text-[11px] bg-black/75 px-2.5 py-1 rounded text-[#94A3B8] border border-[#182A40] backdrop-blur font-sans">
                        Before: <span className="font-mono">2023-08-12</span> (Baseline)
                      </div>
                    </div>
                  </div>

                  {/* Draggable Divider Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-[#00E5FF] cursor-ew-resize flex items-center justify-center pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#00E5FF] text-[#070D16] flex items-center justify-center font-bold text-xs shadow-[0_0_12px_#00E5FF]">
                      ↔
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Blink Flicker Mode */}
            {comparisonMode === 'flicker' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-[#94A3B8]">
                    <span>Astronomical / tactical blink comparator:</span>
                    <span className="text-[#00E5FF] font-medium font-sans">
                      Current view: <span className="font-mono">{flickerFrame === 'before' ? 'Before (2023-08-12)' : 'After (2025-04-28)'}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsFlickering(!isFlickering)}
                      className="px-2.5 py-1 rounded bg-[#0E1F33] border border-[#182A40] hover:text-[#00E5FF] flex items-center space-x-1 cursor-pointer font-sans"
                    >
                      {isFlickering ? <Pause className="w-3 h-3 text-[#F59E0B]" /> : <Play className="w-3 h-3 text-[#10B981]" />}
                      <span>{isFlickering ? 'Pause' : 'Play'}</span>
                    </button>
                    <span className="text-[#64748B] text-[11px] font-sans">Speed:</span>
                    {[500, 1000, 2000].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFlickerSpeedMs(s)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                          flickerSpeedMs === s ? 'bg-[#00E5FF] text-[#070D16] font-bold' : 'bg-[#0E1F33] text-[#94A3B8]'
                        }`}
                      >
                        {s === 500 ? '2.0 Hz' : s === 1000 ? '1.0 Hz' : '0.5 Hz'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative w-full h-80 rounded-lg overflow-hidden bg-black border border-[#182A40]">
                  <img
                    src={flickerFrame === 'before' ? (item.beforeImgUrl || '/assets/before_scene.jpg') : (item.afterImgUrl || '/assets/after_scene.jpg')}
                    alt="Flicker Frame"
                    className="w-full h-full object-cover transition-opacity duration-75"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded bg-black/85 border border-[#00E5FF] text-xs font-medium text-[#00E5FF] font-sans">
                    {flickerFrame === 'before' ? 'Frame A: 2023-08-12 baseline' : 'Frame B: 2025-04-28 observed change'}
                  </div>
                  {showMask && flickerFrame === 'after' && (
                    <div className="absolute top-[28%] right-[18%] w-[28%] h-[42%] border-2 border-[#EF4444] bg-[#EF4444]/20 rounded-lg flex items-center justify-center">
                      <span className="text-[11px] bg-[#EF4444] text-white px-2 py-0.5 rounded font-medium font-sans">
                        New structure detected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode 3: Difference Mode */}
            {comparisonMode === 'difference' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>Isolated difference mask (Thresholded ΔNDBI &gt; 0.22, cloud excluded)</span>
                  <span className="text-[#10B981] font-medium font-sans">Signal-to-noise: <span className="font-mono">14.8 dB</span></span>
                </div>
                <div className="relative w-full h-80 rounded-lg overflow-hidden bg-black border border-[#182A40]">
                  <img
                    src={item.afterImgUrl || '/assets/after_scene.jpg'}
                    alt="Difference Overlay"
                    className="w-full h-full object-cover filter contrast-125 brightness-75"
                  />
                  {/* Glowing heatmap difference mask */}
                  <div className="absolute inset-0 bg-[#070D16]/75 mix-blend-multiply" />
                  <div className="absolute top-[28%] right-[18%] w-[28%] h-[42%] border-2 border-[#EF4444] bg-[#EF4444]/50 rounded-lg shadow-[0_0_35px_rgba(239,68,68,0.9)] flex flex-col items-center justify-center">
                    <span className="text-xs bg-[#EF4444] text-white px-2.5 py-1 rounded font-medium shadow font-sans">
                      Structural expansion <span className="font-mono">+4.2 ha</span>
                    </span>
                    <span className="text-[10px] text-white mt-1 font-medium font-sans">Confidence: <span className="font-mono">96%</span></span>
                  </div>
                  <div className="absolute top-3 left-3 px-3 py-1 rounded bg-black/85 border border-[#EF4444] text-xs font-medium text-[#EF4444] font-sans">
                    Diff: |T2 - T1| radiometric delta &gt; threshold
                  </div>
                </div>
              </div>
            )}

            {/* Mode 4: Side-by-Side Dual View */}
            {comparisonMode === 'side-by-side' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#94A3B8]">
                    <span className="font-medium text-white">Before: <span className="font-mono">2023-08-12</span></span>
                    <span>Sentinel-2 L2A</span>
                  </div>
                  <div className="aspect-[16/10] bg-black rounded-lg overflow-hidden border border-[#182A40] relative">
                    <img
                      src={item.beforeImgUrl || '/assets/before_scene.jpg'}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-[#94A3B8] font-sans">
                      Baseline surface
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#94A3B8]">
                    <span className="font-medium text-[#00E5FF]">After: <span className="font-mono">2025-04-28</span></span>
                    <span className="text-[#10B981] font-medium font-sans">Change confirmed</span>
                  </div>
                  <div className="aspect-[16/10] bg-black rounded-lg overflow-hidden border border-[#00E5FF]/60 relative">
                    <img
                      src={item.afterImgUrl || '/assets/after_scene.jpg'}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                    {showMask && (
                      <div className="absolute top-[28%] right-[18%] w-[32%] h-[46%] border-2 border-[#EF4444] bg-[#EF4444]/25 rounded flex items-center justify-center animate-pulse">
                        <span className="text-[10px] bg-[#EF4444] text-white px-1.5 py-0.5 rounded font-medium font-mono">
                          {item.areaHa || '4.2 ha'}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-[#00E5FF] font-sans">
                      Observed state
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quantitative Tactical Metric Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#070D16] border border-[#182A40] rounded-xl p-3.5 print:bg-gray-100 print:text-black">
              <span className="text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B] block">CHANGED FOOTPRINT</span>
              <span className="text-xl font-bold font-mono text-[#00E5FF] block mt-0.5 print:text-black">{item.areaHa || '4.2 ha'}</span>
              <span className="text-[11px] text-[#94A3B8] block mt-1">High albedo impervious surface</span>
            </div>

            <div className="bg-[#070D16] border border-[#182A40] rounded-xl p-3.5 print:bg-gray-100 print:text-black">
              <span className="text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B] block">STRUCTURAL UNITS</span>
              <span className="text-xl font-bold font-mono text-white block mt-0.5 print:text-black">17 units</span>
              <span className="text-[11px] text-[#94A3B8] block mt-1">Industrial sheds & piling</span>
            </div>

            <div className="bg-[#070D16] border border-[#182A40] rounded-xl p-3.5 print:bg-gray-100 print:text-black">
              <span className="text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B] block">TEMPORAL INTERVAL</span>
              <span className="text-xl font-bold font-mono text-white block mt-0.5 print:text-black">{item.timeGap || '20 months'}</span>
              <span className="text-[11px] text-[#94A3B8] block mt-1">Aug 2023 → Apr 2025</span>
            </div>

            <div className="bg-[#070D16] border border-[#182A40] rounded-xl p-3.5 print:bg-gray-100 print:text-black">
              <span className="text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B] block">CONFIDENCE VERDICT</span>
              <span className="text-xl font-bold font-mono text-[#10B981] block mt-0.5 print:text-black">{item.confidencePct}%</span>
              <span className="text-[11px] text-[#94A3B8] block mt-1">7-tier filter passed</span>
            </div>
          </div>

          {/* 2. Temporal Evidence Timeline Scrubber */}
          <div className="bg-[#070D16] border border-[#182A40] rounded-xl p-4 print:hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#182A40]/80 mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#38BDF8]" />
                <span className="text-xs font-semibold text-white tracking-normal font-sans">
                  Multi-temporal observation timeline
                </span>
              </div>
              <span className="text-xs text-[#94A3B8] font-sans">
                Scrub observations across 2023–2025 archive
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
              {observations.map((obs) => {
                const isSelected = selectedObsDate === obs.date;
                return (
                  <div
                    key={obs.sceneId}
                    onClick={() => setSelectedObsDate(obs.date)}
                    className={`p-2.5 rounded-lg border text-center cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0E355A] border-[#00E5FF] shadow-md'
                        : 'bg-[#0B1523] border-[#182A40] hover:border-[#223A57]'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] font-mono text-[#94A3B8]">{obs.date}</div>
                      <div className="text-xs font-mono font-medium text-white mt-1">{obs.sceneId.split('_')[0]}</div>
                    </div>

                    <div className="mt-2">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium font-sans ${
                          !obs.usable
                            ? 'bg-[#7F1D1D]/40 text-[#F87171] border border-[#EF4444]/40'
                            : obs.state === 'PERSISTS'
                            ? 'bg-[#064E3B]/60 text-[#34D399] border border-[#10B981]/40'
                            : obs.state === 'CHANGE DETECTED'
                            ? 'bg-[#0E355A] text-[#38BDF8] border border-[#0284C7]'
                            : 'bg-[#1E293B] text-[#94A3B8]'
                        }`}
                      >
                        {obs.state === 'CHANGE DETECTED' ? 'Change detected' : obs.state === 'NO CHANGE' ? 'No change' : obs.state === 'EARLY SIGNAL' ? 'Early signal' : obs.state === 'PERSISTS' ? 'Persists' : 'Unusable'}
                      </span>

                      {obs.marker && (
                        <div className="text-[10px] text-[#00E5FF] font-medium mt-1 font-sans">
                          ★ {obs.marker === 'FIRST EVIDENCE' ? 'First evidence' : 'Change confirmed'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. 8-Step False-Change Analysis ("Why this change is trusted") */}
          <div className="bg-[#070D16] border border-[#182A40] rounded-xl p-4 print:border-gray-300 print:bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#182A40]/80 mb-3 print:border-gray-300">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span className="text-xs font-semibold text-white tracking-normal print:text-black font-sans">
                  False-alarm suppression verification (8-step pipeline)
                </span>
              </div>
              <span className="text-xs text-[#10B981] font-medium flex items-center space-x-1 print:text-black font-sans">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All 7 tiers passed</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {falseChangeSteps.map((s) => (
                <div key={s.step} className="p-2.5 bg-[#0B1523] border border-[#182A40] rounded-lg text-xs print:bg-gray-50 print:border-gray-200">
                  <div className="flex justify-between items-center text-[11px] text-[#94A3B8] mb-1 print:text-gray-600">
                    <span className="text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B]">Step {s.step}</span>
                    <span className="text-[#10B981] font-semibold text-xs font-sans">✓ Pass</span>
                  </div>
                  <div className="text-xs font-medium text-white print:text-black font-sans">{s.name}</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5 print:text-gray-500 font-sans">{s.metric}</div>
                  <div className="flex justify-between items-center mt-2 pt-1 border-t border-[#182A40]/50 text-[11px] print:border-gray-200">
                    <span className="text-[#94A3B8] print:text-gray-600 font-sans">Observed: <b className="text-[#00E5FF] print:text-black font-mono">{s.val}</b></span>
                    <span className="text-[#64748B] print:text-gray-500 font-mono text-[11px]">{s.threshold}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Deliberate False Alarms Correctly Rejected by System */}
          <div className="bg-[#070D16] border border-[#182A40] rounded-xl p-4 print:hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#182A40]/80 mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-xs font-semibold text-white tracking-normal font-sans">
                  False alarms rejected by pipeline (Benchmark tests)
                </span>
              </div>
              <span className="text-xs text-[#94A3B8] font-sans">Precision over recall enforced</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {rejectedAlarms.map((r) => (
                <div key={r.id} className="p-3 bg-[#0B1523] border border-[#EF4444]/30 rounded-lg">
                  <div className="text-[11px] font-sans uppercase tracking-[0.05em] text-[#EF4444] font-medium mb-1">{r.reason}</div>
                  <div className="text-xs font-medium text-white font-sans">{r.type}</div>
                  <div className="text-[11px] text-[#94A3B8] mt-1 font-sans">Metric: <span className="font-mono">{r.metric}</span></div>
                  <div className="text-[11px] text-[#64748B] mt-0.5 font-sans">Scene: <span className="font-mono">{r.scene}</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Defense Analyst Sign-off Box (Clean military format for dossiers) */}
          <div className="bg-[#070D16] border border-[#182A40] rounded-xl p-4 print:border-gray-300 print:bg-white text-xs space-y-2">
            <div className="flex items-center space-x-2 text-[#00E5FF] font-semibold print:text-black font-sans">
              <FileCheck className="w-4 h-4" />
              <span>Defence satellite intelligence audit record</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-[#94A3B8] print:text-gray-700">
              <div>
                <span className="block text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B]">OPERATIONAL TARGET</span>
                <span className="text-white font-medium print:text-black font-sans">{item.title}</span>
              </div>
              <div>
                <span className="block text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B]">COORDINATES</span>
                <span className="text-white font-mono font-medium print:text-black">{item.coordinates}</span>
              </div>
              <div>
                <span className="block text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B]">REVIEWING OFFICER</span>
                <span className="text-[#00E5FF] font-medium print:text-black font-sans">{profile.name} <span className="font-mono text-[10px]">({profile.callSign})</span></span>
              </div>
              <div>
                <span className="block text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B]">PROVENANCE</span>
                <span className="text-white print:text-black font-sans">FC-Siam-diff / RemoteCLIP</span>
              </div>
              <div>
                <span className="block text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B]">VERDICT STATUS</span>
                <span className="text-[#10B981] font-semibold print:text-black font-sans">Action recommended</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
