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
  country: string;       // "India" | "Brazil"
  state: string;         // e.g. "Gujarat", "Maharashtra", "Odisha", "Jharkhand", "Karnataka", "Tamil Nadu", "Kerala", "West Bengal", "Rondônia", etc.
  region: string;        // e.g. "Coastal / Port", "Forest / Western Ghats", "Mining Belt", "Urban Metro", etc.
  category: 'port' | 'construction' | 'mining' | 'deforestation' | 'urban' | 'roads' | 'flood';
  coordinates: string;   // e.g. "21.4587° N, 72.7812° E"
  lat: number;
  lon: number;
  sensor: string;
  resolution: string;    // e.g. "10 m"
  resolutionDetail: string; // e.g. "10m True Color (B4,B3,B2)"
  baselineDate: string;  // YYYY-MM-DD
  currentDate: string;   // YYYY-MM-DD
  beforeCloudCover: string;
  cloudCover: string;
  areaHaValue: number;
  areaM2Value: number;
  changePercentage: string;
  confidencePct: number;
  relevanceScore: number;
  changeType: string;
  description: string;
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
 * Formats standard Before and After image overlay labels:
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
 * Master canonical array of verified Ground-Truth Locations across India & Globally
 */
export const CANONICAL_LOCATIONS: GroundTruthLocation[] = [
  // 1. Mundra Port, Gujarat
  {
    id: 'loc-mundra',
    title: 'Mundra Port Deepwater Terminal & SEZ Expansion',
    locationName: 'Mundra Coastal Belt, Kutch',
    country: 'India',
    state: 'Gujarat',
    region: 'Coastal / Port',
    category: 'port',
    coordinates: '22.7383° N, 69.7042° E',
    lat: 22.7383,
    lon: 69.7042,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color (B4,B3,B2)',
    baselineDate: '2023-02-10',
    currentDate: '2025-03-15',
    beforeCloudCover: '0.4%',
    cloudCover: '1.1%',
    areaHaValue: 6.8,
    areaM2Value: 68000,
    changePercentage: '+28.4%',
    confidencePct: 95,
    relevanceScore: 97,
    changeType: 'New Port Construction',
    description: 'Deepwater berth dredging, container yard paving, and wharf extension along the Kutch coastline.',
    imageUrl: '/assets/card_3_port.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_3_port.jpg',
    keywords: ['construction', 'sea', 'coastal', 'port', 'mundra', 'gujarat', 'kutch', 'berth', 'wharf', 'terminal', 'shipping', 'marine', 'port construction', 'coastal development', 'dredging'],
    passes: [
      { date: '2023-02-10', label: 'Baseline', month: 'Feb 2023', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-11-18', label: 'Dredging Basin', month: 'Nov 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-08-22', label: 'Piling Works', month: 'Aug 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2025-03-15', label: 'Deck Completed', month: 'Mar 2025', img: '/assets/card_3_port.jpg', hasChange: true },
    ],
    tacticalX: 32,
    tacticalY: 34,
    regionalX: 28,
    regionalY: 32,
  },

  // 2. Hazira, Gujarat
  {
    id: 'loc-hazira',
    title: 'Hazira Deepwater Wharf & Piling Deck',
    locationName: 'Hazira Industrial Port Sector, Surat',
    country: 'India',
    state: 'Gujarat',
    region: 'Coastal / Port',
    category: 'port',
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
    description: 'Structural expansion of heavy cargo wharf and pier piling works near Tapi rivermouth.',
    imageUrl: '/assets/card_1_construction.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/after_scene.jpg',
    keywords: ['construction', 'sea', 'coastal', 'port', 'hazira', 'gujarat', 'surat', 'wharf', 'piling', 'deck', 'jetty', 'port construction', 'coastal development'],
    passes: [
      { date: '2023-04-12', label: 'Baseline', month: 'Apr 2023', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2024-02-18', label: 'Excavation', month: 'Feb 2024', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-08-19', label: 'Piling Works', month: 'Aug 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2025-04-28', label: 'Superstructure', month: 'Apr 2025', img: '/assets/after_scene.jpg', hasChange: true },
    ],
    tacticalX: 47,
    tacticalY: 44,
    regionalX: 38,
    regionalY: 39,
  },

  // 3. JNPT Mumbai, Maharashtra
  {
    id: 'loc-jnpt',
    title: 'JNPT Nhava Sheva Fourth Container Terminal Berth',
    locationName: 'Navi Mumbai Harbor, Raigad',
    country: 'India',
    state: 'Maharashtra',
    region: 'Coastal / Port',
    category: 'port',
    coordinates: '18.9499° N, 72.9515° E',
    lat: 18.9499,
    lon: 72.9515,
    sensor: 'Sentinel-1 SAR / Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m Optical & C-Band SAR',
    baselineDate: '2023-01-15',
    currentDate: '2025-02-20',
    beforeCloudCover: '0.2%',
    cloudCover: '0.9%',
    areaHaValue: 7.4,
    areaM2Value: 74000,
    changePercentage: '+31.2%',
    confidencePct: 94,
    relevanceScore: 95,
    changeType: 'Marine Terminal Construction',
    description: 'Land reclamation, heavy container yard concrete apron, and gantry crane rail foundation.',
    imageUrl: '/assets/card_3_port.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_3_port.jpg',
    keywords: ['construction', 'sea', 'coastal', 'port', 'mumbai', 'maharashtra', 'jnpt', 'nhava sheva', 'navi mumbai', 'berth', 'container', 'terminal', 'port construction', 'coastal development'],
    passes: [
      { date: '2023-01-15', label: 'Baseline', month: 'Jan 2023', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-10-10', label: 'Sub-base Paving', month: 'Oct 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-06-15', label: 'Rail Placement', month: 'Jun 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2025-02-20', label: 'Terminal Active', month: 'Feb 2025', img: '/assets/card_3_port.jpg', hasChange: true },
    ],
    tacticalX: 40,
    tacticalY: 58,
    regionalX: 35,
    regionalY: 54,
  },

  // 4. Chennai Port, Tamil Nadu
  {
    id: 'loc-chennai-port',
    title: 'Chennai Port Coastal Freight Terminal & Breakwater',
    locationName: 'Chennai Harbor Coast, George Town',
    country: 'India',
    state: 'Tamil Nadu',
    region: 'Coastal / Port',
    category: 'port',
    coordinates: '13.0844° N, 80.2941° E',
    lat: 13.0844,
    lon: 80.2941,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color (B4,B3,B2)',
    baselineDate: '2023-03-01',
    currentDate: '2025-01-25',
    beforeCloudCover: '1.0%',
    cloudCover: '0.6%',
    areaHaValue: 5.1,
    areaM2Value: 51000,
    changePercentage: '+18.7%',
    confidencePct: 91,
    relevanceScore: 93,
    changeType: 'Coastal Port Expansion',
    description: 'Breakwater armor block reinforcement, shoreline reclamation, and freight corridor expansion.',
    imageUrl: '/assets/card_2_riverside.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_2_riverside.jpg',
    keywords: ['construction', 'sea', 'coastal', 'port', 'chennai', 'tamil nadu', 'breakwater', 'harbor', 'freight', 'coastal development', 'port construction', 'south india'],
    passes: [
      { date: '2023-03-01', label: 'Baseline', month: 'Mar 2023', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-11-12', label: 'Tetrapod Armor', month: 'Nov 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-07-20', label: 'Wharf Paving', month: 'Jul 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2025-01-25', label: 'Operational Gate', month: 'Jan 2025', img: '/assets/card_2_riverside.jpg', hasChange: true },
    ],
    tacticalX: 55,
    tacticalY: 68,
    regionalX: 48,
    regionalY: 66,
  },

  // 5. Kochi International Container Terminal, Kerala
  {
    id: 'loc-kochi-ictt',
    title: 'Vallarpadam ICTT Container Basin Dredging',
    locationName: 'Vallarpadam Basin, Kochi',
    country: 'India',
    state: 'Kerala',
    region: 'Coastal / Port',
    category: 'port',
    coordinates: '9.9656° N, 76.2711° E',
    lat: 9.9656,
    lon: 76.2711,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color (B4,B3,B2)',
    baselineDate: '2023-02-14',
    currentDate: '2024-12-18',
    beforeCloudCover: '1.8%',
    cloudCover: '2.1%',
    areaHaValue: 3.9,
    areaM2Value: 39000,
    changePercentage: '+16.5%',
    confidencePct: 92,
    relevanceScore: 92,
    changeType: 'Harbor Basin Expansion',
    description: 'Channel deepening, jetty extension, and logistics handling yard adjacent to Cochin backwaters.',
    imageUrl: '/assets/card_4_bridge.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_4_bridge.jpg',
    keywords: ['construction', 'sea', 'coastal', 'port', 'kochi', 'cochin', 'kerala', 'transshipment', 'vallarpadam', 'ictt', 'backwaters', 'port construction', 'coastal development'],
    passes: [
      { date: '2023-02-14', label: 'Baseline', month: 'Feb 2023', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-09-18', label: 'Basin Dredging', month: 'Sep 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-05-10', label: 'Jetty Apron', month: 'May 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2024-12-18', label: 'Completed Berth', month: 'Dec 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
    ],
    tacticalX: 44,
    tacticalY: 76,
    regionalX: 42,
    regionalY: 74,
  },

  // 6. Visakhapatnam Harbor, Andhra Pradesh
  {
    id: 'loc-vizag-harbor',
    title: 'Visakhapatnam Outer Harbor Breakwater Deepening',
    locationName: 'Visakhapatnam Port Channel, Vizag',
    country: 'India',
    state: 'Andhra Pradesh',
    region: 'Coastal / Port',
    category: 'port',
    coordinates: '17.6868° N, 83.2185° E',
    lat: 17.6868,
    lon: 83.2185,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color (B4,B3,B2)',
    baselineDate: '2023-01-20',
    currentDate: '2025-03-30',
    beforeCloudCover: '0.5%',
    cloudCover: '1.4%',
    areaHaValue: 5.8,
    areaM2Value: 58000,
    changePercentage: '+22.1%',
    confidencePct: 93,
    relevanceScore: 94,
    changeType: 'Harbor Deepening & Wharf Work',
    description: 'Construction of deep draft multi-cargo berth and reclamation of rocky coastal shoreline.',
    imageUrl: '/assets/card_1_construction.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_1_construction.jpg',
    keywords: ['construction', 'sea', 'coastal', 'port', 'visakhapatnam', 'vizag', 'andhra pradesh', 'breakwater', 'harbor', 'outer harbor', 'berth', 'port construction', 'coastal development'],
    passes: [
      { date: '2023-01-20', label: 'Baseline', month: 'Jan 2023', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-10-15', label: 'Dredge Pass', month: 'Oct 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-07-08', label: 'Reclamation Rock', month: 'Jul 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2025-03-30', label: 'Berth Paved', month: 'Mar 2025', img: '/assets/card_1_construction.jpg', hasChange: true },
    ],
    tacticalX: 62,
    tacticalY: 56,
    regionalX: 56,
    regionalY: 54,
  },

  // 7. Deendayal Kandla Port, Gujarat
  {
    id: 'loc-kandla',
    title: 'Deendayal Port Oil Jetty & Cargo Berth 13',
    locationName: 'Kandla Creek, Kutch',
    country: 'India',
    state: 'Gujarat',
    region: 'Coastal / Port',
    category: 'port',
    coordinates: '23.0062° N, 70.2190° E',
    lat: 23.0062,
    lon: 70.2190,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color (B4,B3,B2)',
    baselineDate: '2023-04-05',
    currentDate: '2025-02-12',
    beforeCloudCover: '0.1%',
    cloudCover: '0.5%',
    areaHaValue: 4.6,
    areaM2Value: 46000,
    changePercentage: '+24.9%',
    confidencePct: 92,
    relevanceScore: 91,
    changeType: 'Jetty & Marine Construction',
    description: 'Construction of 13th cargo berth and oil terminal pipeline corridor across tidal mudflats.',
    imageUrl: '/assets/card_5_land.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_5_land.jpg',
    keywords: ['construction', 'sea', 'coastal', 'port', 'kandla', 'deendayal', 'gujarat', 'kutch', 'jetty', 'oil', 'berth', 'port construction', 'coastal development'],
    passes: [
      { date: '2023-04-05', label: 'Baseline', month: 'Apr 2023', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-11-20', label: 'Piling Alignment', month: 'Nov 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-06-18', label: 'Superstructure Deck', month: 'Jun 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2025-02-12', label: 'Terminal Ready', month: 'Feb 2025', img: '/assets/card_5_land.jpg', hasChange: true },
    ],
    tacticalX: 34,
    tacticalY: 30,
    regionalX: 30,
    regionalY: 30,
  },

  // 8. Amazon Basin, Brazil (Global Deforestation)
  {
    id: 'loc-amazon',
    title: 'Amazon Basin Rondônia Rainforest Deforestation Front',
    locationName: 'Porto Velho Sector, Rondônia',
    country: 'Brazil',
    state: 'Rondônia',
    region: 'Rainforest / Global',
    category: 'deforestation',
    coordinates: '10.8250° S, 62.9200° W',
    lat: -10.8250,
    lon: -62.9200,
    sensor: 'Landsat-8/9 & Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m Multispectral NDVI',
    baselineDate: '2022-08-15',
    currentDate: '2024-09-20',
    beforeCloudCover: '1.2%',
    cloudCover: '1.5%',
    areaHaValue: 142.5,
    areaM2Value: 1425000,
    changePercentage: '-58.4%',
    confidencePct: 98,
    relevanceScore: 99,
    changeType: 'Primary Rainforest Clear-cutting',
    description: 'Severe fishbone pattern deforestation, cattle pasture clearing, and canopy loss detected across dense tropical rainforest.',
    imageUrl: '/assets/card_5_land.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_5_land.jpg',
    keywords: ['deforestation', 'forest', 'rainforest', 'amazon', 'amazonas', 'rondonia', 'brazil', 'trees', 'canopy', 'logging', 'clearing', 'slash and burn', 'greenery loss', 'environmental', 'tropical'],
    passes: [
      { date: '2022-08-15', label: 'Baseline', month: 'Aug 2022', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-05-10', label: 'Access Roads Cut', month: 'May 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-01-14', label: 'Canopy Cleared', month: 'Jan 2024', img: '/assets/card_5_land.jpg', hasChange: true },
      { date: '2024-09-20', label: 'Pasture Established', month: 'Sep 2024', img: '/assets/card_5_land.jpg', hasChange: true },
    ],
    tacticalX: 18,
    tacticalY: 60,
    regionalX: 12,
    regionalY: 65,
  },

  // 9. Western Ghats, Karnataka (Deforestation)
  {
    id: 'loc-western-ghats',
    title: 'Western Ghats Shola & Evergreen Forest Encroachment',
    locationName: 'Agumbe Rainforest Corridor, Shimoga',
    country: 'India',
    state: 'Karnataka',
    region: 'Forest / Biodiversity',
    category: 'deforestation',
    coordinates: '12.9234° N, 75.6421° E',
    lat: 12.9234,
    lon: 75.6421,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m NDVI & True Color',
    baselineDate: '2022-11-10',
    currentDate: '2024-11-25',
    beforeCloudCover: '2.0%',
    cloudCover: '1.8%',
    areaHaValue: 28.3,
    areaM2Value: 283000,
    changePercentage: '-32.6%',
    confidencePct: 94,
    relevanceScore: 96,
    changeType: 'Canopy Fragmentation & Clearing',
    description: 'Forest canopy thinning and clearance of native shola vegetation for commercial estate roads and monoculture planting.',
    imageUrl: '/assets/card_5_land.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_5_land.jpg',
    keywords: ['deforestation', 'forest', 'western ghats', 'karnataka', 'agumbe', 'shimoga', 'evergreen', 'shola', 'trees', 'canopy', 'vegetation loss', 'plantation', 'encroachment'],
    passes: [
      { date: '2022-11-10', label: 'Baseline', month: 'Nov 2022', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-07-15', label: 'Canopy Disturbance', month: 'Jul 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-03-20', label: 'Clearing Advance', month: 'Mar 2024', img: '/assets/card_5_land.jpg', hasChange: true },
      { date: '2024-11-25', label: 'Cleared Parcel', month: 'Nov 2024', img: '/assets/card_5_land.jpg', hasChange: true },
    ],
    tacticalX: 42,
    tacticalY: 70,
    regionalX: 40,
    regionalY: 68,
  },

  // 10. Northeast India, Mizoram (Deforestation)
  {
    id: 'loc-northeast-forest',
    title: 'Northeast India Dampa Forest Canopy Clearance',
    locationName: 'Mamit Hills Border Corridor, Mizoram',
    country: 'India',
    state: 'Mizoram',
    region: 'Forest / Northeast',
    category: 'deforestation',
    coordinates: '23.7120° N, 92.4280° E',
    lat: 23.7120,
    lon: 92.4280,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m Optical Sentinel-2',
    baselineDate: '2023-01-08',
    currentDate: '2025-01-18',
    beforeCloudCover: '1.5%',
    cloudCover: '1.1%',
    areaHaValue: 34.0,
    areaM2Value: 340000,
    changePercentage: '-41.2%',
    confidencePct: 93,
    relevanceScore: 95,
    changeType: 'Jhum Cultivation & Forest Clearing',
    description: 'Rapid slash-and-burn agrarian clearing resulting in exposed hill slopes and loss of closed-canopy subtropical woodland.',
    imageUrl: '/assets/card_5_land.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_5_land.jpg',
    keywords: ['deforestation', 'forest', 'northeast india', 'northeast', 'mizoram', 'mamit', 'dampa', 'hills', 'trees', 'canopy', 'jhum', 'slash and burn', 'assam'],
    passes: [
      { date: '2023-01-08', label: 'Baseline', month: 'Jan 2023', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-09-12', label: 'Hillside Burn', month: 'Sep 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-05-24', label: 'Exposed Soil', month: 'May 2024', img: '/assets/card_5_land.jpg', hasChange: true },
      { date: '2025-01-18', label: 'Fallow Scrub', month: 'Jan 2025', img: '/assets/card_5_land.jpg', hasChange: true },
    ],
    tacticalX: 78,
    tacticalY: 38,
    regionalX: 74,
    regionalY: 36,
  },

  // 11. Central India, Madhya Pradesh (Deforestation)
  {
    id: 'loc-central-forest',
    title: 'Central India Satpura Corridor Tree Cover Cleared',
    locationName: 'Satpura Foothills, Hoshangabad',
    country: 'India',
    state: 'Madhya Pradesh',
    region: 'Forest / Central India',
    category: 'deforestation',
    coordinates: '22.4500° N, 78.4300° E',
    lat: 22.4500,
    lon: 78.4300,
    sensor: 'Sentinel-2 / Landsat-8 (15m)',
    resolution: '10 m',
    resolutionDetail: '10m Optical Multispectral',
    baselineDate: '2022-12-05',
    currentDate: '2024-12-15',
    beforeCloudCover: '0.3%',
    cloudCover: '0.8%',
    areaHaValue: 19.5,
    areaM2Value: 195000,
    changePercentage: '-27.8%',
    confidencePct: 91,
    relevanceScore: 92,
    changeType: 'Dry Deciduous Forest Clearance',
    description: 'Clearance of teak and dry deciduous woodland along linear transmission corridor and highway easement.',
    imageUrl: '/assets/card_5_land.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_5_land.jpg',
    keywords: ['deforestation', 'forest', 'central india', 'madhya pradesh', 'satpura', 'hoshangabad', 'trees', 'clearing', 'vegetation loss', 'canopy'],
    passes: [
      { date: '2022-12-05', label: 'Baseline', month: 'Dec 2022', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-08-14', label: 'Right-of-Way Cut', month: 'Aug 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-04-18', label: 'Pylon Line Clear', month: 'Apr 2024', img: '/assets/card_5_land.jpg', hasChange: true },
      { date: '2024-12-15', label: 'Cleared Strip', month: 'Dec 2024', img: '/assets/card_5_land.jpg', hasChange: true },
    ],
    tacticalX: 52,
    tacticalY: 46,
    regionalX: 50,
    regionalY: 45,
  },

  // 12. Jharia Coalfield, Jharkhand (Mining)
  {
    id: 'loc-jharia',
    title: 'Jharia Coalfield Open-Cast Pit Expansion',
    locationName: 'Dhanbad Coal Belt, Jharia',
    country: 'India',
    state: 'Jharkhand',
    region: 'Mining Belt',
    category: 'mining',
    coordinates: '23.7441° N, 86.4132° E',
    lat: 23.7441,
    lon: 86.4132,
    sensor: 'Sentinel-1 SAR / Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m SAR & Thermal Radiometry',
    baselineDate: '2022-10-15',
    currentDate: '2024-11-20',
    beforeCloudCover: '0.6%',
    cloudCover: '0.9%',
    areaHaValue: 48.6,
    areaM2Value: 486000,
    changePercentage: '+52.3%',
    confidencePct: 97,
    relevanceScore: 98,
    changeType: 'Open-Cast Coal Pit & Overburden',
    description: 'Massive open-pit excavation deepening, bench terracing, and expansion of overburden waste dump with subsurface thermal anomalies.',
    imageUrl: '/assets/card_5_land.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_5_land.jpg',
    keywords: ['mining', 'coal', 'open-cast', 'pit', 'quarry', 'jharia', 'jharkhand', 'dhanbad', 'excavation', 'mineral', 'strip mine', 'overburden'],
    passes: [
      { date: '2022-10-15', label: 'Baseline', month: 'Oct 2022', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-06-12', label: 'Bench Deepened', month: 'Jun 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-02-18', label: 'Dump Overburden', month: 'Feb 2024', img: '/assets/card_5_land.jpg', hasChange: true },
      { date: '2024-11-20', label: 'Pit Boundary Active', month: 'Nov 2024', img: '/assets/card_5_land.jpg', hasChange: true },
    ],
    tacticalX: 68,
    tacticalY: 42,
    regionalX: 64,
    regionalY: 40,
  },

  // 13. Keonjhar Iron Ore, Odisha (Mining)
  {
    id: 'loc-keonjhar',
    title: 'Keonjhar Iron Ore Open Pit Mine Excavation',
    locationName: 'Barbil-Joda Mining Valley, Keonjhar',
    country: 'India',
    state: 'Odisha',
    region: 'Mining Belt',
    category: 'mining',
    coordinates: '21.6288° N, 85.5817° E',
    lat: 21.6288,
    lon: 85.5817,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color & SWIR Iron Index',
    baselineDate: '2023-01-10',
    currentDate: '2025-02-15',
    beforeCloudCover: '0.4%',
    cloudCover: '0.7%',
    areaHaValue: 36.2,
    areaM2Value: 362000,
    changePercentage: '+44.1%',
    confidencePct: 95,
    relevanceScore: 97,
    changeType: 'Iron Ore Open Cast Mining',
    description: 'Rapid stripping of lateritic topsoil, formation of terraced benches, and heavy haulage road network expansion.',
    imageUrl: '/assets/card_1_construction.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_1_construction.jpg',
    keywords: ['mining', 'iron ore', 'open-cast', 'pit', 'quarry', 'odisha', 'keonjhar', 'barbil', 'joda', 'excavation', 'strip mine', 'mineral'],
    passes: [
      { date: '2023-01-10', label: 'Baseline', month: 'Jan 2023', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-09-15', label: 'Topsoil Stripped', month: 'Sep 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-06-20', label: 'Ore Bench Cut', month: 'Jun 2024', img: '/assets/card_1_construction.jpg', hasChange: true },
      { date: '2025-02-15', label: 'Open Pit Max', month: 'Feb 2025', img: '/assets/card_1_construction.jpg', hasChange: true },
    ],
    tacticalX: 66,
    tacticalY: 46,
    regionalX: 62,
    regionalY: 44,
  },

  // 14. Korba, Chhattisgarh (Mining)
  {
    id: 'loc-korba',
    title: 'Korba Thermal Coal Strip Mining & Overburden Dump',
    locationName: 'Gevra-Dipka Sector, Korba',
    country: 'India',
    state: 'Chhattisgarh',
    region: 'Mining Belt',
    category: 'mining',
    coordinates: '22.3595° N, 82.7501° E',
    lat: 22.3595,
    lon: 82.7501,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color (B4,B3,B2)',
    baselineDate: '2022-11-20',
    currentDate: '2024-12-10',
    beforeCloudCover: '0.5%',
    cloudCover: '0.8%',
    areaHaValue: 54.0,
    areaM2Value: 540000,
    changePercentage: '+48.9%',
    confidencePct: 96,
    relevanceScore: 96,
    changeType: 'Coal Strip Excavation',
    description: 'Advance of heavy dragline strip extraction face, removal of vegetation cover, and enlargement of overburden storage hills.',
    imageUrl: '/assets/card_5_land.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_5_land.jpg',
    keywords: ['mining', 'coal', 'strip mine', 'open-cast', 'korba', 'chhattisgarh', 'gevra', 'dipka', 'excavation', 'overburden', 'quarry'],
    passes: [
      { date: '2022-11-20', label: 'Baseline', month: 'Nov 2022', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-07-22', label: 'Dragline Face', month: 'Jul 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-03-14', label: 'Overburden Ridge', month: 'Mar 2024', img: '/assets/card_5_land.jpg', hasChange: true },
      { date: '2024-12-10', label: 'Strip Extended', month: 'Dec 2024', img: '/assets/card_5_land.jpg', hasChange: true },
    ],
    tacticalX: 60,
    tacticalY: 45,
    regionalX: 57,
    regionalY: 43,
  },

  // 15. Makrana, Rajasthan (Mining / Quarry)
  {
    id: 'loc-makrana',
    title: 'Makrana & Khetri Mineral Quarrying Trench',
    locationName: 'Aravalli Mineral Belt, Nagaur',
    country: 'India',
    state: 'Rajasthan',
    region: 'Mining Belt',
    category: 'mining',
    coordinates: '27.0422° N, 74.7211° E',
    lat: 27.0422,
    lon: 74.7211,
    sensor: 'Landsat-8/9 (15m)',
    resolution: '15 m',
    resolutionDetail: '15m Panchromatic Pan-sharpened',
    baselineDate: '2022-09-12',
    currentDate: '2024-10-18',
    beforeCloudCover: '0.0%',
    cloudCover: '0.2%',
    areaHaValue: 22.4,
    areaM2Value: 224000,
    changePercentage: '+37.5%',
    confidencePct: 92,
    relevanceScore: 93,
    changeType: 'Limestone & Marble Quarrying',
    description: 'Deep linear quarry trenching and hillside stone processing waste terraces detected across arid terrain.',
    imageUrl: '/assets/card_1_construction.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_1_construction.jpg',
    keywords: ['mining', 'quarry', 'quarrying', 'marble', 'limestone', 'stone', 'rajasthan', 'makrana', 'khetri', 'nagaur', 'aravalli', 'excavation'],
    passes: [
      { date: '2022-09-12', label: 'Baseline', month: 'Sep 2022', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-05-18', label: 'Trench Deepening', month: 'May 2023', img: '/assets/card_1_construction.jpg', hasChange: false },
      { date: '2024-01-22', label: 'Terrace Dump', month: 'Jan 2024', img: '/assets/card_1_construction.jpg', hasChange: true },
      { date: '2024-10-18', label: 'Quarry Pit Active', month: 'Oct 2024', img: '/assets/card_1_construction.jpg', hasChange: true },
    ],
    tacticalX: 38,
    tacticalY: 26,
    regionalX: 34,
    regionalY: 25,
  },

  // 16. New Town Rajarhat, Kolkata (Urban Expansion)
  {
    id: 'loc-kolkata-rajarhat',
    title: 'New Town Rajarhat & East Kolkata Wetlands Infill',
    locationName: 'Action Area III & Wetlands Edge, Kolkata',
    country: 'India',
    state: 'West Bengal',
    region: 'Urban Metro',
    category: 'urban',
    coordinates: '22.5867° N, 88.4754° E',
    lat: 22.5867,
    lon: 88.4754,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color (B4,B3,B2)',
    baselineDate: '2022-12-10',
    currentDate: '2025-01-20',
    beforeCloudCover: '0.7%',
    cloudCover: '1.0%',
    areaHaValue: 18.2,
    areaM2Value: 182000,
    changePercentage: '+42.6%',
    confidencePct: 96,
    relevanceScore: 98,
    changeType: 'Urban Expansion & Wetland Concrete Infill',
    description: 'Infill of peripheral waterbodies and marshland with concrete building foundations, multi-story housing blocks, and arterial roads.',
    imageUrl: '/assets/card_1_construction.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/after_scene.jpg',
    keywords: ['urban expansion', 'urban', 'expansion', 'kolkata', 'west bengal', 'rajarhat', 'new town', 'wetlands', 'concrete', 'buildings', 'city', 'real estate', 'sprawl'],
    passes: [
      { date: '2022-12-10', label: 'Baseline', month: 'Dec 2022', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-08-14', label: 'Earth Fill', month: 'Aug 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-04-18', label: 'Foundation Poured', month: 'Apr 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2025-01-20', label: 'Towers Built', month: 'Jan 2025', img: '/assets/after_scene.jpg', hasChange: true },
    ],
    tacticalX: 72,
    tacticalY: 44,
    regionalX: 68,
    regionalY: 42,
  },

  // 17. Navi Mumbai Airport, Maharashtra (Urban Expansion)
  {
    id: 'loc-navi-mumbai',
    title: 'Navi Mumbai International Airport Urban Spread',
    locationName: 'Ulwe & Panvel Creek, Navi Mumbai',
    country: 'India',
    state: 'Maharashtra',
    region: 'Urban Metro',
    category: 'urban',
    coordinates: '18.9894° N, 73.0645° E',
    lat: 18.9894,
    lon: 73.0645,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color (B4,B3,B2)',
    baselineDate: '2022-11-15',
    currentDate: '2025-03-05',
    beforeCloudCover: '0.3%',
    cloudCover: '0.6%',
    areaHaValue: 62.0,
    areaM2Value: 620000,
    changePercentage: '+68.4%',
    confidencePct: 97,
    relevanceScore: 97,
    changeType: 'Mega Airport & Urban Corridor Construction',
    description: 'Flattening of Ulwe hill, river diversion, runway sub-base paving, and surrounding residential transit city expansion.',
    imageUrl: '/assets/card_1_construction.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/after_scene.jpg',
    keywords: ['urban expansion', 'urban', 'expansion', 'mumbai', 'navi mumbai', 'maharashtra', 'airport', 'panvel', 'ulwe', 'concrete', 'city', 'sprawl', 'construction'],
    passes: [
      { date: '2022-11-15', label: 'Baseline', month: 'Nov 2022', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-09-10', label: 'Hill Leveling', month: 'Sep 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-06-18', label: 'Runway Base Paved', month: 'Jun 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2025-03-05', label: 'Terminal Structure', month: 'Mar 2025', img: '/assets/after_scene.jpg', hasChange: true },
    ],
    tacticalX: 41,
    tacticalY: 57,
    regionalX: 36,
    regionalY: 53,
  },

  // 18. Dwarka Expressway, Delhi NCR (Urban Expansion)
  {
    id: 'loc-delhi-ncr',
    title: 'Dwarka Expressway Sector 84 Urban Sprawl',
    locationName: 'Gurugram Border, Delhi NCR',
    country: 'India',
    state: 'Delhi NCR',
    region: 'Urban Metro',
    category: 'urban',
    coordinates: '28.5140° N, 77.0120° E',
    lat: 28.5140,
    lon: 77.0120,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color (B4,B3,B2)',
    baselineDate: '2022-10-01',
    currentDate: '2024-11-10',
    beforeCloudCover: '0.2%',
    cloudCover: '0.4%',
    areaHaValue: 31.5,
    areaM2Value: 315000,
    changePercentage: '+51.0%',
    confidencePct: 95,
    relevanceScore: 96,
    changeType: 'Commercial & High-Rise Residential Sprawl',
    description: 'Agricultural land converted into high-density gated apartment complexes, commercial malls, and elevated expressway connectors.',
    imageUrl: '/assets/card_4_bridge.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/after_scene.jpg',
    keywords: ['urban expansion', 'urban', 'expansion', 'delhi', 'delhi ncr', 'gurugram', 'dwarka', 'expressway', 'haryana', 'city', 'high-rise', 'sprawl', 'buildings'],
    passes: [
      { date: '2022-10-01', label: 'Baseline', month: 'Oct 2022', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-06-15', label: 'Plot Clearing', month: 'Jun 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-02-20', label: 'Expressway Open', month: 'Feb 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2024-11-10', label: 'Highrises Complete', month: 'Nov 2024', img: '/assets/after_scene.jpg', hasChange: true },
    ],
    tacticalX: 43,
    tacticalY: 20,
    regionalX: 40,
    regionalY: 20,
  },

  // 19. Whitefield IT Corridor, Bengaluru (Urban Expansion)
  {
    id: 'loc-bengaluru-it',
    title: 'Whitefield & Electronic City Tech Corridor Expansion',
    locationName: 'Kadugodi Outer Belt, Bengaluru',
    country: 'India',
    state: 'Karnataka',
    region: 'Urban Metro',
    category: 'urban',
    coordinates: '12.9698° N, 77.7500° E',
    lat: 12.9698,
    lon: 77.7500,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m High-Res Optical',
    baselineDate: '2023-01-12',
    currentDate: '2025-02-18',
    beforeCloudCover: '0.8%',
    cloudCover: '1.0%',
    areaHaValue: 24.8,
    areaM2Value: 248000,
    changePercentage: '+38.7%',
    confidencePct: 94,
    relevanceScore: 96,
    changeType: 'IT Park & Multi-Story Urban Spread',
    description: 'Conversion of scrubland and mango groves into sprawling corporate tech parks, metro rail stations, and residential towers.',
    imageUrl: '/assets/card_1_construction.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/after_scene.jpg',
    keywords: ['urban expansion', 'urban', 'expansion', 'bengaluru', 'bangalore', 'karnataka', 'whitefield', 'electronic city', 'tech park', 'city', 'sprawl', 'buildings'],
    passes: [
      { date: '2023-01-12', label: 'Baseline', month: 'Jan 2023', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-09-20', label: 'Site Excavation', month: 'Sep 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-05-14', label: 'Glass Facade Work', month: 'May 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2025-02-18', label: 'Campus Inhabited', month: 'Feb 2025', img: '/assets/after_scene.jpg', hasChange: true },
    ],
    tacticalX: 46,
    tacticalY: 69,
    regionalX: 43,
    regionalY: 67,
  },

  // 20. HITEC City, Hyderabad (Urban Expansion)
  {
    id: 'loc-hyderabad-or',
    title: 'HITEC City & Outer Ring Road Real Estate Growth',
    locationName: 'Gachibowli-Nanakramguda, Hyderabad',
    country: 'India',
    state: 'Telangana',
    region: 'Urban Metro',
    category: 'urban',
    coordinates: '17.4474° N, 78.3762° E',
    lat: 17.4474,
    lon: 78.3762,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color (B4,B3,B2)',
    baselineDate: '2023-02-05',
    currentDate: '2025-01-30',
    beforeCloudCover: '0.3%',
    cloudCover: '0.5%',
    areaHaValue: 21.0,
    areaM2Value: 210000,
    changePercentage: '+40.2%',
    confidencePct: 93,
    relevanceScore: 95,
    changeType: 'High-Density Commercial Urban Growth',
    description: 'Rocky granite outcrop blasting, tower foundations, and expressway cloverleaf junction expansion in Cyberabad corridor.',
    imageUrl: '/assets/card_4_bridge.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_4_bridge.jpg',
    keywords: ['urban expansion', 'urban', 'expansion', 'hyderabad', 'telangana', 'hitec city', 'gachibowli', 'outer ring road', 'financial district', 'city', 'sprawl'],
    passes: [
      { date: '2023-02-05', label: 'Baseline', month: 'Feb 2023', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-10-18', label: 'Blasting & Grading', month: 'Oct 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-06-25', label: 'Pillar Columns', month: 'Jun 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2025-01-30', label: 'Tower Cladding', month: 'Jan 2025', img: '/assets/card_4_bridge.jpg', hasChange: true },
    ],
    tacticalX: 49,
    tacticalY: 56,
    regionalX: 46,
    regionalY: 54,
  },

  // 21. Samruddhi Mahamarg, Maharashtra (Roads & Infrastructure)
  {
    id: 'loc-samruddhi',
    title: 'Samruddhi Mahamarg Super Expressway Corridor',
    locationName: 'Aurangabad-Nashik Section',
    country: 'India',
    state: 'Maharashtra',
    region: 'Infrastructure Corridor',
    category: 'roads',
    coordinates: '19.8762° N, 75.3433° E',
    lat: 19.8762,
    lon: 75.3433,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m True Color (B4,B3,B2)',
    baselineDate: '2022-09-01',
    currentDate: '2024-10-15',
    beforeCloudCover: '0.6%',
    cloudCover: '0.4%',
    areaHaValue: 78.5,
    areaM2Value: 785000,
    changePercentage: '+84.0%',
    confidencePct: 98,
    relevanceScore: 98,
    changeType: 'Access-Controlled Expressway Construction',
    description: '6-lane high-speed concrete expressway corridor, grade-separated toll plazas, interchanges, and wildlife overpasses cutting across agricultural plains.',
    imageUrl: '/assets/card_4_bridge.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_4_bridge.jpg',
    keywords: ['roads', 'new roads', 'road development', 'highway', 'expressway', 'samruddhi', 'maharashtra', 'aurangabad', 'corridor', 'paving', 'infrastructure', 'transport'],
    passes: [
      { date: '2022-09-01', label: 'Baseline', month: 'Sep 2022', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-05-15', label: 'Embankment Fill', month: 'May 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-01-20', label: 'Pavement Layer', month: 'Jan 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2024-10-15', label: 'Expressway Open', month: 'Oct 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
    ],
    tacticalX: 44,
    tacticalY: 53,
    regionalX: 41,
    regionalY: 50,
  },

  // 22. Char Dham Himalayan Highway, Uttarakhand (Roads)
  {
    id: 'loc-chardham',
    title: 'Char Dham All-Weather Himalayan Highway Paving',
    locationName: 'Rishikesh-Devprayag Ridge, Tehri',
    country: 'India',
    state: 'Uttarakhand',
    region: 'Infrastructure Corridor',
    category: 'roads',
    coordinates: '30.3165° N, 78.0322° E',
    lat: 30.3165,
    lon: 78.0322,
    sensor: 'Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m Optical Pan-Sharpened',
    baselineDate: '2022-10-10',
    currentDate: '2024-11-28',
    beforeCloudCover: '0.2%',
    cloudCover: '0.5%',
    areaHaValue: 16.4,
    areaM2Value: 164000,
    changePercentage: '+36.8%',
    confidencePct: 92,
    relevanceScore: 94,
    changeType: 'Mountain Highway Widening & Cut-and-Fill',
    description: 'Double-laning of mountain pilgrimage route, hillside slope stabilization benches, and tunnel entrance civil works.',
    imageUrl: '/assets/card_4_bridge.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_4_bridge.jpg',
    keywords: ['roads', 'new roads', 'road development', 'highway', 'char dham', 'uttarakhand', 'rishikesh', 'himalayas', 'mountain', 'paving', 'widening', 'infrastructure'],
    passes: [
      { date: '2022-10-10', label: 'Baseline', month: 'Oct 2022', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-06-18', label: 'Cut Slope Benches', month: 'Jun 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-02-14', label: 'Retaining Wall', month: 'Feb 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
      { date: '2024-11-28', label: 'Paved Double Lane', month: 'Nov 2024', img: '/assets/card_4_bridge.jpg', hasChange: true },
    ],
    tacticalX: 44,
    tacticalY: 15,
    regionalX: 42,
    regionalY: 14,
  },

  // 23. Brahmaputra Majuli Floodplain, Assam (Flood)
  {
    id: 'loc-brahmaputra',
    title: 'Brahmaputra Floodplain Riverbank Erosion & Sand Siltation',
    locationName: 'Majuli River Island, Jorhat',
    country: 'India',
    state: 'Assam',
    region: 'Flood & Wetlands',
    category: 'flood',
    coordinates: '26.9500° N, 94.2167° E',
    lat: 26.9500,
    lon: 94.2167,
    sensor: 'Sentinel-1 SAR / Sentinel-2 (10m)',
    resolution: '10 m',
    resolutionDetail: '10m Optical / Radar NDWI',
    baselineDate: '2023-03-10',
    currentDate: '2024-09-18',
    beforeCloudCover: '1.4%',
    cloudCover: '2.8%',
    areaHaValue: 112.0,
    areaM2Value: 1120000,
    changePercentage: '+63.5%',
    confidencePct: 96,
    relevanceScore: 97,
    changeType: 'Severe River Inundation & Silt Accretion',
    description: 'Monsoonal river swelling, bank collapse, inundation of riparian settlements, and deposition of fresh sand shoals.',
    imageUrl: '/assets/card_2_riverside.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_2_riverside.jpg',
    keywords: ['flood', 'water', 'brahmaputra', 'majuli', 'assam', 'river', 'riverbank', 'erosion', 'inundation', 'monsoon', 'siltation', 'island'],
    passes: [
      { date: '2023-03-10', label: 'Baseline', month: 'Mar 2023', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-08-20', label: 'Peak Monsoonal Rise', month: 'Aug 2023', img: '/assets/card_2_riverside.jpg', hasChange: false },
      { date: '2024-04-12', label: 'Bank Submergence', month: 'Apr 2024', img: '/assets/card_2_riverside.jpg', hasChange: true },
      { date: '2024-09-18', label: 'Post-Flood Silt', month: 'Sep 2024', img: '/assets/card_2_riverside.jpg', hasChange: true },
    ],
    tacticalX: 82,
    tacticalY: 28,
    regionalX: 78,
    regionalY: 26,
  },

  // 24. Kuttanad Lowland, Kerala (Flood)
  {
    id: 'loc-kuttanad',
    title: 'Kuttanad Lowland Basin Flood Inundation & Sediment',
    locationName: 'Vembanad Lake Estuary, Alappuzha',
    country: 'India',
    state: 'Kerala',
    region: 'Flood & Wetlands',
    category: 'flood',
    coordinates: '9.4981° N, 76.4560° E',
    lat: 9.4981,
    lon: 76.4560,
    sensor: 'Sentinel-1 SAR (10m)',
    resolution: '10 m',
    resolutionDetail: '10m All-Weather SAR Flood Mapping',
    baselineDate: '2023-01-20',
    currentDate: '2024-08-30',
    beforeCloudCover: '1.0%',
    cloudCover: '0.0%',
    areaHaValue: 64.2,
    areaM2Value: 642000,
    changePercentage: '+47.2%',
    confidencePct: 94,
    relevanceScore: 95,
    changeType: 'Submerged Agricultural Polders',
    description: 'Monsoon runoff overtopping protective bunds, submerging low-lying paddy polders under 1.5 to 2.2 meters of floodwater.',
    imageUrl: '/assets/card_2_riverside.jpg',
    beforeImgUrl: '/assets/before_scene.jpg',
    afterImgUrl: '/assets/card_2_riverside.jpg',
    keywords: ['flood', 'water', 'kuttanad', 'kerala', 'alappuzha', 'vembanad', 'inundation', 'submerged', 'polders', 'monsoon', 'backwaters'],
    passes: [
      { date: '2023-01-20', label: 'Baseline', month: 'Jan 2023', img: '/assets/before_scene.jpg', hasChange: false },
      { date: '2023-07-24', label: 'Pre-Monsoon Normal', month: 'Jul 2023', img: '/assets/card_5_land.jpg', hasChange: false },
      { date: '2024-02-15', label: 'Bund Breached', month: 'Feb 2024', img: '/assets/card_2_riverside.jpg', hasChange: true },
      { date: '2024-08-30', label: 'Flood Inundation Peak', month: 'Aug 2024', img: '/assets/card_2_riverside.jpg', hasChange: true },
    ],
    tacticalX: 43,
    tacticalY: 78,
    regionalX: 41,
    regionalY: 76,
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
    country: loc.country,
    state: loc.state,
    region: loc.region,
    category: loc.category,
    coordinates: loc.coordinates,
    lat: loc.lat,
    lon: loc.lon,
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
    matchType: loc.relevanceScore >= 95 ? 'High Relevance' : 'Medium Relevance',
    changePercentage: loc.changePercentage,
    changeType: loc.changeType,
    description: loc.description,
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
 * Dev-time validation function that inspects a location or item
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
