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
    cloudCover: '2.1% (Clear)',
    areaHa: '4.2 ha',
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
    cloudCover: '1.8% (Clear)',
    areaHa: '3.1 ha',
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
    areaHa: '4.8 ha',
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
    areaHa: '1.8 ha',
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
    sensor: 'Landsat-8 (15m)',
    category: 'landfill',
    categoryLabel: 'Reclamation & Earthworks',
    color: '#F59E0B',
    confidencePct: 81,
    sst: '29.2 °C (Bare Soil)',
    elevation: '+1.8m MSL',
    albedo: '+0.26 NDBI',
    ndvi: '0.05 (Sediment)',
    cloudCover: '3.1% (Clear)',
    areaHa: '5.6 ha',
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
    categoryLabel: 'Container Terminal Yard',
    color: '#6366F1',
    confidencePct: 94,
    sst: '30.1 °C (Thermal Pavement)',
    elevation: '+6.2m MSL',
    albedo: '+0.38 NDBI',
    ndvi: '0.04 (Pavement)',
    cloudCover: '1.5% (Clear)',
    areaHa: '8.4 ha',
    tacticalX: 33,
    tacticalY: 25,
    regionalX: 37.4,
    regionalY: 37.5,
  },
  {
    id: 'res-7',
    title: 'Bay of Bengal Offshore Oceanographic Station',
    coordinates: '15.2970° N, 87.8680° E',
    lat: 15.2970,
    lon: 87.8680,
    sensor: 'Sentinel-3 & SAR',
    category: 'offshore',
    categoryLabel: 'Deepwater Marine Station',
    color: '#00E5FF',
    confidencePct: 95,
    sst: '29.4 °C (Oceanic Altimetry)',
    elevation: '-2840m Bathymetry',
    albedo: '-0.42 NDWI (Deep Ocean)',
    ndvi: '0.00 (Pelagic)',
    cloudCover: '4.2% (Maritime Pass)',
    areaHa: '12.4 ha',
    tacticalX: 85,
    tacticalY: 65,
    regionalX: 69.5,
    regionalY: 62.0,
  },
  {
    id: 'res-8',
    title: 'Arabian Sea Offshore Energy Corridor',
    coordinates: '18.9220° N, 71.4500° E',
    lat: 18.9220,
    lon: 71.4500,
    sensor: 'Sentinel-1 SAR (10m)',
    category: 'offshore',
    categoryLabel: 'Offshore Energy Corridor',
    color: '#14B8A6',
    confidencePct: 92,
    sst: '28.1 °C (Ocean Surface)',
    elevation: '-82m Bathymetry',
    albedo: '-0.38 NDWI',
    ndvi: '0.00 (Open Sea)',
    cloudCover: '0.0% (SAR Penetration)',
    areaHa: '9.8 ha',
    tacticalX: 18,
    tacticalY: 72,
    regionalX: 25.5,
    regionalY: 53.0,
  },
  {
    id: 'res-9',
    title: 'Gulf of Khambhat Marine Gateway & Tidal Flat',
    coordinates: '21.2000° N, 72.4000° E',
    lat: 21.2000,
    lon: 72.4000,
    sensor: 'Sentinel-2 (10m)',
    category: 'offshore',
    categoryLabel: 'Tidal Sediment Gateway',
    color: '#0284C7',
    confidencePct: 91,
    sst: '27.4 °C (Estuary Water)',
    elevation: '-14m Bathymetry',
    albedo: '+0.08 NDWI',
    ndvi: '0.09 (Mangrove Fringe)',
    cloudCover: '2.8% (Clear Sky)',
    areaHa: '15.2 ha',
    tacticalX: 26,
    tacticalY: 46,
    regionalX: 35.8,
    regionalY: 43.5,
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

  // Spectral Layers & Heatmap
  const [activeLayer, setActiveLayer] = useState<string>('Sentinel-2 (True Color RGB)');
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  // Active Selected Station / Coordinates
  const [currentCoords, setCurrentCoords] = useState<string>(coordinates);
  const [activeStation, setActiveStation] = useState<MapTargetStation>(() => {
    return MAP_STATIONS.find(s => s.id === selectedTargetId) || MAP_STATIONS[0];
  });
  const [clickedPoint, setClickedPoint] = useState<{ x: number; y: number; lat: number; lon: number } | null>(null);
  const [aoiAlert, setAoiAlert] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Available spectral layers with real radiometric filters
  const layers = [
    { name: 'Sentinel-2 (True Color RGB)', date: '2025-04-28', filter: 'none', desc: '10m Multi-spectral true color bands B4-B3-B2' },
    { name: 'Surface Temp (SWIR B11/B12)', date: '2025-04-28', filter: 'contrast(1.35) hue-rotate(28deg) saturate(1.8)', desc: 'Thermal radiometric infrared heat signature' },
    { name: 'NDVI Vegetation Health Index', date: '2025-04-28', filter: 'saturate(2.2) contrast(1.2) hue-rotate(330deg)', desc: 'Normalized difference vegetation density' },
    { name: 'NDBI Built-up Concrete Index', date: '2025-04-28', filter: 'contrast(1.4) saturate(1.4) hue-rotate(180deg)', desc: 'Impervious concrete & structural wharf reflectance' },
    { name: 'Sentinel-1 SAR Radar Backscatter', date: '2025-04-28', filter: 'grayscale(1) contrast(1.9) brightness(0.95)', desc: 'C-Band GRD VV+VH all-weather penetration' },
  ];

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

    // Call external selector so Semantic Search and Change Analysis update immediately
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
          timeGap: '24 months'
        });
      }
    }

    setAoiAlert(`Target lock: ${station.title}`);
    setTimeout(() => setAoiAlert(null), 3000);
  };

  // Interactive Map Canvas Click: Calculate exact geographic Lat/Lon and pick nearest station
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel click to geographic Lat & Lon relative to current scale
    let computedLat: number;
    let computedLon: number;

    if (viewMode === 'regional') {
      // Regional map spans approx 5°N to 35°N (Lat), 60°E to 100°E (Lon)
      const pctX = (clickX / rect.width);
      const pctY = (clickY / rect.height);
      computedLon = 60.0 + pctX * 40.0;
      computedLat = 35.0 - pctY * 30.0;
    } else {
      // Tactical sector spans approx 21.43°N to 21.49°N, 72.75°E to 72.80°E
      const pctX = (clickX / rect.width);
      const pctY = (clickY / rect.height);
      computedLon = 72.7500 + pctX * 0.0500;
      computedLat = 21.4900 - pctY * 0.0600;
    }

    const coordsStr = `Lat: ${computedLat.toFixed(4)}° N   Lon: ${computedLon.toFixed(4)}° E`;
    setCurrentCoords(coordsStr);
    if (onCoordinatesChange) onCoordinatesChange(coordsStr);

    setClickedPoint({
      x: (clickX / rect.width) * 100,
      y: (clickY / rect.height) * 100,
      lat: computedLat,
      lon: computedLon
    });

    // Find closest station in database
    let closestStation = MAP_STATIONS[0];
    let minDistance = Number.MAX_VALUE;

    MAP_STATIONS.forEach((st) => {
      const dist = Math.hypot(st.lat - computedLat, st.lon - computedLon);
      if (dist < minDistance) {
        minDistance = dist;
        closestStation = st;
      }
    });

    handleSelectStation(closestStation);
  };

  // Mouse drag panning
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on background or left mouse button
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: Math.max(-300, Math.min(300, e.clientX - dragStart.x)),
        y: Math.max(-250, Math.min(250, e.clientY - dragStart.y))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setClickedPoint(null);
  };

  const currentLayerObj = layers.find((l) => l.name === activeLayer) || layers[0];

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      className="relative w-full h-full bg-[#050C16] overflow-hidden rounded-xl border border-[#182A40] select-none cursor-crosshair group font-sans"
    >
      {/* 1. TOP HEADER & TELEMETRY TOOLBAR */}
      {mode === 'compact' ? (
        <div
          className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between pointer-events-none"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left: Tactical AOI Title Badge */}
          <div className="flex items-center space-x-2 pointer-events-auto bg-[#070D16]/90 border border-[#182A40] px-2.5 py-1.5 rounded-lg shadow-xl backdrop-blur-md text-xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-semibold text-white tracking-tight">Tactical AOI Monitor ({selectedAOI})</span>
            <span className="text-[10px] text-[#38BDF8] font-mono border-l border-[#182A40] pl-2 hidden sm:inline">10m Sentinel-2</span>
          </div>

          {/* Right: Expand to Dedicated Satellite Altimetry Map button */}
          <div className="flex items-center space-x-1.5 pointer-events-auto">
            {onOpenFullMap && (
              <button
                onClick={onOpenFullMap}
                className="h-7 px-2.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-medium flex items-center space-x-1.5 transition shadow-lg backdrop-blur-md cursor-pointer"
                title="Open dedicated Satellite Altimetry Map section"
              >
                <span className="hidden sm:inline">Satellite Altimetry Map</span>
                <span className="sm:hidden">Full Map</span>
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between pointer-events-none"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Left: View Mode Toggle & Title */}
        <div className="flex items-center space-x-2 pointer-events-auto bg-[#070D16]/90 border border-[#182A40] px-2.5 py-1.5 rounded-lg shadow-xl backdrop-blur-md text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
            <span className="font-semibold text-white tracking-tight hidden sm:inline">Satellite Altimetry & Surveillance</span>
          </div>

          <div className="h-3 w-[1px] bg-[#182A40] hidden sm:block" />

          {/* View Switcher: Regional Ocean vs Tactical AOI */}
          <div className="flex items-center bg-[#0B1523] p-0.5 rounded-md border border-[#182A40]">
            <button
              onClick={() => {
                setViewMode('regional');
                resetView();
              }}
              className={`h-6 px-2.5 rounded text-[11px] font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'regional'
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3 text-[#00E5FF]" />
              <span>Regional Ocean</span>
            </button>
            <button
              onClick={() => {
                setViewMode('tactical');
                resetView();
              }}
              className={`h-6 px-2.5 rounded text-[11px] font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'tactical'
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Crosshair className="w-3 h-3 text-[#10B981]" />
              <span>Tactical {selectedAOI} (10m)</span>
            </button>
          </div>
        </div>

        {/* Center: Quick Stations Selector Chips */}
        <div className="hidden xl:flex items-center space-x-1 pointer-events-auto bg-[#070D16]/85 border border-[#182A40] px-2 py-1 rounded-lg backdrop-blur-md overflow-x-auto no-scrollbar max-w-[420px]">
          {MAP_STATIONS.slice(0, 6).map((st) => {
            const isSelected = activeStation.id === st.id;
            return (
              <button
                key={st.id}
                onClick={(e) => handleSelectStation(st, e)}
                className={`h-6 px-2 rounded text-[10px] font-mono whitespace-nowrap transition cursor-pointer flex items-center space-x-1 shrink-0 ${
                  isSelected
                    ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/60 font-bold'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0E1A2B]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st.color }} />
                <span>{st.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Spectral Layer Switcher Button & Heatmap Toggle */}
        <div className="flex items-center space-x-1.5 pointer-events-auto">
          {/* Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`h-7 px-2 rounded-lg border text-xs font-medium flex items-center space-x-1.5 transition shadow-lg backdrop-blur-md cursor-pointer ${
              showHeatmap
                ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]'
                : 'bg-[#070D16]/90 border-[#182A40] text-[#94A3B8] hover:text-white hover:border-[#0284C7]'
            }`}
            title="Toggle multi-temporal change heatmap"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Heatmap</span>
          </button>

          {/* Layer Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="h-7 px-2.5 rounded-lg bg-[#070D16]/90 border border-[#182A40] hover:border-[#00E5FF]/50 text-white text-xs font-medium flex items-center space-x-1.5 transition shadow-lg backdrop-blur-md cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span className="hidden sm:inline text-[11px] truncate max-w-[110px]">{activeLayer.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-[#64748B]" />
            </button>

            {showLayerMenu && (
              <div className="absolute top-8 right-0 w-64 bg-[#0B1523] border border-[#182A40] rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1 font-sans animate-in fade-in">
                <div className="px-2 py-1 text-[10px] text-[#64748B] uppercase font-bold tracking-wider">
                  Select Spectral Band Layer
                </div>
                {layers.map((l) => (
                  <div
                    key={l.name}
                    onClick={() => {
                      setActiveLayer(l.name);
                      setShowLayerMenu(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                      activeLayer === l.name
                        ? 'bg-[#0E355A] text-[#00E5FF] font-bold border border-[#00E5FF]/40'
                        : 'text-[#94A3B8] hover:bg-[#132438] hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{l.name}</div>
                      <div className="text-[10px] text-[#64748B]">{l.desc}</div>
                    </div>
                    {activeLayer === l.name && <Check className="w-3.5 h-3.5 text-[#00E5FF]" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

      {/* Alert Banner for AOI actions */}
      {aoiAlert && (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-40 bg-[#063327] border border-[#10B981] px-4 py-1.5 rounded-lg text-xs text-[#10B981] shadow-2xl flex items-center space-x-2 animate-in fade-in pointer-events-none">
          <Check className="w-3.5 h-3.5" />
          <span>{aoiAlert}</span>
        </div>
      )}

      {/* 2. MAIN SATELLITE MAP TEXTURE CANVAS */}
      <div
        className="absolute inset-[-25%] transition-transform duration-200 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Photorealistic Satellite Map Background Image */}
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-300"
          style={{
            backgroundImage: `url(${viewMode === 'regional' ? '/assets/regional_satellite_map.jpg' : '/assets/satellite_map_base.jpg'})`,
            filter: currentLayerObj.filter,
          }}
        />

        {/* Change Heatmap Density Overlay (when toggled) */}
        {showHeatmap && (
          <div className="absolute inset-0 pointer-events-none animate-in fade-in duration-300">
            <div
              className="absolute w-72 h-72 rounded-full bg-red-600/35 blur-3xl"
              style={{ top: '44%', left: '46%', transform: 'translate(-50%, -50%)' }}
            />
            <div
              className="absolute w-96 h-96 rounded-full bg-amber-500/25 blur-3xl"
              style={{ top: '48%', left: '50%', transform: 'translate(-50%, -50%)' }}
            />
          </div>
        )}

        {/* 3. INTERACTIVE STATION BEACON PINS (Plotted at calibrated coordinates) */}
        {MAP_STATIONS.map((station) => {
          const isSelected = activeStation.id === station.id;
          const posX = viewMode === 'regional' ? station.regionalX : station.tacticalX;
          const posY = viewMode === 'regional' ? station.regionalY : station.tacticalY;

          return (
            <div
              key={station.id}
              onClick={(e) => handleSelectStation(station, e)}
              className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin"
              style={{ left: `${posX}%`, top: `${posY}%` }}
              title={`Click to select: ${station.title} (${station.coordinates})`}
            >
              {/* Pulsing Beacon Waves */}
              <div
                className={`absolute inset-0 -m-3 rounded-full opacity-75 animate-ping`}
                style={{
                  backgroundColor: station.color,
                  animationDuration: isSelected ? '1.5s' : '3s'
                }}
              />

              {/* Center Target Dot */}
              <div
                className={`relative w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center shadow-lg ${
                  isSelected
                    ? 'scale-125 border-white bg-[#00E5FF] shadow-[0_0_15px_#00E5FF]'
                    : 'border-[#070D16] group-hover/pin:scale-110'
                }`}
                style={{ backgroundColor: isSelected ? '#00E5FF' : station.color }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              {/* Station Label Card (Always legible with high contrast) */}
              <div
                className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1 rounded-md border text-[10px] font-sans transition-all shadow-xl backdrop-blur-md pointer-events-none ${
                  isSelected
                    ? 'bg-[#070D16]/95 border-[#00E5FF] text-white shadow-[0_0_12px_rgba(0,229,255,0.4)] z-30 scale-105'
                    : 'bg-[#0B1523]/90 border-[#182A40] text-[#94A3B8] group-hover/pin:text-white group-hover/pin:border-[#0284C7]'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold">
                  <span>{station.title.split(' ')[0]}</span>
                  <span className="text-[9px] font-mono text-[#00E5FF]">{station.confidencePct}%</span>
                </div>
                <div className="text-[8px] font-mono text-[#64748B]">
                  {station.lat.toFixed(2)}°N, {station.lon.toFixed(2)}°E
                </div>
              </div>
            </div>
          );
        })}

        {/* User Click Indicator Beacon (if clicked arbitrary spot) */}
        {clickedPoint && (
          <div
            className="absolute z-25 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${clickedPoint.x}%`, top: `${clickedPoint.y}%` }}
          >
            <div className="w-8 h-8 rounded-full border border-[#00E5FF] animate-ping" />
            <div className="w-3 h-3 rounded-full bg-[#00E5FF] border border-white shadow-[0_0_10px_#00E5FF]" />
          </div>
        )}

        {/* Tactical AOI Bounding Box (In Tactical Mode) */}
        {viewMode === 'tactical' && (
          <div
            className="absolute transition-all rounded-xl border-2 border-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_20px_rgba(0,229,255,0.25)] pointer-events-none"
            style={{
              top: '44%',
              left: '46%',
              width: '260px',
              height: '190px',
              transform: 'translate(-50%, -50%) rotate(-14deg)',
            }}
          >
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#0B1523] rounded-full border-2 border-[#00E5FF]" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#0B1523] rounded-full border-2 border-[#00E5FF]" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#0B1523] rounded-full border-2 border-[#00E5FF]" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#0B1523] rounded-full border-2 border-[#00E5FF]" />
          </div>
        )}
      </div>

      {/* Sleek Coordinate Badge (Bottom Left) */}
      <div
        className="absolute bottom-2.5 left-2.5 z-30 pointer-events-none"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#070D16]/90 border border-[#182A40] rounded-lg px-2.5 py-1 backdrop-blur-md text-[10px] font-mono text-[#94A3B8] flex items-center space-x-2 shadow-lg">
          <span className="text-[#00E5FF] font-semibold">{currentCoords}</span>
          <span className="border-l border-[#182A40] pl-2 text-white truncate max-w-[200px]">{siteName}</span>
        </div>
      </div>

      {/* 5. STATION CATEGORY LEGEND (Shown only in full mode) */}
      {mode !== 'compact' && (
        <div
          className="hidden md:block absolute top-14 right-3 z-30 pointer-events-auto"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#070D16]/90 border border-[#182A40] rounded-xl p-2.5 shadow-2xl backdrop-blur-md text-[10px] font-sans space-y-1.5 w-44">
            <div className="flex items-center justify-between border-b border-[#182A40] pb-1 text-[#64748B] font-bold tracking-wider uppercase text-[9px]">
              <span>STATION LEGEND</span>
              <button onClick={() => setShowLegend(!showLegend)} className="hover:text-white cursor-pointer">
                {showLegend ? '−' : '+'}
              </button>
            </div>

            {showLegend && (
              <div className="space-y-1 text-[#94A3B8]">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                  <span className="text-white">Wharf / Piling Construction</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                  <span>Sea Bund / Embankment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
                  <span>Marine Logistics / Berth</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span>Rivermouth Pier & Bridge</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span>Mudflat & Earthworks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
                  <span>Offshore Satellite Sector</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. FLOATING ZOOM & VIEW CONTROLS (Top Left) */}
      <div
        className="absolute top-14 left-3 flex flex-col space-y-1.5 z-20 pointer-events-auto"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
          className="w-7 h-7 rounded-lg bg-[#070D16]/90 border border-[#182A40] hover:border-[#00E5FF] hover:text-[#00E5FF] flex items-center justify-center text-white transition backdrop-blur shadow-lg cursor-pointer"
          title="Zoom in"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
          className="w-7 h-7 rounded-lg bg-[#070D16]/90 border border-[#182A40] hover:border-[#00E5FF] hover:text-[#00E5FF] flex items-center justify-center text-white transition backdrop-blur shadow-lg cursor-pointer"
          title="Zoom out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={resetView}
          className="w-7 h-7 rounded-lg bg-[#070D16]/90 border border-[#182A40] hover:border-[#00E5FF] hover:text-[#00E5FF] flex items-center justify-center text-white transition backdrop-blur shadow-lg cursor-pointer"
          title="Reset pan and zoom"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 7. COMPASS & NORTH INDICATOR (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center space-x-2 pointer-events-none">
        <div className="w-8 h-8 rounded-full bg-[#070D16]/90 border border-[#182A40] flex flex-col items-center justify-center text-[9px] font-mono text-white backdrop-blur shadow">
          <span className="text-[#00E5FF] font-bold">N</span>
          <div className="w-0.5 h-2.5 bg-[#00E5FF]" />
        </div>
      </div>
    </div>
  );
};
