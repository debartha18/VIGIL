import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  Search,
  Plus,
  Minus,
  RotateCcw,
  ChevronRight
} from 'lucide-react';
import { SearchResultItem } from '../components/search/SemanticSearchResults';

export interface AltimetryStation {
  id: string;
  title: string;
  stationCode: string;
  type: 'in-situ' | 'drifter' | 'argo' | 'tide-gauge' | 'wave-buoy';
  typeLabel: string;
  color: string;
  coordinates: string;
  lat: number;
  lon: number;
  // Position percentages on global equirectangular map
  globalX: number;
  globalY: number;
  // Telemetry metrics matching ocean-vision-3d
  depth: string;
  pressure: string;
  sst: string;
  sstVal: number;
  salinity: string;
  salinityVal: number;
  dissolvedOxygen: string;
  dissolvedOxygenVal: number;
  chlorophyll: string;
  chlorophyllVal: number;
  waveHeight: string;
  waveHeightVal: number;
  currentSpeed: string;
  currentSpeedVal: number;
  windSpeed: string;
  windDirection: string;
  // Linked semantic search item ID (if any)
  semanticId?: string;
}

const GLOBAL_STATIONS: AltimetryStation[] = [
  {
    id: 'st-bob',
    title: 'Bay of Bengal Oceanic Station',
    stationCode: 'Bay of Bengal',
    type: 'in-situ',
    typeLabel: 'In-situ Station',
    color: '#EAB308',
    coordinates: '15.2970° N, 87.8680° E',
    lat: 15.297,
    lon: 87.868,
    globalX: 74.4,
    globalY: 41.5,
    depth: '3,840m',
    pressure: '3,955.20 dbar (390.41 atm)',
    sst: '28.9 °C',
    sstVal: 28.9,
    salinity: '32.8 PSU',
    salinityVal: 32.8,
    dissolvedOxygen: '4.6 mg/L',
    dissolvedOxygenVal: 4.6,
    chlorophyll: '0.52 mg/m³',
    chlorophyllVal: 0.52,
    waveHeight: '1.42m',
    waveHeightVal: 1.42,
    currentSpeed: '0.42 m/s',
    currentSpeedVal: 0.42,
    windSpeed: '7.4 m/s',
    windDirection: '205° SW',
    semanticId: 'res-7'
  },
  {
    id: 'st-as',
    title: 'Arabian Sea Offshore Energy Corridor',
    stationCode: 'Arabian Sea',
    type: 'in-situ',
    typeLabel: 'In-situ Station',
    color: '#EAB308',
    coordinates: '18.9220° N, 71.4500° E',
    lat: 18.922,
    lon: 71.450,
    globalX: 69.8,
    globalY: 39.5,
    depth: '1,280m',
    pressure: '1,318.40 dbar (130.12 atm)',
    sst: '28.1 °C',
    sstVal: 28.1,
    salinity: '36.5 PSU',
    salinityVal: 36.5,
    dissolvedOxygen: '4.2 mg/L',
    dissolvedOxygenVal: 4.2,
    chlorophyll: '0.38 mg/m³',
    chlorophyllVal: 0.38,
    waveHeight: '1.25m',
    waveHeightVal: 1.25,
    currentSpeed: '0.49 m/s',
    currentSpeedVal: 0.49,
    windSpeed: '8.2 m/s',
    windDirection: '240° WSW',
    semanticId: 'res-8'
  },
  {
    id: 'st-hazira',
    title: 'Hazira Deepwater Wharf & Piling Deck',
    stationCode: 'Hazira Wharf',
    type: 'tide-gauge',
    typeLabel: 'Tide Gauge & Wharf',
    color: '#00E5FF',
    coordinates: '21.4587° N, 72.7812° E',
    lat: 21.4587,
    lon: 72.7812,
    globalX: 70.2,
    globalY: 38.2,
    depth: '18m',
    pressure: '18.50 dbar (1.82 atm)',
    sst: '28.4 °C',
    sstVal: 28.4,
    salinity: '34.2 PSU',
    salinityVal: 34.2,
    dissolvedOxygen: '5.1 mg/L',
    dissolvedOxygenVal: 5.1,
    chlorophyll: '0.95 mg/m³',
    chlorophyllVal: 0.95,
    waveHeight: '0.85m',
    waveHeightVal: 0.85,
    currentSpeed: '0.62 m/s',
    currentSpeedVal: 0.62,
    windSpeed: '6.1 m/s',
    windDirection: '190° S',
    semanticId: 'res-1'
  },
  {
    id: 'st-natl',
    title: 'North Atlantic Ocean Mid-Basin',
    stationCode: 'Station 42012',
    type: 'drifter',
    typeLabel: 'Drifter Buoy',
    color: '#A855F7',
    coordinates: '32.4000° N, 42.1000° W',
    lat: 32.4,
    lon: -42.1,
    globalX: 38.3,
    globalY: 32.0,
    depth: '4,520m',
    pressure: '4,655.60 dbar (459.45 atm)',
    sst: '22.4 °C',
    sstVal: 22.4,
    salinity: '36.8 PSU',
    salinityVal: 36.8,
    dissolvedOxygen: '5.8 mg/L',
    dissolvedOxygenVal: 5.8,
    chlorophyll: '0.24 mg/m³',
    chlorophyllVal: 0.24,
    waveHeight: '2.10m',
    waveHeightVal: 2.10,
    currentSpeed: '0.36 m/s',
    currentSpeedVal: 0.36,
    windSpeed: '11.5 m/s',
    windDirection: '275° W',
  },
  {
    id: 'st-pac',
    title: 'Equatorial Pacific Deep Basin',
    stationCode: 'Station 51012',
    type: 'argo',
    typeLabel: 'Argo Float',
    color: '#10B981',
    coordinates: '0.2000° S, 140.5000° W',
    lat: -0.2,
    lon: -140.5,
    globalX: 11.0,
    globalY: 50.1,
    depth: '5,180m',
    pressure: '5,335.40 dbar (526.54 atm)',
    sst: '26.8 °C',
    sstVal: 26.8,
    salinity: '35.1 PSU',
    salinityVal: 35.1,
    dissolvedOxygen: '4.8 mg/L',
    dissolvedOxygenVal: 4.8,
    chlorophyll: '0.19 mg/m³',
    chlorophyllVal: 0.19,
    waveHeight: '1.80m',
    waveHeightVal: 1.80,
    currentSpeed: '0.17 m/s',
    currentSpeedVal: 0.17,
    windSpeed: '6.8 m/s',
    windDirection: '095° E',
  },
  {
    id: 'st-south',
    title: 'Southern Ocean Antarctic Convergence',
    stationCode: 'Station 71025',
    type: 'wave-buoy',
    typeLabel: 'Wave Buoy',
    color: '#F97316',
    coordinates: '42.1000° S, 85.4000° E',
    lat: -42.1,
    lon: 85.4,
    globalX: 73.7,
    globalY: 73.4,
    depth: '4,100m',
    pressure: '4,223.00 dbar (416.78 atm)',
    sst: '12.4 °C',
    sstVal: 12.4,
    salinity: '34.4 PSU',
    salinityVal: 34.4,
    dissolvedOxygen: '7.2 mg/L',
    dissolvedOxygenVal: 7.2,
    chlorophyll: '0.65 mg/m³',
    chlorophyllVal: 0.65,
    waveHeight: '3.40m',
    waveHeightVal: 3.40,
    currentSpeed: '0.34 m/s',
    currentSpeedVal: 0.34,
    windSpeed: '14.2 m/s',
    windDirection: '280° W',
  },
  {
    id: 'st-aus',
    title: 'West Australian Oceanic Basin',
    stationCode: 'Station 80045',
    type: 'in-situ',
    typeLabel: 'In-situ Station',
    color: '#EAB308',
    coordinates: '28.5000° S, 110.2000° E',
    lat: -28.5,
    lon: 110.2,
    globalX: 80.6,
    globalY: 65.8,
    depth: '4,890m',
    pressure: '5,036.70 dbar (497.08 atm)',
    sst: '20.1 °C',
    sstVal: 20.1,
    salinity: '35.6 PSU',
    salinityVal: 35.6,
    dissolvedOxygen: '5.4 mg/L',
    dissolvedOxygenVal: 5.4,
    chlorophyll: '0.31 mg/m³',
    chlorophyllVal: 0.31,
    waveHeight: '1.95m',
    waveHeightVal: 1.95,
    currentSpeed: '0.28 m/s',
    currentSpeedVal: 0.28,
    windSpeed: '9.0 m/s',
    windDirection: '160° SSE',
  },
  {
    id: 'st-alaska',
    title: 'Gulf of Alaska Altimetry Mooring',
    stationCode: 'Station 46001',
    type: 'tide-gauge',
    typeLabel: 'Tide Gauge',
    color: '#00E5FF',
    coordinates: '56.3000° N, 148.2000° W',
    lat: 56.3,
    lon: -148.2,
    globalX: 8.8,
    globalY: 18.7,
    depth: '3,820m',
    pressure: '3,934.60 dbar (388.31 atm)',
    sst: '10.1 °C',
    sstVal: 10.1,
    salinity: '32.4 PSU',
    salinityVal: 32.4,
    dissolvedOxygen: '7.8 mg/L',
    dissolvedOxygenVal: 7.8,
    chlorophyll: '1.12 mg/m³',
    chlorophyllVal: 1.12,
    waveHeight: '2.80m',
    waveHeightVal: 2.80,
    currentSpeed: '0.12 m/s',
    currentSpeedVal: 0.12,
    windSpeed: '12.8 m/s',
    windDirection: '310° NW',
  }
];

interface SatelliteAltimetryMapViewProps {
  onBackToSemanticSearch: () => void;
  onSelectStationForSearch?: (item: SearchResultItem) => void;
  groundTruthTargets: SearchResultItem[];
}

export const SatelliteAltimetryMapView: React.FC<SatelliteAltimetryMapViewProps> = ({
  onBackToSemanticSearch,
  onSelectStationForSearch,
  groundTruthTargets
}) => {
  // Navigation & Display state
  const [activeParam, setActiveParam] = useState<'currents' | 'sst' | 'wave' | 'salinity' | 'cyclones' | 'fleet'>('currents');
  const [viewMode, setViewMode] = useState<'global' | 'regional' | 'tactical'>('global');
  const [activeStation, setActiveStation] = useState<AltimetryStation>(GLOBAL_STATIONS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lon: number; x: number; y: number } | null>(null);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter stations based on search query
  const filteredStations = GLOBAL_STATIONS.filter(st => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return st.title.toLowerCase().includes(q) ||
           st.stationCode.toLowerCase().includes(q) ||
           st.coordinates.toLowerCase().includes(q);
  });

  // Handle Canvas Click to interpolate accurate coordinates
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const normalizedX = (clickX - pan.x) / (rect.width * zoom);
    const normalizedY = (clickY - pan.y) / (rect.height * zoom);

    // Equirectangular mapping: X: [-180, 180], Y: [90, -90]
    const lon = (normalizedX * 360) - 180;
    const lat = 90 - (normalizedY * 180);

    const clampedLat = Math.max(-85, Math.min(85, lat));
    const clampedLon = Math.max(-180, Math.min(180, lon));

    // Dynamic telemetry estimation for arbitrary clicked point
    const depthEst = Math.round(1500 + Math.abs(clampedLat) * 45 + (clampedLon % 30) * 20);
    const sstEst = +(28 - (Math.abs(clampedLat) * 0.35)).toFixed(1);
    const pressEst = +(depthEst * 1.03).toFixed(2);
    const salEst = +(34 + (Math.abs(clampedLat) % 3) * 0.7).toFixed(1);
    const doEst = +(4.2 + (Math.abs(clampedLat) * 0.04)).toFixed(1);
    const chlaEst = +(0.2 + (Math.abs(clampedLon) % 5) * 0.15).toFixed(2);
    const swhEst = +(1.2 + (Math.abs(clampedLat) * 0.025)).toFixed(2);
    const windEst = +(6.5 + (Math.abs(clampedLat) * 0.1)).toFixed(1);

    const dynamicStation: AltimetryStation = {
      id: `coord-${Date.now()}`,
      title: `Surface Coordinate: ${Math.abs(clampedLat).toFixed(2)}° ${clampedLat >= 0 ? 'N' : 'S'}, ${Math.abs(clampedLon).toFixed(2)}° ${clampedLon >= 0 ? 'E' : 'W'}`,
      stationCode: `${Math.abs(clampedLat).toFixed(2)}°N, ${Math.abs(clampedLon).toFixed(2)}°E`,
      type: 'in-situ',
      typeLabel: 'User Selected Coordinate',
      color: '#00E5FF',
      coordinates: `${Math.abs(clampedLat).toFixed(4)}° ${clampedLat >= 0 ? 'N' : 'S'}, ${Math.abs(clampedLon).toFixed(4)}° ${clampedLon >= 0 ? 'E' : 'W'}`,
      lat: clampedLat,
      lon: clampedLon,
      globalX: normalizedX * 100,
      globalY: normalizedY * 100,
      depth: `${depthEst}m Bathymetry`,
      pressure: `${pressEst} dbar (${(pressEst / 10.1325).toFixed(1)} atm)`,
      sst: `${sstEst} °C`,
      sstVal: sstEst,
      salinity: `${salEst} PSU`,
      salinityVal: salEst,
      dissolvedOxygen: `${doEst} mg/L`,
      dissolvedOxygenVal: doEst,
      chlorophyll: `${chlaEst} mg/m³`,
      chlorophyllVal: chlaEst,
      waveHeight: `${swhEst}m`,
      waveHeightVal: swhEst,
      currentSpeed: '0.35 m/s',
      currentSpeedVal: 0.35,
      windSpeed: `${windEst} m/s`,
      windDirection: '225° SW'
    };

    setClickedCoord({
      lat: clampedLat,
      lon: clampedLon,
      x: normalizedX * 100,
      y: normalizedY * 100
    });
    setActiveStation(dynamicStation);
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Jump to Semantic Search with selected station
  const handleFocusInSemanticSearch = () => {
    if (!onSelectStationForSearch) {
      onBackToSemanticSearch();
      return;
    }

    if (activeStation.semanticId) {
      const match = groundTruthTargets.find(t => t.id === activeStation.semanticId);
      if (match) {
        onSelectStationForSearch(match);
        return;
      }
    }

    // Fallback: Create dynamic SearchResultItem from this station
    const dynamicItem: SearchResultItem = {
      id: activeStation.id,
      title: activeStation.title,
      date: '2025-04-28',
      sensor: 'Sentinel-3 / Altimetry',
      coordinates: activeStation.coordinates,
      matchType: 'High Match',
      confidencePct: 94,
      imageUrl: '/assets/card_3_port.jpg',
      beforeImgUrl: '/assets/before_scene.jpg',
      afterImgUrl: '/assets/card_3_port.jpg',
      areaHa: '12.4 ha',
      timeGap: 'Multi-Temporal Pass'
    };

    onSelectStationForSearch(dynamicItem);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#070D16] text-white font-sans select-none overflow-hidden relative">
      {/* 1. TOP HEADER & TELEMETRY TOOLBAR (Modeled after Ocean Vision 3D) */}
      <header className="h-13 bg-[#0B1523]/95 border-b border-[#182A40] px-3 sm:px-4 flex items-center justify-between gap-3 shrink-0 z-20 backdrop-blur-md">
        {/* Left: Back button & Title */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onBackToSemanticSearch}
            className="h-8 px-2.5 rounded-lg bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-[#00E5FF] hover:text-white flex items-center space-x-1.5 text-xs font-semibold transition cursor-pointer shadow"
            title="Return to Semantic Search Workspace"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Semantic Search</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-ping" />
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-[200px] md:max-w-none">
              Global Oceanographic Satellite Altimetry & Current Map
            </h1>
            <span className="hidden lg:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 font-bold">
              V2.4 LIVE
            </span>
          </div>

          <button
            onClick={handleFocusInSemanticSearch}
            className="hidden xl:flex h-8 px-2.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white items-center space-x-1.5 text-xs font-medium transition cursor-pointer shadow"
            title="Focus the selected station in Semantic Search"
          >
            <span>Focus in Search: {activeStation.stationCode}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Search & Parameter Filters */}
        <div className="hidden md:flex items-center space-x-2 flex-1 justify-center max-w-2xl">
          {/* Quick Search */}
          <div className="relative w-44 lg:w-56 shrink-0">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ocean or station..."
              className="w-full h-8 pl-8 pr-3 bg-[#070D16] border border-[#182A40] rounded-lg text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          {/* Oceanographic Parameter Tabs (Currents, SST, Wave, Salinity, Cyclones, Fleet) */}
          <div className="flex items-center space-x-1 bg-[#070D16] p-0.5 rounded-lg border border-[#182A40]">
            <button
              onClick={() => setActiveParam('currents')}
              className={`h-7 px-2.5 rounded text-[11px] font-medium transition cursor-pointer ${
                activeParam === 'currents'
                  ? 'bg-[#00E5FF] text-[#070D16] font-bold shadow'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Currents
            </button>
            <button
              onClick={() => setActiveParam('sst')}
              className={`h-7 px-2.5 rounded text-[11px] font-medium transition cursor-pointer ${
                activeParam === 'sst'
                  ? 'bg-[#00E5FF] text-[#070D16] font-bold shadow'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              SST (Temperature)
            </button>
            <button
              onClick={() => setActiveParam('wave')}
              className={`h-7 px-2.5 rounded text-[11px] font-medium transition cursor-pointer hidden xl:inline ${
                activeParam === 'wave'
                  ? 'bg-[#00E5FF] text-[#070D16] font-bold shadow'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Significant Wave Height
            </button>
            <button
              onClick={() => setActiveParam('salinity')}
              className={`h-7 px-2.5 rounded text-[11px] font-medium transition cursor-pointer hidden xl:inline ${
                activeParam === 'salinity'
                  ? 'bg-[#00E5FF] text-[#070D16] font-bold shadow'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Salinity
            </button>
            <button
              onClick={() => setActiveParam('cyclones')}
              className={`h-7 px-2.5 rounded text-[11px] font-medium transition cursor-pointer hidden 2xl:inline ${
                activeParam === 'cyclones'
                  ? 'bg-[#00E5FF] text-[#070D16] font-bold shadow'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Active Cyclones
            </button>
            <button
              onClick={() => setActiveParam('fleet')}
              className={`h-7 px-2.5 rounded text-[11px] font-medium transition cursor-pointer hidden 2xl:inline ${
                activeParam === 'fleet'
                  ? 'bg-[#00E5FF] text-[#070D16] font-bold shadow'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Sensor Fleet
            </button>
          </div>
        </div>

        {/* Right: View Projection Mode & Zoom Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1 bg-[#070D16] p-0.5 rounded-lg border border-[#182A40]">
            <button
              onClick={() => { setViewMode('global'); setPan({ x: 0, y: 0 }); setZoom(1.0); }}
              className={`h-7 px-2.5 rounded text-[11px] font-medium transition cursor-pointer ${
                viewMode === 'global' ? 'bg-[#0284C7] text-white shadow' : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Global Ocean Bathymetry Map"
            >
              Global
            </button>
            <button
              onClick={() => { setViewMode('regional'); setPan({ x: 0, y: 0 }); setZoom(1.0); }}
              className={`h-7 px-2.5 rounded text-[11px] font-medium transition cursor-pointer ${
                viewMode === 'regional' ? 'bg-[#0284C7] text-white shadow' : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Regional Ocean & Coast"
            >
              Regional
            </button>
            <button
              onClick={() => { setViewMode('tactical'); setPan({ x: 0, y: 0 }); setZoom(1.0); }}
              className={`h-7 px-2.5 rounded text-[11px] font-medium transition cursor-pointer ${
                viewMode === 'tactical' ? 'bg-[#0284C7] text-white shadow' : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Tactical Sentinel-2 (10m)"
            >
              Tactical (10m)
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setZoom(z => Math.min(z + 0.25, 3.0))}
              className="w-7 h-7 rounded bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-white flex items-center justify-center transition cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(z - 0.25, 0.75))}
              className="w-7 h-7 rounded bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-white flex items-center justify-center transition cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1.0); }}
              className="w-7 h-7 rounded bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-white flex items-center justify-center transition cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN MAP CANVAS (Interactive Bathymetric Altimetry Canvas) */}
      <div
        ref={containerRef}
        onClick={handleMapClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 relative overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        style={{ backgroundColor: '#020617' }}
      >
        {/* Transformable Canvas Layer */}
        <div
          className="w-full h-full relative transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Authentic Satellite & Bathymetry Imagery */}
          <div
            className="w-full h-full bg-contain md:bg-cover bg-center bg-no-repeat transition-all duration-300"
            style={{
              backgroundImage: `url(${
                viewMode === 'global'
                  ? '/assets/global_altimetry_map.jpg'
                  : viewMode === 'regional'
                  ? '/assets/regional_satellite_map.jpg'
                  : '/assets/satellite_map_base.jpg'
              })`,
              filter: activeParam === 'sst'
                ? 'contrast(1.3) saturate(1.8) hue-rotate(25deg)'
                : activeParam === 'wave'
                ? 'contrast(1.4) saturate(1.2) hue-rotate(190deg)'
                : activeParam === 'salinity'
                ? 'contrast(1.2) saturate(1.5) hue-rotate(280deg)'
                : 'none'
            }}
          />

          {/* SVG Overlay: Latitude Graticules & Ocean Current Streamlines (Global Mode) */}
          {viewMode === 'global' && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 500" preserveAspectRatio="none">
              {/* Latitude Graticule Lines */}
              {/* Arctic Circle 66.5° N */}
              <line x1="0" y1="65" x2="1000" y2="65" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="4 4" strokeOpacity="0.45" />
              <text x="920" y="60" fill="#94A3B8" fontSize="9" fontFamily="monospace" opacity="0.6">Arctic Circle 66.5° N</text>

              {/* Tropic of Cancer 23.5° N */}
              <line x1="0" y1="184" x2="1000" y2="184" stroke="#F59E0B" strokeWidth="0.9" strokeDasharray="5 3" strokeOpacity="0.5" />
              <text x="890" y="179" fill="#F59E0B" fontSize="9" fontFamily="monospace" opacity="0.75">Tropic of Cancer 23.5° N</text>

              {/* Equator 0° */}
              <line x1="0" y1="250" x2="1000" y2="250" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="6 4" strokeOpacity="0.85" />
              <text x="20" y="245" fill="#F59E0B" fontSize="11" fontFamily="monospace" fontWeight="bold">0° Equator</text>
              <text x="750" y="245" fill="#F59E0B" fontSize="11" fontFamily="monospace" fontWeight="bold">Equator 0°</text>

              {/* Tropic of Capricorn 23.5° S */}
              <line x1="0" y1="315" x2="1000" y2="315" stroke="#F59E0B" strokeWidth="0.9" strokeDasharray="5 3" strokeOpacity="0.5" />
              <text x="700" y="310" fill="#F59E0B" fontSize="9" fontFamily="monospace" opacity="0.75">Tropic of Capricorn 23.5° S</text>

              {/* Antarctic Circle 66.5° S */}
              <line x1="0" y1="435" x2="1000" y2="435" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="4 4" strokeOpacity="0.45" />
              <text x="450" y="430" fill="#94A3B8" fontSize="9" fontFamily="monospace" opacity="0.6">Antarctic Convergence 66.5° S</text>

              {/* Ocean Currents Streamlines (Active when Currents is on) */}
              {activeParam === 'currents' && (
                <g className="animate-pulse">
                  {/* Warm Currents (Red/Coral) */}
                  {/* Gulf Stream */}
                  <path d="M 280 230 Q 330 190 410 140" fill="none" stroke="#EF4444" strokeWidth="2.2" strokeDasharray="6 3" strokeOpacity="0.9" />
                  <text x="325" y="200" fill="#F87171" fontSize="9" fontFamily="sans-serif" fontWeight="bold">Gulf Stream</text>

                  {/* North Equatorial Current */}
                  <path d="M 390 260 Q 300 262 210 260" fill="none" stroke="#EF4444" strokeWidth="2.0" strokeDasharray="6 3" strokeOpacity="0.85" />
                  <text x="260" y="275" fill="#F87171" fontSize="8" fontFamily="sans-serif">North Equatorial Current</text>

                  {/* Kuroshio Current */}
                  <path d="M 830 230 Q 860 170 910 160" fill="none" stroke="#EF4444" strokeWidth="2.2" strokeDasharray="6 3" strokeOpacity="0.9" />
                  <text x="850" y="195" fill="#F87171" fontSize="9" fontFamily="sans-serif" fontWeight="bold">Kuroshio</text>

                  {/* Agulhas Current */}
                  <path d="M 580 300 Q 560 360 520 380" fill="none" stroke="#EF4444" strokeWidth="2.2" strokeDasharray="6 3" strokeOpacity="0.9" />
                  <text x="560" y="340" fill="#F87171" fontSize="9" fontFamily="sans-serif">Agulhas Current</text>

                  {/* Cold Currents (Cyan/Blue) */}
                  {/* California Current */}
                  <path d="M 180 140 Q 200 200 220 240" fill="none" stroke="#38BDF8" strokeWidth="2.2" strokeDasharray="6 3" strokeOpacity="0.9" />
                  <text x="185" y="190" fill="#38BDF8" fontSize="8" fontFamily="sans-serif">California Current</text>

                  {/* Humboldt / Peru Current */}
                  <path d="M 270 420 Q 260 340 280 270" fill="none" stroke="#38BDF8" strokeWidth="2.2" strokeDasharray="6 3" strokeOpacity="0.9" />
                  <text x="235" y="350" fill="#38BDF8" fontSize="8" fontFamily="sans-serif">Humboldt / Peru Current</text>

                  {/* Benguela Current */}
                  <path d="M 520 400 Q 480 330 480 270" fill="none" stroke="#38BDF8" strokeWidth="2.2" strokeDasharray="6 3" strokeOpacity="0.9" />
                  <text x="460" y="335" fill="#38BDF8" fontSize="8" fontFamily="sans-serif">Benguela Current</text>

                  {/* West Australian Current */}
                  <path d="M 780 410 Q 770 340 760 290" fill="none" stroke="#38BDF8" strokeWidth="2.2" strokeDasharray="6 3" strokeOpacity="0.9" />
                  <text x="710" y="355" fill="#38BDF8" fontSize="8" fontFamily="sans-serif">West Australian Current</text>

                  {/* Antarctic Circumpolar Current */}
                  <path d="M 50 450 Q 500 450 950 450" fill="none" stroke="#00E5FF" strokeWidth="2.5" strokeDasharray="8 4" strokeOpacity="0.8" />
                  <text x="400" y="465" fill="#00E5FF" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Antarctic Circumpolar Current</text>
                </g>
              )}
            </svg>
          )}

          {/* Station Beacon Pins (Global & Regional) */}
          {filteredStations.map((st) => {
            const isSelected = activeStation.id === st.id;
            return (
              <div
                key={st.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStation(st);
                }}
                className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `${st.globalX}%`,
                  top: `${st.globalY}%`,
                }}
                title={`${st.title} (${st.coordinates})`}
              >
                {/* Pulsing Beacon Waves */}
                <div
                  className="absolute inset-0 -m-3 rounded-full opacity-75 animate-ping"
                  style={{ backgroundColor: st.color, animationDuration: isSelected ? '1.5s' : '3s' }}
                />

                {/* Center Target Dot */}
                <div
                  className={`relative w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center shadow-lg ${
                    isSelected ? 'scale-125 border-white shadow-[0_0_15px_#00E5FF]' : 'border-[#070D16] group-hover:scale-110'
                  }`}
                  style={{ backgroundColor: isSelected ? '#00E5FF' : st.color }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                {/* Station Tag Card (matching ocean-vision-3d) */}
                <div
                  className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1.5 rounded-md border text-[10px] font-sans transition-all shadow-2xl backdrop-blur-md ${
                    isSelected
                      ? 'bg-[#070D16]/95 border-[#00E5FF] text-white shadow-[0_0_15px_rgba(0,229,255,0.4)] z-30 scale-105'
                      : 'bg-[#0B1523]/90 border-[#182A40] text-[#94A3B8] group-hover:text-white group-hover:border-[#0284C7]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                    <span>{st.stationCode}</span>
                  </div>
                  <div className="text-[9px] font-mono text-[#38BDF8] flex items-center space-x-2">
                    <span>SST: {st.sst}</span>
                    <span>Cur: {st.currentSpeed}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* User Click Indicator Beacon (if clicked arbitrary spot) */}
          {clickedCoord && (
            <div
              className="absolute z-25 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${clickedCoord.x}%`, top: `${clickedCoord.y}%` }}
            >
              <div className="w-9 h-9 rounded-full border border-[#00E5FF] animate-ping" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#00E5FF] border border-white shadow-[0_0_15px_#00E5FF]" />
            </div>
          )}
        </div>



        {/* 4. STATION & CURRENTS LEGEND (Right side - matching ocean-vision-3d) */}
        <div
          className="hidden md:block absolute top-4 right-4 z-30 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="bg-[#070D16]/90 border border-[#182A40] rounded-xl p-3 shadow-2xl backdrop-blur-md text-[11px] font-sans space-y-2 w-48">
            <div className="flex items-center justify-between border-b border-[#182A40] pb-1 text-[#64748B] font-bold tracking-wider uppercase text-[10px]">
              <span>LEGEND</span>
              <button onClick={() => setShowLegend(!showLegend)} className="hover:text-white cursor-pointer px-1">
                {showLegend ? '−' : '+'}
              </button>
            </div>

            {showLegend && (
              <div className="space-y-2 text-[#94A3B8]">
                {/* Station Types */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
                    <span className="text-white">In-situ Station</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
                    <span>Drifter Buoy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span>Argo Float</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]" />
                    <span>Tide Gauge</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                    <span>Wave Buoy</span>
                  </div>
                </div>

                {/* Ocean Currents */}
                <div className="pt-1.5 border-t border-[#182A40]/70 space-y-1">
                  <div className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Ocean Currents</div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-0.5 bg-[#EF4444]" />
                    <span className="text-[#F87171]">Warm Current</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-0.5 border-b border-dashed border-[#38BDF8]" />
                    <span className="text-[#38BDF8]">Cold Current</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. COMPASS & NORTH INDICATOR */}
        <div className="absolute bottom-16 right-4 z-20 flex items-center space-x-2 pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-[#070D16]/95 border border-[#182A40] flex flex-col items-center justify-center text-[10px] font-mono text-white backdrop-blur shadow-xl">
            <span className="text-[#00E5FF] font-bold">N</span>
            <div className="w-0.5 h-3 bg-[#00E5FF]" />
          </div>
        </div>
      </div>

      {/* 6. BOTTOM TELEMETRY GAUGES BAR (Modeled after Ocean Vision 3D bottom bar) */}
      <footer className="h-14 bg-[#0B1523]/95 border-t border-[#182A40] px-3 sm:px-4 flex items-center justify-between gap-2 shrink-0 z-20 backdrop-blur-md overflow-x-auto no-scrollbar">
        {/* Metric Gauge 1: SST */}
        <div className="bg-[#070D16] border border-[#182A40] rounded-lg px-2.5 py-1 min-w-[125px] shrink-0">
          <div className="text-[9px] text-[#64748B] uppercase font-bold truncate">Sea Surface Temp (°C)</div>
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#F59E0B]">
            <span>{activeStation.sstVal.toFixed(2)}</span>
            <div className="w-12 h-1.5 bg-[#182A40] rounded-full overflow-hidden ml-2">
              <div className="h-full bg-[#F59E0B]" style={{ width: `${(activeStation.sstVal / 35) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Metric Gauge 2: Salinity */}
        <div className="bg-[#070D16] border border-[#182A40] rounded-lg px-2.5 py-1 min-w-[125px] shrink-0">
          <div className="text-[9px] text-[#64748B] uppercase font-bold truncate">Salinity (PSU)</div>
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#10B981]">
            <span>{activeStation.salinityVal.toFixed(2)}</span>
            <div className="w-12 h-1.5 bg-[#182A40] rounded-full overflow-hidden ml-2">
              <div className="h-full bg-[#10B981]" style={{ width: `${(activeStation.salinityVal / 40) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Metric Gauge 3: Currents */}
        <div className="bg-[#070D16] border border-[#182A40] rounded-lg px-2.5 py-1 min-w-[125px] shrink-0">
          <div className="text-[9px] text-[#64748B] uppercase font-bold truncate">Ocean Currents (m/s)</div>
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#00E5FF]">
            <span>{activeStation.currentSpeedVal.toFixed(2)}</span>
            <div className="w-12 h-1.5 bg-[#182A40] rounded-full overflow-hidden ml-2">
              <div className="h-full bg-[#00E5FF]" style={{ width: `${(activeStation.currentSpeedVal / 1.5) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Metric Gauge 4: Significant Wave Height */}
        <div className="bg-[#070D16] border border-[#182A40] rounded-lg px-2.5 py-1 min-w-[130px] shrink-0">
          <div className="text-[9px] text-[#64748B] uppercase font-bold truncate">Wave Height (m)</div>
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#38BDF8]">
            <span>{activeStation.waveHeightVal.toFixed(2)}</span>
            <div className="w-12 h-1.5 bg-[#182A40] rounded-full overflow-hidden ml-2">
              <div className="h-full bg-[#38BDF8]" style={{ width: `${(activeStation.waveHeightVal / 5.0) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Metric Gauge 5: Chlorophyll-a */}
        <div className="hidden lg:block bg-[#070D16] border border-[#182A40] rounded-lg px-2.5 py-1 min-w-[125px] shrink-0">
          <div className="text-[9px] text-[#64748B] uppercase font-bold truncate">Chlorophyll-a (mg/m³)</div>
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#10B981]">
            <span>{activeStation.chlorophyllVal.toFixed(2)}</span>
            <div className="w-12 h-1.5 bg-[#182A40] rounded-full overflow-hidden ml-2">
              <div className="h-full bg-[#10B981]" style={{ width: `${(activeStation.chlorophyllVal / 2.0) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Metric Gauge 6: Dissolved Oxygen */}
        <div className="hidden lg:block bg-[#070D16] border border-[#182A40] rounded-lg px-2.5 py-1 min-w-[125px] shrink-0">
          <div className="text-[9px] text-[#64748B] uppercase font-bold truncate">Dissolved Oxygen (mg/L)</div>
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#A855F7]">
            <span>{activeStation.dissolvedOxygenVal.toFixed(2)}</span>
            <div className="w-12 h-1.5 bg-[#182A40] rounded-full overflow-hidden ml-2">
              <div className="h-full bg-[#A855F7]" style={{ width: `${(activeStation.dissolvedOxygenVal / 10.0) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Right Corner: Mini Map Preview Thumbnail */}
        <div className="shrink-0 flex items-center space-x-2 pl-2 border-l border-[#182A40]/80">
          <div className="w-20 h-9 rounded border border-[#182A40] overflow-hidden relative shadow bg-cover bg-center" style={{ backgroundImage: "url('/assets/global_altimetry_map.jpg')" }}>
            <div className="absolute inset-0 bg-[#00E5FF]/10" />
            <div className="absolute w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" style={{ left: `${activeStation.globalX}%`, top: `${activeStation.globalY}%`, transform: 'translate(-50%, -50%)' }} />
          </div>
        </div>
      </footer>
    </div>
  );
};
