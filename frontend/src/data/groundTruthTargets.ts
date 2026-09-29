/**
 * CANONICAL SINGLE SOURCE OF TRUTH FOR VIGIL GROUND-TRUTH LOCATIONS
 * All displayed dates, observation periods, chronological passes, areas (ha and m²),
 * detection confidence, and retrieval scores are derived strictly from here.
 */

export interface TimelinePass {
  date: string;       // YYYY-MM-DD
  label: string;      // e.g. "Baseline", "Excavation", "Piling Works", "Superstructure"
  month: string;      // e.g. "Apr 2023"
  img: string;        // Asset image URL
  hasChange: boolean; // Whether change mask or change activity applies
}

export interface GroundTruthLocation {
  id: string;
  title: string;
  locationName: string;
  coordinates: string; // e.g. "21.4587° N, 72.7812° E"
  lat: number;
  lon: number;
  sensor: string;
  resolution: string; // e.g. "10 m"
  resolutionDetail: string; // e.g. "10m True Color (B4,B3,B2)"
  baselineDate: string; // YYYY-MM-DD (e.g. "2023-04-12")
  currentDate: string;  // YYYY-MM-DD (e.g. "2025-04-28")
  beforeCloudCover: string; // e.g. "0.8%"
  cloudCover: string;       // e.g. "1.2%"
  areaHaValue: number;      // e.g. 4.2
  areaM2Value: number;      // e.g. 42000 (strictly 4.2 * 10000)
  changePercentage: string; // e.g. "+34.8%"
  confidencePct: number;    // Detection Confidence (e.g. 96)
  relevanceScore: number;   // Retrieval Relevance (e.g. 96)
  changeType: string;       // e.g. "New Construction"
  imageUrl: string;
  beforeImgUrl: string;
  afterImgUrl: string;
  keywords: string[];
  passes: TimelinePass[];
  tacticalX: number;
  tacticalY: number;
  regionalX: number;
  regionalY: number;
}

/**
 * Computes exact whole months elapsed between two ISO date strings (YYYY-MM-DD).
 */
export function computeMonthsBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const yearsDiff = end.getFullYear() - start.getFullYear();
  const monthsDiff = end.getMonth() - start.getMonth();
  return yearsDiff * 12 + monthsDiff;
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into display format "DD Mon YYYY" (e.g. "12 Apr 2023").
 */
export function formatDateDisplay(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const year = parts[0];
      return `${day} ${months[monthIdx]} ${year}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into month-year format "Mon YYYY" (e.g. "Apr 2023").
 */
export function formatMonthYear(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const year = parts[0];
      return `${months[monthIdx]} ${year}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

/**
 * Formats standard Before and After image overlay labels strictly adhering to priority 3 format:
 * Format: "BEFORE · 12 Apr 2023 · 10 m · Cloud 0.8%"  /  "AFTER · 28 Apr 2025 · 10 m · Cloud 1.2%"
 */
export function formatImageOverlayLabel(
  type: 'BEFORE' | 'AFTER',
  dateStr: string,
  resolution: string,
  cloudCover: string
): string {
  const formattedDate = formatDateDisplay(dateStr);
  const cleanRes = resolution.replace(/\s*Optical.*$/i, '').trim();
  const cleanCloud = cloudCover.replace(/\s*\(.*?\)/g, '').trim();
  return `${type} · ${formattedDate} · ${cleanRes} · Cloud ${cleanCloud}`;
}

/**
 * Computes human-readable observation period string e.g. "Apr 2023 → Apr 2025".
 */
export function computeObservationPeriod(startDateStr: string, endDateStr: string): string {
  return `${formatMonthYear(startDateStr)} → ${formatMonthYear(endDateStr)}`;
}

/**
 * Master canonical array of verified Ground-Truth Locations
 */
export const CANONICAL_LOCATIONS: GroundTruthLocation[] = [
  {
    id: 'res-1',
    title: 'Hazira Deepwater Wharf & Piling Deck',
    locationName: 'Hazira Industrial Port Sector',
    coordinates: '21.4587° N, 72.7812° E',
    lat: 21.4587,
    lon: 72.7812,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color (B4,B3,B2)',
    baselineDate: '2023-04-12',
    currentDate: '2025-04-28',
    beforeCloudCover: '0.8%',
    cloudCover: '1.2%',
    areaHaValue: 4.2,
    areaM2Value: 42000,
    changePercentage: '+34.8%',
    confidencePct: 96,
    relevanceScore: 96,
    changeType: 'New Construction',
    imageUrl: '/assets/card_1_construction.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/after_scene.jpg',
    keywords: ['construction', 'wharf', 'port', 'jetty', 'marine', 'deck', 'structure', 'building', 'sea', 'coastal', 'concrete', 'pier'],
    passes: [
      { date: '2023-04-12', label: 'Baseline', month: 'Apr 2023', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2024-02-18', label: 'Excavation', month: 'Feb 2024', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-08-19', label: 'Piling Works', month: 'Aug 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2025-04-28', label: 'Superstructure', month: 'Apr 2025', img: '/assets/after_scene.jpg', hasChange: true },
    ],
    tacticalX: 47,
    tacticalY: 44,
    regionalX: 38.2,
    regionalY: 39.2,
  },
  {
    id: 'res-2',
    title: 'Dumas Coastal Bund & Sea Embankment',
    locationName: 'Dumas Shoreline Sector',
    coordinates: '21.4632° N, 72.7845° E',
    lat: 21.4632,
    lon: 72.7845,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color (B4,B3,B2)',
    baselineDate: '2022-11-04',
    currentDate: '2024-11-18',
    beforeCloudCover: '1.1%',
    cloudCover: '0.5%',
    areaHaValue: 3.1,
    areaM2Value: 31000,
    changePercentage: '+21.5%',
    confidencePct: 93,
    relevanceScore: 93,
    changeType: 'River / Embankment Work',
    imageUrl: '/assets/card_2_riverside.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_2_riverside.jpg',
    keywords: ['sea', 'coast', 'coastal', 'river', 'riverside', 'bund', 'embankment', 'seawall', 'water', 'boundary', 'shoreline', 'riprap'],
    passes: [
      { date: '2022-11-04', label: 'Baseline', month: 'Nov 2022', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-07-14', label: 'Riprap Laying', month: 'Jul 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-03-20', label: 'Bund Wall', month: 'Mar 2024', img: '/assets/card_2_riverside.jpg', hasChange: true },
      { date: '2024-11-18', label: 'Completion', month: 'Nov 2024', img: '/assets/card_2_riverside.jpg', hasChange: true },
    ],
    tacticalX: 52,
    tacticalY: 38,
    regionalX: 41.5,
    regionalY: 34.0,
  },
  {
    id: 'res-3',
    title: 'Adani Marine Logistics Berth Extension',
    locationName: 'Marine Logistics South Wharf',
    coordinates: '21.4521° N, 72.7763° E',
    lat: 21.4521,
    lon: 72.7763,
    sensor: 'Sentinel-1 SAR / Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m Optical / SAR fused',
    baselineDate: '2022-12-10',
    currentDate: '2024-06-15',
    beforeCloudCover: '0.4%',
    cloudCover: '2.1%',
    areaHaValue: 4.8,
    areaM2Value: 48000,
    changePercentage: '+28.4%',
    confidencePct: 89,
    relevanceScore: 89,
    changeType: 'Structural Expansion',
    imageUrl: '/assets/card_3_port.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_3_port.jpg',
    keywords: ['port', 'berth', 'marine', 'dock', 'ships', 'logistics', 'container', 'sar', 'radar', 'sea', 'water'],
    passes: [
      { date: '2022-12-10', label: 'Baseline', month: 'Dec 2022', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-06-18', label: 'Dredging', month: 'Jun 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2023-11-22', label: 'Piling Substructure', month: 'Nov 2023', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2024-06-15', label: 'Berth Decking', month: 'Jun 2024', img: '/assets/card_3_port.jpg', hasChange: true },
    ],
    tacticalX: 42,
    tacticalY: 52,
    regionalX: 35.8,
    regionalY: 44.5,
  },
  {
    id: 'res-4',
    title: 'Tapi Rivermouth Pier Piling & Riprap',
    locationName: 'Tapi River Channel Estuary',
    coordinates: '21.4550° N, 72.7801° E',
    lat: 21.4550,
    lon: 72.7801,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color (B4,B3,B2)',
    baselineDate: '2022-12-01',
    currentDate: '2023-12-03',
    beforeCloudCover: '0.9%',
    cloudCover: '0.0%',
    areaHaValue: 1.8,
    areaM2Value: 18000,
    changePercentage: '+14.2%',
    confidencePct: 85,
    relevanceScore: 85,
    changeType: 'Road & Pier Development',
    imageUrl: '/assets/card_4_bridge.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_4_bridge.jpg',
    keywords: ['bridge', 'road', 'pier', 'piling', 'highway', 'corridor', 'transport', 'river', 'rivermouth', 'channel'],
    passes: [
      { date: '2022-12-01', label: 'Baseline', month: 'Dec 2022', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-04-10', label: 'Pier Piles', month: 'Apr 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2023-08-15', label: 'Deck Span', month: 'Aug 2023', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2023-12-03', label: 'Pavement', month: 'Dec 2023', img: '/assets/card_4_bridge.jpg', hasChange: true },
    ],
    tacticalX: 45,
    tacticalY: 48,
    regionalX: 37.0,
    regionalY: 41.0,
  },
  {
    id: 'res-5',
    title: 'Coastal Mudflat Landfill & Earthworks',
    locationName: 'East Hazira Tidal Mudflat',
    coordinates: '21.4617° N, 72.7890° E',
    lat: 21.4617,
    lon: 72.7890,
    sensor: 'Sentinel-2 / Landsat-8 (15m)',
    resolution: '10 m',
    resolutionDetail: '10m High-Res Optical',
    baselineDate: '2022-09-14',
    currentDate: '2023-05-17',
    beforeCloudCover: '0.2%',
    cloudCover: '1.6%',
    areaHaValue: 5.6,
    areaM2Value: 56000,
    changePercentage: '+39.1%',
    confidencePct: 81,
    relevanceScore: 81,
    changeType: 'Vegetation / Cleared Land',
    imageUrl: '/assets/card_5_land.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_5_land.jpg',
    keywords: ['land', 'clearance', 'earthworks', 'soil', 'landfill', 'reclamation', 'vegetation', 'mangrove', 'deforestation', 'sea'],
    passes: [
      { date: '2022-09-14', label: 'Baseline', month: 'Sep 2022', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2022-12-20', label: 'Vegetation Clearance', month: 'Dec 2022', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2023-02-15', label: 'Earthworks Fill', month: 'Feb 2023', img: '/assets/card_5_land.jpg', hasChange: true },
      { date: '2023-05-17', label: 'Graded Surface', month: 'May 2023', img: '/assets/card_5_land.jpg', hasChange: true },
    ],
    tacticalX: 58,
    tacticalY: 40,
    regionalX: 43.0,
    regionalY: 36.0,
  },
  {
    id: 'res-6',
    title: 'Hazira Port North Container Staging Yard',
    locationName: 'North Terminal Staging Zone',
    coordinates: '21.4820° N, 72.7740° E',
    lat: 21.4820,
    lon: 72.7740,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color (B4,B3,B2)',
    baselineDate: '2022-12-18',
    currentDate: '2025-04-10',
    beforeCloudCover: '0.5%',
    cloudCover: '0.8%',
    areaHaValue: 8.4,
    areaM2Value: 84000,
    changePercentage: '+45.0%',
    confidencePct: 94,
    relevanceScore: 94,
    changeType: 'Industrial Staging Area',
    imageUrl: '/assets/card_1_construction.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_3_port.jpg',
    keywords: ['port', 'container', 'storage', 'yard', 'asphalt', 'paving', 'terminal', 'hazira', 'industrial', 'construction'],
    passes: [
      { date: '2022-12-18', label: 'Baseline', month: 'Dec 2022', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-09-10', label: 'Grading & Subgrade', month: 'Sep 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-06-25', label: 'Pavement Layer', month: 'Jun 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2025-04-10', label: 'Operational Staging', month: 'Apr 2025', img: '/assets/card_3_port.jpg', hasChange: true },
    ],
    tacticalX: 38,
    tacticalY: 32,
    regionalX: 32.0,
    regionalY: 28.0,
  },
  {
    id: 'res-7',
    title: 'Bay of Bengal Deepwater Oceanographic Station',
    locationName: 'Central Bay of Bengal',
    coordinates: '15.2970° N, 87.8680° E',
    lat: 15.2970,
    lon: 87.8680,
    sensor: 'Sentinel-3 & Sentinel-1 SAR',
    resolution: '300 m / 10 m',
    resolutionDetail: 'Sentinel-3 Altimetry + SAR',
    baselineDate: '2024-01-10',
    currentDate: '2025-05-12',
    beforeCloudCover: '2.8%',
    cloudCover: '4.2%',
    areaHaValue: 12.4,
    areaM2Value: 124000,
    changePercentage: '+18.0%',
    confidencePct: 95,
    relevanceScore: 95,
    changeType: 'Oceanographic Station',
    imageUrl: '/assets/card_3_port.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_3_port.jpg',
    keywords: ['bay of bengal', 'bengal', 'ocean', 'altimetry', 'cyclone', 'sea', 'current', 'marine', 'deepwater', 'station'],
    passes: [
      { date: '2024-01-10', label: 'Baseline', month: 'Jan 2024', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2024-07-20', label: 'Mooring Deployment', month: 'Jul 2024', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-11-15', label: 'Sensor Array Active', month: 'Nov 2024', img: '/assets/card_3_port.jpg', hasChange: true },
      { date: '2025-05-12', label: 'Station Operational', month: 'May 2025', img: '/assets/card_3_port.jpg', hasChange: true },
    ],
    tacticalX: 50,
    tacticalY: 50,
    regionalX: 50.0,
    regionalY: 50.0,
  },
  {
    id: 'res-8',
    title: 'Arabian Sea Offshore Energy Corridor',
    locationName: 'Mumbai Offshore Basin',
    coordinates: '18.9220° N, 71.4500° E',
    lat: 18.9220,
    lon: 71.4500,
    sensor: 'Sentinel-1 SAR (10m)',
    resolution: '10 m',
    resolutionDetail: '10m C-Band SAR VV/VH',
    baselineDate: '2023-08-20',
    currentDate: '2025-04-18',
    beforeCloudCover: '0.0%',
    cloudCover: '1.0%',
    areaHaValue: 9.8,
    areaM2Value: 98000,
    changePercentage: '+26.3%',
    confidencePct: 92,
    relevanceScore: 92,
    changeType: 'Offshore Energy Corridor',
    imageUrl: '/assets/card_1_construction.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_1_construction.jpg',
    keywords: ['arabian sea', 'arabian', 'offshore', 'platform', 'energy', 'oil', 'gas', 'sea', 'marine', 'shipping', 'corridor'],
    passes: [
      { date: '2023-08-20', label: 'Baseline', month: 'Aug 2023', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2024-02-14', label: 'Jacket In-situ', month: 'Feb 2024', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-09-08', label: 'Topsides Link', month: 'Sep 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2025-04-18', label: 'Platform Deck', month: 'Apr 2025', img: '/assets/card_1_construction.jpg', hasChange: true },
    ],
    tacticalX: 45,
    tacticalY: 55,
    regionalX: 30.0,
    regionalY: 60.0,
  },
  {
    id: 'res-9',
    title: 'Gulf of Khambhat Marine Gateway & Tidal Flat',
    locationName: 'Khambhat Tidal Delta',
    coordinates: '21.2000° N, 72.4000° E',
    lat: 21.2000,
    lon: 72.4000,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color (B4,B3,B2)',
    baselineDate: '2023-03-05',
    currentDate: '2025-03-22',
    beforeCloudCover: '0.7%',
    cloudCover: '0.4%',
    areaHaValue: 15.2,
    areaM2Value: 152000,
    changePercentage: '+31.0%',
    confidencePct: 91,
    relevanceScore: 91,
    changeType: 'Tidal Sediment & Coastal Shift',
    imageUrl: '/assets/card_2_riverside.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_2_riverside.jpg',
    keywords: ['khambhat', 'gulf', 'tidal', 'estuary', 'delta', 'marine', 'sediment', 'coast', 'water', 'gateway'],
    passes: [
      { date: '2023-03-05', label: 'Baseline', month: 'Mar 2023', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-10-12', label: 'Tidal Shift Observed', month: 'Oct 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-05-18', label: 'Sediment Accretion', month: 'May 2024', img: '/assets/card_2_riverside.jpg', hasChange: true },
      { date: '2025-03-22', label: 'Stabilization Pass', month: 'Mar 2025', img: '/assets/card_2_riverside.jpg', hasChange: true },
    ],
    tacticalX: 30,
    tacticalY: 65,
    regionalX: 25.0,
    regionalY: 45.0,
  }
];

/**
 * Adapter helper that formats a canonical location into SearchResultItem for existing components
 */
export function locationToSearchResultItem(loc: GroundTruthLocation) {
  const months = computeMonthsBetween(loc.baselineDate, loc.currentDate);
  const period = computeObservationPeriod(loc.baselineDate, loc.currentDate);

  return {
    id: loc.id,
    title: loc.title,
    locationName: loc.locationName,
    coordinates: loc.coordinates,
    date: loc.currentDate,
    beforeDate: loc.baselineDate,
    sensor: loc.sensor,
    resolution: loc.resolutionDetail,
    cloudCover: loc.cloudCover,
    beforeCloudCover: loc.beforeCloudCover,
    areaHa: `${loc.areaHaValue} ha (${loc.areaM2Value.toLocaleString()} m²)`,
    areaHaValue: loc.areaHaValue,
    areaM2Value: loc.areaM2Value,
    timeGap: `${months} months`,
    observationPeriod: period,
    confidencePct: loc.confidencePct,
    relevanceScore: loc.relevanceScore,
    matchType: loc.relevanceScore >= 90 ? 'High Relevance' : 'Medium Relevance',
    changePercentage: loc.changePercentage,
    changeType: loc.changeType,
    imageUrl: loc.imageUrl,
    beforeImgUrl: loc.beforeImgUrl,
    afterImgUrl: loc.afterImgUrl,
    keywords: loc.keywords,
    passes: loc.passes,
    tacticalX: loc.tacticalX,
    tacticalY: loc.tacticalY,
    regionalX: loc.regionalX,
    regionalY: loc.regionalY,
  };
}

export type EnrichedSearchResultItem = ReturnType<typeof locationToSearchResultItem>;

/**
 * Priority 1 Requirement 5: Dev-time validation function that inspects a location or item
 * and logs a console warning if dates, elapsed months, or area conversions are inconsistent.
 */
export function validateLocationData(loc: GroundTruthLocation | EnrichedSearchResultItem): boolean {
  let isValid = true;
  const warnings: string[] = [];

  // 1. Verify chronological passes: first must match baseline, last must match current
  if (loc.passes && loc.passes.length >= 2) {
    const firstPass = loc.passes[0];
    const lastPass = loc.passes[loc.passes.length - 1];
    const baseline = 'baselineDate' in loc ? loc.baselineDate : (loc as any).beforeDate;
    const current = 'currentDate' in loc ? loc.currentDate : (loc as any).date;

    if (firstPass.date !== baseline) {
      warnings.push(`Passes[0].date (${firstPass.date}) does not match baselineDate (${baseline})`);
      isValid = false;
    }
    if (lastPass.date !== current) {
      warnings.push(`Passes[last].date (${lastPass.date}) does not match currentDate (${current})`);
      isValid = false;
    }

    // Chronological order verification
    for (let i = 1; i < loc.passes.length; i++) {
      if (new Date(loc.passes[i].date).getTime() < new Date(loc.passes[i - 1].date).getTime()) {
        warnings.push(`Passes not strictly chronological: ${loc.passes[i - 1].date} > ${loc.passes[i].date}`);
        isValid = false;
      }
    }
  }

  // 2. Verify Area consistency: 1 ha = 10,000 m²
  if ('areaHaValue' in loc && 'areaM2Value' in loc) {
    const expectedM2 = Math.round(loc.areaHaValue * 10000);
    if (loc.areaM2Value !== expectedM2) {
      warnings.push(`Area mismatch: ${loc.areaHaValue} ha is not equal to ${loc.areaM2Value} m² (expected ${expectedM2} m²)`);
      isValid = false;
    }
  }

  // 3. Verify computed months count
  const baseline = 'baselineDate' in loc ? loc.baselineDate : (loc as any).beforeDate;
  const current = 'currentDate' in loc ? loc.currentDate : (loc as any).date;
  if (baseline && current) {
    const computedMonths = computeMonthsBetween(baseline, current);
    if ('timeGap' in loc && loc.timeGap) {
      const parsedMonths = parseInt(loc.timeGap.replace(/[^0-9]/g, ''), 10);
      if (parsedMonths !== computedMonths) {
        warnings.push(`timeGap string (${loc.timeGap}) does not match dynamically computed months (${computedMonths} months)`);
        isValid = false;
      }
    }
  }

  if (!isValid && typeof console !== 'undefined' && console.warn) {
    console.warn(`[VIGIL DATA CONSISTENCY WARNING] Location "${loc.title}":\n- ${warnings.join('\n- ')}`);
  }

  return isValid;
}
