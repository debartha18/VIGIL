import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Check } from 'lucide-react';

export interface SearchResultItem {
  id: string;
  title: string;
  date: string;
  sensor: string;
  coordinates: string;
  matchType: 'High Match' | 'Medium Match' | string;
  confidencePct: number;
  imageUrl: string;
  beforeImgUrl?: string;
  afterImgUrl?: string;
  areaHa?: string;
  timeGap?: string;
  locationName?: string;
  changeType?: string;
  observationPeriod?: string;
  cloudCover?: string;
  beforeCloudCover?: string;
  beforeDate?: string;
  resolution?: string;
  changePercentage?: string;
  changeMaskUrl?: string;
}

interface SemanticSearchResultsProps {
  onSelectResult?: (item: SearchResultItem) => void;
  selectedId?: string;
  items?: SearchResultItem[];
  isSearching?: boolean;
}

export const SemanticSearchResults: React.FC<SemanticSearchResultsProps> = ({
  onSelectResult,
  selectedId = 'res-1',
  items,
  isSearching = false,
}) => {
  const [sortMethod, setSortMethod] = useState<'Relevance' | 'Confidence' | 'Date'>('Relevance');
  const [showSortMenu, setShowSortMenu] = useState<boolean>(false);

  const fallbackResults: SearchResultItem[] = [
    {
      id: 'res-1',
      title: 'Hazira Deepwater Wharf & Piling Deck',
      locationName: 'Hazira',
      changeType: 'New Construction',
      date: '2025-04-28',
      observationPeriod: '2023 → 2025',
      sensor: 'Sentinel-2 (10m)',
      resolution: '10 m',
      cloudCover: '1.8%',
      beforeCloudCover: '2.1%',
      beforeDate: '2023-08-12',
      coordinates: '21.4587° N, 72.7812° E',
      matchType: 'High Match',
      confidencePct: 96,
      changePercentage: '+34.8%',
      imageUrl: '/assets/card_1_construction.jpg',
      beforeImgUrl: '/assets/before_scene.jpg',
      afterImgUrl: '/assets/card_1_construction.jpg',
      areaHa: '4.2 ha (42,000 m²)',
      timeGap: '20 months',
    },
    {
      id: 'res-2',
      title: 'Dumas Coastal Bund & Sea Embankment',
      locationName: 'Dumas Shoreline',
      changeType: 'Coastal Bund Extension',
      date: '2024-11-18',
      observationPeriod: '2023 → 2024',
      sensor: 'Sentinel-2 (10m)',
      resolution: '10 m',
      cloudCover: '1.4%',
      beforeCloudCover: '2.1%',
      beforeDate: '2023-08-12',
      coordinates: '21.4632° N, 72.7845° E',
      matchType: 'High Match',
      confidencePct: 93,
      changePercentage: '+28.4%',
      imageUrl: '/assets/card_2_riverside.jpg',
      beforeImgUrl: '/assets/before_scene.jpg',
      afterImgUrl: '/assets/card_2_riverside.jpg',
      areaHa: '3.1 ha (31,000 m²)',
      timeGap: '15 months',
    },
    {
      id: 'res-3',
      title: 'Adani Marine Logistics Berth Extension',
      locationName: 'Adani Port',
      changeType: 'Structural Berth Expansion',
      date: '2024-06-15',
      observationPeriod: '2023 → 2024',
      sensor: 'Sentinel-1 SAR (10m)',
      resolution: '10 m',
      cloudCover: '0.0% (SAR Radar)',
      beforeCloudCover: '2.1%',
      beforeDate: '2023-08-12',
      coordinates: '21.4521° N, 72.7763° E',
      matchType: 'Medium Match',
      confidencePct: 89,
      changePercentage: '+41.2%',
      imageUrl: '/assets/card_3_port.jpg',
      beforeImgUrl: '/assets/before_scene.jpg',
      afterImgUrl: '/assets/card_3_port.jpg',
      areaHa: '4.8 ha (48,000 m²)',
      timeGap: '10 months',
    },
    {
      id: 'res-4',
      title: 'Tapi Rivermouth Pier Piling & Riprap',
      locationName: 'Tapi Rivermouth',
      changeType: 'Pier & Bridge Works',
      date: '2023-12-03',
      observationPeriod: '2023 → 2024',
      sensor: 'Sentinel-2 (10m)',
      resolution: '10 m',
      cloudCover: '2.4%',
      beforeCloudCover: '2.1%',
      beforeDate: '2023-08-12',
      coordinates: '21.4550° N, 72.7801° E',
      matchType: 'Medium Match',
      confidencePct: 85,
      changePercentage: '+18.5%',
      imageUrl: '/assets/card_4_bridge.jpg',
      beforeImgUrl: '/assets/before_scene.jpg',
      afterImgUrl: '/assets/card_4_bridge.jpg',
      areaHa: '1.8 ha (18,000 m²)',
      timeGap: '4 months',
    },
    {
      id: 'res-5',
      title: 'Coastal Mudflat Landfill & Earthworks',
      locationName: 'Dumas Mudflats',
      changeType: 'Land Clearance & Leveling',
      date: '2024-03-22',
      observationPeriod: '2023 → 2024',
      sensor: 'Landsat-8/9 (15m)',
      resolution: '15 m',
      cloudCover: '1.1%',
      beforeCloudCover: '2.1%',
      beforeDate: '2023-08-12',
      coordinates: '21.4617° N, 72.7890° E',
      matchType: 'Medium Match',
      confidencePct: 81,
      changePercentage: '+52.0%',
      imageUrl: '/assets/card_5_land.jpg',
      beforeImgUrl: '/assets/before_scene.jpg',
      afterImgUrl: '/assets/card_5_land.jpg',
      areaHa: '5.6 ha (56,000 m²)',
      timeGap: '7 months',
    },
  ];

  const sourceData = items && items.length > 0 ? items : fallbackResults;

  // Sorting operation
  const searchResults = [...sourceData].sort((a, b) => {
    if (sortMethod === 'Confidence') return b.confidencePct - a.confidencePct;
    if (sortMethod === 'Date') return b.date.localeCompare(a.date);
    return 0; // Default Relevance
  });

  return (
    <div className="w-full h-full bg-[#0B1523] border border-[#182A40] rounded-xl p-3 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#182A40]/80 font-sans shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full border border-[#0284C7]/60 flex items-center justify-center text-[#38BDF8]">
            <Search className="w-2.5 h-2.5" />
          </div>
          <h3 className="text-xs font-semibold text-white tracking-normal font-sans">
            Semantic search results
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-[#0369A1]/20 border border-[#0284C7]/40 text-[11px] text-[#38BDF8] font-sans">
            <span className="font-mono font-medium">{searchResults.length}</span> targets retrieved
          </span>
        </div>

        {/* Sort Selector with interactive dropdown */}
        <div className="relative font-sans">
          <div
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center space-x-1.5 text-xs text-[#94A3B8] cursor-pointer hover:text-white"
          >
            <span>Sort:</span>
            <div className="h-6 flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#070D16] border border-[#182A40] text-white">
              <span>{sortMethod}</span>
              <ChevronDown className="w-3 h-3 text-[#64748B]" />
            </div>
          </div>

          {showSortMenu && (
            <div className="absolute top-7 right-0 w-36 bg-[#0E1A2B] border border-[#182A40] rounded-lg shadow-2xl py-1 z-30 font-sans text-xs">
              {(['Relevance', 'Confidence', 'Date'] as const).map((m) => (
                <div
                  key={m}
                  onClick={() => {
                    setSortMethod(m);
                    setShowSortMenu(false);
                  }}
                  className={`flex items-center justify-between px-3 py-1.5 hover:bg-[#1A2D46] cursor-pointer ${
                    sortMethod === m ? 'text-[#38BDF8] font-medium' : 'text-[#94A3B8]'
                  }`}
                >
                  <span>{m}</span>
                  {sortMethod === m && <Check className="w-3 h-3 text-[#38BDF8]" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5 Distinct Photographic Result Cards or Loading Shimmer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 flex-1 min-h-0 overflow-y-auto">
        {isSearching
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#070D16] rounded-xl border border-[#182A40] p-2 flex flex-col justify-between animate-pulse"
              >
                <div>
                  <div className="aspect-[16/10] bg-[#0E1B2D] rounded-lg mb-2" />
                  <div className="h-3.5 bg-[#0E1B2D] rounded w-3/4 mb-2" />
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-[#0E1B2D] rounded w-1/2" />
                    <div className="h-2.5 bg-[#0E1B2D] rounded w-2/3" />
                  </div>
                </div>
                <div className="h-7 bg-[#0E1B2D] rounded-lg mt-2 w-full" />
              </div>
            ))
          : searchResults.map((card) => {
              const isSelected = selectedId === card.id;
              const locationStr = card.locationName || card.title.split(' ')[0] || 'Hazira';
              const changeTypeStr = card.changeType || 'Detected Change';
              const obsPeriodStr = card.observationPeriod || '2023 → 2025';

              return (
                <div
                  key={card.id}
                  id={`semantic-card-${card.id}`}
                  onClick={() => onSelectResult && onSelectResult(card)}
                  className={`bg-[#070D16] rounded-xl border p-2 flex flex-col justify-between transition-all duration-200 cursor-pointer group ${
                    isSelected
                      ? 'border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.35)] ring-2 ring-[#00E5FF]/70 bg-[#0E2238] scale-[1.01]'
                      : 'border-[#182A40] hover:border-[#223A57] hover:bg-[#0A1422]'
                  }`}
                >
                  <div>
                    {/* Genuine Distinct Satellite Crop Thumbnail with Lazy Loading & Correct Aspect Ratio */}
                    <div className="relative aspect-[16/10] bg-[#0E1B2D] rounded-lg overflow-hidden border border-[#182A40] mb-2">
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        style={{ imageRendering: 'auto' }}
                      />

                      {/* Top Overlay: Match Score & Location Badge */}
                      <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                        {/* Primary Match Score */}
                        <span className="font-mono text-white text-[11px] font-bold px-1.5 py-0.5 bg-[#070D16]/95 border border-[#182A40] rounded shadow-md backdrop-blur flex items-center space-x-1">
                          <span className="text-[#00E5FF]">{card.confidencePct}%</span>
                          <span className="text-[9px] text-[#94A3B8] font-normal border-l border-[#182A40] pl-1">match</span>
                        </span>

                        {/* Location Tag */}
                        <span className="px-1.5 py-0.5 rounded bg-[#0E1A2B]/90 border border-[#182A40] text-[10px] font-medium text-white truncate max-w-[90px] shadow backdrop-blur">
                          {locationStr}
                        </span>
                      </div>

                      {/* Bottom Overlay: Change Type Badge */}
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 pointer-events-none">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-[#070D16]/90 border border-[#0284C7]/60 text-[9px] font-semibold text-[#38BDF8] truncate max-w-full shadow backdrop-blur">
                          {changeTypeStr}
                        </span>
                      </div>
                    </div>

                    {/* Card Title */}
                    <h4
                      className="text-xs font-semibold text-white tracking-normal leading-snug line-clamp-1 mb-1 font-sans group-hover:text-[#38BDF8] transition"
                      title={card.title}
                    >
                      {card.title}
                    </h4>

                    {/* Card Forensic Metadata list */}
                    <div className="space-y-0.5 text-[10px] text-[#94A3B8] font-sans">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Observation:</span>
                        <span className="font-mono text-white font-medium">{obsPeriodStr}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Sensor / Res:</span>
                        <span className="font-mono text-[#38BDF8] truncate max-w-[120px]">{card.sensor}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Coordinates:</span>
                        <span className="font-mono text-[#94A3B8] truncate max-w-[120px] group-hover:text-white transition">
                          {card.coordinates}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Open Analysis Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectResult) onSelectResult(card);
                    }}
                    className={`mt-2 w-full h-7 px-3 rounded-lg border text-xs font-sans font-medium flex items-center justify-center space-x-1 transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#0E355A] border-[#0284C7] text-[#38BDF8]'
                        : 'bg-[#0E1B2D] group-hover:bg-[#132A46] border-[#182A40] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <span>{isSelected ? 'Target active' : 'Analyze target'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
      </div>
    </div>
  );
};
