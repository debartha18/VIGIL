import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Plus,
  Minus,
  Layers,
  ChevronDown,
  Check,
  RotateCcw,
  Maximize2
} from 'lucide-react';
import { SearchResultItem } from '../search/SemanticSearchResults';
import {
  CANONICAL_LOCATIONS,
  locationToSearchResultItem
} from '../../data/groundTruthTargets';

interface SatelliteMapCanvasProps {
  coordinates?: string;
  selectedAOI?: string;
  onCoordinatesChange?: (coords: string) => void;
  siteName?: string;
  selectedTargetId?: string;
  onSelectTarget?: (target: SearchResultItem) => void;
  targets?: SearchResultItem[];
  mode?: 'compact' | 'full';
  onOpenFullMap?: () => void;
}

export const SatelliteMapCanvas: React.FC<SatelliteMapCanvasProps> = ({
  coordinates = 'Lat: 21.4587° N   Lon: 72.7812° E',
  selectedAOI: _selectedAOI = 'AOI-1',
  onCoordinatesChange,
  siteName = 'Hazira Deepwater Wharf & Piling Deck',
  selectedTargetId,
  onSelectTarget,
  targets = [],
  mode = 'compact',
  onOpenFullMap
}) => {
  // Map View Mode: Regional Oceanographic vs Tactical 10m AOI Sector
  const [viewMode, setViewMode] = useState<'regional' | 'tactical'>(() => mode === 'compact' ? 'tactical' : 'regional');
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Progressive Tiled Loading state & skeleton
  const [isLoadingTiles, setIsLoadingTiles] = useState<boolean>(false);

  // Spectral Layers & Heatmap
  const [activeLayer, setActiveLayer] = useState<string>('Sentinel-2 (True Color RGB)');
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Resolving display targets: prioritize passed search results, fallback to canonical
  const displayTargets: SearchResultItem[] = useMemo(() => {
    if (targets && targets.length > 0) return targets;
    return CANONICAL_LOCATIONS.map(locationToSearchResultItem);
  }, [targets]);

  const activeTarget = useMemo(() => {
    if (selectedTargetId) {
      const found = displayTargets.find(t => t.id === selectedTargetId);
      if (found) return found;
    }
    return displayTargets[0];
  }, [displayTargets, selectedTargetId]);

  // Available spectral layers with real radiometric filters
  const layers = [
    { name: 'Sentinel-2 (True Color RGB)', filter: 'none', desc: '10m Multi-spectral true color bands B4-B3-B2' },
    { name: 'Surface Temp (SWIR B11/B12)', filter: 'contrast(1.35) hue-rotate(28deg) saturate(1.8)', desc: 'Thermal radiometric infrared heat signature' },
    { name: 'NDVI Vegetation Health Index', filter: 'saturate(2.2) contrast(1.2) hue-rotate(330deg)', desc: 'Normalized difference vegetation density' },
    { name: 'NDBI Built-up Concrete Index', filter: 'contrast(1.4) saturate(1.4) hue-rotate(180deg)', desc: 'Impervious concrete & structural wharf reflectance' },
    { name: 'Sentinel-1 SAR Radar Backscatter', filter: 'grayscale(1) contrast(1.9) brightness(0.95)', desc: 'C-Band GRD VV+VH all-weather penetration' },
  ];

  const currentLayerObj = layers.find(l => l.name === activeLayer) || layers[0];

  // Prefetch target images on mount
  useEffect(() => {
    const prefetchUrls = [
      '/assets/satellite_map_base.jpg',
      '/assets/regional_satellite_map.jpg',
      '/assets/card_1_construction.jpg',
      '/assets/card_2_riverside.jpg',
      '/assets/card_3_port.jpg',
      '/assets/card_4_bridge.jpg',
      '/assets/card_5_land.jpg'
    ];
    prefetchUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  // Smoothly center the map view onto the active target
  useEffect(() => {
    if (activeTarget) {
      const posX = viewMode === 'regional'
        ? (activeTarget.regionalX ?? activeTarget.tacticalX ?? 50)
        : (activeTarget.tacticalX ?? 50);
      const posY = viewMode === 'regional'
        ? (activeTarget.regionalY ?? activeTarget.tacticalY ?? 50)
        : (activeTarget.tacticalY ?? 50);

      // Centering offset calculation relative to 50%
      setPan({
        x: (50 - posX) * 3.2,
        y: (50 - posY) * 2.8,
      });

      if (onCoordinatesChange && activeTarget.coordinates) {
        onCoordinatesChange(activeTarget.coordinates);
      }
    }
  }, [activeTarget, viewMode, onCoordinatesChange]);

  const handleSelectStation = (target: SearchResultItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onSelectTarget) {
      onSelectTarget(target);
    }
    if (onCoordinatesChange && target.coordinates) {
      onCoordinatesChange(target.coordinates);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom((prevZoom) => {
      const nextZoom = Math.min(Math.max(prevZoom + zoomDelta, 0.75), 3.0);
      if (Math.abs(nextZoom - prevZoom) > 0.2) {
        setIsLoadingTiles(true);
        setTimeout(() => setIsLoadingTiles(false), 200);
      }
      return nextZoom;
    });
  };

  const resetView = () => {
    if (activeTarget) {
      const posX = viewMode === 'regional'
        ? (activeTarget.regionalX ?? activeTarget.tacticalX ?? 50)
        : (activeTarget.tacticalX ?? 50);
      const posY = viewMode === 'regional'
        ? (activeTarget.regionalY ?? activeTarget.tacticalY ?? 50)
        : (activeTarget.tacticalY ?? 50);

      setPan({
        x: (50 - posX) * 3.2,
        y: (50 - posY) * 2.8,
      });
    } else {
      setPan({ x: 0, y: 0 });
    }
    setZoom(1.0);
  };

  const activePosX = activeTarget
    ? (viewMode === 'regional' ? (activeTarget.regionalX ?? activeTarget.tacticalX ?? 50) : (activeTarget.tacticalX ?? 50))
    : 50;
  const activePosY = activeTarget
    ? (viewMode === 'regional' ? (activeTarget.regionalY ?? activeTarget.tacticalY ?? 50) : (activeTarget.tacticalY ?? 50))
    : 50;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className={`w-full h-full bg-[#020617] border border-[#182A40] rounded-xl relative overflow-hidden select-none font-sans text-white text-xs ${
        isDragging ? 'cursor-grabbing' : 'cursor-crosshair'
      }`}
      style={{ imageRendering: 'auto' }}
    >
      {/* 1. TOP FLOATING CONTROL BAR */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between pointer-events-none gap-2">
        {/* Left: Viewport Source & Projection Selector */}
        <div className="flex items-center space-x-1.5 pointer-events-auto bg-[#070D16]/95 border border-[#182A40] px-2.5 py-1 rounded-lg backdrop-blur-md shadow-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-bold text-white tracking-tight hidden sm:inline">
            {activeTarget?.sensor || 'Sentinel-2 Optical (10m)'}
          </span>

          <div className="h-3 w-[1px] bg-[#182A40] hidden sm:block" />

          {/* View Switcher: Regional Ocean vs Local AOI */}
          <div className="flex bg-[#030712] rounded p-0.5 border border-[#182A40]">
            <button
              onClick={() => setViewMode('tactical')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                viewMode === 'tactical'
                  ? 'bg-accent text-bg font-bold shadow'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Local
            </button>
            <button
              onClick={() => setViewMode('regional')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                viewMode === 'regional'
                  ? 'bg-accent text-bg font-bold shadow'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Regional
            </button>
          </div>

          {/* Open Full Interactive Map Button */}
          {onOpenFullMap && (
            <button
              onClick={onOpenFullMap}
              className="ml-1 p-1 rounded bg-[#0A1628] hover:bg-[#132438] border border-[#182A40] text-[#00E5FF] transition cursor-pointer flex items-center space-x-1"
              title="Open full interactive map screen"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Right: Layers & Heatmap */}
        <div className="flex items-center space-x-1.5 pointer-events-auto relative">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2 py-1 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center space-x-1 shadow-lg backdrop-blur-md ${
              showHeatmap
                ? 'bg-change/20 border-change text-change'
                : 'bg-[#070D16]/95 border-[#182A40] text-[#94A3B8] hover:text-white'
            }`}
            title="Toggle detected change heatmap"
          >
            <span>Heatmap</span>
          </button>

          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="bg-[#070D16]/95 border border-[#182A40] hover:border-[#00E5FF]/50 px-2.5 py-1 rounded-lg text-white font-medium text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xl backdrop-blur-md"
          >
            <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="hidden sm:inline">{activeLayer.split(' ')[0]}</span>
            <ChevronDown className="w-3 h-3 text-[#64748B]" />
          </button>

          {showLayerMenu && (
            <div
              className="absolute top-8 right-0 w-64 bg-[#070D16]/98 border border-[#182A40] rounded-xl shadow-2xl p-2 z-50 text-xs backdrop-blur-lg animate-in fade-in"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="px-2 py-1 text-[10px] text-[#64748B] font-mono border-b border-[#182A40] mb-1">
                SPECTRAL LAYERS & INDICES
              </div>
              <div className="space-y-0.5">
                {layers.map((l) => (
                  <div
                    key={l.name}
                    onClick={() => {
                      setActiveLayer(l.name);
                      setShowLayerMenu(false);
                    }}
                    className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition text-[11px] ${
                      activeLayer === l.name
                        ? 'bg-[#0E355A] text-[#00E5FF] font-bold border border-[#00E5FF]/40'
                        : 'text-[#94A3B8] hover:bg-[#132438] hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white">{l.name}</div>
                      <div className="text-[9px] text-[#64748B]">{l.desc}</div>
                    </div>
                    {activeLayer === l.name && <Check className="w-3 h-3 text-[#00E5FF] shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN SATELLITE MAP TEXTURE & PROGRESSIVE TILE CANVAS */}
      <div
        className="absolute inset-[-25%] transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Photorealistic Sharp Satellite Texture */}
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-300"
          style={{
            backgroundImage: `url(${viewMode === 'regional' ? '/assets/regional_satellite_map.jpg' : '/assets/satellite_map_base.jpg'})`,
            filter: currentLayerObj.filter,
          }}
        />

        {/* Tile Loading Skeleton / Scanning Effect (during zoom shifts) */}
        {isLoadingTiles && (
          <div className="absolute inset-0 bg-[#070D16]/30 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
            <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full p-12 opacity-40">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-[#00E5FF]/30 rounded bg-[#00E5FF]/5 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* Change Heatmap Density Overlay (when toggled) */}
        {showHeatmap && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-200">
            <div
              className="absolute w-72 h-72 rounded-full bg-change/10 border border-change/25"
              style={{ top: `${activePosY}%`, left: `${activePosX}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
        )}

        {/* 3. NUMBERED LOCATION MARKERS matching results strip rank */}
        {displayTargets.map((item, idx) => {
          const isSelected = activeTarget?.id === item.id;
          const posX = viewMode === 'regional'
            ? (item.regionalX ?? item.tacticalX ?? 50)
            : (item.tacticalX ?? 50);
          const posY = viewMode === 'regional'
            ? (item.regionalY ?? item.tacticalY ?? 50)
            : (item.tacticalY ?? 50);
          const rank = idx + 1;

          return (
            <div
              key={item.id}
              onClick={(e) => handleSelectStation(item, e)}
              className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${posX}%`, top: `${posY}%` }}
              title={`#${rank} ${item.title} (${item.coordinates})`}
            >
              {/* Numbered Marker Badge */}
              <div
                className={`rounded-full flex items-center justify-center font-mono tabular-nums transition-all ${
                  isSelected
                    ? 'w-6 h-6 bg-surface border-2 border-accent text-accent font-bold text-xs shadow-subtle ring-2 ring-accent/30'
                    : 'w-5 h-5 bg-surface border border-border text-text-2 hover:text-text hover:border-text-2 text-[10px] shadow-subtle'
                }`}
              >
                {rank}
              </div>

              {/* Small label for the selected AOI */}
              {isSelected && (
                <div className="absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-surface/95 border border-border text-xs text-text shadow-subtle pointer-events-none flex items-center space-x-1.5 animate-in fade-in duration-150">
                  <span className="font-medium">{item.locationName || item.title.split(' ')[0]}</span>
                  <span className="font-mono text-text-2 text-[10px]">· {item.coordinates.split(',')[0]}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Dynamic AOI boundary surrounding selected station */}
        {viewMode === 'tactical' && (
          <div
            className="absolute rounded-md border-2 border-boundary bg-boundary/5 pointer-events-none transition-all duration-300"
            style={{
              top: `${activePosY}%`,
              left: `${activePosX}%`,
              width: '200px',
              height: '140px',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>

      {/* 4. SLEEK COORDINATE READOUT & DEMO NOTE (Bottom Left) */}
      <div className="absolute bottom-2.5 left-2.5 z-30 pointer-events-none flex flex-wrap items-center gap-2">
        <div className="bg-surface/90 border border-border rounded-md px-2 py-1 text-xs font-mono text-text-2 flex items-center space-x-2 shadow-subtle">
          <span className="text-text tabular-nums">{activeTarget?.coordinates || coordinates}</span>
          <span className="border-l border-border pl-2 text-text-2 truncate max-w-[180px]" title={activeTarget?.title || siteName}>
            {activeTarget?.title || siteName}
          </span>
        </div>
        <div className="bg-surface/90 border border-border rounded-md px-2 py-1 text-[11px] text-text-2 font-sans shadow-subtle">
          {activeTarget?.state ? `${activeTarget.state}, ${activeTarget.country || 'India'}` : 'public/demo data'}
        </div>
      </div>

      {/* 5. FLOATING ZOOM & VIEW CONTROLS (Top Left) */}
      <div
        className="absolute top-12 left-2.5 flex flex-col space-y-1 z-20 pointer-events-auto"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            setIsLoadingTiles(true);
            setTimeout(() => setIsLoadingTiles(false), 200);
            setZoom((z) => Math.min(z + 0.25, 2.5));
          }}
          className="w-6 h-6 rounded-md bg-surface/90 border border-border hover:bg-raised text-text-2 hover:text-text flex items-center justify-center transition cursor-pointer shadow-subtle focus-visible:ring-2 focus-visible:ring-accent"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            setIsLoadingTiles(true);
            setTimeout(() => setIsLoadingTiles(false), 200);
            setZoom((z) => Math.max(z - 0.25, 0.75));
          }}
          className="w-6 h-6 rounded-md bg-surface/90 border border-border hover:bg-raised text-text-2 hover:text-text flex items-center justify-center transition cursor-pointer shadow-subtle focus-visible:ring-2 focus-visible:ring-accent"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={resetView}
          className="w-6 h-6 rounded-md bg-surface/90 border border-border hover:bg-raised text-text-2 hover:text-text flex items-center justify-center transition cursor-pointer shadow-subtle focus-visible:ring-2 focus-visible:ring-accent"
          title="Reset pan and zoom"
          aria-label="Reset pan and zoom"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* 6. QUIET SCALE BAR & NORTH ARROW (Bottom Right) */}
      <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center space-x-2 pointer-events-none">
        <div className="bg-surface/90 border border-border px-2 py-0.5 rounded-md text-[10px] font-mono text-text-2 flex items-center space-x-1.5 shadow-subtle">
          <div className="w-10 h-1 border-b-2 border-l-2 border-r-2 border-text-2" />
          <span>{zoom >= 1.5 ? '100 m' : '250 m'}</span>
        </div>

        <div className="w-6 h-6 rounded-md bg-surface/90 border border-border flex items-center justify-center text-[10px] font-mono text-text-2 shadow-subtle">
          <span className="font-semibold">N</span>
        </div>
      </div>
    </div>
  );
};
