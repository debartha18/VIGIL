/**
 * CANONICAL SOURCE OF TRUTH FOR MULTI-TEMPORAL CHANGE CANDIDATES
 * Synchronized with AOI Monitor (AOI-1, AOI-2, AOI-3) and Tactical Search Locations
 */

export interface ChangeCandidateItem {
  id: string;
  aoiId: string;
  aoiName: string;
  title: string;
  locationName: string;
  changeType: string;
  change_type?: string;
  areaM2: number;
  area_m2?: number;
  areaHa: number;
  firstEvidenceAt: string;
  first_evidence_at?: string;
  confirmedAt: string;
  nearestRiverM: number;
  nearest_river_m?: number;
  classifiedBy: string;
  classified_by?: string;
  confidencePct: number;
  confidence: {
    composite_score: number;
    breakdown?: {
      semanticRelevance?: number;
      temporalPersistence?: number;
      registrationQuality?: number;
      observationCleanliness?: number;
      changeMagnitude?: number;
    };
  };
  verdict: 'CONFIRMED' | 'REJECTED' | 'INVESTIGATE';
  sensor: string;
  description: string;
  beforeImgUrl: string;
  afterImgUrl: string;
  coordinates: string;
  lat: number;
  lon: number;
  observations?: {
    date: string;
    sensor: string;
    status: string;
    clean: boolean;
  }[];
  processingLog?: string[];
  processing_log?: string[];
}

export const CANONICAL_CHANGE_CANDIDATES: ChangeCandidateItem[] = [
  {
    id: 'CAND-AOI-01',
    aoiId: 'AOI-1',
    aoiName: 'Tapi River Estuary & Hazira Industrial Belt',
    title: 'Tapi Industrial Wharf & Pylon Extension',
    locationName: 'Tapi River Estuary & Hazira Industrial Belt, Gujarat',
    changeType: 'NEW_CONSTRUCTION',
    change_type: 'NEW_CONSTRUCTION',
    areaM2: 42000,
    area_m2: 42000,
    areaHa: 4.2,
    firstEvidenceAt: '2023-08-12',
    first_evidence_at: '2023-08-12',
    confirmedAt: '2025-04-28 (2 days ago)',
    nearestRiverM: 45,
    nearest_river_m: 45,
    classifiedBy: 'FC-Siam-diff+SpectralRules',
    classified_by: 'FC-Siam-diff+SpectralRules',
    confidencePct: 96,
    confidence: {
      composite_score: 0.96,
      breakdown: {
        semanticRelevance: 0.96,
        temporalPersistence: 0.98,
        registrationQuality: 0.95,
        observationCleanliness: 0.94,
        changeMagnitude: 0.91
      }
    },
    verdict: 'CONFIRMED',
    sensor: 'Sentinel-2 (10m) / Sentinel-1 SAR',
    description: '17 new industrial shed foundations and reinforced river wharf pylon expansion detected near deepwater channel.',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/after_scene.jpg',
    coordinates: '21.4587° N, 72.7812° E',
    lat: 21.4587,
    lon: 72.7812,
    observations: [
      { date: '2023-08-12', sensor: 'Sentinel-2 L2A', status: 'Baseline - Undeveloped Estuary', clean: true },
      { date: '2024-02-18', sensor: 'Sentinel-2 L2A', status: 'Ground Excavation & Pile Foundation', clean: true },
      { date: '2024-08-19', sensor: 'Sentinel-1 SAR', status: 'High Radar Backscatter - Deck Emergence', clean: true },
      { date: '2025-04-28', sensor: 'Sentinel-2 L2A', status: 'Finished 380m Wharf Structure with Crane Rails', clean: true }
    ],
    processingLog: [
      '2025-04-28: Detected via bi-temporal differencing against 2023-08-12 baseline',
      '2025-04-28: Phase correlation check: dx=0.14px, dy=-0.08px, residual=0.16px (PASS)',
      '2025-04-28: Temporal persistence verified across 4 cloud-free acquisitions (PASS)'
    ]
  },
  {
    id: 'CAND-AOI-03',
    aoiId: 'AOI-3',
    aoiName: 'Hazira Deepwater Port Marine Basin & Berths',
    title: 'Marine Basin Berth Extension & Dredging Plume',
    locationName: 'Hazira Deepwater Port Marine Basin & Berths, Gulf of Khambhat',
    changeType: 'PORT_INFRASTRUCTURE',
    change_type: 'PORT_INFRASTRUCTURE',
    areaM2: 18000,
    area_m2: 18000,
    areaHa: 1.8,
    firstEvidenceAt: '2023-11-04',
    first_evidence_at: '2023-11-04',
    confirmedAt: '2025-04-27 (Yesterday)',
    nearestRiverM: 0,
    nearest_river_m: 0,
    classifiedBy: 'Sentinel-1 SAR Radar + NDWI',
    classified_by: 'Sentinel-1 SAR Radar + NDWI',
    confidencePct: 88,
    confidence: {
      composite_score: 0.88,
      breakdown: {
        semanticRelevance: 0.89,
        temporalPersistence: 0.91,
        registrationQuality: 0.90,
        observationCleanliness: 0.88,
        changeMagnitude: 0.84
      }
    },
    verdict: 'CONFIRMED',
    sensor: 'Sentinel-1 SAR (10m) / Sentinel-2',
    description: 'Container stack orientation shift and temporary dredging barge moored along secondary jetty.',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/after_scene.jpg',
    coordinates: '21.0950° N, 72.6520° E',
    lat: 21.0950,
    lon: 72.6520,
    observations: [
      { date: '2023-11-04', sensor: 'Sentinel-2 L2A', status: 'Baseline Open Water Basin', clean: true },
      { date: '2024-06-12', sensor: 'Sentinel-1 SAR', status: 'Dredging Operations Detected', clean: true },
      { date: '2025-04-27', sensor: 'Sentinel-1 SAR', status: 'Structural Berth & Mooring Extension', clean: true }
    ],
    processingLog: [
      '2025-04-27: SAR VV/VH polarization ratio shift confirmed',
      '2025-04-27: Non-tidal vessel signature distinguished from permanent infrastructure'
    ]
  },
  {
    id: 'CAND-2026-002',
    aoiId: 'AOI-1',
    aoiName: 'Tapi River Estuary & Hazira Industrial Belt',
    title: 'South Estuary Dredged Channel & Riprap Embankment',
    locationName: 'Tapi River Southern Bund, Surat, Gujarat',
    changeType: 'WATER_BOUNDARY',
    change_type: 'WATER_BOUNDARY',
    areaM2: 68200,
    area_m2: 68200,
    areaHa: 6.8,
    firstEvidenceAt: '2023-11-04',
    first_evidence_at: '2023-11-04',
    confirmedAt: '2025-03-15',
    nearestRiverM: 0,
    nearest_river_m: 0,
    classifiedBy: 'SpectralIndices-NDWI',
    classified_by: 'SpectralIndices-NDWI',
    confidencePct: 91,
    confidence: {
      composite_score: 0.91,
      breakdown: {
        semanticRelevance: 0.92,
        temporalPersistence: 0.98,
        registrationQuality: 0.95,
        observationCleanliness: 0.92,
        changeMagnitude: 0.88
      }
    },
    verdict: 'CONFIRMED',
    sensor: 'Sentinel-2 L2A (10m)',
    description: 'Engineered riprap embankment stabilized; water boundary shift and deepening verified.',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/after_scene.jpg',
    coordinates: '21.4300° N, 72.7650° E',
    lat: 21.4300,
    lon: 72.7650,
    observations: [
      { date: '2023-11-04', sensor: 'Sentinel-2 L2A', status: 'Intertidal Silt Bank', clean: true },
      { date: '2024-04-25', sensor: 'Sentinel-2 L2A', status: 'Active Channel Deepening', clean: true },
      { date: '2025-03-15', sensor: 'Sentinel-2 L2A', status: 'Riprap Embankment Stabilized', clean: true }
    ],
    processingLog: [
      '2025-03-15: Spectral NDWI delta +0.34 confirmed',
      '2025-03-15: Sub-pixel residual 0.22px (PASS)'
    ]
  },
  {
    id: 'CAND-2026-004',
    aoiId: 'AOI-MUNDRA',
    aoiName: 'Mundra Port Sector',
    title: 'Mundra Port West Basin Container Berth Piling',
    locationName: 'Mundra Coastal Belt, Kutch, Gujarat',
    changeType: 'NEW_CONSTRUCTION',
    change_type: 'NEW_CONSTRUCTION',
    areaM2: 74000,
    area_m2: 74000,
    areaHa: 7.4,
    firstEvidenceAt: '2023-02-10',
    first_evidence_at: '2023-02-10',
    confirmedAt: '2025-03-15',
    nearestRiverM: 12,
    nearest_river_m: 12,
    classifiedBy: 'FC-Siam-diff+Multi-sensor SAR',
    classified_by: 'FC-Siam-diff+Multi-sensor SAR',
    confidencePct: 95,
    confidence: {
      composite_score: 0.95,
      breakdown: {
        semanticRelevance: 0.97,
        temporalPersistence: 0.98,
        registrationQuality: 0.96,
        observationCleanliness: 0.95,
        changeMagnitude: 0.92
      }
    },
    verdict: 'CONFIRMED',
    sensor: 'Sentinel-2 (10m) / Sentinel-1 SAR',
    description: 'Heavy container berth pile foundations and intertidal wharf deck reclamation underway.',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/after_scene.jpg',
    coordinates: '22.7383° N, 69.7042° E',
    lat: 22.7383,
    lon: 69.7042,
    observations: [
      { date: '2023-02-10', sensor: 'Sentinel-2 L2A', status: 'Baseline Natural Shoreline', clean: true },
      { date: '2024-03-22', sensor: 'Sentinel-1 SAR', status: 'Offshore Piling Grid Initiated', clean: true },
      { date: '2025-03-15', sensor: 'Sentinel-2 L2A', status: 'Reinforced Concrete Apron Finished', clean: true }
    ],
    processingLog: [
      '2025-03-15: Co-registered deep differencing verified',
      '2025-03-15: 8-step false alarm filter cleared'
    ]
  },
  {
    id: 'CAND-2026-005',
    aoiId: 'AOI-1',
    aoiName: 'Tapi River Estuary & Hazira Industrial Belt',
    title: 'Hazira Petrochemical Pipeline Trench & Tank Pad',
    locationName: 'Hazira Industrial Corridor North, Gujarat',
    changeType: 'INDUSTRIAL_EXPANSION',
    change_type: 'INDUSTRIAL_EXPANSION',
    areaM2: 36000,
    area_m2: 36000,
    areaHa: 3.6,
    firstEvidenceAt: '2024-03-10',
    first_evidence_at: '2024-03-10',
    confirmedAt: '2025-04-20',
    nearestRiverM: 180,
    nearest_river_m: 180,
    classifiedBy: 'FC-Siam-diff Bi-temporal',
    classified_by: 'FC-Siam-diff Bi-temporal',
    confidencePct: 93,
    confidence: {
      composite_score: 0.93,
      breakdown: {
        semanticRelevance: 0.94,
        temporalPersistence: 0.95,
        registrationQuality: 0.92,
        observationCleanliness: 0.91,
        changeMagnitude: 0.89
      }
    },
    verdict: 'CONFIRMED',
    sensor: 'Sentinel-2 L2A (10m)',
    description: 'Underground high-pressure pipeline trench backfilled; two circular tank foundation pads emerged.',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/after_scene.jpg',
    coordinates: '21.4650° N, 72.7950° E',
    lat: 21.4650,
    lon: 72.7950,
    observations: [
      { date: '2024-03-10', sensor: 'Sentinel-2 L2A', status: 'Open Scrubland', clean: true },
      { date: '2024-10-15', sensor: 'Sentinel-2 L2A', status: 'Linear Excavation Corridors', clean: true },
      { date: '2025-04-20', sensor: 'Sentinel-2 L2A', status: 'Storage Silo Ring Foundations', clean: true }
    ],
    processingLog: [
      '2025-04-20: Geometric persistence verified across dry season acquisitions'
    ]
  },
  {
    id: 'CAND-2026-006',
    aoiId: 'AOI-3',
    aoiName: 'Hazira Deepwater Port Marine Basin & Berths',
    title: 'Coastal Mangrove Fringe Clearing & Bund',
    locationName: 'Dumas-Hazira Transition Zone, Surat, Gujarat',
    changeType: 'LAND_CLEARANCE',
    change_type: 'LAND_CLEARANCE',
    areaM2: 24000,
    area_m2: 24000,
    areaHa: 2.4,
    firstEvidenceAt: '2024-01-10',
    first_evidence_at: '2024-01-10',
    confirmedAt: '2025-04-15',
    nearestRiverM: 320,
    nearest_river_m: 320,
    classifiedBy: 'SpectralIndices-NDVI',
    classified_by: 'SpectralIndices-NDVI',
    confidencePct: 84,
    confidence: {
      composite_score: 0.84,
      breakdown: {
        semanticRelevance: 0.86,
        temporalPersistence: 0.88,
        registrationQuality: 0.89,
        observationCleanliness: 0.87,
        changeMagnitude: 0.79
      }
    },
    verdict: 'INVESTIGATE',
    sensor: 'Sentinel-2 L2A (10m)',
    description: 'Vegetation loss detected along intertidal marsh boundary. Requires ground truth check.',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/after_scene.jpg',
    coordinates: '21.1100° N, 72.6850° E',
    lat: 21.1100,
    lon: 72.6850,
    observations: [
      { date: '2024-01-10', sensor: 'Sentinel-2 L2A', status: 'Dense Mangrove Canopy', clean: true },
      { date: '2024-09-05', sensor: 'Sentinel-2 L2A', status: 'Partial Canopy Defoliation', clean: true },
      { date: '2025-04-15', sensor: 'Sentinel-2 L2A', status: 'Cleared Mudflat Surface with Soil Berm', clean: true }
    ],
    processingLog: [
      '2025-04-15: Flagged for analyst adjudication under coastal protection clause'
    ]
  },
  {
    id: 'CAND-2026-007',
    aoiId: 'AOI-JNPT',
    aoiName: 'JNPT Nhava Sheva Maritime Corridor',
    title: 'JNPT Fourth Marine Terminal Reclamation',
    locationName: 'Nhava Sheva, Navi Mumbai, Maharashtra',
    changeType: 'PORT_INFRASTRUCTURE',
    change_type: 'PORT_INFRASTRUCTURE',
    areaM2: 82000,
    area_m2: 82000,
    areaHa: 8.2,
    firstEvidenceAt: '2023-04-05',
    first_evidence_at: '2023-04-05',
    confirmedAt: '2025-03-28',
    nearestRiverM: 0,
    nearest_river_m: 0,
    classifiedBy: 'FC-Siam-diff+Multi-sensor SAR',
    classified_by: 'FC-Siam-diff+Multi-sensor SAR',
    confidencePct: 94,
    confidence: {
      composite_score: 0.94,
      breakdown: {
        semanticRelevance: 0.95,
        temporalPersistence: 0.97,
        registrationQuality: 0.96,
        observationCleanliness: 0.93,
        changeMagnitude: 0.91
      }
    },
    verdict: 'CONFIRMED',
    sensor: 'Sentinel-2 (10m) / Sentinel-1 SAR',
    description: 'Caisson emplacement and extensive backfill for 4th container handling rail yard.',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/after_scene.jpg',
    coordinates: '18.9496° N, 72.9512° E',
    lat: 18.9496,
    lon: 72.9512,
    observations: [
      { date: '2023-04-05', sensor: 'Sentinel-2 L2A', status: 'Baseline Intertidal Berth', clean: true },
      { date: '2024-05-18', sensor: 'Sentinel-1 SAR', status: 'Caisson Structure Placed', clean: true },
      { date: '2025-03-28', sensor: 'Sentinel-2 L2A', status: 'Hardened Container Terminal Deck', clean: true }
    ],
    processingLog: [
      '2025-03-28: Multi-scene persistence verified (> 3 observations)'
    ]
  },
  {
    id: 'CAND-2026-008',
    aoiId: 'AOI-CHENNAI',
    aoiName: 'Chennai Port Outer Basin',
    title: 'Outer Breakwater Extension & Coal Berth Deck',
    locationName: 'Chennai Port Trust, Tamil Nadu',
    changeType: 'NEW_CONSTRUCTION',
    change_type: 'NEW_CONSTRUCTION',
    areaM2: 49000,
    area_m2: 49000,
    areaHa: 4.9,
    firstEvidenceAt: '2023-06-15',
    first_evidence_at: '2023-06-15',
    confirmedAt: '2025-04-02',
    nearestRiverM: 0,
    nearest_river_m: 0,
    classifiedBy: 'FC-Siam-diff+SpectralRules',
    classified_by: 'FC-Siam-diff+SpectralRules',
    confidencePct: 91,
    confidence: {
      composite_score: 0.91,
      breakdown: {
        semanticRelevance: 0.92,
        temporalPersistence: 0.93,
        registrationQuality: 0.91,
        observationCleanliness: 0.90,
        changeMagnitude: 0.88
      }
    },
    verdict: 'CONFIRMED',
    sensor: 'Sentinel-2 (10m) / Sentinel-1 SAR',
    description: 'Armored breakwater extension extending 420m into Bay of Bengal for deepwater coal handling.',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/after_scene.jpg',
    coordinates: '13.0827° N, 80.2985° E',
    lat: 13.0827,
    lon: 80.2985,
    observations: [
      { date: '2023-06-15', sensor: 'Sentinel-2 L2A', status: 'Open Sea Channel', clean: true },
      { date: '2024-08-10', sensor: 'Sentinel-1 SAR', status: 'Riprap Subsurface Mound Active', clean: true },
      { date: '2025-04-02', sensor: 'Sentinel-2 L2A', status: 'Finished Armored Jetty Deck', clean: true }
    ],
    processingLog: [
      '2025-04-02: Water/land transition algorithm confirmed permanent hard structure'
    ]
  }
];
