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
    <div className="w-full bg-surface px-3 sm:px-4 py-2 border-b border-border shrink-0 select-none relative z-50">
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0 md:space-x-3">
        {/* Semantic Query Input + Mobile Quick Submit */}
        <div className="flex items-center space-x-2 w-full md:flex-1">
          <div className="flex-1 flex items-center bg-bg border border-border focus-within:border-accent rounded-md px-3 py-1.5 transition-colors">
            <Search className="w-4 h-4 text-text-2 mr-2.5 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you want to find across satellite archives..."
              className="w-full bg-transparent text-xs sm:text-sm text-text font-sans placeholder-text-2 outline-none"
            />
          </div>
          {/* Mobile Search Button */}
          <button
            type="submit"
            className="md:hidden flex items-center space-x-1.5 bg-accent hover:bg-accent/90 active:bg-accent/80 text-bg font-semibold text-xs px-3.5 py-2 rounded-md transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Search className="w-3.5 h-3.5 stroke-[2]" />
            <span>Search</span>
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
              className={`flex items-center space-x-2 bg-bg border ${
                showDateMenu ? 'border-accent' : 'border-border hover:border-text-2'
              } rounded-md px-3 py-1.5 text-xs text-text select-none cursor-pointer transition-colors font-sans focus-visible:ring-2 focus-visible:ring-accent`}
              title="Select temporal observation window"
            >
              <Calendar className={`w-3.5 h-3.5 ${showDateMenu ? 'text-accent' : 'text-text-2'} shrink-0`} />
              <span className="font-mono text-xs tabular-nums">{dateRange[0]}</span>
              <span className="text-text-2">→</span>
              <span className="font-mono text-xs tabular-nums">{dateRange[1]}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-text-2 ml-1 transition-transform duration-150 ${showDateMenu ? 'rotate-180 text-accent' : ''}`} />
            </button>

            {showDateMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-10 left-0 sm:left-auto sm:right-0 md:left-0 w-[310px] sm:w-[340px] bg-raised border border-border rounded-md shadow-subtle p-3 z-50 text-xs space-y-3 font-sans animate-in fade-in duration-150"
              >
                <div>
                  <div className="text-xs font-semibold text-text-2 mb-1.5 flex items-center justify-between">
                    <span>Observation presets</span>
                    <span className="text-[11px] text-accent font-mono">2021–2026</span>
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
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors text-left text-xs ${
                            isSelected ? 'bg-surface text-accent font-medium' : 'text-text-2 hover:bg-surface hover:text-text'
                          }`}
                        >
                          <span className="leading-tight">{dp.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Date Range Picker Inputs */}
                <div className="border-t border-border pt-2.5">
                  <div className="text-xs font-semibold text-text-2 mb-2">
                    Custom temporal range
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-text-2 block mb-1">Start date</label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full bg-surface border border-border rounded px-2 py-1 text-xs text-text font-mono focus:border-accent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-2 block mb-1">End date</label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full bg-surface border border-border rounded px-2 py-1 text-xs text-text font-mono focus:border-accent focus:outline-none"
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
                    className="mt-2.5 w-full bg-accent hover:bg-accent/90 active:bg-accent/80 text-bg font-semibold py-1.5 rounded-md text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <span>Apply custom window</span>
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
              className={`flex items-center space-x-2 bg-bg border ${
                showSensorMenu ? 'border-accent' : 'border-border hover:border-text-2'
              } rounded-md px-3 py-1.5 text-xs font-medium text-text select-none cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-accent`}
              title="Select sensor constellation"
            >
              <Satellite className={`w-3.5 h-3.5 ${showSensorMenu ? 'text-accent' : 'text-text-2'} shrink-0`} />
              <span className="text-xs">{sensor}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-text-2 ml-1 transition-transform duration-150 ${showSensorMenu ? 'rotate-180 text-accent' : ''}`} />
            </button>

            {showSensorMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-10 right-0 w-60 bg-raised border border-border rounded-md shadow-subtle p-2 z-50 text-xs space-y-1 font-sans animate-in fade-in duration-150"
              >
                <div className="px-2 py-1 text-xs text-text-2 font-medium flex items-center justify-between border-b border-border pb-1.5 mb-1">
                  <span>Select constellation</span>
                  <span className="text-[10px] text-accent font-mono">EO & SAR</span>
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
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors text-left ${
                        isSelected ? 'bg-surface text-accent font-medium' : 'text-text-2 hover:bg-surface hover:text-text'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-medium leading-tight">{s.name}</div>
                        <div className="text-[10px] text-text-2 font-mono leading-tight">{s.desc}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Search Button - Only filled primary action button in view */}
          <button
            type="submit"
            className="hidden md:flex items-center space-x-1.5 bg-accent hover:bg-accent/90 active:bg-accent/80 text-bg font-semibold text-xs px-4 py-2 rounded-md transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Search className="w-3.5 h-3.5 stroke-[2]" />
            <span>Search</span>
          </button>
        </div>
      </form>
    </div>
  );
};
