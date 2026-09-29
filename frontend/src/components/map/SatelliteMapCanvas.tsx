import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Minus,
  Crosshair,
  Layers,
  ChevronDown,
  Check,
  Flame,
  Globe,
  RotateCcw,
  Maximize2
} from 'lucide-react';
import { SearchResultItem } from '../search/SemanticSearchResults';

export interface MapTargetStation {
  id: string;
  title: string;
  coordinates: string;
  lat: number;
  lon: number;
  sensor: string;
  category: 'construction' | 'embankment' | 'port' | 'bridge' | 'landfill' | 'offshore';
  categoryLabel: string;
  color: string;
  confidencePct: number;
  sst: string;
  elevation: string;
  albedo: string;
  ndvi: string;
  cloudCover: string;
  areaHa: string;
  // Canvas coordinate percentages in tactical and regional views
  tacticalX: number;
  tacticalY: number;
  regionalX: number;
  regionalY: number;
}

// Calibrated stations & targets matching ground-truth and regional oceanographic sectors
const MAP_STATIONS: MapTargetStation[] = [
  {
    id: 'res-1',
    title: 'Hazira Deepwater Wharf & Piling Deck',
    coordinates: '21.4587° N, 72.7812° E',
    lat: 21.4587,
    lon: 72.7812,
    sensor: 'Sentinel-2 (10m)',
    category: 'construction',
    categoryLabel: 'Wharf & Piling Deck',
    color: '#00E5FF',
    confidencePct: 96,
    sst: '28.4 °C (SWIR B11)',
    elevation: '+4.8m MSL',
    albedo: '+0.28 NDBI',
    ndvi: '0.12 (Built-up)',
    cloudCover: '1.8% (Clear)',
    areaHa: '4.2 ha (42,000 m²)',
    tacticalX: 47,
    tacticalY: 44,
    regionalX: 38.2,
    regionalY: 39.2,
  },
  {
    id: 'res-2',
    title: 'Dumas Coastal Bund & Sea Embankment',
    coordinates: '21.4632° N, 72.7845° E',
    lat: 21.4632,
    lon: 72.7845,
    sensor: 'Sentinel-2 (10m)',
    category: 'embankment',
    categoryLabel: 'Coastal Sea Bund',
    color: '#38BDF8',
    confidencePct: 93,
    sst: '27.9 °C (SWIR B11)',
    elevation: '+3.2m MSL',
    albedo: '+0.19 NDBI',
    ndvi: '0.22 (Tidal Grass)',
    cloudCover: '1.4% (Clear)',
    areaHa: '3.1 ha (31,000 m²)',
    tacticalX: 57,
    tacticalY: 36,
    regionalX: 38.6,
    regionalY: 38.8,
  },
  {
    id: 'res-3',
    title: 'Adani Marine Logistics Berth Extension',
    coordinates: '21.4521° N, 72.7763° E',
    lat: 21.4521,
    lon: 72.7763,
    sensor: 'Sentinel-1 SAR (10m)',
    category: 'port',
    categoryLabel: 'Marine Logistics Berth',
    color: '#A855F7',
    confidencePct: 89,
    sst: '28.8 °C (SAR VV/VH)',
    elevation: '+5.1m MSL',
    albedo: '+0.34 NDBI',
    ndvi: '0.08 (Asphalt / Metal)',
    cloudCover: '0.0% (SAR All-Weather)',
    areaHa: '4.8 ha (48,000 m²)',
    tacticalX: 36,
    tacticalY: 57,
    regionalX: 37.8,
    regionalY: 40.1,
  },
  {
    id: 'res-4',
    title: 'Tapi Rivermouth Pier Piling & Riprap',
    coordinates: '21.4550° N, 72.7801° E',
    lat: 21.4550,
    lon: 72.7801,
    sensor: 'Sentinel-2 (10m)',
    category: 'bridge',
    categoryLabel: 'Rivermouth Pier & Channel',
    color: '#10B981',
    confidencePct: 85,
    sst: '26.8 °C (Water Interface)',
    elevation: '+2.4m MSL',
    albedo: '+0.15 NDBI',
    ndvi: '0.18 (Riparian)',
    cloudCover: '2.4% (Clear)',
    areaHa: '1.8 ha (18,000 m²)',
    tacticalX: 45,
    tacticalY: 51,
    regionalX: 38.1,
    regionalY: 39.6,
  },
  {
    id: 'res-5',
    title: 'Coastal Mudflat Landfill & Earthworks',
    coordinates: '21.4617° N, 72.7890° E',
    lat: 21.4617,
    lon: 72.7890,
    sensor: 'Landsat-8/9 (15m)',
    category: 'landfill',
    categoryLabel: 'Reclamation & Earthworks',
    color: '#F59E0B',
    confidencePct: 81,
    sst: '29.2 °C (Bare Soil)',
    elevation: '+1.8m MSL',
    albedo: '+0.26 NDBI',
    ndvi: '0.05 (Sediment)',
    cloudCover: '1.1% (Clear)',
    areaHa: '5.6 ha (56,000 m²)',
    tacticalX: 68,
    tacticalY: 38,
    regionalX: 39.1,
    regionalY: 38.6,
  },
  {
    id: 'res-6',
    title: 'Hazira Port North Container Staging Yard',
    coordinates: '21.4820° N, 72.7740° E',
    lat: 21.4820,
    lon: 72.7740,
    sensor: 'Sentinel-2 (10m)',
    category: 'port',
    categoryLabel: 'Container Staging Yard',
    color: '#EC4899',
    confidencePct: 94,
    sst: '28.9 °C (SWIR B11)',
    elevation: '+5.5m MSL',
    albedo: '+0.36 NDBI',
    ndvi: '0.07 (Paved)',
    cloudCover: '1.6% (Clear Sky)',
    areaHa: '8.4 ha (84,000 m²)',
    tacticalX: 42,
    tacticalY: 28,
    regionalX: 38.0,
    regionalY: 37.8,
  }
];

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
  selectedAOI = 'AOI-1',
  onCoordinatesChange,
  siteName = 'Hazira Deepwater Wharf & Piling Deck',
  selectedTargetId = 'res-1',
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

  // Active Selected Station / Coordinates
  const [currentCoords, setCurrentCoords] = useState<string>(coordinates);
  const [activeStation, setActiveStation] = useState<MapTargetStation>(() => {
    return MAP_STATIONS.find(s => s.id === selectedTargetId) || MAP_STATIONS[0];
  });

  const containerRef = useRef<HTMLDivElement>(null);

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

  // Synchronize when external target changes
  useEffect(() => {
    setCurrentCoords(coordinates);
    const matched = MAP_STATIONS.find(s => s.id === selectedTargetId);
    if (matched) {
      setActiveStation(matched);
    }
  }, [coordinates, selectedTargetId]);

  // Center on station when selected
  const handleSelectStation = (station: MapTargetStation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveStation(station);
    const coordsStr = `Lat: ${station.lat.toFixed(4)}° N   Lon: ${station.lon.toFixed(4)}° E`;
    setCurrentCoords(coordsStr);
    if (onCoordinatesChange) onCoordinatesChange(coordsStr);

    if (onSelectTarget) {
      const matchInTargets = targets.find(t => t.id === station.id);
      if (matchInTargets) {
        onSelectTarget(matchInTargets);
      } else {
        onSelectTarget({
          id: station.id,
          title: station.title,
          date: '2025-04-28',
          sensor: station.sensor,
          coordinates: station.coordinates,
          matchType: 'High Match',
          confidencePct: station.confidencePct,
          imageUrl: '/assets/card_1_construction.jpg',
          beforeImgUrl: '/assets/before_scene.jpg',
          afterImgUrl: '/assets/after_scene.jpg',
          areaHa: station.areaHa,
          timeGap: '20 months'
        });
      }
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
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
  };

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
            Sentinel-2 Optical (10m)
          </span>

          <div className="h-3 w-[1px] bg-[#182A40] hidden sm:block" />

          {/* View Switcher: Regional Ocean vs Tactical AOI */}
          <div className="flex items-center bg-[#0B1523] p-0.5 rounded-md border border-[#182A40]">
            <button
              onClick={() => {
                setViewMode('regional');
                resetView();
              }}
              className={`h-5 px-2 rounded text-[10px] font-medium transition cursor-pointer flex items-center space-x-1 ${
                viewMode === 'regional' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Globe className="w-2.5 h-2.5 text-[#00E5FF]" />
              <span>Regional</span>
            </button>
            <button
              onClick={() => {
                setViewMode('tactical');
                resetView();
              }}
              className={`h-5 px-2 rounded text-[10px] font-medium transition cursor-pointer flex items-center space-x-1 ${
                viewMode === 'tactical' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Crosshair className="w-2.5 h-2.5 text-[#10B981]" />
              <span>Local {selectedAOI}</span>
            </button>
          </div>
        </div>

        {/* Right: Consolidated "Layers & More" Dropdown (Uncluttered Map Header) */}
        <div className="relative pointer-events-auto">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="h-6 px-2.5 rounded-lg bg-[#070D16]/95 border border-[#182A40] hover:border-[#00E5FF]/60 text-white text-[11px] font-medium flex items-center space-x-1.5 transition shadow backdrop-blur-md cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus:outline-none"
            title="Spectral Layers, Heatmap and Display Controls"
          >
            <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="hidden sm:inline">Layers & More</span>
            <ChevronDown className="w-3 h-3 text-[#64748B]" />
          </button>

          {showLayerMenu && (
            <div className="absolute top-7 right-0 w-64 bg-[#0B1523] border border-[#182A40] rounded-xl shadow-2xl p-2.5 z-50 text-xs space-y-2 font-sans animate-in fade-in">
              <div className="px-2 py-1 text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider border-b border-[#182A40]/70">
                Display & Analysis Overlays
              </div>

              {/* Quick Actions in Menu: Heatmap & Fullscreen Expand */}
              <div className="grid grid-cols-2 gap-1.5 px-1">
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
                    showHeatmap
                      ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]'
                      : 'bg-[#070D16] border-[#182A40] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <Flame className="w-3 h-3 text-[#EF4444]" />
                  <span>Heatmap</span>
                </button>

                {onOpenFullMap && (
                  <button
                    onClick={() => {
                      setShowLayerMenu(false);
                      onOpenFullMap();
                    }}
                    className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-[#070D16] border border-[#182A40] text-[#94A3B8] hover:text-white hover:border-[#00E5FF] transition cursor-pointer text-[11px]"
                  >
                    <Maximize2 className="w-3 h-3 text-[#00E5FF]" />
                    <span>Full Map</span>
                  </button>
                )}
              </div>

              <div className="px-2 pt-1 text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">
                Spectral Band Layers
              </div>

              <div className="space-y-1">
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
        className="absolute inset-[-25%] transition-transform duration-150 ease-out"
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
              style={{ top: '44%', left: '46%', transform: 'translate(-50%, -50%)' }}
            />
          </div>
        )}

        {/* 3. NUMBERED LOCATION MARKERS matching results strip rank */}
        {MAP_STATIONS.map((station, idx) => {
          const isSelected = (selectedTargetId ? selectedTargetId === station.id : activeStation.id === station.id);
          const posX = station.tacticalX;
          const posY = station.tacticalY;
          const rank = idx + 1;

          return (
            <div
              key={station.id}
              onClick={(e) => handleSelectStation(station, e)}
              className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${posX}%`, top: `${posY}%` }}
              title={`#${rank} ${station.title} (${station.lat.toFixed(4)}°N, ${station.lon.toFixed(4)}°E)`}
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

              {/* ONE small label for the selected AOI only (name + ID in mono) */}
              {isSelected && (
                <div className="absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-surface/95 border border-border text-xs text-text shadow-subtle pointer-events-none flex items-center space-x-1.5 animate-in fade-in duration-150">
                  <span className="font-medium">{station.title.split(' ')[0]}</span>
                  <span className="font-mono text-text-2 text-[10px]">· {station.id}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* AOI boundary: 1.5-2px solid --boundary */}
        {viewMode === 'tactical' && (
          <div
            className="absolute rounded-md border-2 border-boundary bg-boundary/5 pointer-events-none"
            style={{
              top: '48%',
              left: '52%',
              width: '240px',
              height: '170px',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>

      {/* 4. SLEEK COORDINATE READOUT & DEMO NOTE (Bottom Left) */}
      <div className="absolute bottom-2.5 left-2.5 z-30 pointer-events-none flex flex-wrap items-center gap-2">
        <div className="bg-surface/90 border border-border rounded-md px-2 py-1 text-xs font-mono text-text-2 flex items-center space-x-2 shadow-subtle" title={`${siteName} (${currentCoords})`}>
          <span className="text-text tabular-nums">{currentCoords}</span>
          <span className="border-l border-border pl-2 text-text-2 truncate max-w-[160px]" title={siteName}>{siteName}</span>
        </div>
        <div className="bg-surface/90 border border-border rounded-md px-2 py-1 text-[11px] text-text-2 font-sans shadow-subtle">
          Imagery: public/demo data
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
