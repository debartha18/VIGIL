import React, { useState, useRef, useEffect } from 'react';
import { Search, Calendar, ChevronDown, Satellite, Check } from 'lucide-react';

interface OrbitalSearchBarProps {
  onSearch: (query: string, dateRange: [string, string], sensor: string) => void;
  defaultQuery?: string;
}

export const OrbitalSearchBar: React.FC<OrbitalSearchBarProps> = ({
  onSearch,
  defaultQuery = '"construction near river"',
}) => {
  const [query, setQuery] = useState(defaultQuery);
  const [dateRange, setDateRange] = useState<[string, string]>(['2023-01-01', '2025-09-01']);
  const [sensor, setSensor] = useState('All Sensors');
  const [showSensorMenu, setShowSensorMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);

  // Custom date picker state
  const [customStart, setCustomStart] = useState('2023-01-01');
  const [customEnd, setCustomEnd] = useState('2025-09-01');

  // Click outside listener refs
  const dateMenuRef = useRef<HTMLDivElement>(null);
  const sensorMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateMenuRef.current && !dateMenuRef.current.contains(event.target as Node)) {
        setShowDateMenu(false);
      }
      if (sensorMenuRef.current && !sensorMenuRef.current.contains(event.target as Node)) {
        setShowSensorMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const datePresets: { label: string; range: [string, string] }[] = [
    { label: '2023-01-01 → 2025-09-01 (Master Baseline)', range: ['2023-01-01', '2025-09-01'] },
    { label: '2021-01-15 → 2023-12-31 (Early Epoch)', range: ['2021-01-15', '2023-12-31'] },
    { label: '2024-01-01 → 2026-09-20 (Recent Changes)', range: ['2024-01-01', '2026-09-20'] },
    { label: '2024-06-01 → 2025-06-01 (1-Year Window)', range: ['2024-06-01', '2025-06-01'] },
  ];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch(query, dateRange, sensor);
  };

  return (
    <div className="w-full bg-[#070D16] px-3 sm:px-5 py-2.5 sm:py-3 border-b border-[#182A40]/80 shrink-0 select-none relative z-50">
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0 md:space-x-3">
        {/* Semantic Query Input + Mobile Quick Submit */}
        <div className="flex items-center space-x-2 w-full md:flex-1">
          <div className="flex-1 flex items-center bg-[#0B1523] border border-[#182A40] focus-within:border-[#00E5FF]/70 focus-within:ring-1 focus-within:ring-[#00E5FF]/30 rounded-lg px-3 sm:px-3.5 py-2 transition-all">
            <Search className="w-4 h-4 text-[#64748B] mr-2.5 sm:mr-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you want to find across satellite archives..."
              className="w-full bg-transparent text-xs sm:text-sm text-white font-sans placeholder-[#475569] outline-none"
            />
          </div>
          {/* Mobile Search Button */}
          <button
            type="submit"
            className="md:hidden flex items-center space-x-1.5 bg-[#00E5FF] hover:bg-[#22D3EE] active:bg-[#00B4D8] text-[#070D16] font-bold text-xs px-3.5 py-2 rounded-lg shadow-[0_0_12px_rgba(0,229,255,0.3)] transition-all cursor-pointer shrink-0"
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Find</span>
          </button>
        </div>

        {/* Filter Controls Row: Unclipped container so dropdowns float smoothly */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Interactive Date Range Selector Dropdown */}
          <div ref={dateMenuRef} className="relative font-sans shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDateMenu((prev) => !prev);
                setShowSensorMenu(false);
              }}
              className={`flex items-center space-x-2 sm:space-x-2.5 bg-[#0B1523] border ${
                showDateMenu ? 'border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.25)]' : 'border-[#182A40] hover:border-[#00E5FF]/60'
              } rounded-lg px-2.5 sm:px-3.5 py-2 text-xs text-white select-none cursor-pointer transition font-sans`}
              title="Select temporal observation window"
            >
              <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${showDateMenu ? 'text-[#00E5FF]' : 'text-[#64748B]'} shrink-0`} />
              <span className="font-mono text-[11px] sm:text-xs">{dateRange[0]}</span>
              <span className="text-[#64748B]">→</span>
              <span className="font-mono text-[11px] sm:text-xs">{dateRange[1]}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] ml-0.5 sm:ml-1 transition-transform duration-200 ${showDateMenu ? 'rotate-180 text-[#00E5FF]' : ''}`} />
            </button>

            {showDateMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-12 left-0 sm:left-auto sm:right-0 md:left-0 w-[310px] sm:w-[340px] bg-[#0E1A2B] border border-[#00E5FF]/40 rounded-xl shadow-2xl p-3 z-50 text-xs space-y-3 font-sans backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
              >
                <div>
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Observation Presets</span>
                    <span className="text-[9px] text-[#00E5FF] font-mono">Archive 2021-2026</span>
                  </div>
                  <div className="space-y-1">
                    {datePresets.map((dp) => {
                      const isSelected = dateRange[0] === dp.range[0] && dateRange[1] === dp.range[1];
                      return (
                        <button
                          key={dp.label}
                          type="button"
                          onClick={() => {
                            setDateRange(dp.range);
                            setCustomStart(dp.range[0]);
                            setCustomEnd(dp.range[1]);
                            setShowDateMenu(false);
                            onSearch(query, dp.range, sensor);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition text-left ${
                            isSelected ? 'bg-[#0E355A] text-[#00E5FF] font-bold border border-[#00E5FF]/40' : 'text-[#94A3B8] hover:bg-[#132438] hover:text-white'
                          }`}
                        >
                          <span className="text-[11px] leading-tight">{dp.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Date Range Picker Inputs */}
                <div className="border-t border-[#182A40] pt-2.5">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                    Custom Temporal Range
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#94A3B8] block mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full bg-[#070D16] border border-[#182A40] rounded px-2 py-1 text-xs text-white font-mono focus:border-[#00E5FF] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#94A3B8] block mb-1">End Date</label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full bg-[#070D16] border border-[#182A40] rounded px-2 py-1 text-xs text-white font-mono focus:border-[#00E5FF] focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (customStart && customEnd) {
                        const newRange: [string, string] = [customStart, customEnd];
                        setDateRange(newRange);
                        setShowDateMenu(false);
                        onSearch(query, newRange, sensor);
                      }
                    }}
                    className="mt-2.5 w-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold py-1.5 rounded-lg text-xs transition cursor-pointer flex items-center justify-center space-x-1 shadow"
                  >
                    <span>Apply Custom Window</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sensor Selector Dropdown */}
          <div ref={sensorMenuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSensorMenu((prev) => !prev);
                setShowDateMenu(false);
              }}
              className={`flex items-center space-x-2 sm:space-x-2.5 bg-[#0B1523] border ${
                showSensorMenu ? 'border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.25)]' : 'border-[#182A40] hover:border-[#00E5FF]/60'
              } rounded-lg px-2.5 sm:px-3.5 py-2 text-xs font-medium text-white select-none cursor-pointer transition`}
              title="Select sensor constellation"
            >
              <Satellite className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${showSensorMenu ? 'text-[#00E5FF]' : 'text-[#64748B]'} shrink-0`} />
              <span className="text-[11px] sm:text-xs">{sensor}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] ml-0.5 sm:ml-1 transition-transform duration-200 ${showSensorMenu ? 'rotate-180 text-[#00E5FF]' : ''}`} />
            </button>

            {showSensorMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-12 right-0 w-60 bg-[#0E1A2B] border border-[#00E5FF]/40 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1 font-sans backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-2 py-1 text-[10px] text-[#64748B] uppercase font-bold tracking-wider flex items-center justify-between border-b border-[#182A40] pb-1.5 mb-1">
                  <span>Select Constellation</span>
                  <span className="text-[9px] text-[#00E5FF] font-mono">EO & SAR</span>
                </div>
                {[
                  { name: 'All Sensors', desc: 'Optical 10m + SAR + Landsat' },
                  { name: 'Sentinel-2 (10m)', desc: 'MSI Multispectral 10m Resolution' },
                  { name: 'Sentinel-1 (SAR)', desc: 'C-Band Synthetic Aperture Radar' },
                  { name: 'Landsat-8/9 (15m)', desc: 'OLI-2 15m Panchromatic & Thermal' },
                ].map((s) => {
                  const isSelected = sensor === s.name;
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => {
                        setSensor(s.name);
                        setShowSensorMenu(false);
                        onSearch(query, dateRange, s.name);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition text-left ${
                        isSelected ? 'bg-[#0E355A] text-[#00E5FF] font-bold border border-[#00E5FF]/40' : 'text-[#94A3B8] hover:bg-[#132438] hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="text-[11px] font-medium leading-tight">{s.name}</div>
                        <div className="text-[9px] text-[#64748B] font-mono leading-tight">{s.desc}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Search Button */}
          <button
            type="submit"
            className="hidden md:flex items-center space-x-2 bg-[#00E5FF] hover:bg-[#22D3EE] active:bg-[#00B4D8] text-[#070D16] font-bold text-xs px-5 py-2.5 rounded-lg shadow-[0_0_15px_rgba(0,229,255,0.35)] transition-all cursor-pointer shrink-0"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span>Search</span>
          </button>
        </div>
      </form>
    </div>
  );
};
