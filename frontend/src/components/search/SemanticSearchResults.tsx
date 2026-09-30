import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Check } from 'lucide-react';
import {
  CANONICAL_LOCATIONS,
  locationToSearchResultItem,
  TimelinePass
} from '../../data/groundTruthTargets';

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
  country?: string;
  state?: string;
  region?: string;
  category?: string;
  description?: string;
  lat?: number;
  lon?: number;
  tacticalX?: number;
  tacticalY?: number;
  regionalX?: number;
  regionalY?: number;
  changeType?: string;
  observationPeriod?: string;
  cloudCover?: string;
  beforeCloudCover?: string;
  beforeDate?: string;
  resolution?: string;
  changePercentage?: string;
  changeMaskUrl?: string;
  passes?: TimelinePass[];
  relevanceScore?: number;
  areaHaValue?: number;
  areaM2Value?: number;
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

  const fallbackResults: SearchResultItem[] = CANONICAL_LOCATIONS.map(locationToSearchResultItem);

  const sourceData = items && items.length > 0 ? items : fallbackResults;

  // Sorting operation
  const searchResults = [...sourceData].sort((a, b) => {
    if (sortMethod === 'Confidence') return b.confidencePct - a.confidencePct;
    if (sortMethod === 'Date') return b.date.localeCompare(a.date);
    return 0; // Default Relevance
  });

  return (
    <div className="w-full h-full bg-surface border border-border rounded-md p-3 flex flex-col justify-between select-none shadow-subtle">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/80 font-sans shrink-0">
        <div className="flex items-center space-x-2">
          <Search className="w-3.5 h-3.5 text-text-2" />
          <h3 className="text-xs font-semibold text-text tracking-normal font-sans">
            Semantic search results
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-raised border border-border text-xs text-text-2 font-sans">
            <span className="font-mono font-medium text-text">{searchResults.length}</span> locations retrieved
          </span>
        </div>

        {/* Sort Selector with interactive dropdown */}
        <div className="relative font-sans">
          <div
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center space-x-1.5 text-xs text-text-2 cursor-pointer hover:text-text"
          >
            <span>Sort:</span>
            <div className="h-6 flex items-center space-x-1 px-2 py-0.5 rounded-md bg-bg border border-border text-text">
              <span>{sortMethod}</span>
              <ChevronDown className="w-3 h-3 text-text-2" />
            </div>
          </div>

          {showSortMenu && (
            <div className="absolute top-7 right-0 w-36 bg-raised border border-border rounded-md shadow-subtle py-1 z-30 font-sans text-xs">
              {(['Relevance', 'Confidence', 'Date'] as const).map((m) => (
                <div
                  key={m}
                  onClick={() => {
                    setSortMethod(m);
                    setShowSortMenu(false);
                  }}
                  className={`flex items-center justify-between px-3 py-1.5 hover:bg-surface cursor-pointer ${
                    sortMethod === m ? 'text-accent font-medium' : 'text-text-2'
                  }`}
                >
                  <span>{m}</span>
                  {sortMethod === m && <Check className="w-3 h-3 text-accent" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5 Distinct Photographic Result Cards or Loading Skeleton / Empty State */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 flex-1 min-h-0 overflow-y-auto">
        {isSearching ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-bg rounded-md border border-border p-2 flex flex-col justify-between animate-pulse"
            >
              <div>
                <div className="aspect-[16/10] bg-raised rounded mb-2" />
                <div className="h-3.5 bg-raised rounded w-3/4 mb-2" />
                <div className="space-y-1.5">
                  <div className="h-2.5 bg-raised rounded w-1/2" />
                  <div className="h-2.5 bg-raised rounded w-2/3" />
                </div>
              </div>
              <div className="h-7 bg-raised rounded mt-2 w-full" />
            </div>
          ))
        ) : searchResults.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center text-text-2">
            <Search className="w-8 h-8 mb-2 opacity-40 text-text-2" />
            <span className="text-sm font-medium text-text">No locations found</span>
            <span className="text-xs text-text-2 mt-1">Try adjusting your query or filter parameters</span>
          </div>
        ) : (
          searchResults.map((card) => {
            const isSelected = selectedId === card.id;
            const locationStr = card.locationName || card.title.split(' ')[0] || 'Hazira';
            const changeTypeStr = card.changeType || 'Detected Change';

            return (
              <div
                key={card.id}
                id={`semantic-card-${card.id}`}
                tabIndex={0}
                onClick={() => onSelectResult && onSelectResult(card)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectResult && onSelectResult(card);
                  }
                }}
                className={`bg-bg rounded-md border p-2 flex flex-col justify-between transition-colors duration-150 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? 'border-accent ring-2 ring-accent/40 bg-surface shadow-subtle'
                    : 'border-border hover:border-text-2 hover:bg-raised/40'
                }`}
              >
                <div>
                  {/* Distinct Satellite Crop Thumbnail */}
                  <div className="relative aspect-[16/10] bg-surface rounded overflow-hidden border border-border mb-2">
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      style={{ imageRendering: 'auto' }}
                    />

                    {/* Top Overlay: Match Score & Location Badge */}
                    <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                      {/* Retrieval Relevance Score */}
                      <span className="font-mono text-text text-xs font-semibold px-1.5 py-0.5 bg-bg/90 border border-border rounded shadow-subtle flex items-center space-x-1" title="Retrieval Relevance">
                        <span className="text-accent">{card.confidencePct}%</span>
                        <span className="text-[10px] text-text-2 font-normal border-l border-border pl-1">Relevance</span>
                      </span>

                      {/* Location Tag */}
                      <span className="px-1.5 py-0.5 rounded bg-bg/90 border border-border text-[11px] text-text truncate max-w-[100px] shadow-subtle">
                        {locationStr}
                      </span>
                    </div>

                    {/* Bottom Overlay: Change Type Badge */}
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 pointer-events-none">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-bg/90 border border-border text-[10px] text-text-2 truncate max-w-full shadow-subtle">
                        {changeTypeStr}
                      </span>
                    </div>
                  </div>

                  {/* Card Title & Location */}
                  <h4
                    className="text-xs font-semibold text-text tracking-normal leading-snug line-clamp-1 mb-0.5 font-sans group-hover:text-accent transition-colors"
                    title={card.title}
                  >
                    {card.title}
                  </h4>
                  <div className="text-[11px] text-text-2 mb-1.5 flex items-center justify-between">
                    <span className="truncate max-w-[150px]">{card.state ? `${card.state}, ${card.country || 'India'}` : (card.country || 'India')}</span>
                    <span className="font-mono text-accent font-medium">{card.changePercentage || ''}</span>
                  </div>

                  {/* Card Forensic Metadata list */}
                  <div className="space-y-0.5 text-xs text-text-2 font-sans border-t border-border/60 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-text-2">Coordinates:</span>
                      <span className="font-mono text-text text-[11px] truncate max-w-[125px] tabular-nums" title={card.coordinates}>
                        {card.coordinates}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-text-2">Dates (B/A):</span>
                      <span className="font-mono text-text text-[11px] tabular-nums">
                        {card.beforeDate?.slice(0, 7) || '2023'} → {card.date?.slice(0, 7) || '2025'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-text-2">Area / Conf:</span>
                      <span className="font-mono text-text text-[11px] tabular-nums">
                        {card.areaHa?.split(' ')[0] || '4.2'} ha · <span className="text-accent">{card.confidencePct}%</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-text-2">Sensor:</span>
                      <span className="font-mono text-text-2 text-[10px] truncate max-w-[125px] tabular-nums" title={card.sensor}>
                        {card.sensor}
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
                  className={`mt-2 w-full h-7 px-3 rounded-md border text-xs font-sans font-medium flex items-center justify-center space-x-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isSelected
                      ? 'bg-raised border-accent text-accent'
                      : 'bg-raised hover:bg-surface border-border text-text'
                  }`}
                >
                  <span>{isSelected ? 'Location active' : 'Select location'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-text-2" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
