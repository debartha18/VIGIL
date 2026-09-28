import React, { useState } from 'react';
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

  const datePresets: { label: string; range: [string, string] }[] = [
    { label: '2023-01-01 → 2025-09-01 (Master Baseline)', range: ['2023-01-01', '2025-09-01'] },
    { label: '2021-01-15 → 2023-12-31 (Early Epoch)', range: ['2021-01-15', '2023-12-31'] },
    { label: '2024-01-01 → 2026-09-20 (Recent Changes)', range: ['2024-01-01', '2026-09-20'] },
  ];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch(query, dateRange, sensor);
  };

  return (
    <div className="w-full bg-[#070D16] px-3 sm:px-5 py-2.5 sm:py-3 border-b border-[#182A40]/80 shrink-0 select-none">
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

        {/* Filter Controls Row (Scrolls horizontally on small devices without breaking) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {/* Interactive Date Range Selector Dropdown */}
          <div className="relative font-sans shrink-0">
            <div
              onClick={() => {
                setShowDateMenu(!showDateMenu);
                setShowSensorMenu(false);
              }}
              className="flex items-center space-x-2 sm:space-x-2.5 bg-[#0B1523] border border-[#182A40] hover:border-[#00E5FF]/50 rounded-lg px-2.5 sm:px-3.5 py-2 text-xs text-white select-none cursor-pointer transition font-sans"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#64748B] shrink-0" />
              <span className="font-mono text-[11px] sm:text-xs">{dateRange[0]}</span>
              <span className="text-[#64748B]">→</span>
              <span className="font-mono text-[11px] sm:text-xs">{dateRange[1]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B] ml-0.5 sm:ml-1" />
            </div>

            {showDateMenu && (
              <div className="absolute top-11 left-0 w-72 sm:w-80 bg-[#0E1A2B] border border-[#182A40] rounded-xl shadow-2xl p-2 z-40 text-xs space-y-1 font-sans">
                <div className="px-2 py-1 text-[11px] text-[#64748B] uppercase tracking-[0.05em] font-sans">
                  Select temporal observation window
                </div>
                {datePresets.map((dp) => (
                  <div
                    key={dp.label}
                    onClick={() => {
                      setDateRange(dp.range);
                      setShowDateMenu(false);
                      onSearch(query, dp.range, sensor);
                    }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition ${
                      dateRange[0] === dp.range[0] ? 'bg-[#0E355A] text-[#00E5FF] font-bold' : 'text-[#94A3B8] hover:bg-[#132438] hover:text-white'
                    }`}
                  >
                    <span>{dp.label}</span>
                    {dateRange[0] === dp.range[0] && <Check className="w-3.5 h-3.5 text-[#00E5FF]" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sensor Selector Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowSensorMenu(!showSensorMenu);
                setShowDateMenu(false);
              }}
              className="flex items-center space-x-2 sm:space-x-2.5 bg-[#0B1523] border border-[#182A40] hover:border-[#00E5FF]/50 rounded-lg px-2.5 sm:px-3.5 py-2 text-xs font-medium text-white select-none cursor-pointer transition"
            >
              <Satellite className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#64748B] shrink-0" />
              <span className="text-[11px] sm:text-xs">{sensor}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B] ml-0.5 sm:ml-1" />
            </button>

            {showSensorMenu && (
              <div className="absolute top-11 right-0 w-52 bg-[#0E1A2B] border border-[#182A40] rounded-xl shadow-2xl p-2 z-40 font-mono text-xs space-y-1">
                <div className="px-2 py-1 text-[10px] text-[#64748B] uppercase font-bold tracking-wider">
                  Select Sensor Constellation
                </div>
                {['All Sensors', 'Sentinel-2 (10m)', 'Sentinel-1 (SAR)', 'Landsat-8/9 (15m)'].map((s) => (
                  <div
                    key={s}
                    onClick={() => {
                      setSensor(s);
                      setShowSensorMenu(false);
                      onSearch(query, dateRange, s);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                      sensor === s ? 'bg-[#0E355A] text-[#00E5FF] font-bold' : 'text-[#94A3B8] hover:bg-[#132438] hover:text-white'
                    }`}
                  >
                    <span>{s}</span>
                    {sensor === s && <Check className="w-3.5 h-3.5 text-[#00E5FF]" />}
                  </div>
                ))}
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
