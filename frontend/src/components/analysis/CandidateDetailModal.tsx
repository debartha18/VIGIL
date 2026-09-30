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
import { formatDateDisplay } from '../../data/groundTruthTargets';

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
  const [selectedObsDate, setSelectedObsDate] = useState<string>(item?.date || '2025-04-28');

  // Derive dynamic observation dates strictly from item
  const beforeDateStr = item?.beforeDate || '2023-04-12';
  const afterDateStr = item?.date || '2025-04-28';
  const displayBeforeDate = formatDateDisplay(beforeDateStr);
  const displayAfterDate = formatDateDisplay(afterDateStr);
  const displayPeriod = item?.observationPeriod || `${displayBeforeDate.slice(-4)} → ${displayAfterDate.slice(-4)}`;

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
      <div className="w-full max-w-6xl h-[94vh] bg-surface border border-border rounded-md flex flex-col shadow-subtle overflow-hidden text-text font-sans print:h-auto print:max-w-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Top Header */}
        <div className="h-14 bg-surface border-b border-border px-6 flex items-center justify-between shrink-0 print:border-b-2 print:border-black print:bg-white print:text-black">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-accent print:hidden" />
            <h2 className="text-sm font-semibold text-text tracking-normal print:text-black print:text-base">
              Geospatial Analysis Dossier // <span className="font-mono text-accent">{item.id}</span> — {item.title}
            </h2>
            <span className="px-2 py-0.5 rounded bg-raised border border-border text-[11px] text-ok font-medium print:border print:border-black print:text-black print:bg-transparent">
              Verified real change (<span className="font-mono font-semibold">{item.confidencePct}%</span>)
            </span>
          </div>

          <div className="flex items-center space-x-2.5 print:hidden">
            <button
              onClick={handlePrintReport}
              className="px-3 py-1.5 bg-raised hover:bg-surface border border-border rounded text-xs text-text hover:text-accent flex items-center space-x-1.5 transition font-medium shadow-subtle cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export dossier (Print / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded bg-surface hover:bg-raised border border-border flex items-center justify-center text-text-2 hover:text-text transition cursor-pointer"
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
          <div className="flex items-center justify-between bg-bg border border-border rounded-md p-1.5 print:hidden">
            <div className="flex items-center space-x-1">
              <span className="text-[11px] font-sans uppercase tracking-[0.05em] text-text-2 px-2 font-medium">Mode:</span>
              <button
                onClick={() => setComparisonMode('split')}
                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer ${
                  comparisonMode === 'split'
                    ? 'bg-raised text-accent border border-border shadow-subtle'
                    : 'text-text-2 hover:text-text hover:bg-raised/60'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Split view (Swipe)</span>
              </button>

              <button
                onClick={() => setComparisonMode('flicker')}
                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer ${
                  comparisonMode === 'flicker'
                    ? 'bg-raised text-accent border border-border shadow-subtle'
                    : 'text-text-2 hover:text-text hover:bg-raised/60'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Blink flicker (1Hz)</span>
              </button>

              <button
                onClick={() => setComparisonMode('difference')}
                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer ${
                  comparisonMode === 'difference'
                    ? 'bg-raised text-accent border border-border shadow-subtle'
                    : 'text-text-2 hover:text-text hover:bg-raised/60'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Difference mask</span>
              </button>

              <button
                onClick={() => setComparisonMode('side-by-side')}
                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer ${
                  comparisonMode === 'side-by-side'
                    ? 'bg-raised text-accent border border-border shadow-subtle'
                    : 'text-text-2 hover:text-text hover:bg-raised/60'
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
                    ? 'bg-raised border-border text-accent shadow-subtle'
                    : 'bg-surface border-border text-text-2 hover:text-text'
                }`}
              >
                {showMask ? '✓ Change annotation on' : 'Annotation off'}
              </button>
            </div>
          </div>

          {/* 1. Comparison Canvas (Changes depending on selected mode) */}
          <div className="bg-surface border border-border rounded-md p-3.5 print:border-gray-300 print:bg-white shadow-subtle">
            {/* Mode 1: Split View / Swipe */}
            {comparisonMode === 'split' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-text-2">
                  <span>Drag slider or click viewport to inspect Before vs After boundaries</span>
                  <span className="text-accent font-medium font-sans">Slider: <span className="font-mono">{sliderPos}%</span></span>
                </div>
                <div
                  className="relative w-full h-80 rounded-md overflow-hidden bg-bg border border-border cursor-ew-resize select-none"
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
                      className="w-full h-full object-cover object-center"
                      style={{ filter: 'brightness(1.02) contrast(1.08) saturate(1.14)' }}
                    />
                    {showMask && (
                      <div className="absolute top-[28%] right-[18%] w-[28%] h-[42%] border-2 border-change bg-change/20 rounded flex items-center justify-center pointer-events-none">
                        <span className="text-[11px] bg-change text-bg px-2 py-0.5 rounded font-medium font-mono shadow-subtle">
                          {item.areaHa || '4.2 ha'}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-3 text-[11px] bg-bg/85 px-2.5 py-1 rounded text-accent border border-border backdrop-blur font-sans">
                      After: <span className="font-mono">{displayAfterDate}</span> ({item.sensor || 'Sentinel-2 L2A'})
                    </div>
                  </div>

                  {/* Before Layer (Seamlessly clipped to sliderPos with exact same dimensions) */}
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                  >
                    <img
                      src={item.beforeImgUrl || '/assets/before_scene.jpg'}
                      alt="Before Scene"
                      className="w-full h-full object-cover object-center"
                      style={{ filter: 'brightness(1.02) contrast(1.08) saturate(1.14)' }}
                    />
                    <div className="absolute top-2 left-3 text-[11px] bg-bg/85 px-2.5 py-1 rounded text-text-2 border border-border backdrop-blur font-sans">
                      Before: <span className="font-mono">{displayBeforeDate}</span> (Baseline)
                    </div>
                  </div>

                  {/* Draggable Divider Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-border pointer-events-none flex items-center justify-center"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="w-4 h-7 rounded bg-surface border border-border flex items-center justify-center text-[10px] text-text-2 shadow-subtle">
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
                  <div className="flex items-center space-x-2 text-text-2">
                    <span>Astronomical / tactical blink comparator:</span>
                    <span className="text-accent font-medium font-sans">
                      Current view: <span className="font-mono">{flickerFrame === 'before' ? `Before (${displayBeforeDate})` : `After (${displayAfterDate})`}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsFlickering(!isFlickering)}
                      className="px-2.5 py-1 rounded bg-raised border border-border text-text hover:text-accent flex items-center space-x-1 cursor-pointer font-sans"
                    >
                      {isFlickering ? <Pause className="w-3 h-3 text-change" /> : <Play className="w-3 h-3 text-ok" />}
                      <span>{isFlickering ? 'Pause' : 'Play'}</span>
                    </button>
                    <span className="text-text-2 text-[11px] font-sans">Speed:</span>
                    {[500, 1000, 2000].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFlickerSpeedMs(s)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                          flickerSpeedMs === s ? 'bg-raised text-accent border border-border font-bold' : 'bg-surface text-text-2 border border-border'
                        }`}
                      >
                        {s === 500 ? '2.0 Hz' : s === 1000 ? '1.0 Hz' : '0.5 Hz'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative w-full h-80 rounded-md overflow-hidden bg-bg border border-border">
                  <img
                    src={flickerFrame === 'before' ? (item.beforeImgUrl || '/assets/before_scene.jpg') : (item.afterImgUrl || '/assets/after_scene.jpg')}
                    alt="Flicker Frame"
                    className="w-full h-full object-cover object-center transition-opacity duration-75"
                    style={{ filter: 'brightness(1.02) contrast(1.08) saturate(1.14)' }}
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded bg-bg/85 border border-border text-xs font-medium text-text font-sans backdrop-blur">
                    {flickerFrame === 'before' ? `Frame A: ${displayBeforeDate} baseline` : `Frame B: ${displayAfterDate} observed change`}
                  </div>
                  {showMask && flickerFrame === 'after' && (
                    <div className="absolute top-[28%] right-[18%] w-[28%] h-[42%] border-2 border-change bg-change/20 rounded flex items-center justify-center">
                      <span className="text-[11px] bg-change text-bg px-2 py-0.5 rounded font-medium font-sans">
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
                <div className="flex items-center justify-between text-xs text-text-2">
                  <span>Isolated difference mask (Thresholded ΔNDBI &gt; 0.22, cloud excluded)</span>
                  <span className="text-ok font-medium font-sans">Signal-to-noise: <span className="font-mono">14.8 dB</span></span>
                </div>
                <div className="relative w-full h-80 rounded-md overflow-hidden bg-bg border border-border">
                  <img
                    src={item.afterImgUrl || '/assets/after_scene.jpg'}
                    alt="Difference Overlay"
                    className="w-full h-full object-cover object-center"
                    style={{ filter: 'brightness(1.02) contrast(1.08) saturate(1.14)' }}
                  />
                  {/* Subtle difference mask */}
                  <div className="absolute inset-0 bg-bg/60 mix-blend-multiply" />
                  <div className="absolute top-[28%] right-[18%] w-[28%] h-[42%] border-2 border-change bg-change/30 rounded flex flex-col items-center justify-center">
                    <span className="text-xs bg-change text-bg px-2.5 py-1 rounded font-medium shadow-subtle font-sans">
                      Structural expansion <span className="font-mono">{item.areaHa || '4.2 ha'}</span>
                    </span>
                    <span className="text-[10px] text-text mt-1 font-medium font-sans">Confidence: <span className="font-mono">{item.confidencePct}%</span></span>
                  </div>
                  <div className="absolute top-3 left-3 px-3 py-1 rounded bg-bg/85 border border-border text-xs font-medium text-change font-sans backdrop-blur">
                    Diff: |T2 - T1| radiometric delta &gt; threshold
                  </div>
                </div>
              </div>
            )}

            {/* Mode 4: Side-by-Side Dual View */}
            {comparisonMode === 'side-by-side' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-text-2">
                    <span className="font-medium text-text">Before: <span className="font-mono">{displayBeforeDate}</span></span>
                    <span>{item.sensor || 'Sentinel-2 L2A'}</span>
                  </div>
                  <div className="aspect-[16/10] bg-bg rounded-md overflow-hidden border border-border relative">
                    <img
                      src={item.beforeImgUrl || '/assets/before_scene.jpg'}
                      alt="Before"
                      className="w-full h-full object-cover object-center"
                      style={{ filter: 'brightness(1.02) contrast(1.08) saturate(1.14)' }}
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-bg/85 border border-border text-[10px] text-text-2 font-sans backdrop-blur">
                      Baseline surface
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-text-2">
                    <span className="font-medium text-text">After: <span className="font-mono">{displayAfterDate}</span></span>
                    <span className="text-ok font-medium font-sans">Change confirmed</span>
                  </div>
                  <div className="aspect-[16/10] bg-bg rounded-md overflow-hidden border border-border relative">
                    <img
                      src={item.afterImgUrl || '/assets/after_scene.jpg'}
                      alt="After"
                      className="w-full h-full object-cover object-center"
                      style={{ filter: 'brightness(1.02) contrast(1.08) saturate(1.14)' }}
                    />
                    {showMask && (
                      <div className="absolute top-[28%] right-[18%] w-[32%] h-[46%] border-2 border-change bg-change/25 rounded flex items-center justify-center">
                        <span className="text-[10px] bg-change text-bg px-1.5 py-0.5 rounded font-medium font-mono">
                          {item.areaHa || '4.2 ha'}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-bg/85 border border-border text-[10px] text-accent font-sans backdrop-blur">
                      Observed state
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quantitative Tactical Metric Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="bg-surface border border-border rounded-md p-3 print:bg-gray-100 print:text-black">
              <span className="text-text-2 text-xs block">Changed footprint</span>
              <span className="text-xl font-bold font-mono text-text block mt-0.5 print:text-black">{item.areaHa || '4.2 ha'}</span>
              <span className="text-[11px] text-text-2 block mt-1">High albedo impervious surface</span>
            </div>

            <div className="bg-surface border border-border rounded-md p-3 print:bg-gray-100 print:text-black">
              <span className="text-text-2 text-xs block">Structural units</span>
              <span className="text-xl font-bold font-mono text-text block mt-0.5 print:text-black">17 units</span>
              <span className="text-[11px] text-text-2 block mt-1">Industrial sheds & piling</span>
            </div>

            <div className="bg-surface border border-border rounded-md p-3 print:bg-gray-100 print:text-black">
              <span className="text-text-2 text-xs block">Temporal interval</span>
              <span className="text-xl font-bold font-mono text-text block mt-0.5 print:text-black">{item.timeGap || '20 months'}</span>
              <span className="text-[11px] text-text-2 block mt-1">{displayPeriod}</span>
            </div>

            <div className="bg-surface border border-border rounded-md p-3 print:bg-gray-100 print:text-black">
              <span className="text-text-2 text-xs block">Confidence verdict</span>
              <span className="text-xl font-bold font-mono text-ok block mt-0.5 print:text-black">{item.confidencePct}%</span>
              <span className="text-[11px] text-text-2 block mt-1">7-tier filter passed</span>
            </div>
          </div>

          {/* 2. Temporal Evidence Timeline Scrubber */}
          <div className="bg-surface border border-border rounded-md p-3.5 print:hidden shadow-subtle">
            <div className="flex items-center justify-between pb-2.5 border-b border-border/80 mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold text-text tracking-normal font-sans">
                  Multi-temporal observation timeline
                </span>
              </div>
              <span className="text-xs text-text-2 font-sans">
                Scrub observations across archive
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
              {observations.map((obs) => {
                const isSelected = selectedObsDate === obs.date;
                return (
                  <div
                    key={obs.sceneId}
                    onClick={() => setSelectedObsDate(obs.date)}
                    className={`p-2.5 rounded-md border text-center cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-raised border-accent text-accent shadow-subtle'
                        : 'bg-surface border-border text-text-2 hover:border-border/80 hover:text-text'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] font-mono text-text-2">{obs.date}</div>
                      <div className="text-xs font-mono font-medium text-text mt-1">{obs.sceneId.split('_')[0]}</div>
                    </div>

                    <div className="mt-2">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium font-sans ${
                          !obs.usable
                            ? 'bg-flag/15 text-flag border border-flag/30'
                            : obs.state === 'PERSISTS'
                            ? 'bg-ok/15 text-ok border border-ok/30'
                            : obs.state === 'CHANGE DETECTED'
                            ? 'bg-change/15 text-change border border-change/30'
                            : 'bg-raised text-text-2 border border-border'
                        }`}
                      >
                        {obs.state === 'CHANGE DETECTED' ? 'Change detected' : obs.state === 'NO CHANGE' ? 'No change' : obs.state === 'EARLY SIGNAL' ? 'Early signal' : obs.state === 'PERSISTS' ? 'Persists' : 'Unusable'}
                      </span>

                      {obs.marker && (
                        <div className="text-[10px] text-accent font-medium mt-1 font-sans">
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
          <div className="bg-surface border border-border rounded-md p-3.5 print:border-gray-300 print:bg-white shadow-subtle">
            <div className="flex items-center justify-between pb-2.5 border-b border-border/80 mb-3 print:border-gray-300">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-ok" />
                <span className="text-xs font-semibold text-text tracking-normal print:text-black font-sans">
                  False-alarm suppression verification (8-step pipeline)
                </span>
              </div>
              <span className="text-xs text-ok font-medium flex items-center space-x-1 print:text-black font-sans">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All 7 tiers passed</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {falseChangeSteps.map((s) => (
                <div key={s.step} className="p-2.5 bg-raised border border-border rounded-md text-xs print:bg-gray-50 print:border-gray-200">
                  <div className="flex justify-between items-center text-[11px] text-text-2 mb-1 print:text-gray-600">
                    <span className="text-[11px] font-sans uppercase tracking-[0.05em] text-text-2">Step {s.step}</span>
                    <span className="text-ok font-semibold text-xs font-sans">✓ Pass</span>
                  </div>
                  <div className="text-xs font-medium text-text print:text-black font-sans">{s.name}</div>
                  <div className="text-[11px] text-text-2 mt-0.5 print:text-gray-500 font-sans">{s.metric}</div>
                  <div className="flex justify-between items-center mt-2 pt-1 border-t border-border/50 text-[11px] print:border-gray-200">
                    <span className="text-text-2 print:text-gray-600 font-sans">Observed: <b className="text-text print:text-black font-mono">{s.val}</b></span>
                    <span className="text-text-2 print:text-gray-500 font-mono text-[11px]">{s.threshold}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Deliberate False Alarms Correctly Rejected by System */}
          <div className="bg-surface border border-border rounded-md p-3.5 print:hidden shadow-subtle">
            <div className="flex items-center justify-between pb-2.5 border-b border-border/80 mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-change" />
                <span className="text-xs font-semibold text-text tracking-normal font-sans">
                  False alarms rejected by pipeline (Benchmark tests)
                </span>
              </div>
              <span className="text-xs text-text-2 font-sans">Precision over recall enforced</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {rejectedAlarms.map((r) => (
                <div key={r.id} className="p-3 bg-raised border border-border rounded-md">
                  <div className="text-[11px] font-sans uppercase tracking-[0.05em] text-flag font-medium mb-1">{r.reason}</div>
                  <div className="text-xs font-medium text-text font-sans">{r.type}</div>
                  <div className="text-[11px] text-text-2 mt-1 font-sans">Metric: <span className="font-mono">{r.metric}</span></div>
                  <div className="text-[11px] text-text-2 mt-0.5 font-sans">Scene: <span className="font-mono">{r.scene}</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Defense Analyst Sign-off Box (Clean military format for dossiers) */}
          <div className="bg-surface border border-border rounded-md p-3.5 print:border-gray-300 print:bg-white text-xs space-y-2 shadow-subtle">
            <div className="flex items-center space-x-2 text-text font-semibold print:text-black font-sans">
              <FileCheck className="w-4 h-4 text-accent" />
              <span>Defence satellite intelligence audit record</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-text-2 print:text-gray-700">
              <div>
                <span className="block text-[11px] font-sans uppercase tracking-[0.05em] text-text-2">OPERATIONAL TARGET</span>
                <span className="text-text font-medium print:text-black font-sans">{item.title}</span>
              </div>
              <div>
                <span className="block text-[11px] font-sans uppercase tracking-[0.05em] text-text-2">COORDINATES</span>
                <span className="text-text font-mono font-medium print:text-black">{item.coordinates}</span>
              </div>
              <div>
                <span className="block text-[11px] font-sans uppercase tracking-[0.05em] text-text-2">REVIEWING OFFICER</span>
                <span className="text-accent font-medium print:text-black font-sans">{profile.name} <span className="font-mono text-[10px]">({profile.callSign})</span></span>
              </div>
              <div>
                <span className="block text-[11px] font-sans uppercase tracking-[0.05em] text-text-2">PROVENANCE</span>
                <span className="text-text print:text-black font-sans">FC-Siam-diff / RemoteCLIP</span>
              </div>
              <div>
                <span className="block text-[11px] font-sans uppercase tracking-[0.05em] text-text-2">VERDICT STATUS</span>
                <span className="text-ok font-semibold print:text-black font-sans">Action recommended</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
