import React, { useState, useRef } from 'react';
import {
  ExternalLink,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Sliders,
  Columns,
  Eye,
  EyeOff,
  RotateCcw
} from 'lucide-react';
import { api } from '../../services/api';
import {
  TimelinePass,
  computeMonthsBetween,
  computeObservationPeriod,
  formatImageOverlayLabel
} from '../../data/groundTruthTargets';

export type ChangeViewMode = 'visual' | 'comparison' | 'change-map';

export type SpectralBandMode = 'RGB' | 'FALSE_COLOR' | 'NDVI' | 'NDWI';

interface ChangeAnalysisCardProps {
  onViewFullReport?: () => void;
  candidateTitle?: string;
  changeType?: string;
  locationName?: string;
  coordinates?: string;
  areaHa?: string;
  timeGap?: string;
  confidence?: number;
  beforeImgUrl?: string;
  afterImgUrl?: string;
  candidateId?: string;
  observationPeriod?: string;
  cloudCover?: string;
  beforeCloudCover?: string;
  beforeDate?: string;
  afterDate?: string;
  resolution?: string;
  changePercentage?: string;
  sensor?: string;
  passes?: TimelinePass[];
  externalViewMode?: ChangeViewMode;
  onViewModeChange?: (mode: ChangeViewMode) => void;
  externalShowChangeMask?: boolean;
  onToggleChangeMask?: (show: boolean) => void;
  externalSpectralMode?: SpectralBandMode;
  onSpectralModeChange?: (mode: SpectralBandMode) => void;
}

export const ChangeAnalysisCard: React.FC<ChangeAnalysisCardProps> = ({
  onViewFullReport,
  candidateTitle = 'Hazira Deepwater Wharf & Piling Deck',
  changeType = 'New Construction',
  locationName = 'Hazira Coastal Sector',
  coordinates = '21.4587° N, 72.7812° E',
  areaHa = '4.2 ha (42,000 m²)',
  timeGap = '20 months',
  confidence = 94,
  beforeImgUrl = '/assets/before_scene.jpg',
  afterImgUrl = '/assets/after_scene.jpg',
  candidateId = 'CAND-2026-001',
  observationPeriod = '2023 → 2025',
  cloudCover = '1.8%',
  beforeCloudCover = '2.1%',
  beforeDate = '2023-08-12',
  afterDate = '2025-04-28',
  resolution = '10 m',
  changePercentage = '+34.8%',
  sensor = 'Sentinel-2 Optical (10m)',
  passes,
  externalViewMode,
  onViewModeChange,
  externalShowChangeMask,
  onToggleChangeMask,
  externalSpectralMode,
  onSpectralModeChange
}) => {
  // 1. Primary Viewing Mode: A. Visual | B. Before / After (Comparison) | C. Change Map
  const [viewMode, setViewMode] = useState<ChangeViewMode>(externalViewMode || 'comparison');
  const [comparisonType, setComparisonType] = useState<'swipe' | 'side-by-side'>('swipe');
  const [swipePos, setSwipePos] = useState<number>(50);

  // 2. Change Mask & Bounding Box Toggles
  const [showChangeMask, setShowChangeMask] = useState<boolean>(
    externalShowChangeMask !== undefined ? externalShowChangeMask : true
  );
  const [showBoundingBox, setShowBoundingBox] = useState<boolean>(true);
  const [maskOpacity, setMaskOpacity] = useState<number>(65); // percentage

  // 3. Spectral Band Mode (RGB, False Color, NDVI, NDWI)
  const [spectralMode, setSpectralMode] = useState<SpectralBandMode>(externalSpectralMode || 'RGB');

  // Synchronize external prop overrides
  React.useEffect(() => {
    if (externalViewMode && externalViewMode !== viewMode) {
      setViewMode(externalViewMode);
    }
  }, [externalViewMode]);

  React.useEffect(() => {
    if (externalShowChangeMask !== undefined && externalShowChangeMask !== showChangeMask) {
      setShowChangeMask(externalShowChangeMask);
    }
  }, [externalShowChangeMask]);

  React.useEffect(() => {
    if (externalSpectralMode && externalSpectralMode !== spectralMode) {
      setSpectralMode(externalSpectralMode);
    }
  }, [externalSpectralMode]);

  // 4. Image Enhancement Adjustments (Brightness, Contrast, Sharpness)
  const [showAdjustments, setShowAdjustments] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(0); // -50 to +50
  const [contrast, setContrast] = useState<number>(0); // -50 to +50
  const [sharpness, setSharpness] = useState<'normal' | 'enhanced' | 'crisp'>('normal');

  // 5. Active Timeline Milestone
  const [selectedTimelineDate, setSelectedTimelineDate] = useState<string>(afterDate);

  // 6. Analyst Verdict & Workflow state
  const [analystVerdict, setAnalystVerdict] = useState<'CONFIRMED' | 'REJECTED' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Derive dynamically computed months and period strictly from baseline and current dates
  const computedMonths = beforeDate && afterDate ? computeMonthsBetween(beforeDate, afterDate) : (timeGap ? parseInt(timeGap, 10) || 24 : 24);
  const computedPeriod = beforeDate && afterDate ? computeObservationPeriod(beforeDate, afterDate) : (observationPeriod || 'Apr 2023 → Apr 2025');
  const computedTimeGap = beforeDate && afterDate ? `${computedMonths} months` : (timeGap || `${computedMonths} months`);

  // Multi-temporal milestones along continuous timeline - strictly chronological with baseline as first and afterDate as last
  const timelineMilestones: TimelinePass[] = passes && passes.length > 0 ? passes : [
    { date: beforeDate, label: 'Baseline', month: 'Apr 2023', img: beforeImgUrl, hasChange: false },
    { date: '2024-02-18', label: 'Excavation', month: 'Feb 2024', img: '/assets/card_5_land.jpg', hasChange: false },
    { date: '2024-08-19', label: 'Piling Works', month: 'Aug 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
    { date: afterDate, label: 'Superstructure', month: 'Apr 2025', img: afterImgUrl, hasChange: true },
  ];

  // Derived clean single-line overlay labels adhering to:
  // "BEFORE · 12 Apr 2023 · 10 m · Cloud 0.8%" / "AFTER · 28 Apr 2025 · 10 m · Cloud 1.2%"
  const beforeOverlayLabel = formatImageOverlayLabel('BEFORE', beforeDate, resolution, beforeCloudCover);
  const afterOverlayLabel = formatImageOverlayLabel('AFTER', selectedTimelineDate, resolution, cloudCover);

  const activePhase = timelineMilestones.find((p) => p.date === selectedTimelineDate) || timelineMilestones[3];

  const handleQuickReview = async (verdict: 'CONFIRMED' | 'REJECTED') => {
    setIsSubmitting(true);
    try {
      await api.submitReviewDecision({
        candidateId,
        analyst: 'Lead Analyst // DGIS Ground Station',
        verdict,
        comment: `Recorded from Change Analysis Console: ${verdict} on ${candidateTitle}`,
      });
      setAnalystVerdict(verdict);
    } catch {
      setAnalystVerdict(verdict);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetEnhancements = () => {
    setBrightness(0);
    setContrast(0);
    setSharpness('normal');
    setMaskOpacity(65);
    setSpectralMode('RGB');
  };

  // Compute CSS filter string for active enhancements & spectral band simulations
  const getFilterStyle = (_isAfter?: boolean) => {
    let base = `brightness(${1 + brightness / 100}) contrast(${1 + contrast / 100})`;

    if (sharpness === 'enhanced') {
      base += ' contrast(1.15) saturate(1.1)';
    } else if (sharpness === 'crisp') {
      base += ' contrast(1.3) saturate(1.25)';
    }

    if (spectralMode === 'FALSE_COLOR') {
      // Color Infrared simulation (NIR->Red, Red->Green, Green->Blue)
      base += ' saturate(2.4) hue-rotate(310deg) contrast(1.25)';
    } else if (spectralMode === 'NDVI') {
      // Normalized Difference Vegetation Index simulation (Vegetation highlighted in emerald green)
      base += ' saturate(2.8) hue-rotate(85deg) contrast(1.4)';
    } else if (spectralMode === 'NDWI') {
      // Normalized Difference Water Index simulation (Water bodies highlighted in electric cyan/navy)
      base += ' saturate(2.6) hue-rotate(185deg) contrast(1.35)';
    }

    return base;
  };

  return (
    <div className="w-full h-full bg-[#0B1523] border border-[#182A40] rounded-xl p-3 flex flex-col justify-between select-none overflow-hidden font-sans text-white text-xs shadow-2xl">
      {/* 1. TOP HEADER BAR: Viewing Modes & Quick Actions */}
      <div className="flex items-center justify-between pb-2 border-b border-[#182A40]/80 shrink-0 gap-2">
        {/* Left: Mode Title + Target Name */}
        <div className="flex items-center space-x-2 min-w-0">
          <TrendingUp className="w-4 h-4 text-[#00E5FF] shrink-0" />
          <h2 className="text-xs sm:text-sm font-semibold text-white tracking-normal font-sans truncate max-w-[190px] sm:max-w-xs" title={candidateTitle}>
            {candidateTitle}
          </h2>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#070D16] border border-[#182A40] text-[11px] font-mono text-[#38BDF8] shrink-0" title={coordinates}>
            {coordinates.split(',')[0]}
          </span>
          <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-[#070D16] border border-[#182A40] text-[11px] font-sans text-[#94A3B8] shrink-0" title={locationName}>
            {locationName}
          </span>
        </div>

        {/* Center/Right: 3 Primary Viewing Modes (A. Visual | B. Before / After | C. Change Map) */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <div className="flex items-center bg-[#070D16] p-0.5 rounded-lg border border-[#182A40]">
            <button
              onClick={() => { setViewMode('visual'); onViewModeChange?.('visual'); }}
              className={`h-6 px-2.5 rounded-md text-[11px] font-medium transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none flex items-center space-x-1 ${
                viewMode === 'visual'
                  ? 'bg-[#0284C7] text-white shadow font-semibold'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              title="A. Visual Mode: Normal high-resolution satellite imagery"
            >
              <span>Visual</span>
            </button>

            <button
              onClick={() => { setViewMode('comparison'); onViewModeChange?.('comparison'); }}
              className={`h-6 px-2.5 rounded-md text-[11px] font-medium transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none flex items-center space-x-1 ${
                viewMode === 'comparison'
                  ? 'bg-[#0284C7] text-white shadow font-semibold'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              title="B. Before / After Mode: Multi-temporal comparative analysis"
            >
              <span>Before / After</span>
            </button>

            <button
              onClick={() => { setViewMode('change-map'); onViewModeChange?.('change-map'); }}
              className={`h-6 px-2.5 rounded-md text-[11px] font-medium transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none flex items-center space-x-1 ${
                viewMode === 'change-map'
                  ? 'bg-[#0284C7] text-white shadow font-semibold'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              title="C. Change Map Mode: Semi-transparent detected change mask"
            >
              <span>Change Map</span>
            </button>
          </div>

          {/* Full Report Dossier Button */}
          <button
            onClick={onViewFullReport}
            className="h-6 hidden md:flex items-center space-x-1 px-2 rounded-lg border border-[#0284C7]/50 text-[11px] text-[#38BDF8] hover:bg-[#0E2D4A] hover:border-[#38BDF8] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none font-sans"
            title="Open comprehensive intelligence dossier"
          >
            <span>Dossier</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. IMAGE TOOLBAR & ENHANCEMENT CONTROLS (Directly above the satellite imagery) */}
      <div className="flex flex-wrap items-center justify-between py-1.5 border-b border-[#182A40]/60 gap-1.5 shrink-0 text-[11px]">
        {/* Left: Spectral Band Switcher */}
        <div className="flex items-center space-x-1">
          <span className="text-[10px] uppercase font-bold text-[#64748B] mr-1 hidden sm:inline">Band:</span>
          <div className="flex items-center bg-[#070D16] p-0.5 rounded-lg border border-[#182A40]">
            <button
              onClick={() => { setSpectralMode('RGB'); onSpectralModeChange?.('RGB'); }}
              className={`h-5 px-2 rounded text-[10px] font-mono font-medium transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none ${
                spectralMode === 'RGB' ? 'bg-[#00E5FF] text-[#070D16] font-bold shadow' : 'text-[#94A3B8] hover:text-white'
              }`}
              title="True Color RGB (B04, B03, B02)"
            >
              RGB
            </button>
            <button
              onClick={() => { setSpectralMode('FALSE_COLOR'); onSpectralModeChange?.('FALSE_COLOR'); }}
              className={`h-5 px-2 rounded text-[10px] font-mono font-medium transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none ${
                spectralMode === 'FALSE_COLOR' ? 'bg-[#A855F7] text-white font-bold shadow' : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Color Infrared (NIR/Red/Green) - Vegetation & boundary contrast [DEMO simulation]"
            >
              False Color <span className="text-[8px] opacity-75">(DEMO)</span>
            </button>
            <button
              onClick={() => { setSpectralMode('NDVI'); onSpectralModeChange?.('NDVI'); }}
              className={`h-5 px-2 rounded text-[10px] font-mono font-medium transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none ${
                spectralMode === 'NDVI' ? 'bg-[#10B981] text-white font-bold shadow' : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Normalized Difference Vegetation Index [DEMO radiometric simulation]"
            >
              NDVI <span className="text-[8px] opacity-75">(DEMO)</span>
            </button>
            <button
              onClick={() => { setSpectralMode('NDWI'); onSpectralModeChange?.('NDWI'); }}
              className={`h-5 px-2 rounded text-[10px] font-mono font-medium transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none ${
                spectralMode === 'NDWI' ? 'bg-[#0284C7] text-white font-bold shadow' : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Normalized Difference Water Index [DEMO water delineation]"
            >
              NDWI <span className="text-[8px] opacity-75">(DEMO)</span>
            </button>
          </div>
        </div>

        {/* Right: Change Mask / Bounding Box & Enhancement Toggles */}
        <div className="flex items-center space-x-1.5 ml-auto">
          {/* Change Mask Toggle */}
          <button
            onClick={() => { const next = !showChangeMask; setShowChangeMask(next); onToggleChangeMask?.(next); }}
            className={`h-5 px-2 rounded text-[10px] font-medium border flex items-center space-x-1 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none ${
              showChangeMask
                ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444] font-semibold shadow'
                : 'bg-[#070D16] border-[#182A40] text-[#94A3B8] hover:text-white'
            }`}
            title="Toggle semi-transparent change mask overlay"
          >
            {showChangeMask ? <Eye className="w-3 h-3 text-[#EF4444]" /> : <EyeOff className="w-3 h-3 text-[#94A3B8]" />}
            <span>Mask Overlay</span>
          </button>

          {/* Bounding Box Secondary Toggle */}
          <button
            onClick={() => setShowBoundingBox(!showBoundingBox)}
            className={`h-5 px-2 rounded text-[10px] font-medium border flex items-center space-x-1 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none ${
              showBoundingBox
                ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] font-semibold'
                : 'bg-[#070D16] border-[#182A40] text-[#94A3B8] hover:text-white'
            }`}
            title="Toggle secondary AOI bounding box frame"
          >
            <span>Box Ref</span>
          </button>

          {/* Comparison Slider vs Dual Tile (When in comparison mode) */}
          {viewMode === 'comparison' && (
            <div className="flex items-center bg-[#070D16] p-0.5 rounded-lg border border-[#182A40]">
              <button
                onClick={() => setComparisonType('swipe')}
                className={`h-5 px-1.5 rounded text-[10px] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none flex items-center space-x-1 ${
                  comparisonType === 'swipe' ? 'bg-[#0284C7] text-white font-bold' : 'text-[#94A3B8] hover:text-white'
                }`}
                title="Draggable comparison slider"
              >
                <Sliders className="w-2.5 h-2.5" />
                <span className="hidden sm:inline">Slider</span>
              </button>
              <button
                onClick={() => setComparisonType('side-by-side')}
                className={`h-5 px-1.5 rounded text-[10px] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none flex items-center space-x-1 ${
                  comparisonType === 'side-by-side' ? 'bg-[#0284C7] text-white font-bold' : 'text-[#94A3B8] hover:text-white'
                }`}
                title="Side-by-side dual tile comparison"
              >
                <Columns className="w-2.5 h-2.5" />
                <span className="hidden sm:inline">Dual</span>
              </button>
            </div>
          )}

          {/* Adjustments Tray Toggle */}
          <button
            onClick={() => setShowAdjustments(!showAdjustments)}
            className={`h-5 px-2 rounded text-[10px] font-medium border flex items-center space-x-1 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none ${
              showAdjustments || brightness !== 0 || contrast !== 0 || sharpness !== 'normal'
                ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B] font-semibold'
                : 'bg-[#070D16] border-[#182A40] text-[#94A3B8] hover:text-white'
            }`}
            title="Image enhancement controls (Brightness, Contrast, Sharpness)"
          >
            <Sliders className="w-2.5 h-2.5" />
            <span className="hidden sm:inline">Enhance</span>
          </button>

          {/* Reset View Button */}
          <button
            onClick={resetEnhancements}
            className="w-5 h-5 rounded bg-[#070D16] hover:bg-[#15273F] border border-[#182A40] text-[#94A3B8] hover:text-white flex items-center justify-center transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none"
            title="Reset enhancements and views"
          >
            <RotateCcw className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* 3. OPTIONAL EXPANDABLE ENHANCEMENT CONTROLS TRAY */}
      {showAdjustments && (
        <div className="bg-[#070D16] p-2.5 rounded-lg border border-[#182A40] my-1 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[10px] shrink-0 animate-in fade-in">
          <div>
            <div className="flex justify-between text-[#94A3B8] mb-1">
              <span>Brightness:</span>
              <span className="font-mono text-white">{brightness > 0 ? `+${brightness}` : brightness}%</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-[#00E5FF] h-1.5 bg-[#182A40] rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between text-[#94A3B8] mb-1">
              <span>Contrast:</span>
              <span className="font-mono text-white">{contrast > 0 ? `+${contrast}` : contrast}%</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-[#00E5FF] h-1.5 bg-[#182A40] rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between text-[#94A3B8] mb-1">
              <span>Mask Opacity:</span>
              <span className="font-mono text-white">{maskOpacity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={maskOpacity}
              onChange={(e) => setMaskOpacity(Number(e.target.value))}
              className="w-full accent-[#EF4444] h-1.5 bg-[#182A40] rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[#94A3B8]">Sharpness:</span>
            <div className="flex items-center space-x-1">
              {(['normal', 'enhanced', 'crisp'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSharpness(s)}
                  className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-mono ${
                    sharpness === s ? 'bg-[#00E5FF] text-[#070D16] font-bold' : 'bg-[#0E1A2B] text-[#94A3B8]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. HERO SATELLITE IMAGERY WORKSPACE (Maximum Visual Focus) */}
      <div className="flex-1 min-h-[220px] sm:min-h-[240px] relative rounded-xl border border-[#182A40] bg-[#020617] overflow-hidden my-1.5 flex flex-col justify-center">
        {/* VIEW MODE A: VISUAL (Single Full-Size High-Resolution Viewport) */}
        {viewMode === 'visual' && (
          <div className="w-full h-full relative group">
            <img
              src={activePhase.img}
              alt="Satellite observation"
              className="w-full h-full object-cover select-none transition-transform duration-300"
              style={{
                filter: getFilterStyle(true),
                imageRendering: 'auto'
              }}
            />

            {/* Change Mask Overlay if enabled in Visual mode */}
            {showChangeMask && activePhase.hasChange && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity"
                style={{ opacity: maskOpacity / 100 }}
              >
                {/* Vector Change Polygon Mask */}
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polygon
                    points="32,24 68,22 74,68 34,72"
                    fill="rgba(239, 68, 68, 0.45)"
                    stroke="#EF4444"
                    strokeWidth="1.2"
                    strokeDasharray="3 2"
                  />
                </svg>
              </div>
            )}

            {/* Bounding Box Frame (Secondary Reference) */}
            {showBoundingBox && activePhase.hasChange && (
              <div className="absolute top-[22%] left-[32%] w-[42%] h-[48%] border-2 border-dashed border-[#00E5FF] rounded-lg pointer-events-none shadow-[0_0_15px_rgba(0,229,255,0.4)] animate-pulse">
                <span className="absolute -top-3 left-1 bg-[#00E5FF] text-[#070D16] text-[8px] font-mono font-bold px-1 rounded">
                  AOI DETECTED CHANGE
                </span>
              </div>
            )}

            {/* Metadata Tag directly on image (Top Left) */}
            <div className="absolute top-2.5 left-2.5 z-20 bg-[#070D16]/90 border border-[#182A40] rounded-lg px-2.5 py-1 backdrop-blur-md text-[10px] font-mono space-y-0.5 shadow-lg">
              <div className="text-white font-bold flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>ACTIVE OBSERVATION</span>
              </div>
              <div className="text-[#94A3B8] flex items-center space-x-2">
                <span>{sensor}</span>
                <span>•</span>
                <span className="text-[#00E5FF]">{selectedTimelineDate}</span>
                <span>•</span>
                <span>{resolution}</span>
                <span>•</span>
                <span>Cloud: {cloudCover}</span>
              </div>
            </div>

            {/* Orientation & Scale Overlay (Bottom) */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20">
              {/* Metric Scale Bar */}
              <div className="bg-[#070D16]/85 border border-[#182A40] px-2 py-0.5 rounded text-[9px] font-mono text-white/90 backdrop-blur flex items-center space-x-1.5">
                <div className="w-16 h-1 border-b-2 border-l-2 border-r-2 border-[#00E5FF]" />
                <span>0 100 250 m</span>
              </div>

              {/* North Compass Arrow */}
              <div className="w-7 h-7 rounded-full bg-[#070D16]/90 border border-[#182A40] flex flex-col items-center justify-center text-[9px] font-mono text-white backdrop-blur shadow">
                <span className="text-[#00E5FF] font-bold leading-none">N</span>
                <div className="w-0.5 h-2 bg-[#00E5FF]" />
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE B: BEFORE / AFTER COMPARISON (Slider vs Dual Tile) */}
        {viewMode === 'comparison' && (
          <div className="w-full h-full relative flex flex-col justify-center">
            {comparisonType === 'swipe' ? (
              /* SMOOTH DRAGGABLE COMPARISON SLIDER */
              <div
                ref={containerRef}
                className="relative w-full h-full select-none cursor-ew-resize overflow-hidden"
              >
                {/* Underneath: AFTER / ACTIVE OBSERVATION (T2) */}
                <img
                  src={activePhase.img}
                  alt="After scene"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{ filter: getFilterStyle(true) }}
                />

                {/* Optional Change Mask Layer on After */}
                {showChangeMask && activePhase.hasChange && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ opacity: maskOpacity / 100 }}
                  >
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polygon
                        points="32,24 68,22 74,68 34,72"
                        fill="rgba(239, 68, 68, 0.45)"
                        stroke="#EF4444"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </div>
                )}

                {/* Top Clipped: BEFORE / BASELINE OBSERVATION (T1) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none border-r-2 border-[#00E5FF]"
                  style={{ width: `${swipePos}%` }}
                >
                  <img
                    src={beforeImgUrl}
                    alt="Before scene"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      width: '100%',
                      maxWidth: 'none',
                      filter: getFilterStyle(false)
                    }}
                  />
                  {/* BEFORE Single-line Metadata Tag on Left (Truncated, no wrap) */}
                  <div className="absolute top-2 left-2 z-20 max-w-[48%] bg-[#070D16]/95 border border-[#182A40] rounded-md px-2.5 py-1 text-[10px] sm:text-[11px] font-mono text-white backdrop-blur truncate shadow" title={beforeOverlayLabel}>
                    {beforeOverlayLabel}
                  </div>
                </div>

                {/* AFTER Single-line Metadata Tag on Right (Truncated, no wrap) */}
                <div className="absolute top-2 right-2 z-20 max-w-[48%] bg-[#070D16]/95 border border-[#182A40] rounded-md px-2.5 py-1 text-[10px] sm:text-[11px] font-mono text-white backdrop-blur truncate shadow" title={afterOverlayLabel}>
                  {afterOverlayLabel}
                </div>

                {/* Draggable Divider Handle with Glow & Grip */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#00E5FF] shadow-[0_0_12px_#00E5FF] pointer-events-none"
                  style={{ left: `${swipePos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#0E1A2B] border-2 border-[#00E5FF] flex items-center justify-center text-[10px] text-[#00E5FF] font-bold shadow-2xl">
                    ⇄
                  </div>
                </div>

                {/* Smooth Range Input Controller */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={swipePos}
                  onChange={(e) => setSwipePos(Number(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
                  aria-label="Swipe curtain comparison slider"
                />

                {/* Scale Bar & North Indicator in Slider View */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none z-20">
                  <div className="bg-[#070D16]/85 border border-[#182A40] px-2 py-0.5 rounded text-[8px] font-mono text-white/90 backdrop-blur">
                    0 100 250 m
                  </div>
                  <div className="text-[9px] font-mono text-[#94A3B8] bg-[#070D16]/90 px-2 py-0.5 rounded border border-[#182A40]">
                    Drag slider to compare ({swipePos}%)
                  </div>
                  <div className="w-5 h-5 rounded-full bg-[#070D16]/90 border border-[#182A40] flex flex-col items-center justify-center text-[7px] font-mono text-white">
                    <span className="text-[#00E5FF] font-bold leading-none">N</span>
                  </div>
                </div>
              </div>
            ) : (
              /* LARGE SIDE-BY-SIDE DUAL TILE COMPARISON */
              <div className="grid grid-cols-2 gap-2 w-full h-full p-1.5">
                {/* Left: BEFORE Tile */}
                <div className="relative rounded-lg overflow-hidden border border-[#182A40] bg-[#070D16] flex flex-col">
                  {/* BEFORE Metadata directly above/on image */}
                  <div className="bg-[#070D16] px-2 py-1 border-b border-[#182A40] text-[9px] font-mono flex items-center justify-between">
                    <span className="text-white font-bold">BEFORE OBSERVATION</span>
                    <span className="text-[#94A3B8]">{beforeDate}</span>
                  </div>
                  <div className="relative flex-1 min-h-0">
                    <img
                      src={beforeImgUrl}
                      alt="Before observation"
                      className="w-full h-full object-cover"
                      style={{ filter: getFilterStyle(false) }}
                    />
                    <div className="absolute bottom-1.5 left-1.5 bg-[#070D16]/90 border border-[#182A40] px-1.5 py-0.5 rounded text-[8px] font-mono text-[#94A3B8]">
                      Sentinel-2 • {resolution} • Cloud: {beforeCloudCover}
                    </div>
                  </div>
                </div>

                {/* Right: AFTER Tile */}
                <div className="relative rounded-lg overflow-hidden border border-[#182A40] bg-[#070D16] flex flex-col">
                  {/* AFTER Metadata directly above/on image */}
                  <div className="bg-[#070D16] px-2 py-1 border-b border-[#182A40] text-[9px] font-mono flex items-center justify-between">
                    <span className="text-[#00E5FF] font-bold">AFTER OBSERVATION</span>
                    <span className="text-[#00E5FF]">{selectedTimelineDate}</span>
                  </div>
                  <div className="relative flex-1 min-h-0">
                    <img
                      src={activePhase.img}
                      alt="After observation"
                      className="w-full h-full object-cover"
                      style={{ filter: getFilterStyle(true) }}
                    />
                    {showChangeMask && activePhase.hasChange && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ opacity: maskOpacity / 100 }}
                      >
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <polygon
                            points="32,24 68,22 74,68 34,72"
                            fill="rgba(239, 68, 68, 0.45)"
                            stroke="#EF4444"
                            strokeWidth="1.2"
                          />
                        </svg>
                      </div>
                    )}
                    {showBoundingBox && activePhase.hasChange && (
                      <div className="absolute top-[24%] left-[30%] w-[42%] h-[48%] border-2 border-[#EF4444] rounded pointer-events-none animate-pulse" />
                    )}
                    <div className="absolute bottom-1.5 left-1.5 bg-[#070D16]/90 border border-[#182A40] px-1.5 py-0.5 rounded text-[8px] font-mono text-[#00E5FF]">
                      Sentinel-2 • {resolution} • Cloud: {cloudCover}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW MODE C: CHANGE MAP (Semi-Transparent Change Mask Focused View) */}
        {viewMode === 'change-map' && (
          <div className="w-full h-full relative group">
            <img
              src={activePhase.img}
              alt="Detected change scene"
              className="w-full h-full object-cover select-none"
              style={{ filter: getFilterStyle(true) }}
            />

            {/* High-Definition Change Mask Overlay */}
            {showChangeMask && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity"
                style={{ opacity: maskOpacity / 100 }}
              >
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Subtle Grid Hatching Pattern */}
                  <defs>
                    <pattern id="changeHatch" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="4" stroke="#EF4444" strokeWidth="1" />
                    </pattern>
                  </defs>
                  {/* Outer Diff Contour */}
                  <polygon
                    points="30,22 70,20 76,70 32,74"
                    fill="url(#changeHatch)"
                    stroke="#EF4444"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="30,22 70,20 76,70 32,74"
                    fill="rgba(239, 68, 68, 0.35)"
                  />
                </svg>
              </div>
            )}

            {/* Bounding Box Frame (Secondary Reference) */}
            {showBoundingBox && (
              <div className="absolute top-[20%] left-[30%] w-[46%] h-[54%] border-2 border-dashed border-[#00E5FF] rounded-lg pointer-events-none shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                <span className="absolute -top-3 left-2 bg-[#00E5FF] text-[#070D16] text-[8px] font-mono font-bold px-1 rounded">
                  DIFF FOOTPRINT: {areaHa} ({changePercentage})
                </span>
              </div>
            )}

            {/* Change Map Legend Overlay (Top Left) */}
            <div className="absolute top-2.5 left-2.5 z-20 bg-[#070D16]/95 border border-[#182A40] rounded-lg p-2 backdrop-blur text-[10px] font-mono space-y-1 shadow-xl">
              <div className="text-white font-bold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
                <span>SEMI-TRANSPARENT CHANGE MASK</span>
              </div>
              <div className="text-[#94A3B8] text-[9px]">
                Detected Feature: <b className="text-white">{changeType}</b>
              </div>
              <div className="text-[#10B981] font-bold text-[9px]">
                Delta: {changePercentage} • Area: {areaHa}
              </div>
            </div>

            {/* Scale Bar & North Indicator */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20">
              <div className="bg-[#070D16]/85 border border-[#182A40] px-2 py-0.5 rounded text-[9px] font-mono text-white/90 backdrop-blur">
                0 100 250 m
              </div>
              <div className="w-7 h-7 rounded-full bg-[#070D16]/90 border border-[#182A40] flex flex-col items-center justify-center text-[9px] font-mono text-white backdrop-blur shadow">
                <span className="text-[#00E5FF] font-bold leading-none">N</span>
                <div className="w-0.5 h-2 bg-[#00E5FF]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. MULTI-TEMPORAL CONTINUOUS MILESTONES SCRUBBER */}
      <div className="bg-[#070D16] px-3 py-2 rounded-lg border border-[#182A40] flex items-center justify-between gap-2 shrink-0 text-xs font-mono">
        <span className="text-[#94A3B8] uppercase font-bold shrink-0 text-xs">Passes:</span>
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
          {timelineMilestones.map((m) => {
            const isSel = selectedTimelineDate === m.date;
            return (
              <button
                key={m.date}
                onClick={() => setSelectedTimelineDate(m.date)}
                className={`px-2.5 py-1 rounded-md text-xs transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none flex items-center space-x-1 shrink-0 focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none ${
                  isSel
                    ? 'bg-[#00E5FF] text-[#070D16] font-bold shadow'
                    : 'bg-[#0B1523] text-[#94A3B8] hover:text-white border border-[#182A40]'
                }`}
                title={`Pass ${m.month}: ${m.label} (${m.date})`}
              >
                <span>{m.month}</span>
                <span className="text-[10px] opacity-80">({m.label})</span>
              </button>
            );
          })}
        </div>
        <span className="text-[#38BDF8] shrink-0 font-semibold text-xs hidden sm:inline">
          Period: {computedPeriod} ({computedTimeGap})
        </span>
      </div>

      {/* 6. QUANTIFIED CHANGE METRICS & MANDATORY ANALYST BANNER */}
      <div className="pt-2 border-t border-[#182A40]/80 space-y-1.5 shrink-0 font-sans">
        {/* Change Metrics Grid - High-Contrast 12-13px labels for Projector Display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
          <div className="p-2 rounded-lg bg-[#070D16] border border-[#182A40]">
            <span className="text-[#94A3B8] block uppercase text-xs font-semibold tracking-wider">Changed Area</span>
            <span className="text-[#38BDF8] text-sm sm:text-base font-bold block mt-0.5">{areaHa}</span>
          </div>

          <div className="p-2 rounded-lg bg-[#070D16] border border-[#182A40]">
            <span className="text-[#94A3B8] block uppercase text-xs font-semibold tracking-wider">Change Delta</span>
            <span className="text-[#10B981] text-sm sm:text-base font-bold block mt-0.5">{changePercentage}</span>
          </div>

          <div className="p-2 rounded-lg bg-[#070D16] border border-[#182A40]">
            <span className="text-[#94A3B8] block uppercase text-xs font-semibold tracking-wider">Detection Confidence</span>
            <span className="text-[#F59E0B] text-sm sm:text-base font-bold block mt-0.5">{confidence}%</span>
          </div>

          <div className="p-2 rounded-lg bg-[#070D16] border border-[#182A40]">
            <span className="text-[#94A3B8] block uppercase text-xs font-semibold tracking-wider">Coordinates</span>
            <span className="text-white text-xs sm:text-sm font-bold truncate block mt-0.5" title={coordinates}>{coordinates}</span>
          </div>
        </div>

        {/* Mandatory Intelligence Notice & Analyst Workflow Decision Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-[11px]">
          <div className="flex items-center space-x-1.5 text-[#F59E0B] text-[10px] font-sans">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>AI-assisted detection. Analyst verification required.</span>
          </div>

          {/* Quick Review Buttons */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleQuickReview('CONFIRMED')}
              disabled={isSubmitting || analystVerdict === 'CONFIRMED'}
              className={`h-6 px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none ${
                analystVerdict === 'CONFIRMED'
                  ? 'bg-[#10B981] text-white shadow'
                  : 'bg-[#0E355A] hover:bg-[#10B981]/80 text-[#38BDF8] hover:text-white border border-[#0284C7]'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{analystVerdict === 'CONFIRMED' ? 'Confirmed' : 'Confirm Change'}</span>
            </button>

            <button
              onClick={() => handleQuickReview('REJECTED')}
              disabled={isSubmitting || analystVerdict === 'REJECTED'}
              className={`h-6 px-2 rounded-lg text-xs font-medium flex items-center space-x-1 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none ${
                analystVerdict === 'REJECTED'
                  ? 'bg-[#EF4444] text-white'
                  : 'bg-[#070D16] hover:bg-[#EF4444]/20 text-[#94A3B8] hover:text-[#EF4444] border border-[#182A40]'
              }`}
            >
              <XCircle className="w-3 h-3" />
              <span>Flag False</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
