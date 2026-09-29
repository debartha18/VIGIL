import React, { useState, useRef, useEffect } from 'react';
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
  formatDateDisplay
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

  // Priority 2 / Item 8: Space shortcut toggles mask overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setShowChangeMask((prev) => {
          const next = !prev;
          onToggleChangeMask?.(next);
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleChangeMask]);

  return (
    <div className="w-full h-full bg-surface border border-border rounded-md p-3 flex flex-col justify-between select-none overflow-hidden font-sans text-text text-xs shadow-subtle">
      {/* 1. TOP HEADER BAR: Viewing Modes & Quick Actions */}
      <div className="flex items-center justify-between pb-2 border-b border-border/80 shrink-0 gap-2">
        {/* Left: Target Name & Coordinates */}
        <div className="flex items-center space-x-2 min-w-0">
          <TrendingUp className="w-4 h-4 text-accent shrink-0" />
          <h2 className="text-xs sm:text-sm font-semibold text-text tracking-normal font-sans truncate max-w-[190px] sm:max-w-xs" title={candidateTitle}>
            {candidateTitle}
          </h2>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-raised border border-border text-[11px] font-mono text-text-2 shrink-0" title={coordinates}>
            {coordinates.split(',')[0]}
          </span>
          <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-raised border border-border text-[11px] font-sans text-text-2 shrink-0" title={locationName}>
            {locationName}
          </span>
        </div>

        {/* Center/Right: 3 Primary Viewing Modes (A. Visual | B. Before / After | C. Change Map) */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center bg-bg p-0.5 rounded-md border border-border" role="tablist" aria-label="Viewing mode">
            <button
              role="tab"
              aria-selected={viewMode === 'visual'}
              onClick={() => { setViewMode('visual'); onViewModeChange?.('visual'); }}
              className={`h-6 px-2.5 rounded text-xs transition cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus:outline-none ${
                viewMode === 'visual'
                  ? 'bg-raised text-accent font-medium border-b-2 border-accent'
                  : 'text-text-2 hover:text-text'
              }`}
              title="A. Visual mode: single high-resolution satellite imagery"
            >
              Visual
            </button>

            <button
              role="tab"
              aria-selected={viewMode === 'comparison'}
              onClick={() => { setViewMode('comparison'); onViewModeChange?.('comparison'); }}
              className={`h-6 px-2.5 rounded text-xs transition cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus:outline-none ${
                viewMode === 'comparison'
                  ? 'bg-raised text-accent font-medium border-b-2 border-accent'
                  : 'text-text-2 hover:text-text'
              }`}
              title="B. Before / After mode: multi-temporal comparative analysis"
            >
              Before / After
            </button>

            <button
              role="tab"
              aria-selected={viewMode === 'change-map'}
              onClick={() => { setViewMode('change-map'); onViewModeChange?.('change-map'); }}
              className={`h-6 px-2.5 rounded text-xs transition cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus:outline-none ${
                viewMode === 'change-map'
                  ? 'bg-raised text-accent font-medium border-b-2 border-accent'
                  : 'text-text-2 hover:text-text'
              }`}
              title="C. Change Map mode: semi-transparent detected change mask"
            >
              Change Map
            </button>
          </div>

          {/* Dossier Link Button */}
          <button
            onClick={onViewFullReport}
            className="h-6 hidden md:flex items-center space-x-1 px-2.5 rounded-md border border-border bg-raised/50 text-xs text-text hover:bg-raised transition cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus:outline-none font-sans"
            title="Open comprehensive intelligence dossier"
          >
            <span>Dossier</span>
            <ExternalLink className="w-3 h-3 text-text-2" />
          </button>
        </div>
      </div>

      {/* 2. IMAGE TOOLBAR & ENHANCEMENT CONTROLS */}
      <div className="flex flex-wrap items-center justify-between py-1.5 border-b border-border/60 gap-1.5 shrink-0 text-xs">
        {/* Left: Spectral Band Segmented Control */}
        <div className="flex items-center space-x-1.5">
          <span className="text-xs text-text-2 mr-0.5 hidden sm:inline">Band:</span>
          <div className="flex items-center bg-bg p-0.5 rounded-md border border-border" role="tablist" aria-label="Spectral band mode">
            {(['RGB', 'FALSE_COLOR', 'NDVI', 'NDWI'] as const).map((band) => {
              const isActive = spectralMode === band;
              const label = band === 'RGB' ? 'RGB' : band === 'FALSE_COLOR' ? 'False Color' : band;
              return (
                <button
                  key={band}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => { setSpectralMode(band); onSpectralModeChange?.(band); }}
                  className={`h-5 px-2 rounded text-[11px] font-mono transition cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus:outline-none ${
                    isActive
                      ? 'bg-raised text-accent font-medium border-b-2 border-accent'
                      : 'text-text-2 hover:text-text'
                  }`}
                  title={`Spectral band: ${label}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Change Mask / Bounding Box & Enhancement Toggles */}
        <div className="flex items-center space-x-1.5 ml-auto">
          {/* Change Mask Toggle */}
          <button
            onClick={() => { const next = !showChangeMask; setShowChangeMask(next); onToggleChangeMask?.(next); }}
            aria-label="Toggle change mask overlay"
            className={`h-6 px-2 rounded-md text-xs border flex items-center space-x-1 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus:outline-none ${
              showChangeMask
                ? 'bg-raised border-change text-change font-medium'
                : 'bg-bg border-border text-text-2 hover:text-text'
            }`}
            title="Toggle mask overlay (Space)"
          >
            {showChangeMask ? <Eye className="w-3.5 h-3.5 text-change" /> : <EyeOff className="w-3.5 h-3.5 text-text-2" />}
            <span className="hidden sm:inline">Mask</span>
          </button>

          {/* AOI Bounding Box Reference */}
          <button
            onClick={() => setShowBoundingBox(!showBoundingBox)}
            aria-label="Toggle AOI boundary reference box"
            className={`h-6 px-2 rounded-md text-xs border flex items-center transition cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus:outline-none ${
              showBoundingBox
                ? 'bg-raised border-boundary text-boundary font-medium'
                : 'bg-bg border-border text-text-2 hover:text-text'
            }`}
            title="Toggle AOI boundary reference box"
          >
            <span>AOI Box</span>
          </button>

          {/* Comparison Slider vs Dual Tile (When in comparison mode) */}
          {viewMode === 'comparison' && (
            <div className="flex items-center bg-bg p-0.5 rounded-md border border-border" role="group" aria-label="Comparison view type">
              <button
                onClick={() => setComparisonType('swipe')}
                aria-label="Slider comparison"
                className={`h-5 w-6 rounded flex items-center justify-center transition cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus:outline-none ${
                  comparisonType === 'swipe' ? 'bg-raised text-accent' : 'text-text-2 hover:text-text'
                }`}
                title="Slider comparison"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setComparisonType('side-by-side')}
                aria-label="Side-by-side comparison"
                className={`h-5 w-6 rounded flex items-center justify-center transition cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus:outline-none ${
                  comparisonType === 'side-by-side' ? 'bg-raised text-accent' : 'text-text-2 hover:text-text'
                }`}
                title="Side-by-side dual tile comparison"
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Adjustments Tray Toggle */}
          <button
            onClick={() => setShowAdjustments(!showAdjustments)}
            aria-label="Adjust image brightness, contrast, and sharpness"
            className={`h-6 w-6 rounded-md border flex items-center justify-center transition cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus:outline-none ${
              showAdjustments || brightness !== 0 || contrast !== 0 || sharpness !== 'normal'
                ? 'bg-raised border-accent text-accent font-medium'
                : 'bg-bg border-border text-text-2 hover:text-text'
            }`}
            title="Image enhancements (Brightness, contrast, sharpness)"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Reset View Button */}
          <button
            onClick={resetEnhancements}
            aria-label="Reset enhancements"
            className="h-6 w-6 rounded-md bg-bg hover:bg-raised border border-border text-text-2 hover:text-text flex items-center justify-center transition cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus:outline-none"
            title="Reset enhancements"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3. OPTIONAL EXPANDABLE ENHANCEMENT CONTROLS TRAY */}
      {showAdjustments && (
        <div className="bg-bg p-2.5 rounded-md border border-border my-1 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs shrink-0 animate-in fade-in">
          <div>
            <div className="flex justify-between text-text-2 mb-1">
              <span>Brightness:</span>
              <span className="font-mono text-text">{brightness > 0 ? `+${brightness}` : brightness}%</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-accent h-1.5 bg-raised rounded cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between text-text-2 mb-1">
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
      <div className="flex-1 min-h-[220px] sm:min-h-[240px] relative rounded-md border border-border bg-bg overflow-hidden my-1.5 flex flex-col justify-center">
        {/* VIEW MODE A: VISUAL (Single Full-Size High-Resolution Viewport) */}
        {viewMode === 'visual' && (
          <div className="w-full h-full relative group">
            <img
              src={activePhase.img}
              alt="Satellite observation"
              className="w-full h-full object-cover object-center select-none"
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
                    fill="rgba(245, 158, 11, 0.15)"
                    stroke="#F59E0B"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            )}

            {/* Bounding Box Frame (Secondary Reference) */}
            {showBoundingBox && activePhase.hasChange && (
              <div className="absolute top-[22%] left-[32%] w-[42%] h-[48%] border border-boundary rounded pointer-events-none">
                <span className="absolute -top-2.5 left-1 bg-surface border border-boundary text-text-2 text-[8px] font-mono px-1 rounded">
                  AOI DETECTED CHANGE
                </span>
              </div>
            )}

            {/* Metadata Tag directly on image (Top Left) */}
            <div className="absolute top-2.5 left-2.5 z-20 bg-surface/90 border border-border rounded px-2.5 py-1 backdrop-blur text-[10px] font-mono space-y-0.5 shadow-subtle" title={`Band: ${spectralMode === 'RGB' ? 'RGB (True Color)' : spectralMode}`}>
              <div className="text-text font-medium flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ok" />
                <span>ACTIVE OBSERVATION</span>
              </div>
              <div className="text-text-2 flex items-center space-x-2 text-[9px]">
                <span>{sensor ? sensor.replace(/\s*\(.*?\)/g, '').trim() : 'Sentinel-2'}</span>
                <span>•</span>
                <span className="text-text font-medium">{formatDateDisplay(selectedTimelineDate)}</span>
                <span>•</span>
                <span>{resolution.replace(/\s*Optical.*$/i, '').trim()}</span>
                <span>•</span>
                <span>Cloud {cloudCover.replace(/\s*\(.*?\)/g, '').trim()}</span>
              </div>
            </div>

            {/* Orientation & Scale Overlay (Bottom) */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20 font-mono text-[9px]">
              {/* Metric Scale Bar */}
              <div className="bg-surface/90 border border-border px-2 py-0.5 rounded text-text-2 backdrop-blur flex items-center space-x-1.5">
                <div className="w-16 h-1 border-b border-l border-r border-text-2" />
                <span>0 100 250 m</span>
              </div>

              {/* North Compass Arrow */}
              <div className="w-6 h-6 rounded-full bg-surface/90 border border-border flex items-center justify-center text-text-2 backdrop-blur shadow-subtle">
                <span className="font-semibold text-[8px]">N</span>
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
                  className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
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
                        fill="rgba(245, 158, 11, 0.15)"
                        stroke="#F59E0B"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                )}

                {/* Top Clipped: BEFORE / BASELINE OBSERVATION (T1) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ clipPath: `inset(0 ${100 - swipePos}% 0 0)` }}
                >
                  <img
                    src={beforeImgUrl}
                    alt="Before scene"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    style={{ filter: getFilterStyle(false) }}
                  />
                </div>

                {/* BEFORE 2-line Metadata Tag on Left */}
                <div
                  className="absolute top-2 left-2 z-20 bg-surface/90 border border-border rounded-md px-2.5 py-1 text-[10px] font-mono backdrop-blur shadow-subtle pointer-events-auto"
                  title={`Band: ${spectralMode === 'RGB' ? 'RGB (True Color)' : spectralMode}`}
                >
                  <div className="font-semibold text-text">BEFORE · {formatDateDisplay(beforeDate)}</div>
                  <div className="text-text-2 text-[9px]">{sensor ? sensor.replace(/\s*\(.*?\)/g, '').trim() : 'Sentinel-2'} · {resolution.replace(/\s*Optical.*$/i, '').trim()} · Cloud {beforeCloudCover.replace(/\s*\(.*?\)/g, '').trim()}</div>
                </div>

                {/* AFTER 2-line Metadata Tag on Right */}
                <div
                  className="absolute top-2 right-2 z-20 bg-surface/90 border border-border rounded-md px-2.5 py-1 text-[10px] font-mono backdrop-blur shadow-subtle pointer-events-auto text-right"
                  title={`Band: ${spectralMode === 'RGB' ? 'RGB (True Color)' : spectralMode}`}
                >
                  <div className="font-semibold text-text">AFTER · {formatDateDisplay(selectedTimelineDate)}</div>
                  <div className="text-text-2 text-[9px]">{sensor ? sensor.replace(/\s*\(.*?\)/g, '').trim() : 'Sentinel-2'} · {resolution.replace(/\s*Optical.*$/i, '').trim()} · Cloud {cloudCover.replace(/\s*\(.*?\)/g, '').trim()}</div>
                </div>

                {/* Draggable Divider Line & Small Neutral Grip */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-border pointer-events-none z-20"
                  style={{ left: `${swipePos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-7 rounded bg-surface border border-border flex items-center justify-center shadow-subtle">
                    <div className="w-0.5 h-3.5 bg-text-2/40 rounded-full" />
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

                {/* Scale Bar & Position Indicator in Slider View */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none z-20 font-mono text-[9px]">
                  <div className="bg-surface/85 border border-border px-2 py-0.5 rounded text-text-2 backdrop-blur">
                    0 100 250 m
                  </div>
                  <div className="text-text-2 bg-surface/90 px-2 py-0.5 rounded border border-border">
                    Drag slider to compare ({swipePos}%)
                  </div>
                  <div className="w-5 h-5 rounded-full bg-surface/90 border border-border flex items-center justify-center text-[8px] text-text-2">
                    <span>N</span>
                  </div>
                </div>
              </div>
            ) : (
              /* LARGE SIDE-BY-SIDE DUAL TILE COMPARISON */
              <div className="grid grid-cols-2 gap-2 w-full h-full p-1.5">
                {/* Left: BEFORE Tile */}
                <div className="relative rounded-lg overflow-hidden border border-border bg-bg flex flex-col">
                  {/* BEFORE Metadata directly above/on image */}
                  <div className="bg-surface px-2.5 py-1 border-b border-border text-[10px] font-mono flex items-center justify-between" title={`Band: ${spectralMode === 'RGB' ? 'RGB (True Color)' : spectralMode}`}>
                    <span className="text-text font-medium">BEFORE · {formatDateDisplay(beforeDate)}</span>
                    <span className="text-text-2 text-[9px]">Cloud {beforeCloudCover.replace(/\s*\(.*?\)/g, '').trim()}</span>
                  </div>
                  <div className="relative flex-1 min-h-0">
                    <img
                      src={beforeImgUrl}
                      alt="Before observation"
                      className="w-full h-full object-cover object-center"
                      style={{ filter: getFilterStyle(false) }}
                    />
                    <div className="absolute bottom-1.5 left-1.5 bg-surface/90 border border-border px-1.5 py-0.5 rounded text-[8px] font-mono text-text-2">
                      Sentinel-2 • {resolution.replace(/\s*Optical.*$/i, '').trim()}
                    </div>
                  </div>
                </div>

                {/* Right: AFTER Tile */}
                <div className="relative rounded-lg overflow-hidden border border-border bg-bg flex flex-col">
                  {/* AFTER Metadata directly above/on image */}
                  <div className="bg-surface px-2.5 py-1 border-b border-border text-[10px] font-mono flex items-center justify-between" title={`Band: ${spectralMode === 'RGB' ? 'RGB (True Color)' : spectralMode}`}>
                    <span className="text-text font-medium">AFTER · {formatDateDisplay(selectedTimelineDate)}</span>
                    <span className="text-text-2 text-[9px]">Cloud {cloudCover.replace(/\s*\(.*?\)/g, '').trim()}</span>
                  </div>
                  <div className="relative flex-1 min-h-0">
                    <img
                      src={activePhase.img}
                      alt="After observation"
                      className="w-full h-full object-cover object-center"
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
                            fill="rgba(245, 158, 11, 0.15)"
                            stroke="#F59E0B"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    )}
                    {showBoundingBox && activePhase.hasChange && (
                      <div className="absolute top-[24%] left-[30%] w-[42%] h-[48%] border border-boundary rounded pointer-events-none" />
                    )}
                    <div className="absolute bottom-1.5 left-1.5 bg-surface/90 border border-border px-1.5 py-0.5 rounded text-[8px] font-mono text-text-2">
                      Sentinel-2 • {resolution.replace(/\s*Optical.*$/i, '').trim()}
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
              className="w-full h-full object-cover object-center select-none"
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
                      <line x1="0" y1="0" x2="0" y2="4" stroke="#F59E0B" strokeWidth="1" />
                    </pattern>
                  </defs>
                  {/* Outer Diff Contour */}
                  <polygon
                    points="30,22 70,20 76,70 32,74"
                    fill="url(#changeHatch)"
                    stroke="#F59E0B"
                    strokeWidth="2"
                  />
                  <polygon
                    points="30,22 70,20 76,70 32,74"
                    fill="rgba(245, 158, 11, 0.15)"
                  />
                </svg>
              </div>
            )}

            {/* Bounding Box Frame (Secondary Reference) */}
            {showBoundingBox && (
              <div className="absolute top-[20%] left-[30%] w-[46%] h-[54%] border border-dashed border-boundary rounded pointer-events-none">
                <span className="absolute -top-2.5 left-2 bg-surface border border-border text-text-2 text-[8px] font-mono px-1 rounded">
                  DIFF FOOTPRINT: {areaHa} ({changePercentage})
                </span>
              </div>
            )}

            {/* Change Map Legend Overlay (Top Left) */}
            <div className="absolute top-2.5 left-2.5 z-20 bg-surface/95 border border-border rounded p-2 backdrop-blur text-[10px] font-mono space-y-1 shadow-subtle">
              <div className="text-text font-medium flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-change" />
                <span>CHANGE MASK</span>
              </div>
              <div className="text-text-2 text-[9px]">
                Detected Feature: <b className="text-text font-medium">{changeType}</b>
              </div>
              <div className="text-ok font-medium text-[9px]">
                Delta: {changePercentage} • Area: {areaHa}
              </div>
            </div>

            {/* Scale Bar & North Indicator */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20 font-mono text-[9px]">
              <div className="bg-surface/85 border border-border px-2 py-0.5 rounded text-text-2 backdrop-blur">
                0 100 250 m
              </div>
              <div className="w-6 h-6 rounded-full bg-surface/90 border border-border flex items-center justify-center text-text-2 backdrop-blur shadow-subtle">
                <span className="font-semibold text-[8px]">N</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. MULTI-TEMPORAL CONTINUOUS MILESTONES SCRUBBER (Tertiary: flat and low contrast) */}
      <div className="bg-bg px-3 py-1.5 rounded-md border border-border flex items-center justify-between gap-2 shrink-0 text-xs font-sans">
        <span className="text-text-2 text-xs shrink-0 font-medium">Passes:</span>
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
          {timelineMilestones.map((m) => {
            const isSel = selectedTimelineDate === m.date;
            return (
              <button
                key={m.date}
                onClick={() => setSelectedTimelineDate(m.date)}
                className={`px-2.5 py-1 rounded text-xs transition cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus:outline-none flex items-center space-x-1 shrink-0 ${
                  isSel
                    ? 'bg-raised text-text font-medium border border-border'
                    : 'bg-transparent text-text-2 hover:text-text'
                }`}
                title={`Pass ${m.month}: ${m.label} (${m.date})`}
              >
                <span>{m.month}</span>
                <span className="text-[11px] text-text-2">({m.label})</span>
              </button>
            );
          })}
        </div>
        <span className="text-text-2 shrink-0 text-xs font-mono tabular-nums hidden sm:inline">
          {computedPeriod} · {computedTimeGap}
        </span>
      </div>

      {/* 6. QUANTIFIED CHANGE METRICS & MANDATORY ANALYST ACTION BAR */}
      <div className="pt-2 border-t border-border/60 space-y-2 shrink-0 font-sans">
        {/* Metric Cards Grid - Secondary hierarchy: compact, hairline dividers, no heavy boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Card 1: Changed Area */}
          <div className="bg-bg border border-border rounded-md p-2.5">
            <span className="text-text-2 text-xs block">Changed area</span>
            <div className="mt-1 font-mono text-xl font-semibold text-text tabular-nums">
              {areaHa.split(' ')[0]} {areaHa.split(' ')[1] || 'ha'}
            </div>
            <div className="text-[11px] text-text-2 font-mono tabular-nums">
              {areaHa.includes('(') ? areaHa.slice(areaHa.indexOf('(') + 1, areaHa.indexOf(')')) : '42,000 m²'}
            </div>
          </div>

          {/* Card 2: Detection Confidence */}
          <div className="bg-bg border border-border rounded-md p-2.5">
            <span className="text-text-2 text-xs block">Detection confidence</span>
            <div className="mt-1 font-mono text-xl font-semibold text-text tabular-nums">
              {confidence}%
            </div>
            <div className="text-[11px] text-text-2">
              Analyst verification req.
            </div>
          </div>

          {/* Card 3: Change Delta */}
          <div className="bg-bg border border-border rounded-md p-2.5">
            <span className="text-text-2 text-xs block">Change delta</span>
            <div className="mt-1 font-mono text-xl font-semibold text-text tabular-nums">
              {changePercentage}
            </div>
            <div className="text-[11px] text-text-2 truncate" title={changeType}>
              {changeType}
            </div>
          </div>

          {/* Card 4: Coordinates */}
          <div className="bg-bg border border-border rounded-md p-2.5">
            <span className="text-text-2 text-xs block">Coordinates</span>
            <div className="mt-1 font-mono text-sm sm:text-base font-semibold text-text tabular-nums truncate" title={coordinates}>
              {coordinates}
            </div>
            <div className="text-[11px] text-text-2 truncate" title={locationName}>
              {locationName}
            </div>
          </div>
        </div>

        {/* Mandatory Verification Note & Review Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center space-x-1.5 text-text-2 text-xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-text-2" />
            <span>AI-assisted detection. Analyst verification required.</span>
          </div>

          {/* Quick Review Buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleQuickReview('CONFIRMED')}
              disabled={isSubmitting || analystVerdict === 'CONFIRMED'}
              aria-label="Confirm detected change"
              className={`h-7 px-3 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus:outline-none ${
                analystVerdict === 'CONFIRMED'
                  ? 'bg-ok text-bg'
                  : 'bg-accent hover:bg-accent/90 active:bg-accent/80 text-bg'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{analystVerdict === 'CONFIRMED' ? 'Confirmed' : 'Confirm Change'}</span>
            </button>

            <button
              onClick={() => handleQuickReview('REJECTED')}
              disabled={isSubmitting || analystVerdict === 'REJECTED'}
              aria-label="Flag detection as false positive"
              className={`h-7 px-3 rounded-md text-xs font-normal border border-border bg-transparent text-text-2 hover:text-flag hover:border-flag/60 flex items-center space-x-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-flag focus:outline-none ${
                analystVerdict === 'REJECTED' ? 'border-flag text-flag bg-flag/10' : ''
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Flag False</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
