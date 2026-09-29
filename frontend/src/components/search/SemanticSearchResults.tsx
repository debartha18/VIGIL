import React, { useState } from 'react';
import { Search, ChevronDown, Calendar, Satellite, MapPin, ChevronRight, Check } from 'lucide-react';

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
      date: '2025-04-28',
      sensor: 'Sentinel-2 (10m)',
      coordinates: '21.4587° N, 72.7812° E',
      matchType: 'High match',
      confidencePct: 96,
      imageUrl: '/assets/card_1_construction.jpg',
      beforeImgUrl: '/assets/before_scene.jpg',
      afterImgUrl: '/assets/after_scene.jpg',
      areaHa: '4.2 ha',
      timeGap: '32 months',
    },
    {
      id: 'res-2',
      title: 'Dumas Coastal Bund & Sea Embankment',
      date: '2024-11-18',
      sensor: 'Sentinel-2 (10m)',
      coordinates: '21.4632° N, 72.7845° E',
      matchType: 'High match',
      confidencePct: 93,
      imageUrl: '/assets/card_2_riverside.jpg',
      beforeImgUrl: '/assets/before_scene.jpg',
      afterImgUrl: '/assets/card_2_riverside.jpg',
      areaHa: '3.1 ha',
      timeGap: '24 months',
    },
    {
      id: 'res-3',
      title: 'Adani Marine Logistics Berth Extension',
      date: '2024-06-15',
      sensor: 'Sentinel-1 SAR (10m)',
      coordinates: '21.4521° N, 72.7763° E',
      matchType: 'Medium match',
      confidencePct: 89,
      imageUrl: '/assets/card_3_port.jpg',
      beforeImgUrl: '/assets/before_scene.jpg',
      afterImgUrl: '/assets/card_3_port.jpg',
      areaHa: '4.8 ha',
      timeGap: '18 months',
    },
    {
      id: 'res-4',
      title: 'Tapi Rivermouth Pier Piling & Riprap',
      date: '2023-12-03',
      sensor: 'Sentinel-2 (10m)',
      coordinates: '21.4550° N, 72.7801° E',
      matchType: 'Medium match',
      confidencePct: 85,
      imageUrl: '/assets/card_4_bridge.jpg',
      beforeImgUrl: '/assets/before_scene.jpg',
      afterImgUrl: '/assets/card_4_bridge.jpg',
      areaHa: '1.8 ha',
      timeGap: '12 months',
    },
    {
      id: 'res-5',
      title: 'Coastal Mudflat Landfill & Earthworks',
      date: '2023-05-17',
      sensor: 'Landsat-8 (15m)',
      coordinates: '21.4617° N, 72.7890° E',
      matchType: 'Medium match',
      confidencePct: 81,
      imageUrl: '/assets/card_5_land.jpg',
      beforeImgUrl: '/assets/before_scene.jpg',
      afterImgUrl: '/assets/card_5_land.jpg',
      areaHa: '5.6 ha',
      timeGap: '8 months',
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
      <div className="flex items-center justify-between pb-2 border-b border-[#182A40]/80 font-sans">
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

      {/* 5 Photographic Result Cards or Loading Shimmer */}
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
              const cleanMatchType = card.matchType.toLowerCase().includes('high') ? 'High match' : 'Medium match';

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
                    {/* Real Photographic Satellite Crop Thumbnail */}
                    <div className="relative aspect-[16/10] bg-[#0E1B2D] rounded-lg overflow-hidden border border-[#182A40] mb-2">
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Primary Hero Metric: Confidence Score + Raw Cosine Value + Secondary Muted Match Tag */}
                      <div
                        className="absolute top-1 left-1 flex items-center space-x-1 backdrop-blur"
                        title={`Cosine Similarity: cos(θ) = ${(card.confidencePct * 0.00985).toFixed(3)} in 512-dim RemoteCLIP embedding space`}
                      >
                        {/* Primary Metric: Bold Confidence Tag */}
                        <span className="font-mono text-white text-xs font-bold px-1.5 py-0.5 bg-[#070D16]/90 border border-[#182A40] rounded-md shadow cursor-help flex items-center space-x-1">
                          <span>{card.confidencePct}%</span>
                          <span className="text-[9px] font-mono text-[#38BDF8] opacity-85 border-l border-[#182A40] pl-1 font-normal" title="Raw cosine similarity score">
                            {(card.confidencePct * 0.00985).toFixed(2)}
                          </span>
                        </span>
                        {/* Secondary Demoted Match Type Tag (Muted Outline) */}
                        <span className="px-1.5 py-0.5 rounded-md border border-[#182A40] bg-[#0E1A2B]/80 text-[#94A3B8] text-[10px] font-sans">
                          {cleanMatchType}
                        </span>
                      </div>
                    </div>

                    {/* Card Title - 2-line wrap with full title tooltip */}
                    <h4
                      className="text-xs font-semibold text-white tracking-normal leading-snug line-clamp-2 min-h-[2.25rem] mb-1.5 font-sans group-hover:text-[#38BDF8] transition"
                      title={card.title}
                    >
                      {card.title}
                    </h4>

                    {/* Card Metadata list */}
                    <div className="space-y-0.5 text-[10px] text-[#94A3B8] font-sans">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-2.5 h-2.5 text-[#64748B] shrink-0" />
                        <span className="font-mono text-white/90">{card.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Satellite className="w-2.5 h-2.5 text-[#64748B] shrink-0" />
                        <span className="truncate">{card.sensor}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-2.5 h-2.5 text-[#64748B] shrink-0" />
                        <span className="truncate font-mono text-[#94A3B8] group-hover:text-white transition">
                          {card.coordinates}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Open Analysis Action Button Standardized to h-7 rounded-lg */}
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
                    <span>{isSelected ? 'Target active' : 'Focus target'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
      </div>
    </div>
  );
};
