import React, { useState, useRef, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Sparkles,
  ShieldAlert,
  FileText,
  RotateCcw,
  Sliders,
  AlertCircle,
  Printer,
  Download,
  X,
  Plus,
  Minus,
  ExternalLink
} from 'lucide-react';

export type BorderChangeType =
  | 'New Construction'
  | 'Structural Expansion'
  | 'Road Development'
  | 'Land Clearance'
  | 'Water-Extent Change'
  | 'Vegetation Change'
  | 'Other';

export interface TimelineStep {
  year: number;
  date: string;
  stage: string;
  status: string;
  notes: string;
  imgUrl: string;
}

export interface BorderLocationItem {
  id: string;
  name: string;
  region: string;
  changeType: BorderChangeType;
  confidence: number;
  coordinates: string;
  lat: number;
  lon: number;
  mapX: number; // percentage on map
  mapY: number; // percentage on map
  borderDistanceKm: number;
  borderDistanceStr: string;
  observationPeriod: string;
  changedArea: string;
  changedAreaM2: number;
  source: string;
  beforeDate: string;
  afterDate: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  description: string;
  ndbiDelta: string;
  ndviDelta: string;
  timelineProgression: TimelineStep[];
  keywords: string[];
}

export const DEMO_BORDER_LOCATIONS: BorderLocationItem[] = [
  {
    id: 'LOC-STRAT-01',
    name: 'High-Altitude Valley Modular Deck & Pylons',
    region: 'Northern High-Altitude Sector',
    changeType: 'New Construction',
    confidence: 94,
    coordinates: '34.2185° N, 77.5840° E',
    lat: 34.2185,
    lon: 77.5840,
    mapX: 42,
    mapY: 22,
    borderDistanceKm: 4.2,
    borderDistanceStr: '4.2 km from International Boundary',
    observationPeriod: '2023 → 2026',
    changedArea: '32,500 m² (3.2 ha)',
    changedAreaM2: 32500,
    source: 'Sentinel-2 (10m Optical)',
    beforeDate: '2023-04-18',
    afterDate: '2026-02-24',
    beforeImageUrl: '/assets/before_scene.jpg',
    afterImageUrl: '/assets/card_1_construction.jpg',
    description: 'Newly identified structural foundation pads, perimeter grading, and prefabricated modular shelters erected on previously unpaved valley terrain.',
    ndbiDelta: '+0.38 NDBI',
    ndviDelta: '-0.21 NDVI',
    keywords: ['construction', 'new', 'buildings', 'structure', 'deck', 'valley', 'north', 'near', 'border'],
    timelineProgression: [
      { year: 2022, date: '2022-05-10', stage: 'Baseline Terrain', status: 'No significant change', notes: 'Natural mountain scree and alluvial fan without artificial features.', imgUrl: '/assets/before_scene.jpg' },
      { year: 2023, date: '2023-04-18', stage: 'Surveying & Access Track', status: 'Initial clearing detected', notes: 'Initial vehicle tracks and survey markers identified.', imgUrl: '/assets/before_scene.jpg' },
      { year: 2024, date: '2024-06-22', stage: 'Earthworks & Foundation Pits', status: 'Excavation active', notes: 'Earth leveling across 2.1 hectares, excavation pits visible.', imgUrl: '/assets/card_5_land.jpg' },
      { year: 2025, date: '2025-07-14', stage: 'Structural Erection', status: 'Vertical structures visible', notes: 'Multiple concrete foundation slabs and framing erected.', imgUrl: '/assets/card_1_construction.jpg' },
      { year: 2026, date: '2026-02-24', stage: 'Completed Structural Deck', status: 'Completed expansion', notes: 'Fully surfaced modular deck with perimeter enclosure.', imgUrl: '/assets/card_1_construction.jpg' }
    ]
  },
  {
    id: 'LOC-STRAT-02',
    name: 'Mountain Pass Lateral Road Paving & Corridor',
    region: 'Northern High-Altitude Sector',
    changeType: 'Road Development',
    confidence: 96,
    coordinates: '33.8420° N, 78.4110° E',
    lat: 33.8420,
    lon: 78.4110,
    mapX: 47,
    mapY: 26,
    borderDistanceKm: 2.8,
    borderDistanceStr: '2.8 km from International Boundary',
    observationPeriod: '2023 → 2026',
    changedArea: '78,000 m² (12.4 km corridor)',
    changedAreaM2: 78000,
    source: 'Sentinel-1 (SAR C-Band)',
    beforeDate: '2023-06-12',
    afterDate: '2026-01-19',
    beforeImageUrl: '/assets/before_scene.jpg',
    afterImageUrl: '/assets/card_4_bridge.jpg',
    description: 'Linear road widening from unpaved dirt track to dual-lane all-weather asphalt corridor, including cut-and-fill slope stabilization and culvert bridges.',
    ndbiDelta: '+0.29 NDBI',
    ndviDelta: '-0.18 NDVI',
    keywords: ['road', 'development', 'widening', 'pass', 'highway', 'transport', 'paving', 'near', 'border'],
    timelineProgression: [
      { year: 2022, date: '2022-07-04', stage: 'Narrow Dirt Track', status: 'No significant change', notes: 'Single-lane unpaved dirt path vulnerable to seasonal snow.', imgUrl: '/assets/before_scene.jpg' },
      { year: 2023, date: '2023-06-12', stage: 'Slope Blasting & Clearing', status: 'Corridor widening started', notes: 'Earth clearing and rock slope blasting along 6 km corridor.', imgUrl: '/assets/card_5_land.jpg' },
      { year: 2024, date: '2024-08-19', stage: 'Sub-Base Grading', status: 'Heavy machinery active', notes: 'Aggregate sub-base laid and compacted across 12 km stretch.', imgUrl: '/assets/card_4_bridge.jpg' },
      { year: 2025, date: '2025-05-30', stage: 'Bituminous Surfacing', status: 'Paving underway', notes: 'Black-top asphalt layer applied with drainage channels.', imgUrl: '/assets/card_4_bridge.jpg' },
      { year: 2026, date: '2026-01-19', stage: 'All-Weather Highway', status: 'Operational corridor', notes: 'Completed dual-lane transit corridor with reinforced retention.', imgUrl: '/assets/card_4_bridge.jpg' }
    ]
  },
  {
    id: 'LOC-STRAT-03',
    name: 'Border Logistics Terminal Structural Expansion',
    region: 'Western Arid Sector',
    changeType: 'Structural Expansion',
    confidence: 91,
    coordinates: '27.1850° N, 70.9200° E',
    lat: 27.1850,
    lon: 70.9200,
    mapX: 25,
    mapY: 45,
    borderDistanceKm: 7.5,
    borderDistanceStr: '7.5 km from International Boundary',
    observationPeriod: '2022 → 2026',
    changedArea: '54,000 m² (5.4 ha)',
    changedAreaM2: 54000,
    source: 'Sentinel-2 (10m Optical)',
    beforeDate: '2022-10-15',
    afterDate: '2026-02-10',
    beforeImageUrl: '/assets/before_scene.jpg',
    afterImageUrl: '/assets/card_3_port.jpg',
    description: 'Substantial expansion of an existing storage terminal, adding 3 large covered warehousing units, hardened concrete apron, and container stacking bays.',
    ndbiDelta: '+0.44 NDBI',
    ndviDelta: '-0.14 NDVI',
    keywords: ['structural', 'expansion', 'warehouse', 'logistics', 'terminal', 'buildings', 'west', 'border'],
    timelineProgression: [
      { year: 2022, date: '2022-10-15', stage: 'Initial Terminal', status: 'Baseline operational size', notes: 'Existing compact depot with limited uncovered parking.', imgUrl: '/assets/before_scene.jpg' },
      { year: 2023, date: '2023-11-20', stage: 'Perimeter Extension', status: 'Land boundary expanded', notes: 'Security perimeter fence relocated outward by 250 meters.', imgUrl: '/assets/card_5_land.jpg' },
      { year: 2024, date: '2024-04-12', stage: 'Foundation Pouring', status: 'Construction active', notes: 'Concrete slabs poured for 3 industrial warehouse footprints.', imgUrl: '/assets/card_1_construction.jpg' },
      { year: 2025, date: '2025-08-05', stage: 'Roof Truss Assembly', status: 'Structural erection', notes: 'Large span roof trusses installed on warehousing units.', imgUrl: '/assets/card_3_port.jpg' },
      { year: 2026, date: '2026-02-10', stage: 'Expanded Logistics Hub', status: 'Fully expanded footprint', notes: 'Operational logistics complex with high-capacity bays.', imgUrl: '/assets/card_3_port.jpg' }
    ]
  },
  {
    id: 'LOC-STRAT-04',
    name: 'Riverine Island Land Clearance & Silt Embankment',
    region: 'Eastern Riparian Sector',
    changeType: 'Land Clearance',
    confidence: 88,
    coordinates: '26.2400° N, 89.8200° E',
    lat: 26.2400,
    lon: 89.8200,
    mapX: 74,
    mapY: 42,
    borderDistanceKm: 1.6,
    borderDistanceStr: '1.6 km from International Boundary',
    observationPeriod: '2023 → 2025',
    changedArea: '46,000 m² (4.6 ha)',
    changedAreaM2: 46000,
    source: 'Sentinel-2 (10m Optical)',
    beforeDate: '2023-03-29',
    afterDate: '2025-11-14',
    beforeImageUrl: '/assets/before_scene.jpg',
    afterImageUrl: '/assets/card_5_land.jpg',
    description: 'Systematic vegetation removal and mechanical leveling across riverine silt island, with linear bund earthworks to prevent seasonal high-water inundation.',
    ndbiDelta: '+0.22 NDBI',
    ndviDelta: '-0.36 NDVI',
    keywords: ['land', 'clearance', 'vegetation', 'river', 'island', 'riparian', 'east', 'border', 'cleared'],
    timelineProgression: [
      { year: 2022, date: '2022-04-02', stage: 'Dense Riparian Vegetation', status: 'Natural reed cover', notes: 'Dense seasonal reeds, scrub, and undisturbed silt sandbars.', imgUrl: '/assets/before_scene.jpg' },
      { year: 2023, date: '2023-03-29', stage: 'Canopy Thinning', status: 'Vegetation clearance detected', notes: 'Systematic clearing of brush across north-south strip.', imgUrl: '/assets/before_scene.jpg' },
      { year: 2024, date: '2024-02-18', stage: 'Bulldozer Leveling', status: 'Bare earth exposed', notes: 'Mechanical soil leveling across 4.6 hectares.', imgUrl: '/assets/card_5_land.jpg' },
      { year: 2025, date: '2025-11-14', stage: 'Consolidated Bund', status: 'Earthworks stabilized', notes: 'Compacted earthen bund with perimeter drainage ditches.', imgUrl: '/assets/card_5_land.jpg' },
      { year: 2026, date: '2026-01-20', stage: 'Prepared Open Surface', status: 'Ready for use', notes: 'Maintained dry surface above seasonal flood watermark.', imgUrl: '/assets/card_5_land.jpg' }
    ]
  },
  {
    id: 'LOC-STRAT-05',
    name: 'Riparian Boundary Stream Culvert & Embankment',
    region: 'Eastern Riparian Sector',
    changeType: 'Water-Extent Change',
    confidence: 92,
    coordinates: '25.1800° N, 91.8600° E',
    lat: 25.1800,
    lon: 91.8600,
    mapX: 79,
    mapY: 48,
    borderDistanceKm: 3.1,
    borderDistanceStr: '3.1 km from International Boundary',
    observationPeriod: '2022 → 2026',
    changedArea: '29,000 m² (2.9 ha)',
    changedAreaM2: 29000,
    source: 'Sentinel-1 (SAR C-Band)',
    beforeDate: '2022-12-05',
    afterDate: '2026-02-01',
    beforeImageUrl: '/assets/before_scene.jpg',
    afterImageUrl: '/assets/card_2_riverside.jpg',
    description: 'Dynamic alteration of boundary stream watercourse, installation of 4-barrel box culverts, and stone gabion embankment revetment.',
    ndbiDelta: '+0.18 NDBI',
    ndviDelta: '-0.12 NDVI',
    keywords: ['water', 'stream', 'river', 'culvert', 'crossing', 'embankment', 'extent', 'border'],
    timelineProgression: [
      { year: 2022, date: '2022-12-05', stage: 'Natural Braided Stream', status: 'Baseline hydrography', notes: 'Meandering shallow watercourse without crossing structures.', imgUrl: '/assets/before_scene.jpg' },
      { year: 2023, date: '2023-10-14', stage: 'Stream Diversion', status: 'Channel diverted', notes: 'Temporary coffer dam and diversion ditch excavated.', imgUrl: '/assets/card_2_riverside.jpg' },
      { year: 2024, date: '2024-11-25', stage: 'Culvert Box Placement', status: 'Concrete placement', notes: 'Precast concrete box culvert barrels aligned in streambed.', imgUrl: '/assets/card_4_bridge.jpg' },
      { year: 2025, date: '2025-09-18', stage: 'Stone Gabions Laid', status: 'Bank revetment active', notes: 'Wire-mesh stone gabion mattresses placed on both banks.', imgUrl: '/assets/card_2_riverside.jpg' },
      { year: 2026, date: '2026-02-01', stage: 'Stabilized Crossing', status: 'Revetment completed', notes: 'All-weather watercourse crossing with stabilized banks.', imgUrl: '/assets/card_2_riverside.jpg' }
    ]
  },
  {
    id: 'LOC-STRAT-06',
    name: 'Ridge Trail Telemetry Mast Footing & Canopy Clearing',
    region: 'Central Himalayan Sector',
    changeType: 'Vegetation Change',
    confidence: 89,
    coordinates: '30.4150° N, 79.9120° E',
    lat: 30.4150,
    lon: 79.9120,
    mapX: 52,
    mapY: 34,
    borderDistanceKm: 8.2,
    borderDistanceStr: '8.2 km from International Boundary',
    observationPeriod: '2023 → 2026',
    changedArea: '38,000 m² (3.8 ha)',
    changedAreaM2: 38000,
    source: 'Landsat-8/9 (15m)',
    beforeDate: '2023-05-11',
    afterDate: '2026-01-28',
    beforeImageUrl: '/assets/before_scene.jpg',
    afterImageUrl: '/assets/card_5_land.jpg',
    description: 'Noticeable canopy thinning and pine forest clearing along high-altitude ridge, with circular earth pad graded for telecommunication relay footing.',
    ndbiDelta: '+0.31 NDBI',
    ndviDelta: '-0.39 NDVI',
    keywords: ['vegetation', 'forest', 'canopy', 'clearing', 'mast', 'ridge', 'himalayan', 'border'],
    timelineProgression: [
      { year: 2022, date: '2022-06-15', stage: 'Continuous Pine Canopy', status: 'Dense forest cover', notes: 'Undisturbed temperate conifer forest canopy on ridge spine.', imgUrl: '/assets/before_scene.jpg' },
      { year: 2023, date: '2023-05-11', stage: 'Trail Clearing', status: 'Linear gap emerging', notes: 'Access path cleared along watershed ridge line.', imgUrl: '/assets/before_scene.jpg' },
      { year: 2024, date: '2024-07-20', stage: 'Circular Cleared Pad', status: 'Canopy cleared', notes: 'Roughly 1.5-hectare circular opening logged and stumped.', imgUrl: '/assets/card_5_land.jpg' },
      { year: 2025, date: '2025-06-04', stage: 'Foundation & Guy Anchors', status: 'Foundation visible', notes: 'Central concrete mast pad and four guy-wire anchor points.', imgUrl: '/assets/card_1_construction.jpg' },
      { year: 2026, date: '2026-01-28', stage: 'Operational Mast Site', status: 'Maintained opening', notes: 'Paved equipment pad with fenced perimeter on cleared ridge.', imgUrl: '/assets/card_5_land.jpg' }
    ]
  }
];

interface BorderStrategicAnalysisViewProps {
  onNavigateToSemanticSearch?: () => void;
}

export const BorderStrategicAnalysisView: React.FC<BorderStrategicAnalysisViewProps> = ({
  onNavigateToSemanticSearch
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedDistance, setSelectedDistance] = useState<string>('All');
  const [selectedConfidence, setSelectedConfidence] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('All');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Active Location State
  const [activeLocationId, setActiveLocationId] = useState<string>('LOC-STRAT-01');
  const [activeTimelineYear, setActiveTimelineYear] = useState<number>(2026);

  // Comparison Workspace State
  const [viewMode, setViewMode] = useState<'dual' | 'swipe'>('dual');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage for swipe curtain

  // Map Controls State
  const [mapZoom, setMapZoom] = useState(1.0);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [analystNotes, setAnalystNotes] = useState(
    'Initial AI multi-temporal change detection verified against Sentinel-2 10m L2A imagery. Visual difference confirms new structural expansion within 5 km of boundary line. Requires ground-level/high-resolution confirmation prior to briefing.'
  );

  const activeLocation = useMemo(() => {
    return DEMO_BORDER_LOCATIONS.find((l) => l.id === activeLocationId) || DEMO_BORDER_LOCATIONS[0];
  }, [activeLocationId]);

  // Timeline Step for active location and active year
  const activeTimelineStep = useMemo(() => {
    return (
      activeLocation.timelineProgression.find((t) => t.year === activeTimelineYear) ||
      activeLocation.timelineProgression[activeLocation.timelineProgression.length - 1]
    );
  }, [activeLocation, activeTimelineYear]);

  // Natural-Language Semantic Search & Filtering Engine
  const filteredLocations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const queryTerms = q.replace(/["']/g, '').split(/\s+/).filter((t) => t.length > 2);

    return DEMO_BORDER_LOCATIONS.filter((loc) => {
      // 1. Text Query Filter & Ranking
      if (queryTerms.length > 0) {
        const matchesTerm = queryTerms.some(
          (t) =>
            loc.name.toLowerCase().includes(t) ||
            loc.changeType.toLowerCase().includes(t) ||
            loc.region.toLowerCase().includes(t) ||
            loc.description.toLowerCase().includes(t) ||
            loc.keywords.some((k) => k.includes(t) || t.includes(k))
        );
        if (!matchesTerm) return false;
      }

      // 2. Change Type Filter
      if (selectedType !== 'All' && loc.changeType !== selectedType) {
        return false;
      }

      // 3. Region Filter
      if (selectedRegion !== 'All' && loc.region !== selectedRegion) {
        return false;
      }

      // 4. Distance Filter
      if (selectedDistance === '< 5 km' && loc.borderDistanceKm >= 5) return false;
      if (selectedDistance === '< 15 km' && loc.borderDistanceKm >= 15) return false;
      if (selectedDistance === '< 30 km' && loc.borderDistanceKm >= 30) return false;

      // 5. Confidence Filter
      if (selectedConfidence === '90%+' && loc.confidence < 90) return false;
      if (selectedConfidence === '95%+' && loc.confidence < 95) return false;

      // 6. Source Filter
      if (selectedSource !== 'All' && !loc.source.toLowerCase().includes(selectedSource.toLowerCase())) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Prioritize smaller distance and higher confidence
      return a.borderDistanceKm - b.borderDistanceKm || b.confidence - a.confidence;
    });
  }, [searchQuery, selectedType, selectedRegion, selectedDistance, selectedConfidence, selectedSource]);

  // Handle Swipe Slider Drag
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const offset = Math.max(0, Math.min(rect.width, clientX - rect.left));
    setSliderPosition((offset / rect.width) * 100);
  };

  // Preset Searches
  const exampleSearches = [
    'Find newly constructed structures near an international border',
    'Show areas with road development between 2023 and 2026',
    'Find regions where construction activity increased',
    'Show land-use changes near a border'
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#070D16] text-white font-sans overflow-y-auto select-none">
      {/* 1. TOP HEADER & PUBLIC DEMO BADGE */}
      <div className="bg-[#0B1523]/95 border-b border-[#182A40] px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-[#00E5FF]" />
            <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Border & Strategic Change Analysis
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0284C7]/20 text-[#38BDF8] border border-[#0284C7]/40 tracking-wider">
              PUBLIC IMAGERY DEMO
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Analyze publicly available satellite imagery for multi-temporal geospatial changes near international borders.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Neutral disclaimer badge */}
          <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#0E1A2B] border border-[#182A40] text-[11px] text-[#94A3B8]">
            <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>AI-assisted detection. Analyst verification required.</span>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="h-8 px-3 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Change Report</span>
          </button>
        </div>
      </div>

      {/* 2. DASHBOARD KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 p-3 sm:px-6 sm:py-3 bg-[#070D16] border-b border-[#182A40]/80">
        <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-2.5">
          <div className="text-[10px] uppercase font-bold text-[#64748B] flex items-center justify-between">
            <span>Locations Analyzed</span>
            <span className="text-[9px] font-mono text-[#00E5FF]">DEMO</span>
          </div>
          <div className="text-lg font-bold font-mono text-white mt-1">142</div>
          <div className="text-[10px] text-[#94A3B8] truncate">Public boundary sectors</div>
        </div>

        <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-2.5">
          <div className="text-[10px] uppercase font-bold text-[#64748B] flex items-center justify-between">
            <span>Changes Detected</span>
            <span className="text-[9px] font-mono text-[#38BDF8]">MULTI-TEMP</span>
          </div>
          <div className="text-lg font-bold font-mono text-[#38BDF8] mt-1">28</div>
          <div className="text-[10px] text-[#94A3B8] truncate">Verified temporal shifts</div>
        </div>

        <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-2.5">
          <div className="text-[10px] uppercase font-bold text-[#64748B] flex items-center justify-between">
            <span>Construction Changes</span>
            <span className="text-[9px] font-mono text-[#F59E0B]">FOOTPRINT</span>
          </div>
          <div className="text-lg font-bold font-mono text-[#F59E0B] mt-1">14</div>
          <div className="text-[10px] text-[#94A3B8] truncate">New structures / decks</div>
        </div>

        <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-2.5">
          <div className="text-[10px] uppercase font-bold text-[#64748B] flex items-center justify-between">
            <span>Road Changes</span>
            <span className="text-[9px] font-mono text-[#10B981]">CORRIDORS</span>
          </div>
          <div className="text-lg font-bold font-mono text-[#10B981] mt-1">9</div>
          <div className="text-[10px] text-[#94A3B8] truncate">Widening & paving</div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-[#0B1523] border border-[#182A40] rounded-xl p-2.5">
          <div className="text-[10px] uppercase font-bold text-[#64748B] flex items-center justify-between">
            <span>Average Confidence</span>
            <span className="text-[9px] font-mono text-[#A855F7]">SIH26227</span>
          </div>
          <div className="text-lg font-bold font-mono text-[#A855F7] mt-1">93.4%</div>
          <div className="text-[10px] text-[#94A3B8] truncate">Analyst validation model</div>
        </div>
      </div>

      {/* 3. NATURAL-LANGUAGE SEARCH & MULTI-FILTER BAR */}
      <div className="px-3 sm:px-6 py-3 bg-[#0A121F] border-b border-[#182A40]">
        <div className="flex flex-col gap-2">
          {/* Main Search Bar */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 flex items-center bg-[#070D16] border border-[#182A40] focus-within:border-[#00E5FF] rounded-xl px-3 py-2 transition shadow">
              <Search className="w-4 h-4 text-[#64748B] mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for changes near an international border..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-[#475569] outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[#64748B] hover:text-white p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFiltersModal(!showFiltersModal)}
              className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
                selectedType !== 'All' || selectedRegion !== 'All' || selectedDistance !== 'All'
                  ? 'bg-[#0E355A] border-[#00E5FF] text-[#00E5FF]'
                  : 'bg-[#0E1A2B] border-[#182A40] text-[#94A3B8] hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Example Search Query Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-bold text-[#64748B] uppercase shrink-0">Examples:</span>
            {exampleSearches.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(ex)}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-[#94A3B8] hover:text-white whitespace-nowrap transition cursor-pointer shrink-0"
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Expanded Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 text-xs">
            {/* Change Type Filter */}
            <div className="flex items-center space-x-1 shrink-0">
              <span className="text-[10px] text-[#64748B] uppercase font-bold">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-[#070D16] border border-[#182A40] text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-[#00E5FF]"
              >
                <option value="All">All Change Types</option>
                <option value="New Construction">New Construction</option>
                <option value="Structural Expansion">Structural Expansion</option>
                <option value="Road Development">Road Development</option>
                <option value="Land Clearance">Land Clearance</option>
                <option value="Water-Extent Change">Water-Extent Change</option>
                <option value="Vegetation Change">Vegetation Change</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Region Filter */}
            <div className="flex items-center space-x-1 shrink-0">
              <span className="text-[10px] text-[#64748B] uppercase font-bold">Sector:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-[#070D16] border border-[#182A40] text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-[#00E5FF]"
              >
                <option value="All">All Sectors</option>
                <option value="Northern High-Altitude Sector">Northern Sector</option>
                <option value="Western Arid Sector">Western Sector</option>
                <option value="Eastern Riparian Sector">Eastern Sector</option>
                <option value="Central Himalayan Sector">Central Himalayan</option>
              </select>
            </div>

            {/* Distance Filter */}
            <div className="flex items-center space-x-1 shrink-0">
              <span className="text-[10px] text-[#64748B] uppercase font-bold">Distance:</span>
              <select
                value={selectedDistance}
                onChange={(e) => setSelectedDistance(e.target.value)}
                className="bg-[#070D16] border border-[#182A40] text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-[#00E5FF]"
              >
                <option value="All">All Distances</option>
                <option value="< 5 km">&lt; 5 km from border</option>
                <option value="< 15 km">&lt; 15 km from border</option>
                <option value="< 30 km">&lt; 30 km from border</option>
              </select>
            </div>

            {/* Confidence Filter */}
            <div className="flex items-center space-x-1 shrink-0">
              <span className="text-[10px] text-[#64748B] uppercase font-bold">Confidence:</span>
              <select
                value={selectedConfidence}
                onChange={(e) => setSelectedConfidence(e.target.value)}
                className="bg-[#070D16] border border-[#182A40] text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-[#00E5FF]"
              >
                <option value="All">All Confidence</option>
                <option value="90%+">90%+ Confidence</option>
                <option value="95%+">95%+ Confidence</option>
              </select>
            </div>

            {/* Satellite Source Filter */}
            <div className="flex items-center space-x-1 shrink-0">
              <span className="text-[10px] text-[#64748B] uppercase font-bold">Source:</span>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="bg-[#070D16] border border-[#182A40] text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-[#00E5FF]"
              >
                <option value="All">All Sensors</option>
                <option value="Sentinel-2">Sentinel-2 (10m)</option>
                <option value="Sentinel-1">Sentinel-1 (SAR)</option>
                <option value="Landsat">Landsat-8/9 (15m)</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center space-x-1 shrink-0">
              <span className="text-[10px] text-[#64748B] uppercase font-bold">Period:</span>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="bg-[#070D16] border border-[#182A40] text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-[#00E5FF]"
              >
                <option value="All">All Observation Periods</option>
                <option value="2023">2023 → 2026</option>
                <option value="2022">2022 → 2026</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(selectedType !== 'All' || selectedRegion !== 'All' || selectedDistance !== 'All' || selectedConfidence !== 'All' || selectedSource !== 'All' || selectedDateRange !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedType('All');
                  setSelectedRegion('All');
                  setSelectedDistance('All');
                  setSelectedConfidence('All');
                  setSelectedSource('All');
                  setSelectedDateRange('All');
                  setSearchQuery('');
                }}
                className="px-2 py-1 rounded bg-[#0E1A2B] hover:bg-[#15273F] text-[#38BDF8] text-[11px] font-medium transition cursor-pointer shrink-0"
              >
                Reset Filters
              </button>
            )}

            {/* Result Count */}
            <span className="ml-auto text-[11px] font-mono text-[#00E5FF] shrink-0 font-bold">
              {filteredLocations.length} relevant locations found
            </span>
          </div>
        </div>
      </div>

      {/* 4. MAIN WORKSPACE: MAP & LOCATION CAROUSEL (Left) + COMPARISON & ANALYST PANEL (Right) */}
      <div className="p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (7 cols): Interactive Map + Multi-Year Timeline + Locations List */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          {/* Interactive Border Map */}
          <div className="bg-[#0B1523] border border-[#182A40] rounded-xl overflow-hidden shadow-2xl relative flex flex-col h-[380px] sm:h-[420px]">
            {/* Map Top Bar */}
            <div className="h-9 px-3 bg-[#070D16]/90 border-b border-[#182A40] flex items-center justify-between z-20 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="font-bold text-white">Border Observation Map</span>
                <span className="text-[10px] text-[#64748B] font-mono">10m Public Imagery</span>
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-[#94A3B8] font-mono">
                <span>Selected: {activeLocation.coordinates}</span>
              </div>
            </div>

            {/* Map Canvas Layer */}
            <div
              className="flex-1 relative overflow-hidden select-none bg-[#020617] cursor-crosshair"
              style={{
                backgroundImage: "url('/assets/satellite_map_base.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Transformable Canvas Layer */}
              <div
                className="w-full h-full relative transition-transform duration-75"
                style={{
                  transform: `translate(${mapPan.x}px, ${mapPan.y}px) scale(${mapZoom})`,
                  transformOrigin: 'center center'
                }}
              >
                {/* Stylized International Border Line Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none">
                  {/* Border Buffer Zone Corridor (Yellow translucent band) */}
                  <path
                    d="M 50 150 Q 250 180 500 240 T 950 340"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="28"
                    strokeOpacity="0.15"
                  />
                  {/* International Border Line (Red/Amber dashed) */}
                  <path
                    d="M 50 150 Q 250 180 500 240 T 950 340"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2.5"
                    strokeDasharray="8 5"
                    strokeOpacity="0.85"
                  />
                  <text x="120" y="140" fill="#EF4444" fontSize="10" fontFamily="monospace" fontWeight="bold" letterSpacing="2">
                    --- INTERNATIONAL BOUNDARY BUFFER (PUBLIC REFERENCE LINE) ---
                  </text>
                  <text x="620" y="270" fill="#EF4444" fontSize="9" fontFamily="monospace" opacity="0.8">
                    10-KM STRATEGIC SURVEILLANCE CORRIDOR
                  </text>
                </svg>

                {/* Detected Change Location Pins */}
                {filteredLocations.map((loc) => {
                  const isSelected = activeLocation.id === loc.id;
                  let pinColor = '#F59E0B';
                  if (loc.changeType === 'Road Development') pinColor = '#38BDF8';
                  else if (loc.changeType === 'Water-Extent Change') pinColor = '#00E5FF';
                  else if (loc.changeType === 'Vegetation Change') pinColor = '#10B981';
                  else if (loc.changeType === 'Structural Expansion') pinColor = '#F97316';

                  return (
                    <div
                      key={loc.id}
                      onClick={() => setActiveLocationId(loc.id)}
                      className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                      style={{ left: `${loc.mapX}%`, top: `${loc.mapY}%` }}
                    >
                      {/* Pulse Wave */}
                      <div
                        className="absolute inset-0 -m-3 rounded-full opacity-75 animate-ping"
                        style={{ backgroundColor: pinColor, animationDuration: isSelected ? '1.5s' : '3.5s' }}
                      />

                      {/* Pin Center Marker */}
                      <div
                        className={`relative rounded-full border-2 transition-all flex items-center justify-center shadow-lg ${
                          isSelected ? 'w-6 h-6 border-white shadow-[0_0_20px_#00E5FF]' : 'w-4 h-4 border-[#070D16] group-hover:scale-110'
                        }`}
                        style={{ backgroundColor: pinColor }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>

                      {/* Pin Tag Card */}
                      <div
                        className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1.5 rounded-lg border text-[10px] font-sans transition-all shadow-2xl backdrop-blur-md ${
                          isSelected
                            ? 'bg-[#070D16]/95 border-[#00E5FF] text-white shadow-[0_0_15px_rgba(0,229,255,0.4)] z-30 scale-105'
                            : 'bg-[#0B1523]/90 border-[#182A40] text-[#94A3B8] group-hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 font-bold">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pinColor }} />
                          <span>{loc.id}</span>
                          <span className="text-[#00E5FF]">• {loc.changeType}</span>
                        </div>
                        <div className="text-[9px] font-mono text-[#F59E0B]">
                          {loc.borderDistanceStr}
                        </div>
                      </div>

                      {/* Bounding Polygon Box for selected target */}
                      {isSelected && (
                        <div className="absolute -left-12 -top-12 w-24 h-24 border-2 border-dashed border-[#00E5FF] rounded-lg pointer-events-none animate-pulse">
                          <span className="absolute -top-4 left-0 bg-[#00E5FF] text-[#070D16] text-[8px] font-mono font-bold px-1 rounded">
                            AOI BOUNDING BOX
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Map Zoom Controls */}
              <div className="absolute bottom-3 right-3 z-30 flex flex-col space-y-1">
                <button
                  onClick={() => setMapZoom((z) => Math.min(z + 0.25, 3.0))}
                  className="w-7 h-7 rounded-lg bg-[#0E1A2B]/90 hover:bg-[#15273F] border border-[#182A40] text-white flex items-center justify-center transition cursor-pointer shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setMapZoom((z) => Math.max(z - 0.25, 0.75))}
                  className="w-7 h-7 rounded-lg bg-[#0E1A2B]/90 hover:bg-[#15273F] border border-[#182A40] text-white flex items-center justify-center transition cursor-pointer shadow"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setMapPan({ x: 0, y: 0 });
                    setMapZoom(1.0);
                  }}
                  className="w-7 h-7 rounded-lg bg-[#0E1A2B]/90 hover:bg-[#15273F] border border-[#182A40] text-white flex items-center justify-center transition cursor-pointer shadow"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom HUD: Target Telemetry */}
              <div className="absolute bottom-3 left-3 z-30 bg-[#070D16]/95 border border-[#182A40] rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-[#94A3B8] flex items-center space-x-3 backdrop-blur shadow">
                <span className="text-white font-bold">{activeLocation.name}</span>
                <span className="text-[#F59E0B] font-bold">{activeLocation.borderDistanceStr}</span>
                <span className="text-[#00E5FF]">Confidence: {activeLocation.confidence}%</span>
              </div>
            </div>
          </div>

          {/* Multi-Year Timeline (2022 -> 2026) */}
          <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-3 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                <Calendar className="w-4 h-4 text-[#00E5FF]" />
                <span>Multi-Temporal Progression Timeline</span>
              </div>
              <span className="text-[10px] font-mono text-[#38BDF8]">
                {activeTimelineStep.date} • Year {activeTimelineYear}
              </span>
            </div>

            {/* Timeline Year Buttons */}
            <div className="grid grid-cols-5 gap-1.5">
              {[2022, 2023, 2024, 2025, 2026].map((yr) => {
                const isSelected = activeTimelineYear === yr;
                return (
                  <button
                    key={yr}
                    onClick={() => setActiveTimelineYear(yr)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#00E5FF] text-[#070D16] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                        : 'bg-[#0E1A2B] text-[#94A3B8] hover:text-white border border-[#182A40]'
                    }`}
                  >
                    <span>{yr}</span>
                    <span className="text-[9px] font-normal truncate max-w-full">
                      {yr === 2022 ? 'Baseline' : yr === 2024 ? 'Earthworks' : yr === 2026 ? 'Observed' : 'Erection'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Timeline Stage Description */}
            <div className="mt-2.5 p-2 rounded-lg bg-[#070D16] border border-[#182A40] text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-white">{activeTimelineStep.stage}:</span>{' '}
                <span className="text-[#94A3B8]">{activeTimelineStep.notes}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0284C7]/20 text-[#38BDF8] shrink-0 ml-2 font-bold">
                {activeTimelineStep.status}
              </span>
            </div>
          </div>

          {/* Filtered Locations List Carousel */}
          <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-3 shadow-lg">
            <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Detected Locations in Sector ({filteredLocations.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto no-scrollbar">
              {filteredLocations.map((loc) => {
                const isSelected = activeLocation.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => setActiveLocationId(loc.id)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center space-x-2.5 ${
                      isSelected
                        ? 'bg-[#0E355A] border-[#00E5FF] text-white shadow'
                        : 'bg-[#070D16] border-[#182A40] text-[#94A3B8] hover:bg-[#0E1A2B] hover:text-white'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#182A40] shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${loc.afterImageUrl})` }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{loc.name}</span>
                        <span className="text-[10px] font-mono text-[#00E5FF]">{loc.confidence}%</span>
                      </div>
                      <div className="text-[10px] text-[#38BDF8] truncate mt-0.5">{loc.changeType}</div>
                      <div className="text-[9px] font-mono text-[#F59E0B] truncate">{loc.borderDistanceStr}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Large Before/After Comparison & Analyst Card */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          {/* Comparison Mode Header */}
          <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-3 shadow-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-xs font-bold text-white">Visual Change Evidence</span>
            </div>

            <div className="flex items-center space-x-1 bg-[#070D16] p-0.5 rounded-lg border border-[#182A40]">
              <button
                onClick={() => setViewMode('dual')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  viewMode === 'dual' ? 'bg-[#0284C7] text-white font-bold' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Dual Tile
              </button>
              <button
                onClick={() => setViewMode('swipe')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  viewMode === 'swipe' ? 'bg-[#0284C7] text-white font-bold' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Swipe Curtain
              </button>
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer flex items-center space-x-1 ${
                  showHeatmap ? 'bg-[#EF4444] text-white font-bold shadow' : 'text-[#94A3B8] hover:text-white'
                }`}
                title="Toggle Change Heatmap Overlay"
              >
                <span>Heatmap</span>
              </button>
            </div>
          </div>

          {/* Before / After Viewer */}
          <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-3 shadow-2xl overflow-hidden flex flex-col">
            {viewMode === 'dual' ? (
              /* DUAL TILE VIEW: Side-by-side Before vs After */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
                {/* Left: BEFORE */}
                <div className="relative rounded-lg overflow-hidden border border-[#182A40] bg-[#070D16] aspect-[4/3]">
                  <img
                    src={activeLocation.beforeImageUrl}
                    alt="Before change"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-[#070D16]/90 border border-[#182A40] text-[10px] font-mono px-2 py-0.5 rounded text-white backdrop-blur">
                    BEFORE: {activeLocation.beforeDate}
                  </div>
                  <div className="absolute bottom-2 left-2 text-[9px] font-mono text-[#94A3B8] bg-black/60 px-1.5 py-0.5 rounded">
                    Baseline Terrain
                  </div>
                </div>

                {/* Right: AFTER */}
                <div className="relative rounded-lg overflow-hidden border border-[#182A40] bg-[#070D16] aspect-[4/3]">
                  <img
                    src={activeTimelineStep.imgUrl}
                    alt="After change"
                    className="w-full h-full object-cover"
                  />
                  {showHeatmap && (
                    <div className="absolute inset-0 bg-red-500/30 mix-blend-color-dodge pointer-events-none animate-pulse">
                      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-yellow-300 drop-shadow">
                        [DIFF HEATMAP DETECTED: +34.8%]
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-[#00E5FF]/20 border border-[#00E5FF] text-[10px] font-mono px-2 py-0.5 rounded text-[#00E5FF] font-bold backdrop-blur">
                    AFTER: {activeTimelineStep.date}
                  </div>
                  <div className="absolute bottom-2 right-2 text-[9px] font-mono text-[#10B981] bg-black/60 px-1.5 py-0.5 rounded font-bold">
                    {activeLocation.changeType}
                  </div>
                </div>
              </div>
            ) : (
              /* SWIPE CURTAIN VIEW: Draggable Comparison Slider */
              <div
                ref={sliderContainerRef}
                onMouseMove={(e) => e.buttons === 1 && handleSliderMove(e)}
                onTouchMove={handleSliderMove}
                className="relative rounded-lg overflow-hidden border border-[#182A40] aspect-[16/10] select-none cursor-ew-resize"
              >
                {/* Underneath: AFTER image */}
                <img
                  src={activeTimelineStep.imgUrl}
                  alt="After"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />

                {showHeatmap && (
                  <div className="absolute inset-0 bg-red-500/25 mix-blend-color-dodge pointer-events-none" />
                )}

                {/* Top clipped: BEFORE image */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none border-r-2 border-[#00E5FF]"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={activeLocation.beforeImageUrl}
                    alt="Before"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ width: '100%', maxWidth: 'none' }}
                  />
                  <div className="absolute top-2 left-2 bg-[#070D16]/90 border border-[#182A40] text-[10px] font-mono px-2 py-0.5 rounded text-white">
                    BEFORE: {activeLocation.beforeDate}
                  </div>
                </div>

                <div className="absolute top-2 right-2 bg-[#00E5FF]/20 border border-[#00E5FF] text-[10px] font-mono px-2 py-0.5 rounded text-[#00E5FF] font-bold">
                  AFTER: {activeTimelineStep.date}
                </div>

                {/* Draggable Divider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] cursor-ew-resize flex items-center justify-center"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#00E5FF] text-[#070D16] font-bold text-xs flex items-center justify-center shadow-lg">
                    ⇄
                  </div>
                </div>
              </div>
            )}

            {/* Slider Instructions hint */}
            {viewMode === 'swipe' && (
              <div className="text-[10px] font-mono text-[#64748B] text-center mt-1.5">
                Drag slider horizontally to inspect visual difference
              </div>
            )}
          </div>

          {/* Change Detection Result Card */}
          <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-3.5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-[#182A40] pb-2">
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase font-bold">Detected Change</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{activeLocation.changeType}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#64748B] uppercase font-bold">Confidence</span>
                <div className="text-sm font-bold font-mono text-[#10B981]">{activeLocation.confidence}%</div>
              </div>
            </div>

            {/* Technical Metadata Table */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#070D16] border border-[#182A40]">
                <span className="text-[10px] text-[#64748B] block uppercase font-bold">Observation Period</span>
                <span className="font-mono text-white font-medium">{activeLocation.observationPeriod}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#070D16] border border-[#182A40]">
                <span className="text-[10px] text-[#64748B] block uppercase font-bold">Distance from Border</span>
                <span className="font-mono text-[#F59E0B] font-bold">{activeLocation.borderDistanceStr}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#070D16] border border-[#182A40]">
                <span className="text-[10px] text-[#64748B] block uppercase font-bold">Changed Surface Area</span>
                <span className="font-mono text-[#38BDF8] font-bold">{activeLocation.changedArea}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#070D16] border border-[#182A40]">
                <span className="text-[10px] text-[#64748B] block uppercase font-bold">Imagery Source</span>
                <span className="font-mono text-white">{activeLocation.source}</span>
              </div>
            </div>

            {/* Neutral Description Explanation */}
            <div className="p-2.5 rounded-lg bg-[#070D16] border border-[#182A40] text-xs text-[#94A3B8] leading-relaxed">
              <p className="font-medium text-white mb-1">Visual Observation:</p>
              <p>{activeLocation.description}</p>
              <p className="mt-2 text-[11px] text-[#64748B] italic">
                The system detected a significant visual difference between the selected observations. The result requires analyst verification.
              </p>
            </div>

            {/* Mandatory Disclaimer Alert */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[11px] text-[#F59E0B]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>AI-assisted detection. Analyst verification required.</span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setViewMode(viewMode === 'dual' ? 'swipe' : 'dual')}
                className="py-2 px-3 rounded-lg bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-xs font-semibold text-white transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>{viewMode === 'dual' ? 'Compare (Swipe)' : 'Side-by-Side'}</span>
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="py-2 px-3 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-xs font-semibold text-white transition cursor-pointer flex items-center justify-center space-x-1.5 shadow"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate Report</span>
              </button>
            </div>

            {onNavigateToSemanticSearch && (
              <button
                onClick={onNavigateToSemanticSearch}
                className="w-full py-1.5 px-3 rounded-lg bg-[#070D16] hover:bg-[#0E1A2B] border border-[#182A40] text-[11px] text-[#38BDF8] hover:text-white transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Inspect in Semantic Search Workspace</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. FORMAL GEOSPATIAL INTELLIGENCE REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0B1523] border border-[#00E5FF]/40 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col font-sans my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Report Header Bar */}
            <div className="bg-[#070D16] border-b border-[#182A40] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/20 border border-[#00E5FF] flex items-center justify-center text-[#00E5FF] font-bold">
                  V
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wider uppercase">
                    VIGIL Space Intelligence • Border Change Report
                  </h2>
                  <div className="text-[10px] font-mono text-[#64748B]">
                    REF: VIGIL-STRAT-2026-0941-DEMO • UNCLASSIFIED // PUBLIC OPEN SOURCE
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="w-8 h-8 rounded-lg bg-[#0E1A2B] hover:bg-[#15273F] text-[#94A3B8] hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Report Content Body */}
            <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh] text-xs">
              {/* Target Location Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#070D16] border border-[#182A40]">
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#64748B] block">Location ID</span>
                  <span className="font-mono text-white font-bold">{activeLocation.id}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#64748B] block">Coordinates</span>
                  <span className="font-mono text-[#00E5FF]">{activeLocation.coordinates}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#64748B] block">Boundary Distance</span>
                  <span className="font-mono text-[#F59E0B] font-bold">{activeLocation.borderDistanceStr}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#64748B] block">Confidence</span>
                  <span className="font-mono text-[#10B981] font-bold">{activeLocation.confidence}% Match</span>
                </div>
              </div>

              {/* Side-by-Side Visual Evidence */}
              <div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Satellite Imagery Evidence
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg overflow-hidden border border-[#182A40] aspect-video relative bg-[#070D16]">
                    <img src={activeLocation.beforeImageUrl} alt="Before" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-white">
                      Baseline: {activeLocation.beforeDate}
                    </span>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-[#182A40] aspect-video relative bg-[#070D16]">
                    <img src={activeLocation.afterImageUrl} alt="After" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-[#00E5FF]/20 border border-[#00E5FF] px-2 py-0.5 rounded text-[9px] font-mono text-[#00E5FF] font-bold">
                      Observed: {activeLocation.afterDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Change Findings */}
              <div className="p-3.5 rounded-xl bg-[#070D16] border border-[#182A40] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Detected Category: {activeLocation.changeType}</span>
                  <span className="text-xs font-mono text-[#10B981] font-bold">Area Delta: {activeLocation.changedArea}</span>
                </div>
                <p className="text-[#94A3B8] leading-relaxed">{activeLocation.description}</p>
                <div className="flex items-center space-x-4 pt-1 font-mono text-[10px] text-[#64748B]">
                  <span>NDBI (Built-up Delta): <b className="text-white">{activeLocation.ndbiDelta}</b></span>
                  <span>NDVI (Canopy Delta): <b className="text-white">{activeLocation.ndviDelta}</b></span>
                  <span>Sensor: <b className="text-white">{activeLocation.source}</b></span>
                </div>
              </div>

              {/* Editable Analyst Notes */}
              <div>
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                  Analyst Assessment Notes
                </label>
                <textarea
                  value={analystNotes}
                  onChange={(e) => setAnalystNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[#070D16] border border-[#182A40] focus:border-[#00E5FF] rounded-lg p-2.5 text-xs text-white outline-none resize-none font-sans"
                />
              </div>

              {/* Mandatory Intelligence Disclaimer */}
              <div className="p-3 rounded-lg bg-[#070D16] border border-[#182A40] text-[10px] text-[#64748B] leading-relaxed">
                <span className="font-bold text-[#F59E0B]">MANDATORY NOTICE:</span> AI-assisted analysis based on publicly available imagery. Results require human verification and should not be interpreted as definitive intelligence conclusions.
              </div>
            </div>

            {/* Report Modal Footer */}
            <div className="bg-[#070D16] border-t border-[#182A40] px-5 py-3 flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#64748B]">
                Generated by VIGIL Geospatial Platform (SIH26227)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="h-8 px-3 rounded-lg bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-xs font-semibold text-white flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Print Dossier</span>
                </button>
                <button
                  onClick={() => {
                    alert('Change report dossier exported to JSON audit ledger.');
                    setShowReportModal(false);
                  }}
                  className="h-8 px-3.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-xs font-semibold text-white flex items-center space-x-1.5 transition cursor-pointer shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
