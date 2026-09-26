import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Minus,
  Crosshair,
  Layers,
  ChevronDown,
  Check,
  Flame,
  Square,
  Pentagon,
  Circle,
  MapPin,
  Save,
  Radio,
  X
} from 'lucide-react';

interface SatelliteMapCanvasProps {
  coordinates?: string;
  selectedAOI?: string;
  onCoordinatesChange?: (coords: string) => void;
  siteName?: string;
}

export const SatelliteMapCanvas: React.FC<SatelliteMapCanvasProps> = ({
  coordinates = 'Lat: 21.4587° N   Lon: 72.7812° E',
  selectedAOI = 'AOI-1',
  onCoordinatesChange,
  siteName,
}) => {
  const [zoom, setZoom] = useState(1.05);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeLayer, setActiveLayer] = useState('Sentinel-2 (True Color RGB)');
  const [activeDate, setActiveDate] = useState('2025-04-28');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(coordinates);
  
  // Feature 6: Change Heatmap Layer
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Feature 10: Better AOI Tools
  const [activeTool, setActiveTool] = useState<'NONE' | 'RECT' | 'POLY' | 'CIRCLE' | 'COORDS'>('NONE');
  const [showCoordModal, setShowCoordModal] = useState(false);
  const [customLat, setCustomLat] = useState('21.4587');
  const [customLon, setCustomLon] = useState('72.7812');
  const [aoiAlert, setAoiAlert] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Available layers with authentic remote-sensing spectral filters
  const layers = [
    { name: 'Sentinel-2 (True Color RGB)', date: '2025-04-28', filter: 'none' },
    { name: 'False Color CIR (B8-B4-B3)', date: '2025-04-28', filter: 'hue-rotate(90deg) contrast(1.25) saturate(1.3)' },
    { name: 'SCL Scene Quality Mask', date: '2025-04-28', filter: 'sepia(0.65) saturate(2.0) contrast(1.1)' },
    { name: 'NDVI Vegetation Health Index', date: '2025-04-28', filter: 'saturate(2.4) contrast(1.15) hue-rotate(330deg)' },
    { name: 'Sentinel-1 SAR Radar Backscatter', date: '2025-04-28', filter: 'grayscale(1) contrast(1.85) brightness(0.95)' },
  ];

  // Pan smoothly when coordinates change from selected target card
  useEffect(() => {
    setCurrentCoords(coordinates);
    const matchLat = coordinates.match(/(\d+\.\d+)°?\s*N/i);
    const matchLon = coordinates.match(/(\d+\.\d+)°?\s*E/i);
    if (matchLat && matchLon) {
      const targetLat = parseFloat(matchLat[1]);
      const targetLon = parseFloat(matchLon[1]);
      const baseLat = 21.4587;
      const baseLon = 72.7812;
      const dLat = targetLat - baseLat;
      const dLon = targetLon - baseLon;
      const newX = (dLon / 0.015) * 600;
      const newY = -(dLat / 0.015) * 400;
      setPan({ x: Math.max(-250, Math.min(250, newX)), y: Math.max(-200, Math.min(200, newY)) });
    }
  }, [coordinates]);

  // Handle Mouse Drag for Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newPanX = e.clientX - dragStart.x;
      const newPanY = e.clientY - dragStart.y;
      setPan({ x: newPanX, y: newPanY });

      // Compute geographic coordinates from pan offset
      const baseLat = 21.4587;
      const baseLon = 72.7812;
      const latOffset = (newPanY / 400) * 0.015;
      const lonOffset = (newPanX / 600) * 0.015;
      const updated = `Lat: ${(baseLat - latOffset).toFixed(4)}° N   Lon: ${(baseLon + lonOffset).toFixed(4)}° E`;
      setCurrentCoords(updated);
      if (onCoordinatesChange) onCoordinatesChange(updated);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1.05);
    setPan({ x: 0, y: 0 });
    setCurrentCoords('Lat: 21.4587° N   Lon: 72.7812° E');
    if (onCoordinatesChange) onCoordinatesChange('Lat: 21.4587° N   Lon: 72.7812° E');
  };

  const handleSaveAOI = () => {
    setAoiAlert('AOI boundary saved to mission cache: Tapi Estuary Sector');
    setTimeout(() => setAoiAlert(null), 3500);
  };

  const handleStartMonitoring = () => {
    setAoiAlert('Continuous 5-day Sentinel-2 & SAR surveillance started for this AOI');
    setTimeout(() => setAoiAlert(null), 3500);
  };

  const applyCustomCoords = () => {
    const updated = `Lat: ${parseFloat(customLat).toFixed(4)}° N   Lon: ${parseFloat(customLon).toFixed(4)}° E`;
    setCurrentCoords(updated);
    if (onCoordinatesChange) onCoordinatesChange(updated);
    setShowCoordModal(false);
  };

  const currentLayerObj = layers.find((l) => l.name === activeLayer) || layers[0];

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full h-full bg-[#08121E] overflow-hidden rounded-xl border border-[#182A40] select-none cursor-grab active:cursor-grabbing group font-sans"
    >
      {/* Alert Banner for AOI actions */}
      {aoiAlert && (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-40 bg-[#063327] border border-[#10B981] px-4 py-1.5 rounded-lg text-xs text-[#10B981] shadow-2xl flex items-center space-x-2 animate-in fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>{aoiAlert}</span>
        </div>
      )}

      {/* Photorealistic Satellite Map Texture Layer */}
      <div
        className="absolute inset-[-30%] transition-transform duration-200 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-300"
          style={{
            backgroundImage: `url('/assets/satellite_map_base.jpg')`,
            filter: currentLayerObj.filter,
          }}
        />

        {/* Feature 6: Change Heatmap Layer Overlay */}
        {showHeatmap && (
          <div className="absolute inset-0 pointer-events-none animate-in fade-in duration-300">
            {/* High Change Heat bloom (Red) */}
            <div
              className="absolute w-64 h-64 rounded-full bg-red-600/35 blur-3xl"
              style={{ top: '40%', left: '42%', transform: 'translate(-50%, -50%)' }}
            />
            {/* Medium Change Heat bloom (Orange) */}
            <div
              className="absolute w-80 h-80 rounded-full bg-amber-500/25 blur-3xl"
              style={{ top: '48%', left: '48%', transform: 'translate(-50%, -50%)' }}
            />
            {/* Low Change Heat bloom (Yellow) */}
            <div
              className="absolute w-96 h-96 rounded-full bg-yellow-400/15 blur-3xl"
              style={{ top: '35%', left: '55%', transform: 'translate(-50%, -50%)' }}
            />
          </div>
        )}

        {/* Scaled AOI Bounding Box - Unified with side panel visual language */}
        <div
          className={`absolute transition-all rounded-xl border-2 ${
            activeTool === 'CIRCLE'
              ? 'rounded-full border-[#0284C7] bg-[#0284C7]/15 shadow-[0_0_20px_rgba(2,132,199,0.3)]'
              : activeTool === 'POLY'
              ? 'border-[#0284C7] bg-[#0284C7]/15 [clip-path:polygon(50%_0%,100%_38%,82%_100%,18%_100%,0%_38%)]'
              : 'border-[#0284C7] bg-[#0284C7]/15 shadow-[0_0_20px_rgba(2,132,199,0.25)]'
          }`}
          style={{
            top: '42%',
            left: '44%',
            width: '240px',
            height: '190px',
            transform: 'translate(-50%, -50%) rotate(-14deg)',
          }}
        >
          {/* 4 Corner Anchor Handles Matching Panel Cards */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#0B1523] rounded-full border-2 border-[#0284C7] shadow-md" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#0B1523] rounded-full border-2 border-[#0284C7] shadow-md" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#0B1523] rounded-full border-2 border-[#0284C7] shadow-md" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#0B1523] rounded-full border-2 border-[#0284C7] shadow-md" />

          {/* Center Target Marker Chip */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#0B1523]/95 border border-[#182A40] text-xs font-sans font-medium text-white shadow-xl backdrop-blur">
              <Crosshair className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="font-mono text-[#38BDF8]">{selectedAOI}</span>
              <span className="text-[#64748B]">·</span>
              <span className="truncate max-w-[140px]">{siteName ? siteName : 'Target lock'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Map Controls (Top Left) */}
      <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-20" onMouseDown={(e) => e.stopPropagation()}>
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.25, 2.8))}
          className="w-8 h-8 rounded-lg bg-[#0B1523]/95 border border-[#182A40] hover:border-[#0284C7] hover:text-[#38BDF8] flex items-center justify-center text-white transition backdrop-blur shadow-lg cursor-pointer"
          title="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
          className="w-8 h-8 rounded-lg bg-[#0B1523]/95 border border-[#182A40] hover:border-[#0284C7] hover:text-[#38BDF8] flex items-center justify-center text-white transition backdrop-blur shadow-lg cursor-pointer"
          title="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="w-8 h-8 rounded-lg bg-[#0B1523]/95 border border-[#182A40] hover:border-[#0284C7] hover:text-[#38BDF8] flex items-center justify-center text-white transition backdrop-blur shadow-lg cursor-pointer"
          title="Reset center / target reticle"
        >
          <Crosshair className="w-4 h-4 text-[#38BDF8]" />
        </button>
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className={`w-8 h-8 rounded-lg bg-[#0B1523]/95 border flex items-center justify-center transition backdrop-blur shadow-lg cursor-pointer ${
            showLayerMenu ? 'border-[#0284C7] text-[#38BDF8]' : 'border-[#182A40] text-white hover:border-[#0284C7]'
          }`}
          title="Toggle layers"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Feature 6: Heatmap Toggle Button */}
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`w-8 h-8 rounded-lg bg-[#0B1523]/95 border flex items-center justify-center transition backdrop-blur shadow-lg cursor-pointer ${
            showHeatmap ? 'border-red-500 bg-red-950/60 text-red-400' : 'border-[#182A40] text-white hover:border-red-400'
          }`}
          title="Toggle change heatmap"
        >
          <Flame className="w-4 h-4" />
        </button>
      </div>

      {/* Feature 10: AOI Tactical Tools Bar (Top Center) */}
      <div
        className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-1 bg-[#0B1523]/95 border border-[#182A40] px-2 py-1 rounded-lg shadow-xl backdrop-blur text-xs font-sans"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <span className="text-[10px] uppercase tracking-[0.05em] text-[#64748B] px-1 font-semibold">AOI TOOLS</span>
        <button
          onClick={() => setActiveTool(activeTool === 'RECT' ? 'NONE' : 'RECT')}
          className={`h-6 px-2 rounded-md flex items-center space-x-1 transition text-xs font-medium cursor-pointer ${
            activeTool === 'RECT' ? 'bg-[#0E355A] text-[#38BDF8] border border-[#0284C7]' : 'text-[#94A3B8] hover:text-white'
          }`}
          title="Draw rectangle"
        >
          <Square className="w-3 h-3" />
          <span>Rect</span>
        </button>
        <button
          onClick={() => setActiveTool(activeTool === 'POLY' ? 'NONE' : 'POLY')}
          className={`h-6 px-2 rounded-md flex items-center space-x-1 transition text-xs font-medium cursor-pointer ${
            activeTool === 'POLY' ? 'bg-[#0E355A] text-[#38BDF8] border border-[#0284C7]' : 'text-[#94A3B8] hover:text-white'
          }`}
          title="Draw polygon"
        >
          <Pentagon className="w-3 h-3" />
          <span>Poly</span>
        </button>
        <button
          onClick={() => setActiveTool(activeTool === 'CIRCLE' ? 'NONE' : 'CIRCLE')}
          className={`h-6 px-2 rounded-md flex items-center space-x-1 transition text-xs font-medium cursor-pointer ${
            activeTool === 'CIRCLE' ? 'bg-[#0E355A] text-[#38BDF8] border border-[#0284C7]' : 'text-[#94A3B8] hover:text-white'
          }`}
          title="Circle radius"
        >
          <Circle className="w-3 h-3" />
          <span>Circle</span>
        </button>
        <button
          onClick={() => setShowCoordModal(true)}
          className="h-6 px-2 rounded-md text-[#94A3B8] hover:text-white flex items-center space-x-1 transition text-xs font-medium cursor-pointer"
          title="Enter coordinates"
        >
          <MapPin className="w-3 h-3 text-[#38BDF8]" />
          <span>Coords</span>
        </button>
        <div className="w-[1px] h-3 bg-[#182A40] mx-1" />
        <button
          onClick={handleSaveAOI}
          className="h-6 px-2.5 rounded-md bg-[#0E2D4A] hover:bg-[#133A5E] text-[#38BDF8] font-medium flex items-center space-x-1 transition cursor-pointer"
        >
          <Save className="w-3 h-3" />
          <span>Save</span>
        </button>
        <button
          onClick={handleStartMonitoring}
          className="h-6 px-2.5 rounded-md bg-[#063327] hover:bg-[#0E4738] border border-[#10B981]/50 text-[#10B981] font-medium flex items-center space-x-1 transition cursor-pointer"
        >
          <Radio className="w-3 h-3" />
          <span>Monitor</span>
        </button>
      </div>

      {/* Feature 6: Heatmap Legend (when heatmap active) */}
      {showHeatmap && (
        <div className="absolute top-14 left-3 z-20 bg-[#0B1523]/95 border border-[#182A40] px-3 py-2 rounded-lg text-xs shadow-xl space-y-1 font-sans">
          <div className="text-white font-semibold flex items-center space-x-1.5 pb-1 border-b border-[#182A40]/60">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[10px] uppercase tracking-[0.05em] text-[#64748B]">CHANGE HEATMAP</span>
          </div>
          <div className="flex items-center space-x-2 pt-0.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span className="text-[#94A3B8] text-[11px]">High change (&gt;0.4 ha)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[#94A3B8] text-[11px]">Medium change</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="text-[#94A3B8] text-[11px]">Low change</span>
          </div>
        </div>
      )}

      {/* Coordinates Input Modal */}
      {showCoordModal && (
        <div
          className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-4 w-72 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#182A40] pb-2 text-xs font-semibold text-white">
              <span>Enter AOI center coordinates</span>
              <button onClick={() => setShowCoordModal(false)} className="text-[#94A3B8] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[#64748B] text-[10px] uppercase tracking-[0.05em] block mb-1">Latitude (° N)</label>
                <input
                  type="text"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-full bg-[#070D16] border border-[#182A40] rounded-lg px-2.5 py-1 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[#64748B] text-[10px] uppercase tracking-[0.05em] block mb-1">Longitude (° E)</label>
                <input
                  type="text"
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  className="w-full bg-[#070D16] border border-[#182A40] rounded-lg px-2.5 py-1 text-white font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-1">
              <button
                onClick={() => setShowCoordModal(false)}
                className="h-7 px-3 rounded-lg bg-[#0E1A2B] text-[#94A3B8] text-xs hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={applyCustomCoords}
                className="h-7 px-3 rounded-lg bg-[#0284C7] text-white font-medium text-xs hover:bg-[#0369A1] cursor-pointer"
              >
                Jump to coordinates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Right Active Layer Indicator & Selector Dropdown */}
      <div className="absolute top-3 right-3 z-20 font-sans" onMouseDown={(e) => e.stopPropagation()}>
        <div
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="flex items-center space-x-2 bg-[#0B1523]/95 border border-[#182A40] hover:border-[#0284C7]/50 px-3 py-1.5 rounded-lg shadow-xl backdrop-blur cursor-pointer transition"
        >
          <div className="text-right leading-tight">
            <div className="text-[11px] font-medium text-white">{activeLayer}</div>
            <div className="text-[9px] font-mono text-[#38BDF8]">{activeDate} · EPSG:32644</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
        </div>

        {showLayerMenu && (
          <div className="absolute top-11 right-0 w-72 bg-[#0B1523] border border-[#182A40] rounded-xl shadow-2xl p-2 z-30 font-sans text-xs space-y-1">
            <div className="px-2 py-1 text-[10px] text-[#64748B] uppercase font-semibold tracking-[0.05em]">
              SATELLITE BAND & LAYER SWITCHER
            </div>
            {layers.map((l) => (
              <div
                key={l.name}
                onClick={() => {
                  setActiveLayer(l.name);
                  setActiveDate(l.date);
                  setShowLayerMenu(false);
                }}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition ${
                  activeLayer === l.name ? 'bg-[#0E355A] text-[#38BDF8] font-medium border border-[#0284C7]/40' : 'text-[#94A3B8] hover:bg-[#0E1A2B] hover:text-white'
                }`}
              >
                <div>
                  <div className="text-xs">{l.name}</div>
                  <div className="text-[10px] font-mono opacity-70">{l.date}</div>
                </div>
                {activeLayer === l.name && <Check className="w-3.5 h-3.5 text-[#38BDF8]" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Right: Mini-Map of India with Pin & North Arrow */}
      <div className="absolute bottom-3 right-3 z-20 flex items-end space-x-2" onMouseDown={(e) => e.stopPropagation()}>
        {/* Compass */}
        <div className="w-7 h-7 rounded-full bg-[#0B1523]/95 border border-[#182A40] flex flex-col items-center justify-center text-[9px] font-mono text-white backdrop-blur shadow">
          <span className="text-[#38BDF8] font-bold">N</span>
          <div className="w-0.5 h-2 bg-[#38BDF8]" />
        </div>

        {/* India Inset Map with Location Pin */}
        <div
          onClick={resetView}
          className="w-20 h-24 bg-[#0B1523]/95 border border-[#182A40] hover:border-[#0284C7]/60 rounded-lg p-1 shadow-2xl backdrop-blur relative flex items-center justify-center cursor-pointer transition"
          title="Click to reset center to target region"
        >
          <img
            src="/assets/india_inset.jpg"
            alt="India Regional Inset"
            className="w-full h-full object-contain rounded"
          />
        </div>
      </div>

      {/* Bottom Left: Scale Bar & Real-time Coordinate Readout */}
      <div className="absolute bottom-3 left-3 z-20 space-y-1 text-xs text-white font-sans" onMouseDown={(e) => e.stopPropagation()}>
        {/* Scale Bar */}
        <div className="flex items-center space-x-1.5 text-[10px] text-[#94A3B8]">
          <div className="w-20 h-1 bg-white border border-[#070D16] relative flex justify-between">
            <div className="w-0.5 h-1.5 -top-0.5 bg-white absolute left-0" />
            <div className="w-0.5 h-1 -top-0.25 bg-white absolute left-1/4" />
            <div className="w-0.5 h-1 -top-0.25 bg-white absolute left-1/2" />
            <div className="w-0.5 h-1.5 -top-0.5 bg-white absolute right-0" />
          </div>
          <span className="font-mono text-[9px]">5 km</span>
        </div>

        {/* Dynamic Coordinate Readout */}
        <div className="bg-[#0B1523]/95 border border-[#182A40] px-2.5 py-1 rounded-lg shadow-lg backdrop-blur flex items-center space-x-2">
          <span className="text-white font-mono text-[10px]">{currentCoords}</span>
          {siteName && (
            <span className="text-[#38BDF8] text-[10px] border-l border-[#182A40] pl-2 font-medium truncate max-w-[170px]">
              {siteName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
