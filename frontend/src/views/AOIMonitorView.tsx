import React, { useState } from 'react';
import {
  Crosshair,
  MapPin,
  Satellite,
  CheckCircle2,
  Eye,
  Bell,
  ArrowRight,
  ShieldAlert,
  Sliders
} from 'lucide-react';

interface AOIMonitorViewProps {
  onViewChange?: (aoiId: string) => void;
}

export const AOIMonitorView: React.FC<AOIMonitorViewProps> = ({ onViewChange }) => {
  const [selectedAOI, setSelectedAOI] = useState<string>('AOI-1');
  const [alertThresholdHa, setAlertThresholdHa] = useState<number>(1.5);
  const [minConfidenceThreshold, setMinConfidenceThreshold] = useState<number>(85);

  const aois = [
    {
      id: 'AOI-1',
      name: 'Tapi River Estuary & Hazira Industrial Belt',
      location: 'Gujarat Coast, India',
      centerCoords: '21.4587° N, 72.7812° E',
      bbox: [72.6500, 21.3500, 72.9000, 21.6000],
      areaKm2: 2500,
      crs: 'EPSG:32644 (UTM Zone 44N)',
      resolution: '10m (Sentinel-2) / 10m (Sentinel-1 SAR)',
      activeChanges: 6,
      suppressedAlarms: 4,
      totalScenes: 24,
      revisitCadence: '5 Days (Sentinel-2A + 2B Constellation)',
      avgCloudPct: 1.8,
      lastScan: '2 days ago (2025-04-28)',
      alertStatus: 'CRITICAL_CHANGE',
      alertBadge: '🔴 New change detected (2 days ago)',
      confidencePct: 96,
      changedAreaHa: 4.2,
      summary: '17 new industrial shed foundations and reinforced river wharf pylon expansion detected near deepwater channel.'
    },
    {
      id: 'AOI-2',
      name: 'Dumas Coastal Mudflats & Southern Bund',
      location: 'Surat Coast, Gujarat',
      centerCoords: '21.0850° N, 72.7120° E',
      bbox: [72.6800, 21.0500, 72.7500, 21.1200],
      areaKm2: 900,
      crs: 'EPSG:32644 (UTM Zone 44N)',
      resolution: '10m Multi-spectral & SAR',
      activeChanges: 0,
      suppressedAlarms: 3,
      totalScenes: 14,
      revisitCadence: '5 Days',
      avgCloudPct: 3.2,
      lastScan: 'Today (Sentinel-1 SAR Radar)',
      alertStatus: 'STABLE',
      alertBadge: '🟢 No significant change',
      confidencePct: 94,
      changedAreaHa: 0.0,
      summary: 'Intertidal mudflat stability verified. 3 seasonal vegetation tidal oscillations correctly suppressed by phenology filter.'
    },
    {
      id: 'AOI-3',
      name: 'Hazira Deepwater Port Marine Basin & Berths',
      location: 'Gulf of Khambhat, Gujarat',
      centerCoords: '21.0950° N, 72.6520° E',
      bbox: [72.5500, 21.0000, 72.7500, 21.2000],
      areaKm2: 625,
      crs: 'EPSG:32644 (UTM Zone 44N)',
      resolution: '10m Multi-spectral & SAR',
      activeChanges: 2,
      suppressedAlarms: 2,
      totalScenes: 18,
      revisitCadence: '5 Days',
      avgCloudPct: 1.4,
      lastScan: 'Yesterday (2025-04-27)',
      alertStatus: 'MODERATE_ACTIVITY',
      alertBadge: '🟡 Routine port activity',
      confidencePct: 88,
      changedAreaHa: 1.8,
      summary: 'Container stack orientation shift and temporary dredging barge moored along secondary jetty.'
    }
  ];

  const current = aois.find((a) => a.id === selectedAOI) || aois[0];

  return (
    <div className="w-full min-h-full flex flex-col bg-[#070D16] p-4 lg:p-6 pb-28 font-sans text-white space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#182A40] pb-4 font-sans">
        <div>
          <h2 className="text-[26px] font-semibold text-white tracking-normal flex items-center space-x-2.5 font-sans">
            <Crosshair className="w-6 h-6 text-[#00E5FF]" />
            <span>Tactical AOI monitor & multi-temporal surveillance cadence</span>
          </h2>
          <p className="text-sm font-normal text-[#94A3B8] mt-1 font-sans">
            Continuous orbital surveillance of strategic coastal sectors. Automated change alerts trigger upon co-registered multi-temporal persistence.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded bg-[#0E355A] border border-[#00E5FF]/40 text-xs font-medium text-[#00E5FF] flex items-center space-x-1.5 font-sans">
            <Bell className="w-3.5 h-3.5" />
            <span>Automated cadence active</span>
          </span>
        </div>
      </div>

      {/* 3 Operational Surveillance AOI Alert Cards */}
      <div className="space-y-3">
        <div className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
          <span>Operational AOI Watchlist & Real-Time Alert Dossiers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aois.map((a) => {
            const isSelected = selectedAOI === a.id;
            return (
              <div
                key={a.id}
                onClick={() => setSelectedAOI(a.id)}
                className={`bg-[#0B1523] border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between space-y-3 shadow-lg ${
                  isSelected
                    ? 'border-[#00E5FF] shadow-[0_0_18px_rgba(0,229,255,0.25)] bg-[#0E2238]'
                    : 'border-[#182A40] hover:border-[#00E5FF]/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#00E5FF]">{a.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      a.alertStatus === 'CRITICAL_CHANGE'
                        ? 'bg-[#7F1D1D]/50 border border-[#EF4444]/60 text-[#FCA5A5] animate-pulse'
                        : a.alertStatus === 'STABLE'
                        ? 'bg-[#064E3B]/60 border border-[#10B981]/50 text-[#34D399]'
                        : 'bg-[#78350F]/50 border border-[#F59E0B]/50 text-[#FDE68A]'
                    }`}>
                      {a.alertBadge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white leading-tight font-sans">{a.name}</h3>
                    <div className="text-xs text-[#94A3B8] mt-0.5 font-sans">{a.location}</div>
                  </div>

                  <p className="text-xs text-[#94A3B8] leading-relaxed pt-1 font-sans">
                    {a.summary}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#182A40]/70 text-xs font-sans">
                  <div className="flex justify-between items-center text-[#94A3B8]">
                    <span className="text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B]">LAST SCAN</span>
                    <span className="text-white font-mono">{a.lastScan}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#94A3B8]">
                    <span className="text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B]">CONFIDENCE</span>
                    <span className={`font-mono font-bold text-sm ${a.confidencePct >= 90 ? 'text-[#10B981]' : 'text-[#38BDF8]'}`}>
                      {a.confidencePct}% Verified
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#94A3B8]">
                    <span className="text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B]">CHANGED FOOTPRINT</span>
                    <span className={`font-mono font-medium ${a.changedAreaHa > 0 ? 'text-[#00E5FF]' : 'text-[#64748B]'}`}>
                      {a.changedAreaHa > 0 ? `${a.changedAreaHa} ha` : '0 ha (Nominal)'}
                    </span>
                  </div>

                  <div className="pt-2">
                    {a.changedAreaHa > 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewChange) onViewChange(a.id);
                        }}
                        className="w-full py-1.5 rounded bg-[#0E355A] hover:bg-[#0284C7] border border-[#0284C7] text-xs text-white font-medium flex items-center justify-center space-x-1.5 transition shadow-[0_0_10px_rgba(2,132,199,0.3)] font-sans"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View change analysis</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <div className="w-full py-1.5 rounded bg-[#070D16] border border-[#182A40] text-[11px] text-[#64748B] text-center font-medium font-sans">
                        Surveillance baseline stable
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AOI Details & Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
        {/* Geodetic Specs */}
        <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-4 space-y-3">
          <div className="text-xs text-[#00E5FF] font-semibold flex items-center space-x-2 font-sans">
            <MapPin className="w-4 h-4" />
            <span>Geodetic specifications</span>
          </div>
          <div className="space-y-2 text-xs font-sans">
            <div>
              <span className="text-[#64748B] block text-[11px] uppercase tracking-[0.05em]">CORRIDOR NAME</span>
              <span className="text-white font-medium">{current.name}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[11px] uppercase tracking-[0.05em]">CENTER COORDINATES</span>
              <span className="text-[#00E5FF] font-mono">{current.centerCoords}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[11px] uppercase tracking-[0.05em]">COORDINATE REFERENCE SYSTEM (CRS)</span>
              <span className="text-white font-mono">{current.crs}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[11px] uppercase tracking-[0.05em]">BOUNDING BOX [MIN_LON, MIN_LAT, MAX_LON, MAX_LAT]</span>
              <span className="text-white font-mono text-xs">[{current.bbox.join(', ')}]</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[11px] uppercase tracking-[0.05em]">MONITORED AREA</span>
              <span className="text-white font-mono">{current.areaKm2} sq km <span className="font-sans text-[#94A3B8]">(50 × 50 km)</span></span>
            </div>
          </div>
        </div>

        {/* Sensor Ingestion Cadence */}
        <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-4 space-y-3">
          <div className="text-xs text-[#10B981] font-semibold flex items-center space-x-2 font-sans">
            <Satellite className="w-4 h-4" />
            <span>Sensor ingestion cadence</span>
          </div>
          <div className="space-y-2 text-xs font-sans">
            <div>
              <span className="text-[#64748B] block text-[11px] uppercase tracking-[0.05em]">ORBITAL REVISIT PERIOD</span>
              <span className="text-white font-medium">{current.revisitCadence}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[11px] uppercase tracking-[0.05em]">PRIMARY RESOLUTION</span>
              <span className="text-white font-mono">{current.resolution}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[11px] uppercase tracking-[0.05em]">HISTORICAL SCENE DEPTH</span>
              <span className="text-white"><span className="font-mono font-medium">{current.totalScenes}</span> multi-temporal acquisitions</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[11px] uppercase tracking-[0.05em]">AVERAGE CLOUD COVERAGE</span>
              <span className="text-[#10B981]"><span className="font-mono font-medium">{current.avgCloudPct}%</span> (High quality optical baseline)</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[11px] uppercase tracking-[0.05em]">MONITORING STATUS</span>
              <span className="text-[#00E5FF] font-medium flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Active air-gapped surveillance</span>
              </span>
            </div>
          </div>
        </div>

        {/* Alert Threshold Configuration */}
        <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-4 space-y-3">
          <div className="text-xs text-[#38BDF8] font-bold flex items-center space-x-2">
            <Sliders className="w-4 h-4" />
            <span>TACTICAL ALERT THRESHOLDS</span>
          </div>
          <div className="space-y-3 text-xs pt-1">
            <div>
              <div className="flex justify-between text-[#94A3B8] mb-1">
                <span>Minimum Changed Area to Trigger Alert:</span>
                <span className="text-[#00E5FF] font-bold">{alertThresholdHa} ha</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={alertThresholdHa}
                onChange={(e) => setAlertThresholdHa(Number(e.target.value))}
                className="w-full accent-[#00E5FF] cursor-pointer h-1.5 bg-[#182A40] rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#94A3B8] mb-1">
                <span>Minimum Confidence Gate:</span>
                <span className="text-[#10B981] font-bold">{minConfidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                step="5"
                value={minConfidenceThreshold}
                onChange={(e) => setMinConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-[#10B981] cursor-pointer h-1.5 bg-[#182A40] rounded-lg"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-[#070D16] border border-[#182A40] flex justify-between items-center text-[11px]">
              <span className="text-[#94A3B8]">Automated Notifications:</span>
              <span className="text-[#10B981] font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active via Local Audit Ledger</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Overview Card */}
      <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-[#94A3B8]">
          <span className="uppercase font-bold tracking-wider">
            Operational Footprint Reticle: {current.id} ({current.name})
          </span>
          <span className="text-[#00E5FF]">EPSG:32644 (UTM 44N)</span>
        </div>
        <div className="aspect-[24/9] rounded-lg overflow-hidden border border-[#182A40] relative bg-[#08121E]">
          <img
            src="/assets/satellite_map_base.jpg"
            alt="AOI Satellite Mosaic"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-48 border-2 border-dashed border-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_35px_rgba(0,229,255,0.4)] flex flex-col items-center justify-center">
              <div className="bg-[#070D16]/90 border border-[#00E5FF] px-3.5 py-1.5 rounded text-xs font-bold text-[#00E5FF] flex items-center space-x-1.5 shadow-xl">
                <Crosshair className="w-4 h-4" />
                <span>{current.id} // {current.centerCoords}</span>
              </div>
              <div className="text-[10px] text-white bg-black/75 px-2 py-0.5 rounded mt-2 border border-[#182A40]">
                Surveillance Grid: 50 × 50 km
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AOIMonitorView;
