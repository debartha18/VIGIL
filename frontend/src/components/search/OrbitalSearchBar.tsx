import React, { useState, useRef, useEffect } from 'react';
import { Search, Calendar, ChevronDown, Satellite, Check, MapPin, Filter } from 'lucide-react';

interface OrbitalSearchBarProps {
  onSearch: (
    query: string,
    dateRange: [string, string],
    sensor: string,
    stateFilter?: string,
    categoryFilter?: string
  ) => void;
  defaultQuery?: string;
  defaultState?: string;
  defaultCategory?: string;
}

export const STATES_LIST = [
  'All Regions',
  'Gujarat',
  'Maharashtra',
  'Odisha',
  'Jharkhand',
  'Karnataka',
  'West Bengal',
  'Tamil Nadu',
  'Kerala',
  'Andhra Pradesh',
  'Rajasthan',
  'Chhattisgarh',
  'Delhi NCR',
  'Uttarakhand',
  'Assam',
  'Mizoram',
  'Madhya Pradesh',
  'Global (Amazon)',
];

export const CATEGORIES_LIST = [
  'All Categories',
  'Coastal / Port',
  'Deforestation',
  'Mining',
  'Urban Expansion',
  'Infrastructure / Roads',
  'Floods / Water',
];

export const OrbitalSearchBar: React.FC<OrbitalSearchBarProps> = ({
  onSearch,
  defaultQuery = '"construction near sea"',
  defaultState = 'All Regions',
  defaultCategory = 'All Categories',
}) => {
  const [query, setQuery] = useState(defaultQuery);
  const [dateRange, setDateRange] = useState<[string, string]>(['2023-01-01', '2025-09-01']);
  const [sensor, setSensor] = useState('All Sensors');
  const [selectedState, setSelectedState] = useState<string>(defaultState);
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);

  const [showSensorMenu, setShowSensorMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showStateMenu, setShowStateMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  // Custom date picker state
  const [customStart, setCustomStart] = useState('2023-01-01');
  const [customEnd, setCustomEnd] = useState('2025-09-01');

  // Click outside listener refs
  const dateMenuRef = useRef<HTMLDivElement>(null);
  const sensorMenuRef = useRef<HTMLDivElement>(null);
  const stateMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateMenuRef.current && !dateMenuRef.current.contains(event.target as Node)) {
        setShowDateMenu(false);
      }
      if (sensorMenuRef.current && !sensorMenuRef.current.contains(event.target as Node)) {
        setShowSensorMenu(false);
      }
      if (stateMenuRef.current && !stateMenuRef.current.contains(event.target as Node)) {
        setShowStateMenu(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setShowCategoryMenu(false);
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
    onSearch(query, dateRange, sensor, selectedState, selectedCategory);
  };

  const handleStateSelect = (st: string) => {
    setSelectedState(st);
    setShowStateMenu(false);
    onSearch(query, dateRange, sensor, st, selectedCategory);
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setShowCategoryMenu(false);
    onSearch(query, dateRange, sensor, selectedState, cat);
  };

  return (
    <div className="w-full bg-surface px-3 sm:px-4 py-2 border-b border-border shrink-0 select-none relative z-40">
      <form onSubmit={handleSearchSubmit} className="flex flex-col xl:flex-row xl:items-center gap-2 xl:gap-0 xl:space-x-3">
        {/* Semantic Query Input + Mobile Quick Submit */}
        <div className="flex items-center space-x-2 w-full xl:flex-1">
          <div className="flex-1 flex items-center bg-bg border border-border focus-within:border-accent rounded-md px-3 py-1.5 transition-colors">
            <Search className="w-4 h-4 text-text-2 mr-2.5 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concepts: e.g. mining, deforestation, urban expansion, construction near sea..."
              className="w-full bg-transparent text-xs sm:text-sm text-text font-sans placeholder-text-2 outline-none"
            />
          </div>
          {/* Mobile Search Button */}
          <button
            type="submit"
            className="xl:hidden flex items-center space-x-1.5 bg-accent hover:bg-accent/90 active:bg-accent/80 text-bg font-semibold text-xs px-3.5 py-2 rounded-md transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Search className="w-3.5 h-3.5 stroke-[2]" />
            <span>Search</span>
          </button>
        </div>

        {/* Filter Controls Row: Unclipped container so dropdowns float smoothly */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Location / State Filter Dropdown */}
          <div ref={stateMenuRef} className="relative font-sans shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowStateMenu((prev) => !prev);
                setShowCategoryMenu(false);
                setShowDateMenu(false);
                setShowSensorMenu(false);
              }}
              className={`flex items-center space-x-1.5 bg-bg border ${
                showStateMenu || selectedState !== 'All Regions' ? 'border-accent text-accent' : 'border-border text-text hover:border-text-2'
              } rounded-md px-2.5 py-1.5 text-xs select-none cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-accent`}
              title="Filter by State or Region"
            >
              <MapPin className={`w-3.5 h-3.5 ${selectedState !== 'All Regions' ? 'text-accent' : 'text-text-2'} shrink-0`} />
              <span className="max-w-[110px] truncate">{selectedState}</span>
              <ChevronDown className={`w-3 h-3 text-text-2 transition-transform duration-150 ${showStateMenu ? 'rotate-180 text-accent' : ''}`} />
            </button>

            {showStateMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-10 left-0 sm:left-auto sm:right-0 md:left-0 w-48 max-h-72 overflow-y-auto bg-raised border border-border rounded-md shadow-2xl p-1.5 z-50 text-xs space-y-0.5 font-sans animate-in fade-in duration-150"
              >
                <div className="px-2 py-1 text-[11px] font-semibold text-text-2 border-b border-border/80 mb-1">
                  Region / State
                </div>
                {STATES_LIST.map((st) => {
                  const isSelected = selectedState === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStateSelect(st)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors text-left text-xs ${
                        isSelected ? 'bg-surface text-accent font-medium' : 'text-text-2 hover:bg-surface hover:text-text'
                      }`}
                    >
                      <span className="truncate">{st}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category / Event Type Filter Dropdown */}
          <div ref={categoryMenuRef} className="relative font-sans shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCategoryMenu((prev) => !prev);
                setShowStateMenu(false);
                setShowDateMenu(false);
                setShowSensorMenu(false);
              }}
              className={`flex items-center space-x-1.5 bg-bg border ${
                showCategoryMenu || selectedCategory !== 'All Categories' ? 'border-accent text-accent' : 'border-border text-text hover:border-text-2'
              } rounded-md px-2.5 py-1.5 text-xs select-none cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-accent`}
              title="Filter by Event Category"
            >
              <Filter className={`w-3.5 h-3.5 ${selectedCategory !== 'All Categories' ? 'text-accent' : 'text-text-2'} shrink-0`} />
              <span className="max-w-[125px] truncate">{selectedCategory}</span>
              <ChevronDown className={`w-3 h-3 text-text-2 transition-transform duration-150 ${showCategoryMenu ? 'rotate-180 text-accent' : ''}`} />
            </button>

            {showCategoryMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-10 left-0 sm:left-auto sm:right-0 md:left-0 w-52 bg-raised border border-border rounded-md shadow-2xl p-1.5 z-50 text-xs space-y-0.5 font-sans animate-in fade-in duration-150"
              >
                <div className="px-2 py-1 text-[11px] font-semibold text-text-2 border-b border-border/80 mb-1">
                  Change Category
                </div>
                {CATEGORIES_LIST.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors text-left text-xs ${
                        isSelected ? 'bg-surface text-accent font-medium' : 'text-text-2 hover:bg-surface hover:text-text'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Date Range Selector Dropdown */}
          <div ref={dateMenuRef} className="relative font-sans shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDateMenu((prev) => !prev);
                setShowSensorMenu(false);
                setShowStateMenu(false);
                setShowCategoryMenu(false);
              }}
              className={`flex items-center space-x-2 bg-bg border ${
                showDateMenu ? 'border-accent' : 'border-border hover:border-text-2'
              } rounded-md px-2.5 py-1.5 text-xs text-text select-none cursor-pointer transition-colors font-sans focus-visible:ring-2 focus-visible:ring-accent`}
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
                className="absolute top-10 right-0 sm:right-auto sm:left-0 w-[310px] sm:w-[340px] bg-raised border border-border rounded-md shadow-2xl p-3 z-50 text-xs space-y-3 font-sans animate-in fade-in duration-150"
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
                            onSearch(query, dp.range, sensor, selectedState, selectedCategory);
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
                        onSearch(query, newRange, sensor, selectedState, selectedCategory);
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
                setShowStateMenu(false);
                setShowCategoryMenu(false);
              }}
              className={`flex items-center space-x-2 bg-bg border ${
                showSensorMenu ? 'border-accent' : 'border-border hover:border-text-2'
              } rounded-md px-2.5 py-1.5 text-xs font-medium text-text select-none cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-accent`}
              title="Select sensor constellation"
            >
              <Satellite className={`w-3.5 h-3.5 ${showSensorMenu ? 'text-accent' : 'text-text-2'} shrink-0`} />
              <span className="text-xs">{sensor}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-text-2 ml-1 transition-transform duration-150 ${showSensorMenu ? 'rotate-180 text-accent' : ''}`} />
            </button>

            {showSensorMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-10 right-0 w-60 bg-raised border border-border rounded-md shadow-2xl p-2 z-50 text-xs space-y-1 font-sans animate-in fade-in duration-150"
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
                        onSearch(query, dateRange, s.name, selectedState, selectedCategory);
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

          {/* Desktop Search Button */}
          <button
            type="submit"
            className="hidden xl:flex items-center space-x-1.5 bg-accent hover:bg-accent/90 active:bg-accent/80 text-bg font-semibold text-xs px-4 py-2 rounded-md transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Search className="w-3.5 h-3.5 stroke-[2]" />
            <span>Search</span>
          </button>
        </div>
      </form>
    </div>
  );
};
