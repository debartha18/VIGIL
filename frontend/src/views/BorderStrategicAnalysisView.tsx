import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Search,
  Calendar,
  Sparkles,
  ShieldAlert,
  FileText,
  RotateCcw,
  AlertCircle,
  Printer,
  Download,
  X,
  Plus,
  Minus,
  ExternalLink,
  Play,
  Pause,
  Layers,
  Maximize2
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
  builtFootprint: string;
  activityLevel: string;
  yearDelta: string;
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
    beforeDate: '2022-05-10',
    afterDate: '2026-02-24',
    beforeImageUrl: '/assets/before_scene.jpg',
    afterImageUrl: '/assets/card_1_construction.jpg',
    description: 'Newly identified structural foundation pads, perimeter grading, and prefabricated modular shelters erected on previously unpaved valley terrain.',
    ndbiDelta: '+0.38 NDBI',
    ndviDelta: '-0.21 NDVI',
    keywords: ['construction', 'new', 'buildings', 'structure', 'deck', 'valley', 'north', 'near', 'border'],
    timelineProgression: [
      {
        year: 2022,
        date: '2022-05-10',
        stage: 'Baseline Terrain',
        status: 'No significant change',
        notes: 'Natural mountain scree and alluvial fan without artificial features.',
        imgUrl: '/assets/before_scene.jpg',
        builtFootprint: '0 m²',
        activityLevel: 'Baseline (0%)',
        yearDelta: '0 m² (Baseline)'
      },
      {
        year: 2023,
        date: '2023-04-18',
        stage: 'Surveying & Access Track',
        status: 'Initial clearing detected',
        notes: 'Initial vehicle tracks, survey markers, and perimeter flagging identified along natural drainage contour.',
        imgUrl: '/assets/before_scene.jpg',
        builtFootprint: '3,200 m²',
        activityLevel: 'Survey & Clearing (15%)',
        yearDelta: '+3,200 m² access clearing'
      },
      {
        year: 2024,
        date: '2024-06-22',
        stage: 'Earthworks & Foundation Pits',
        status: 'Excavation active',
        notes: 'Mechanical soil leveling across 2.1 hectares; deep concrete foundation pits and drainage trenches dug.',
        imgUrl: '/assets/card_5_land.jpg',
        builtFootprint: '14,800 m²',
        activityLevel: 'Earthworks (45%)',
        yearDelta: '+11,600 m² grading'
      },
      {
        year: 2025,
        date: '2025-07-14',
        stage: 'Structural Erection',
        status: 'Vertical framing assembled',
        notes: 'Multiple reinforced concrete foundation slabs cast; steel framing and vertical support pylons assembled.',
        imgUrl: '/assets/card_1_construction.jpg',
        builtFootprint: '26,400 m²',
        activityLevel: 'Structural Erection (80%)',
        yearDelta: '+11,600 m² structures'
      },
      {
        year: 2026,
        date: '2026-02-24',
        stage: 'Completed Modular Deck',
        status: 'Completed expansion',
        notes: 'Fully surfaced modular deck with perimeter security enclosure, power conduit bays, and access links.',
        imgUrl: '/assets/card_1_construction.jpg',
        builtFootprint: '32,500 m²',
        activityLevel: 'Operational Deck (100%)',
        yearDelta: '+6,100 m² final surfacing'
      }
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
    beforeDate: '2022-07-04',
    afterDate: '2026-01-19',
    beforeImageUrl: '/assets/before_scene.jpg',
    afterImageUrl: '/assets/card_4_bridge.jpg',
    description: 'Linear road widening from unpaved dirt track to dual-lane all-weather asphalt corridor, including cut-and-fill slope stabilization and culvert bridges.',
    ndbiDelta: '+0.29 NDBI',
    ndviDelta: '-0.18 NDVI',
    keywords: ['road', 'development', 'widening', 'pass', 'highway', 'transport', 'paving', 'near', 'border'],
    timelineProgression: [
      {
        year: 2022,
        date: '2022-07-04',
        stage: 'Narrow Dirt Track',
        status: 'Baseline unpaved track',
        notes: 'Single-lane unpaved dirt path vulnerable to seasonal snow cover and rockfall washouts.',
        imgUrl: '/assets/before_scene.jpg',
        builtFootprint: '8,000 m²',
        activityLevel: 'Baseline Track (10%)',
        yearDelta: '0 m² (Baseline)'
      },
      {
        year: 2023,
        date: '2023-06-12',
        stage: 'Slope Blasting & Clearing',
        status: 'Corridor widening started',
        notes: 'Heavy machinery slope blasting and earth clearing along 6 km mountain pass right-of-way.',
        imgUrl: '/assets/card_5_land.jpg',
        builtFootprint: '22,000 m²',
        activityLevel: 'Slope Blasting (30%)',
        yearDelta: '+14,000 m² right-of-way'
      },
      {
        year: 2024,
        date: '2024-08-19',
        stage: 'Sub-Base Grading & Culverts',
        status: 'Heavy machinery active',
        notes: 'Crushed stone aggregate sub-base compacted across 12 km stretch; precast concrete culvert pipes installed.',
        imgUrl: '/assets/card_4_bridge.jpg',
        builtFootprint: '45,000 m²',
        activityLevel: 'Sub-Base Compaction (60%)',
        yearDelta: '+23,000 m² sub-base'
      },
      {
        year: 2025,
        date: '2025-05-30',
        stage: 'Bituminous Surfacing',
        status: 'Paving underway',
        notes: 'Black-top bituminous asphalt surfacing applied with reinforced hillside retention netting.',
        imgUrl: '/assets/card_4_bridge.jpg',
        builtFootprint: '65,000 m²',
        activityLevel: 'Asphalt Paving (85%)',
        yearDelta: '+20,000 m² black-top'
      },
      {
        year: 2026,
        date: '2026-01-19',
        stage: 'All-Weather Highway',
        status: 'Operational corridor',
        notes: 'Completed dual-lane transit corridor with reinforced retention barriers, signage, and run-off culverts.',
        imgUrl: '/assets/card_4_bridge.jpg',
        builtFootprint: '78,000 m²',
        activityLevel: 'Operational Highway (100%)',
        yearDelta: '+13,000 m² shoulders'
      }
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
      {
        year: 2022,
        date: '2022-10-15',
        stage: 'Initial Terminal',
        status: 'Baseline depot size',
        notes: 'Existing compact storage depot with limited unpaved open parking and small administration block.',
        imgUrl: '/assets/before_scene.jpg',
        builtFootprint: '12,000 m²',
        activityLevel: 'Baseline Depot (25%)',
        yearDelta: '0 m² (Baseline)'
      },
      {
        year: 2023,
        date: '2023-11-20',
        stage: 'Perimeter Extension',
        status: 'Land boundary expanded',
        notes: 'Outer perimeter fence relocated outward by 250 meters; 2 hectares of desert scrub leveled.',
        imgUrl: '/assets/card_5_land.jpg',
        builtFootprint: '18,500 m²',
        activityLevel: 'Perimeter Expansion (40%)',
        yearDelta: '+6,500 m² perimeter'
      },
      {
        year: 2024,
        date: '2024-04-12',
        stage: 'Foundation Pouring',
        status: 'Construction active',
        notes: 'Reinforced concrete foundation slabs poured for 3 industrial warehouse footprints; heavy crane pads ready.',
        imgUrl: '/assets/card_1_construction.jpg',
        builtFootprint: '32,000 m²',
        activityLevel: 'Foundation Slabs (65%)',
        yearDelta: '+13,500 m² concrete'
      },
      {
        year: 2025,
        date: '2025-08-05',
        stage: 'Roof Truss Assembly',
        status: 'Structural erection',
        notes: 'High-span steel roof trusses and prefabricated wall panels installed on 3 large warehouse units.',
        imgUrl: '/assets/card_3_port.jpg',
        builtFootprint: '46,000 m²',
        activityLevel: 'Roof Framing (85%)',
        yearDelta: '+14,000 m² roofing'
      },
      {
        year: 2026,
        date: '2026-02-10',
        stage: 'Expanded Logistics Hub',
        status: 'Fully expanded footprint',
        notes: 'Fully operational logistics complex with paved container stacking bays, fueling pads, and security gates.',
        imgUrl: '/assets/card_3_port.jpg',
        builtFootprint: '54,000 m²',
        activityLevel: 'Operational Terminal (100%)',
        yearDelta: '+8,000 m² apron'
      }
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
    observationPeriod: '2023 → 2026',
    changedArea: '46,000 m² (4.6 ha)',
    changedAreaM2: 46000,
    source: 'Sentinel-2 (10m Optical)',
    beforeDate: '2022-04-02',
    afterDate: '2026-01-20',
    beforeImageUrl: '/assets/before_scene.jpg',
    afterImageUrl: '/assets/card_5_land.jpg',
    description: 'Systematic vegetation removal and mechanical leveling across riverine silt island, with linear bund earthworks to prevent seasonal high-water inundation.',
    ndbiDelta: '+0.22 NDBI',
    ndviDelta: '-0.36 NDVI',
    keywords: ['land', 'clearance', 'vegetation', 'river', 'island', 'riparian', 'east', 'border', 'cleared'],
    timelineProgression: [
      {
        year: 2022,
        date: '2022-04-02',
        stage: 'Dense Riparian Vegetation',
        status: 'Natural reed cover',
        notes: 'Dense seasonal reeds, scrub, and undisturbed silt sandbars along river boundary corridor.',
        imgUrl: '/assets/before_scene.jpg',
        builtFootprint: '0 m²',
        activityLevel: 'Natural Wetland (0%)',
        yearDelta: '0 m² (Baseline)'
      },
      {
        year: 2023,
        date: '2023-03-29',
        stage: 'Canopy & Brush Clearing',
        status: 'Vegetation clearance detected',
        notes: 'Systematic clearing of brush and tree felling across 1.2 km north-south sandbar strip.',
        imgUrl: '/assets/before_scene.jpg',
        builtFootprint: '8,500 m²',
        activityLevel: 'Brush Removal (20%)',
        yearDelta: '+8,500 m² cleared'
      },
      {
        year: 2024,
        date: '2024-02-18',
        stage: 'Bulldozer Soil Leveling',
        status: 'Bare earth exposed',
        notes: 'Mechanical soil leveling exposing bare compacted clay across 4.6 hectares.',
        imgUrl: '/assets/card_5_land.jpg',
        builtFootprint: '24,000 m²',
        activityLevel: 'Bulldozer Leveling (55%)',
        yearDelta: '+15,500 m² leveled'
      },
      {
        year: 2025,
        date: '2025-11-14',
        stage: 'Consolidated Flood Bund',
        status: 'Earthworks stabilized',
        notes: 'Compacted earthen bund constructed with stone rip-rap to prevent seasonal monsoon inundation.',
        imgUrl: '/assets/card_5_land.jpg',
        builtFootprint: '38,000 m²',
        activityLevel: 'Bund Stabilization (80%)',
        yearDelta: '+14,000 m² bund'
      },
      {
        year: 2026,
        date: '2026-01-20',
        stage: 'Prepared Open Surface',
        status: 'Ready for use',
        notes: 'Consolidated dry open staging surface maintained above maximum recorded flood watermark.',
        imgUrl: '/assets/card_5_land.jpg',
        builtFootprint: '46,000 m²',
        activityLevel: 'Prepared Surface (100%)',
        yearDelta: '+8,000 m² final grading'
      }
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
      {
        year: 2022,
        date: '2022-12-05',
        stage: 'Natural Braided Stream',
        status: 'Baseline hydrography',
        notes: 'Meandering shallow watercourse without crossing structures; water body subject to seasonal shifts.',
        imgUrl: '/assets/before_scene.jpg',
        builtFootprint: '0 m²',
        activityLevel: 'Natural Stream (0%)',
        yearDelta: '0 m² (Baseline)'
      },
      {
        year: 2023,
        date: '2023-10-14',
        stage: 'Stream Diversion Trench',
        status: 'Channel diverted',
        notes: 'Temporary coffer dam built and main stream flow diverted through bypass trench for foundation prep.',
        imgUrl: '/assets/card_2_riverside.jpg',
        builtFootprint: '5,000 m²',
        activityLevel: 'Channel Diversion (25%)',
        yearDelta: '+5,000 m² channel diversion'
      },
      {
        year: 2024,
        date: '2024-11-25',
        stage: 'Box Culvert Placement',
        status: 'Concrete placement',
        notes: 'Four precast reinforced concrete box culvert barrels aligned and bedded in prepared streambed.',
        imgUrl: '/assets/card_4_bridge.jpg',
        builtFootprint: '14,000 m²',
        activityLevel: 'Culvert Footing (55%)',
        yearDelta: '+9,000 m² culverts'
      },
      {
        year: 2025,
        date: '2025-09-18',
        stage: 'Stone Gabions Laid',
        status: 'Bank revetment active',
        notes: 'Wire-mesh stone gabion mattresses placed on both upstream and downstream banks to lock watercourse.',
        imgUrl: '/assets/card_2_riverside.jpg',
        builtFootprint: '22,500 m²',
        activityLevel: 'Gabion Mattresses (80%)',
        yearDelta: '+8,500 m² revetment'
      },
      {
        year: 2026,
        date: '2026-02-01',
        stage: 'Stabilized Riparian Crossing',
        status: 'Revetment completed',
        notes: 'Permanent all-weather crossing with reinforced stone rip-rap embankments and stabilized channel banks.',
        imgUrl: '/assets/card_2_riverside.jpg',
        builtFootprint: '29,000 m²',
        activityLevel: 'Stabilized Crossing (100%)',
        yearDelta: '+6,500 m² final roadway'
      }
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
    beforeDate: '2022-06-15',
    afterDate: '2026-01-28',
    beforeImageUrl: '/assets/before_scene.jpg',
    afterImageUrl: '/assets/card_5_land.jpg',
    description: 'Noticeable canopy thinning and pine forest clearing along high-altitude ridge, with circular earth pad graded for telecommunication relay footing.',
    ndbiDelta: '+0.31 NDBI',
    ndviDelta: '-0.39 NDVI',
    keywords: ['vegetation', 'forest', 'canopy', 'clearing', 'mast', 'ridge', 'himalayan', 'border'],
    timelineProgression: [
      {
        year: 2022,
        date: '2022-06-15',
        stage: 'Continuous Pine Canopy',
        status: 'Dense forest cover',
        notes: 'Undisturbed temperate conifer forest canopy on high watershed ridge spine.',
        imgUrl: '/assets/before_scene.jpg',
        builtFootprint: '0 m²',
        activityLevel: 'Dense Forest (0%)',
        yearDelta: '0 m² (Baseline)'
      },
      {
        year: 2023,
        date: '2023-05-11',
        stage: 'Ridge Trail Access Clearing',
        status: 'Linear gap emerging',
        notes: 'Narrow 3-meter access trail cleared through conifer canopy along ridge crest.',
        imgUrl: '/assets/before_scene.jpg',
        builtFootprint: '4,000 m²',
        activityLevel: 'Trail Clearing (15%)',
        yearDelta: '+4,000 m² trail'
      },
      {
        year: 2024,
        date: '2024-07-20',
        stage: 'Circular Cleared Pad',
        status: 'Canopy cleared',
        notes: 'Roughly 1.5-hectare circular opening clear-felled, stumped, and graded with light tracked vehicles.',
        imgUrl: '/assets/card_5_land.jpg',
        builtFootprint: '16,000 m²',
        activityLevel: 'Circular Clearing (45%)',
        yearDelta: '+12,000 m² clear-felling'
      },
      {
        year: 2025,
        date: '2025-06-04',
        stage: 'Foundation & Guy Anchors',
        status: 'Foundation visible',
        notes: 'Central reinforced concrete mast pad cast with 4 guy-wire bedrock anchor footings.',
        imgUrl: '/assets/card_1_construction.jpg',
        builtFootprint: '28,000 m²',
        activityLevel: 'Mast Footing (75%)',
        yearDelta: '+12,000 m² foundations'
      },
      {
        year: 2026,
        date: '2026-01-28',
        stage: 'Operational Relay Site',
        status: 'Maintained opening',
        notes: 'Paved equipment shelter pad with perimeter chain-link fence on cleared ridge spine.',
        imgUrl: '/assets/card_5_land.jpg',
        builtFootprint: '38,000 m²',
        activityLevel: 'Operational Site (100%)',
        yearDelta: '+10,000 m² perimeter enclosure'
      }
    ]
  },
  {
    id: 'LOC-STRAT-07',
    name: 'Border Township Urban Extension & Grid',
    region: 'Western Arid Sector',
    changeType: 'Structural Expansion',
    confidence: 93,
    coordinates: '31.6340° N, 74.8723° E',
    lat: 31.6340,
    lon: 74.8723,
    mapX: 35,
    mapY: 31,
    borderDistanceKm: 5.6,
    borderDistanceStr: '5.6 km from International Boundary',
    observationPeriod: '2022 → 2026',
    changedArea: '64,000 m² (6.4 ha)',
    changedAreaM2: 64000,
    source: 'Sentinel-2 (10m Optical)',
    beforeDate: '2022-03-14',
    afterDate: '2026-02-18',
    beforeImageUrl: '/assets/before_scene.jpg',
    afterImageUrl: '/assets/card_3_port.jpg',
    description: 'Systematic urban expansion extending township boundary toward outer ring road, creating new rectangular street layout and concrete commercial blocks.',
    ndbiDelta: '+0.42 NDBI',
    ndviDelta: '-0.24 NDVI',
    keywords: ['urban', 'settlement', 'expansion', 'town', 'grid', 'buildings', 'west', 'border'],
    timelineProgression: [
      {
        year: 2022,
        date: '2022-03-14',
        stage: 'Peripheral Fallow Land',
        status: 'Undeveloped land',
        notes: 'Uncultivated arid open scrub at township periphery with no formal road layout.',
        imgUrl: '/assets/before_scene.jpg',
        builtFootprint: '0 m²',
        activityLevel: 'Baseline Fallow (0%)',
        yearDelta: '0 m² (Baseline)'
      },
      {
        year: 2023,
        date: '2023-04-22',
        stage: 'Surveyed Street Grid',
        status: 'Road grid cut',
        notes: 'Rectangular arterial street grid surveyed; unpaved gravel access avenues graded.',
        imgUrl: '/assets/before_scene.jpg',
        builtFootprint: '12,000 m²',
        activityLevel: 'Grid Survey (25%)',
        yearDelta: '+12,000 m² road grid'
      },
      {
        year: 2024,
        date: '2024-05-18',
        stage: 'Subdivision Demarcation',
        status: 'Plots outlined',
        notes: 'Subsurface drainage conduits laid; 24 separate building parcels enclosed with low masonry boundary walls.',
        imgUrl: '/assets/card_5_land.jpg',
        builtFootprint: '34,000 m²',
        activityLevel: 'Parcel Enclosure (50%)',
        yearDelta: '+22,000 m² masonry bounds'
      },
      {
        year: 2025,
        date: '2025-08-11',
        stage: 'Multi-Structure Masonry',
        status: 'Vertical construction active',
        notes: 'Multiple concrete-frame modular buildings and commercial structures under active vertical construction.',
        imgUrl: '/assets/card_1_construction.jpg',
        builtFootprint: '52,000 m²',
        activityLevel: 'Active Masonry (80%)',
        yearDelta: '+18,000 m² structural framing'
      },
      {
        year: 2026,
        date: '2026-02-18',
        stage: 'Settled Urban Grid',
        status: 'Operational township',
        notes: 'Dense settled urban extension with paved avenues, vehicle staging bays, and electrical power connections.',
        imgUrl: '/assets/card_3_port.jpg',
        builtFootprint: '64,000 m²',
        activityLevel: 'Settled Extension (100%)',
        yearDelta: '+12,000 m² paved completion'
      }
    ]
  },
  {
    id: 'LOC-STRAT-08',
    name: 'Valley Agrarian Conversion to Staging Apron',
    region: 'Central Himalayan Sector',
    changeType: 'Land Clearance',
    confidence: 90,
    coordinates: '27.5330° N, 88.5122° E',
    lat: 27.5330,
    lon: 88.5122,
    mapX: 68,
    mapY: 37,
    borderDistanceKm: 6.8,
    borderDistanceStr: '6.8 km from International Boundary',
    observationPeriod: '2022 → 2026',
    changedArea: '48,500 m² (4.8 ha)',
    changedAreaM2: 48500,
    source: 'Sentinel-2 (10m Optical)',
    beforeDate: '2022-09-08',
    afterDate: '2026-01-14',
    beforeImageUrl: '/assets/before_scene.jpg',
    afterImageUrl: '/assets/card_3_port.jpg',
    description: 'Conversion of agricultural terraced land into compacted crushed-stone staging apron with heavy equipment loading bays and boundary berms.',
    ndbiDelta: '+0.36 NDBI',
    ndviDelta: '-0.33 NDVI',
    keywords: ['agricultural', 'land', 'conversion', 'terrace', 'apron', 'staging', 'himalayan', 'border'],
    timelineProgression: [
      {
        year: 2022,
        date: '2022-09-08',
        stage: 'Terraced Agricultural Fields',
        status: 'Active agriculture',
        notes: 'Traditional terraced hillside agricultural plots cultivating seasonal valley crops.',
        imgUrl: '/assets/before_scene.jpg',
        builtFootprint: '0 m²',
        activityLevel: 'Active Agriculture (0%)',
        yearDelta: '0 m² (Baseline)'
      },
      {
        year: 2023,
        date: '2023-10-19',
        stage: 'Topsoil Stripping & Leveling',
        status: 'Land repurposed',
        notes: 'Farming activity discontinued; topsoil scraped off and natural terraced ridges mechanically excavated.',
        imgUrl: '/assets/before_scene.jpg',
        builtFootprint: '10,000 m²',
        activityLevel: 'Topsoil Stripping (20%)',
        yearDelta: '+10,000 m² stripped'
      },
      {
        year: 2024,
        date: '2024-03-27',
        stage: 'Tiered Plateau Leveling',
        status: 'Earthworks active',
        notes: 'Multiple agricultural terraces flattened into unified contiguous tiered plateaus with crushed rock backfill.',
        imgUrl: '/assets/card_5_land.jpg',
        builtFootprint: '28,000 m²',
        activityLevel: 'Plateau Leveling (55%)',
        yearDelta: '+18,000 m² leveling'
      },
      {
        year: 2025,
        date: '2025-06-30',
        stage: 'Compacted Hardstand Apron',
        status: 'Surfacing underway',
        notes: 'Heavy roller compactor applied thick aggregate base course; perimeter drainage culverts and rock retaining walls built.',
        imgUrl: '/assets/card_1_construction.jpg',
        builtFootprint: '41,000 m²',
        activityLevel: 'Hardstand Base (80%)',
        yearDelta: '+13,000 m² aggregate base'
      },
      {
        year: 2026,
        date: '2026-01-14',
        stage: 'Operational Staging Apron',
        status: 'Fully surfaced',
        notes: 'Completed all-weather heavy vehicle staging apron with reinforced perimeter gates and lighting pylons.',
        imgUrl: '/assets/card_3_port.jpg',
        builtFootprint: '48,500 m²',
        activityLevel: 'Operational Apron (100%)',
        yearDelta: '+7,500 m² surfacing'
      }
    ]
  }
];


export const SEARCH_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'don', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'how', 'i', 'if', 'in', 'into', 'is',
  'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'no', 'nor', 'not', 'now', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'our', 'out', 'over', 'own', 'same', 'she', 'should', 'so',
  'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'you', 'your',
  // Geospatial generic search fillers:
  'show', 'find', 'areas', 'area', 'region', 'regions', 'place', 'places', 'spot', 'spots', 'look',
  'locate', 'display', 'search', 'get', 'give', 'list', 'boundary', 'international', 'border', 'increased',
  'changes', 'change'
]);

interface CategoryIntent {
  changeTypes?: BorderChangeType[];
  keywords: string[];
  locationIds?: string[];
  weight: number;
}

const CATEGORY_INTENTS: CategoryIntent[] = [
  {
    changeTypes: ['Road Development'],
    keywords: [
      'road', 'roads', 'highway', 'highways', 'paving', 'paved', 'asphalt', 'pass', 'corridor',
      'culvert', 'bridge', 'transit', 'route', 'traffic', 'widening', 'lateral'
    ],
    locationIds: ['LOC-STRAT-02'],
    weight: 70
  },
  {
    changeTypes: ['New Construction'],
    keywords: [
      'construction', 'constructed', 'construct', 'deck', 'modular', 'pylons', 'erected', 'erection',
      'shelter', 'shelters', 'foundation', 'pads', 'building', 'buildings', 'structure', 'structures'
    ],
    locationIds: ['LOC-STRAT-01'],
    weight: 60
  },
  {
    changeTypes: ['Structural Expansion'],
    keywords: [
      'expansion', 'expanded', 'logistics', 'terminal', 'warehouse', 'warehouses', 'depot', 'apron',
      'stacking', 'storage', 'commercial', 'urban', 'town', 'township', 'grid', 'subdivision'
    ],
    locationIds: ['LOC-STRAT-03', 'LOC-STRAT-07'],
    weight: 60
  },
  {
    changeTypes: ['Land Clearance'],
    keywords: [
      'clearance', 'cleared', 'clearing', 'island', 'silt', 'bund', 'earthworks', 'leveling', 'leveled',
      'bulldozed', 'agrarian', 'agricultural', 'farming', 'terrace', 'terraced', 'topsoil'
    ],
    locationIds: ['LOC-STRAT-04', 'LOC-STRAT-08'],
    weight: 60
  },
  {
    changeTypes: ['Water-Extent Change'],
    keywords: [
      'water', 'stream', 'river', 'riverine', 'riverbank', 'channel', 'culvert', 'embankment', 'gabion',
      'riparian', 'hydrography', 'flood', 'coffer'
    ],
    locationIds: ['LOC-STRAT-05'],
    weight: 70
  },
  {
    changeTypes: ['Vegetation Change'],
    keywords: [
      'vegetation', 'forest', 'canopy', 'tree', 'trees', 'pine', 'logging', 'logged', 'conifer',
      'mast', 'relay', 'telemetry', 'ridge'
    ],
    locationIds: ['LOC-STRAT-06'],
    weight: 70
  }
];

export const computeRelevance = (loc: BorderLocationItem, query: string): number => {
  const qClean = query.toLowerCase().trim();
  if (!qClean) return 1;

  // Extract meaningful tokens
  const words = qClean.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
  const meaningfulTokens = words.filter(w => !SEARCH_STOP_WORDS.has(w) && w.length > 2);
  const tokens = meaningfulTokens.length > 0 ? meaningfulTokens : words.filter(w => w.length > 1);

  if (tokens.length === 0) return 1;

  let score = 0;

  // 1. Exact phrase matches in name, description, or changeType
  if (loc.name.toLowerCase().includes(qClean)) score += 100;
  if (loc.description.toLowerCase().includes(qClean)) score += 60;
  if (loc.changeType.toLowerCase() === qClean) score += 90;

  // 2. Category intent matches
  for (const intent of CATEGORY_INTENTS) {
    const hasIntentKeyword = intent.keywords.some(k => qClean.includes(k) || words.includes(k));
    if (hasIntentKeyword) {
      if (intent.changeTypes && intent.changeTypes.includes(loc.changeType)) {
        score += intent.weight;
      }
      if (intent.locationIds && intent.locationIds.includes(loc.id)) {
        score += intent.weight * 1.5;
      }
    }
  }

  // 3. Token-level matches
  for (const token of tokens) {
    if (loc.id.toLowerCase() === token) score += 90;
    if (loc.changeType.toLowerCase().includes(token)) score += 40;
    if (loc.keywords.some(k => k.includes(token) || token.includes(k))) score += 30;
    if (loc.name.toLowerCase().includes(token)) score += 25;
    if (loc.region.toLowerCase().includes(token)) score += 20;
    if (loc.description.toLowerCase().includes(token)) score += 15;
    if (loc.source.toLowerCase().includes(token)) score += 10;
  }

  // 4. Sector keywords
  if (qClean.includes('north') && loc.region.includes('Northern')) score += 25;
  if (qClean.includes('west') && loc.region.includes('Western')) score += 25;
  if (qClean.includes('east') && loc.region.includes('Eastern')) score += 25;
  if ((qClean.includes('himalaya') || qClean.includes('central')) && loc.region.includes('Central Himalayan')) score += 25;

  // 5. Year matching (e.g. 2023, 2026)
  for (const y of ['2022', '2023', '2024', '2025', '2026']) {
    if (qClean.includes(y)) {
      if (loc.observationPeriod.includes(y)) score += 15;
      if (loc.timelineProgression.some(t => t.year.toString() === y)) score += 10;
    }
  }

  return score;
};

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

  // Active Location State
  const [activeLocationId, setActiveLocationId] = useState<string>('LOC-STRAT-01');
  const [activeTimelineYear, setActiveTimelineYear] = useState<number>(2026);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Comparison Workspace State
  const [viewMode, setViewMode] = useState<'dual' | 'swipe' | 'schematic'>('dual');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage for swipe curtain

  // Map Controls State
  const [mapZoom, setMapZoom] = useState(1.0);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });

  // Modals State
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSchematicModal, setShowSchematicModal] = useState(false);
  const [analystNotes, setAnalystNotes] = useState(
    'Initial AI multi-temporal change detection verified against Sentinel-2 10m L2A imagery. Visual difference confirms new structural expansion within 5 km of boundary line. Requires ground-level/high-resolution confirmation prior to briefing.'
  );

  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Natural-Language Semantic Search & Filtering Engine
  const filteredLocations = useMemo(() => {
    // 1. Base Dropdown Filtering
    const baseList = DEMO_BORDER_LOCATIONS.filter((loc) => {
      // Change Type Filter
      if (selectedType !== 'All' && loc.changeType !== selectedType) {
        return false;
      }

      // Sector Filter
      if (selectedRegion !== 'All' && loc.region !== selectedRegion) {
        return false;
      }

      // Distance Filter
      if (selectedDistance === '< 3 km' && loc.borderDistanceKm >= 3) return false;
      if (selectedDistance === '< 5 km' && loc.borderDistanceKm >= 5) return false;
      if (selectedDistance === '< 10 km' && loc.borderDistanceKm >= 10) return false;

      // Confidence Filter
      if (selectedConfidence === '90%+' && loc.confidence < 90) return false;
      if (selectedConfidence === '95%+' && loc.confidence < 95) return false;

      // Source Filter
      if (selectedSource !== 'All' && !loc.source.toLowerCase().includes(selectedSource.toLowerCase())) {
        return false;
      }

      // Date Range Filter
      if (selectedDateRange !== 'All' && !loc.observationPeriod.includes(selectedDateRange)) {
        return false;
      }

      return true;
    });

    const qClean = searchQuery.toLowerCase().trim();
    if (!qClean) {
      return baseList;
    }

    // 2. Score and rank by semantic relevance
    const scored = baseList
      .map((loc) => ({
        loc,
        score: computeRelevance(loc, qClean)
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
      return scored.map((item) => item.loc);
    }

    // Fallback: match any non-stop words if zero score
    const words = qClean.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => !SEARCH_STOP_WORDS.has(w) && w.length > 2);
    if (words.length > 0) {
      const fallback = baseList.filter((loc) =>
        words.some(
          (w) =>
            loc.name.toLowerCase().includes(w) ||
            loc.changeType.toLowerCase().includes(w) ||
            loc.description.toLowerCase().includes(w) ||
            loc.keywords.some((k) => k.includes(w))
        )
      );
      if (fallback.length > 0) return fallback;
    }

    return [];
  }, [
    searchQuery,
    selectedType,
    selectedRegion,
    selectedDistance,
    selectedConfidence,
    selectedSource,
    selectedDateRange
  ]);

  // Active Location synchronization: always resolves to matching results
  const activeLocation = useMemo(() => {
    const found = filteredLocations.find((l) => l.id === activeLocationId);
    if (found) return found;
    if (filteredLocations.length > 0) return filteredLocations[0];
    return DEMO_BORDER_LOCATIONS[0];
  }, [filteredLocations, activeLocationId]);

  // Keep activeLocationId in sync whenever search or filters update
  useEffect(() => {
    if (filteredLocations.length > 0) {
      const match = filteredLocations.find((l) => l.id === activeLocationId);
      if (!match) {
        setActiveLocationId(filteredLocations[0].id);
      }
    }
  }, [filteredLocations, activeLocationId]);

  // Timeline Step for active location and active year
  const activeTimelineStep = useMemo(() => {
    return (
      activeLocation.timelineProgression.find((t) => t.year === activeTimelineYear) ||
      activeLocation.timelineProgression[activeLocation.timelineProgression.length - 1]
    );
  }, [activeLocation, activeTimelineYear]);

  // Auto-play Year-by-Year progression
  useEffect(() => {
    if (!isPlaying) return;
    const years = [2022, 2023, 2024, 2025, 2026];
    const timer = setInterval(() => {
      setActiveTimelineYear((curr) => {
        const idx = years.indexOf(curr);
        const nextIdx = (idx + 1) % years.length;
        return years[nextIdx];
      });
    }, 1800);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Handle Swipe Slider Draggable Movement
  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const position = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  const exampleSearches = [
    'Find newly constructed structures near an international border',
    'Show areas with road development between 2023 and 2026',
    'Find regions where construction activity increased',
    'Show land-use changes near a border'
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#070D16] text-white font-sans overflow-y-auto selection:bg-[#00E5FF]/30 selection:text-white">
      {/* 1. TOP BANNER / DISCLAIMER NOTICE */}
      <div className="bg-[#0B1523] border-b border-[#182A40] px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-2 text-xs">
          <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span className="font-semibold text-white">
            BORDER & STRATEGIC CHANGE ANALYSIS • UNCLASSIFIED OPEN SOURCE / SYNTHETIC DEMONSTRATION
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-[#64748B]">
          <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>AI-assisted detection. Analyst verification required.</span>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="px-4 pt-4 pb-2 grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="bg-[#0B1523] border border-[#182A40] p-3 rounded-xl shadow">
          <div className="text-[10px] font-mono text-[#64748B] uppercase">Monitored Border Zones</div>
          <div className="text-xl font-bold font-mono text-white mt-1">4 Active Sectors</div>
          <div className="text-[10px] text-[#38BDF8] mt-0.5">Northern, Western, Eastern & Himalayan</div>
        </div>

        <div className="bg-[#0B1523] border border-[#182A40] p-3 rounded-xl shadow">
          <div className="text-[10px] font-mono text-[#64748B] uppercase">Detected Change Events</div>
          <div className="text-xl font-bold font-mono text-[#00E5FF] mt-1">
            {DEMO_BORDER_LOCATIONS.length} Strategic Points
          </div>
          <div className="text-[10px] text-[#10B981] mt-0.5">Multi-temporal optical & SAR pairs</div>
        </div>

        <div className="bg-[#0B1523] border border-[#182A40] p-3 rounded-xl shadow">
          <div className="text-[10px] font-mono text-[#64748B] uppercase">Average Detection Confidence</div>
          <div className="text-xl font-bold font-mono text-[#10B981] mt-1">92.4%</div>
          <div className="text-[10px] text-[#64748B] mt-0.5">Cos-sim feature embeddings &delta;</div>
        </div>

        <div className="bg-[#0B1523] border border-[#182A40] p-3 rounded-xl shadow">
          <div className="text-[10px] font-mono text-[#64748B] uppercase">Latest Satellite Pass</div>
          <div className="text-xl font-bold font-mono text-[#F59E0B] mt-1">2026-02-24</div>
          <div className="text-[10px] text-[#94A3B8] mt-0.5">Sentinel-2 (10m L2A) Cadence</div>
        </div>
      </div>

      {/* 3. NATURAL-LANGUAGE SEARCH & FILTERS BAR */}
      <div className="px-4 py-2 shrink-0">
        <div className="bg-[#0B1523] border border-[#182A40] p-3 rounded-xl space-y-2.5 shadow">
          {/* Main Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in plain English (e.g. 'find newly constructed structures near an international border' or 'road development')..."
              className="w-full bg-[#070D16] border border-[#182A40] focus:border-[#00E5FF] text-xs text-white placeholder-[#64748B] rounded-lg pl-9 pr-24 py-2 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#64748B] hover:text-white font-mono bg-[#0E1A2B] px-1.5 py-0.5 rounded cursor-pointer"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Example Search Query Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-bold text-[#64748B] uppercase shrink-0">Examples:</span>
            {exampleSearches.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => {
                  // Clear conflicting filters so search query takes full effect
                  setSelectedType('All');
                  setSelectedRegion('All');
                  setSelectedDistance('All');
                  setSelectedConfidence('All');
                  setSelectedSource('All');
                  setSelectedDateRange('All');
                  setSearchQuery(ex);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] border whitespace-nowrap transition cursor-pointer shrink-0 ${
                  searchQuery === ex
                    ? 'bg-[#00E5FF] text-[#070D16] border-[#00E5FF] font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                    : 'bg-[#0E1A2B] hover:bg-[#15273F] border-[#182A40] text-[#94A3B8] hover:text-white'
                }`}
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
                <option value="< 3 km">&lt; 3 km from border</option>
                <option value="< 5 km">&lt; 5 km from border</option>
                <option value="< 10 km">&lt; 10 km from border</option>
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
            {(selectedType !== 'All' ||
              selectedRegion !== 'All' ||
              selectedDistance !== 'All' ||
              selectedConfidence !== 'All' ||
              selectedSource !== 'All' ||
              selectedDateRange !== 'All' ||
              searchQuery) && (
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
              {filteredLocations.length} strategic locations found
            </span>
          </div>
        </div>
      </div>

      {/* 4. MAIN WORKSPACE: MAP & YEAR-BY-YEAR PROGRESSION (Left) + EVIDENCE VIEWER (Right) */}
      <div className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
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

              {/* Empty State Overlay if no locations matched search */}
              {filteredLocations.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/75 backdrop-blur-sm pointer-events-auto p-4">
                  <div className="bg-[#0B1523] border border-[#182A40] rounded-2xl p-5 max-w-sm text-center space-y-3 shadow-2xl">
                    <AlertCircle className="w-8 h-8 text-[#F59E0B] mx-auto animate-bounce" />
                    <div>
                      <div className="text-sm font-bold text-white">No Strategic Points Found</div>
                      <p className="text-xs text-[#94A3B8] mt-1">
                        No locations matched "{searchQuery}" with the selected sector and filter parameters.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedType('All');
                        setSelectedRegion('All');
                        setSelectedDistance('All');
                        setSelectedConfidence('All');
                        setSelectedSource('All');
                        setSelectedDateRange('All');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-xs font-semibold text-white transition cursor-pointer shadow"
                    >
                      Reset All Filters & Search
                    </button>
                  </div>
                </div>
              )}
                {/* Detected Change Location Pins: Clean by default; info card only when selected! */}
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
                          isSelected
                            ? 'w-6 h-6 border-white shadow-[0_0_20px_#00E5FF] scale-125'
                            : 'w-4 h-4 border-[#070D16] group-hover:scale-110 shadow-md'
                        }`}
                        style={{ backgroundColor: pinColor }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>

                      {/* Pin Tag Card: ONLY SHOWN WHEN CLICKED / SELECTED */}
                      {isSelected && (
                        <div
                          className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-2 rounded-xl border border-[#00E5FF] bg-[#070D16]/95 text-white shadow-[0_0_25px_rgba(0,229,255,0.6)] z-40 scale-105 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
                        >
                          <div className="flex items-center space-x-1.5 font-bold">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pinColor }} />
                            <span className="text-white text-xs">{loc.id}</span>
                            <span className="text-[#00E5FF] text-[10px]">• {loc.changeType}</span>
                          </div>
                          <div className="text-[10px] text-[#38BDF8] font-medium mt-0.5 truncate max-w-[220px]">
                            {loc.name}
                          </div>
                          <div className="text-[9px] font-mono text-[#F59E0B] mt-0.5 flex items-center space-x-2">
                            <span>{loc.borderDistanceStr}</span>
                            <span>•</span>
                            <span className="text-[#10B981]">{loc.confidence}% match</span>
                          </div>
                        </div>
                      )}

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

          {/* Multi-Year Timeline Progression (2022 -> 2026) with Auto-Play & Forensic Change */}
          <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-3 shadow-lg space-y-2.5">
            {/* Timeline Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#00E5FF]" />
                <span className="text-xs font-bold text-white">Year-by-Year Multi-Temporal Progression</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Auto-Play Button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow ${
                    isPlaying
                      ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                      : 'bg-[#0284C7] text-white hover:bg-[#0369A1]'
                  }`}
                  title={isPlaying ? 'Pause Auto-Play' : 'Auto-Play Progression (2022 → 2026)'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause' : 'Play Progression'}</span>
                </button>

                {/* Full Dossier Inspector Trigger */}
                <button
                  onClick={() => setShowSchematicModal(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-[#38BDF8] hover:text-white flex items-center space-x-1.5 transition cursor-pointer"
                  title="Open Full 5-Year Schematic Evolution Dossier"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Schematic Dossier</span>
                </button>
              </div>
            </div>

            {/* Timeline Year Step Buttons (5 Years: 2022, 2023, 2024, 2025, 2026) */}
            <div className="grid grid-cols-5 gap-1.5">
              {[2022, 2023, 2024, 2025, 2026].map((yr) => {
                const isSelected = activeTimelineYear === yr;
                const step =
                  activeLocation.timelineProgression.find((t) => t.year === yr) ||
                  activeLocation.timelineProgression[0];

                return (
                  <button
                    key={yr}
                    onClick={() => {
                      setIsPlaying(false);
                      setActiveTimelineYear(yr);
                    }}
                    className={`p-2 rounded-xl text-xs font-mono transition cursor-pointer flex flex-col items-center justify-between border ${
                      isSelected
                        ? 'bg-[#0E355A] border-[#00E5FF] text-white shadow-[0_0_15px_rgba(0,229,255,0.4)] ring-1 ring-[#00E5FF]'
                        : 'bg-[#070D16] border-[#182A40] text-[#94A3B8] hover:border-[#38BDF8] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1 font-bold">
                      <span className={isSelected ? 'text-[#00E5FF]' : 'text-white'}>{yr}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />}
                    </div>
                    <span className="text-[9px] font-sans font-medium truncate max-w-full text-center mt-0.5">
                      {step.stage}
                    </span>
                    <span className="text-[8px] font-mono px-1 py-0.2 rounded mt-1 bg-[#182A40]/80 text-[#38BDF8]">
                      {step.builtFootprint}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Year-by-Year Forensic Observation Breakdown Card */}
            <div className="p-3 rounded-xl bg-[#070D16] border border-[#182A40] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#182A40] pb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] text-xs font-mono font-bold">
                    Year {activeTimelineYear} • {activeTimelineStep.date}
                  </span>
                  <span className="text-xs font-bold text-white">{activeTimelineStep.stage}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0284C7]/20 text-[#38BDF8] font-bold self-start sm:self-auto">
                  {activeTimelineStep.status}
                </span>
              </div>

              {/* Exact Change Description */}
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                <span className="font-semibold text-white">What Changed in {activeTimelineYear}: </span>
                {activeTimelineStep.notes}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
                <div className="p-1.5 rounded bg-[#0B1523] border border-[#182A40]">
                  <span className="text-[#64748B] block uppercase text-[8px]">Built Footprint</span>
                  <span className="text-white font-bold">{activeTimelineStep.builtFootprint}</span>
                </div>
                <div className="p-1.5 rounded bg-[#0B1523] border border-[#182A40]">
                  <span className="text-[#64748B] block uppercase text-[8px]">Year-on-Year &Delta;</span>
                  <span className="text-[#10B981] font-bold">{activeTimelineStep.yearDelta}</span>
                </div>
                <div className="p-1.5 rounded bg-[#0B1523] border border-[#182A40]">
                  <span className="text-[#64748B] block uppercase text-[8px]">Activity Level</span>
                  <span className="text-[#F59E0B] font-bold">{activeTimelineStep.activityLevel}</span>
                </div>
                <div className="p-1.5 rounded bg-[#0B1523] border border-[#182A40]">
                  <span className="text-[#64748B] block uppercase text-[8px]">Sensor Source</span>
                  <span className="text-[#38BDF8] font-bold truncate block">{activeLocation.source}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filtered Locations List Carousel */}
          <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-3 shadow-lg">
            <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Detected Locations in Sector ({filteredLocations.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto no-scrollbar">
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
                    <div
                      className="w-12 h-12 rounded-lg overflow-hidden border border-[#182A40] shrink-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${loc.afterImageUrl})` }}
                    />
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

        {/* Right Column (5 cols): Large Comparison & Analyst Card */}
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
                className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  viewMode === 'dual' ? 'bg-[#0284C7] text-white font-bold' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Dual Tile
              </button>
              <button
                onClick={() => setViewMode('swipe')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  viewMode === 'swipe' ? 'bg-[#0284C7] text-white font-bold' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Swipe
              </button>
              <button
                onClick={() => setViewMode('schematic')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  viewMode === 'schematic' ? 'bg-[#0284C7] text-white font-bold' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                5-Year View
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

          {/* Visual Evidence Viewer */}
          <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-3 shadow-2xl overflow-hidden flex flex-col">
            {viewMode === 'schematic' ? (
              /* 5-YEAR SCHEMATIC GALLERY: All 5 Years Shown Side-by-Side */
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-bold">5-YEAR TEMPORAL SATELLITE CADENCE</span>
                  <span className="text-[#00E5FF] text-[10px]">Click any year to select</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5">
                  {activeLocation.timelineProgression.map((step) => {
                    const isCur = activeTimelineYear === step.year;
                    return (
                      <div
                        key={step.year}
                        onClick={() => {
                          setIsPlaying(false);
                          setActiveTimelineYear(step.year);
                        }}
                        className={`rounded-xl border p-2 flex flex-col transition cursor-pointer ${
                          isCur
                            ? 'bg-[#0E355A] border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)] ring-1 ring-[#00E5FF]'
                            : 'bg-[#070D16] border-[#182A40] hover:border-[#38BDF8] text-[#94A3B8]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
                          <span className={isCur ? 'text-[#00E5FF]' : 'text-white'}>{step.year}</span>
                          <span className="text-[9px] text-[#64748B]">{step.date.slice(5)}</span>
                        </div>
                        <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#182A40] relative mb-1.5 bg-[#020617]">
                          <img src={step.imgUrl} alt={step.stage} className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-black/80 px-1 py-0.2 rounded text-[8px] font-mono text-[#38BDF8]">
                            {step.builtFootprint}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-white truncate">{step.stage}</div>
                        <div className="text-[9px] text-[#94A3B8] line-clamp-2 mt-0.5 leading-tight">
                          {step.notes}
                        </div>
                        <div className="mt-auto pt-1 flex items-center justify-between text-[8px] font-mono">
                          <span className="text-[#10B981] font-semibold">{step.yearDelta}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : viewMode === 'dual' ? (
              /* DUAL TILE VIEW: Side-by-side Before (Baseline) vs After (Selected Year) */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
                {/* Left: BASELINE */}
                <div className="relative rounded-lg overflow-hidden border border-[#182A40] bg-[#070D16] aspect-[4/3]">
                  <img
                    src={activeLocation.beforeImageUrl}
                    alt="Before change"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-[#070D16]/90 border border-[#182A40] text-[10px] font-mono px-2 py-0.5 rounded text-white backdrop-blur">
                    BASELINE: {activeLocation.beforeDate}
                  </div>
                  <div className="absolute bottom-2 left-2 text-[9px] font-mono text-[#94A3B8] bg-black/60 px-1.5 py-0.5 rounded">
                    Undisturbed Terrain
                  </div>
                </div>

                {/* Right: SELECTED YEAR OBSERVATION */}
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
                    OBSERVED: {activeTimelineStep.date} (Year {activeTimelineYear})
                  </div>
                  <div className="absolute bottom-2 right-2 text-[9px] font-mono text-[#10B981] bg-black/75 px-1.5 py-0.5 rounded font-bold">
                    {activeTimelineStep.stage}
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
                {/* Underneath: AFTER image (Selected Year) */}
                <img
                  src={activeTimelineStep.imgUrl}
                  alt="After"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />

                {showHeatmap && (
                  <div className="absolute inset-0 bg-red-500/25 mix-blend-color-dodge pointer-events-none" />
                )}

                {/* Top clipped: BEFORE image (Baseline) */}
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
                    BASELINE: {activeLocation.beforeDate}
                  </div>
                </div>

                <div className="absolute top-2 right-2 bg-[#00E5FF]/20 border border-[#00E5FF] text-[10px] font-mono px-2 py-0.5 rounded text-[#00E5FF] font-bold">
                  OBSERVED: {activeTimelineStep.date} ({activeTimelineYear})
                </div>

                {/* Draggable Divider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] cursor-ew-resize flex items-center justify-center"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#00E5FF] text-[#070D16] font-bold text-xs flex items-center justify-center shadow-lg">
                    &#8644;
                  </div>
                </div>
              </div>
            )}

            {/* Slider Instructions hint */}
            {viewMode === 'swipe' && (
              <div className="text-[10px] font-mono text-[#64748B] text-center mt-1.5">
                Drag slider horizontally to inspect visual difference between Baseline and Year {activeTimelineYear}
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
                <div className="text-sm font-bold font-mono text-[#10B981]">{activeLocation.confidence}% Match</div>
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
                onClick={() => setShowSchematicModal(true)}
                className="py-2 px-3 rounded-lg bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-xs font-semibold text-white transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Schematic Dossier</span>
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

      {/* 5. FULL 5-YEAR SCHEMATIC EVOLUTION DOSSIER MODAL */}
      {showSchematicModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0B1523] border border-[#00E5FF]/40 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col font-sans my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#070D16] border-b border-[#182A40] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/20 border border-[#00E5FF] flex items-center justify-center text-[#00E5FF] font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wider uppercase">
                    Year-by-Year Schematic Evolution Dossier • {activeLocation.id}
                  </h2>
                  <div className="text-[10px] font-mono text-[#64748B]">
                    {activeLocation.name} • {activeLocation.coordinates} • {activeLocation.borderDistanceStr}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSchematicModal(false)}
                className="w-8 h-8 rounded-lg bg-[#0E1A2B] hover:bg-[#15273F] text-[#94A3B8] hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Complete 5-Year Chronological Step-by-Step Gallery */}
            <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh] text-xs">
              <div className="flex items-center justify-between bg-[#070D16] p-3 rounded-xl border border-[#182A40]">
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] uppercase block">Analysis Category</span>
                  <span className="font-bold text-white text-sm">{activeLocation.changeType}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] uppercase block">Observation Period</span>
                  <span className="font-mono text-[#00E5FF] font-bold">{activeLocation.observationPeriod}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] uppercase block">Total Area Delta</span>
                  <span className="font-mono text-[#10B981] font-bold">{activeLocation.changedArea}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] uppercase block">Confidence Score</span>
                  <span className="font-mono text-[#F59E0B] font-bold">{activeLocation.confidence}% Match</span>
                </div>
              </div>

              {/* 5-Year Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {activeLocation.timelineProgression.map((step) => (
                  <div
                    key={step.year}
                    className="bg-[#070D16] border border-[#182A40] rounded-xl p-3 flex flex-col space-y-2 hover:border-[#00E5FF] transition"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] text-xs font-bold">
                        Year {step.year}
                      </span>
                      <span className="text-[10px] text-[#64748B]">{step.date}</span>
                    </div>

                    <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#182A40] relative bg-[#020617]">
                      <img src={step.imgUrl} alt={step.stage} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-mono text-[#38BDF8]">
                        Footprint: {step.builtFootprint}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-white text-xs">{step.stage}</div>
                      <div className="text-[10px] font-mono text-[#38BDF8] mt-0.5">{step.status}</div>
                    </div>

                    <p className="text-[11px] text-[#94A3B8] leading-tight flex-1">
                      {step.notes}
                    </p>

                    <div className="pt-2 border-t border-[#182A40] space-y-1 font-mono text-[9px]">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">&Delta; Change:</span>
                        <span className="text-[#10B981] font-bold">{step.yearDelta}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Activity:</span>
                        <span className="text-[#F59E0B] font-bold">{step.activityLevel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Forensic Assessment Summary */}
              <div className="p-3.5 rounded-xl bg-[#070D16] border border-[#182A40] space-y-2">
                <span className="font-bold text-white text-xs block">AI-Assisted Temporal Analysis Summary:</span>
                <p className="text-[#94A3B8] leading-relaxed text-xs">
                  {activeLocation.description} Multi-temporal analysis across the 2022&ndash;2026 satellite acquisition archive
                  verifies progressive structural footprint alteration of {activeLocation.changedArea} within {activeLocation.borderDistanceStr}.
                </p>
                <div className="flex items-center space-x-4 pt-1 font-mono text-[10px] text-[#64748B]">
                  <span>NDBI (Built-up Delta): <b className="text-white">{activeLocation.ndbiDelta}</b></span>
                  <span>NDVI (Canopy Delta): <b className="text-white">{activeLocation.ndviDelta}</b></span>
                  <span>Sensor: <b className="text-white">{activeLocation.source}</b></span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-2.5 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[11px] text-[#F59E0B]">
                <b>MANDATORY NOTICE:</b> AI-assisted detection based on publicly available satellite imagery. Results require human analyst verification.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#070D16] border-t border-[#182A40] px-5 py-3 flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#64748B]">
                Orbital Intel Space Intelligence &bull; Multi-Temporal Forensic Cadence
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
                  onClick={() => setShowSchematicModal(false)}
                  className="h-8 px-3.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-xs font-semibold text-white flex items-center space-x-1.5 transition cursor-pointer shadow"
                >
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. FORMAL GEOSPATIAL INTELLIGENCE REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0B1523] border border-[#00E5FF]/40 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col font-sans my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Report Header Bar */}
            <div className="bg-[#070D16] border-b border-[#182A40] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/20 border border-[#00E5FF] flex items-center justify-center text-[#00E5FF] font-bold">
                  O
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wider uppercase">
                    Orbital Intel Space Intelligence • Border Change Report
                  </h2>
                  <div className="text-[10px] font-mono text-[#64748B]">
                    REF: OIT-STRAT-2026-0941-DEMO • UNCLASSIFIED // PUBLIC OPEN SOURCE
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
                    <img src={activeTimelineStep.imgUrl} alt="After" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-[#00E5FF]/20 border border-[#00E5FF] px-2 py-0.5 rounded text-[9px] font-mono text-[#00E5FF] font-bold">
                      Observed: {activeTimelineStep.date} ({activeTimelineYear})
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
                Generated by Orbital Intel Geospatial Platform (SIH26227)
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
