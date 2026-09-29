import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  Search,
  Plus,
  Minus,
  RotateCcw,
  ChevronRight,
  Filter,
  Sparkles
} from 'lucide-react';
import { SearchResultItem } from '../components/search/SemanticSearchResults';

export type VigilFeatureCategory =
  | 'all'
  | 'construction'
  | 'road'
  | 'water'
  | 'vegetation'
  | 'urban'
  | 'agriculture'
  | 'industrial'
  | 'riverbank';

export interface CategoryInfo {
  id: VigilFeatureCategory;
  name: string;
  icon: string;
  whatVigilShows: string;
  color: string;
  badgeBg: string;
}

export const VIGIL_CATEGORIES: CategoryInfo[] = [
  {
    id: 'construction',
    name: 'Construction sites',
    icon: '🏗️',
    whatVigilShows: 'New buildings, expansion of built-up areas',
    color: '#F59E0B',
    badgeBg: 'rgba(245, 158, 11, 0.15)'
  },
  {
    id: 'road',
    name: 'Road development',
    icon: '🛣️',
    whatVigilShows: 'New roads, road widening, extensions',
    color: '#38BDF8',
    badgeBg: 'rgba(56, 189, 248, 0.15)'
  },
  {
    id: 'water',
    name: 'River / water bodies',
    icon: '🌊',
    whatVigilShows: 'Change in water extent, riverbank changes',
    color: '#00E5FF',
    badgeBg: 'rgba(0, 229, 255, 0.15)'
  },
  {
    id: 'vegetation',
    name: 'Vegetation / cleared land',
    icon: '🌳',
    whatVigilShows: 'Forest/vegetation clearance',
    color: '#10B981',
    badgeBg: 'rgba(16, 185, 129, 0.15)'
  },
  {
    id: 'urban',
    name: 'Urban areas',
    icon: '🏘️',
    whatVigilShows: 'New structures and urban expansion',
    color: '#A855F7',
    badgeBg: 'rgba(168, 85, 247, 0.15)'
  },
  {
    id: 'agriculture',
    name: 'Open/agricultural land',
    icon: '🚜',
    whatVigilShows: 'Conversion of open land to built-up areas',
    color: '#84CC16',
    badgeBg: 'rgba(132, 204, 22, 0.15)'
  },
  {
    id: 'industrial',
    name: 'Industrial areas',
    icon: '🏭',
    whatVigilShows: 'Expansion of industrial structures',
    color: '#F97316',
    badgeBg: 'rgba(249, 115, 22, 0.15)'
  },
  {
    id: 'riverbank',
    name: 'Riverbank areas',
    icon: '🏞️',
    whatVigilShows: 'Construction or land-use changes near rivers',
    color: '#EC4899',
    badgeBg: 'rgba(236, 72, 153, 0.15)'
  }
];

export interface AltimetryStation {
  id: string;
  title: string;
  stationCode: string;
  category: VigilFeatureCategory;
  categoryLabel: string;
  categoryIcon: string;
  whatVigilShows: string;
  changeDescription: string;
  areaChange: string;
  areaChangeM2: number;
  ndviDelta: string;
  ndbiDelta: string;
  confidencePct: number;
  sensor: string;
  observationDate: string;
  type: 'in-situ' | 'drifter' | 'argo' | 'tide-gauge' | 'wave-buoy' | 'satellite-aoi';
  typeLabel: string;
  color: string;
  coordinates: string;
  lat: number;
  lon: number;
  // Position percentages on global equirectangular map
  globalX: number;
  globalY: number;
  // Position percentages on regional India satellite map (58°E-98°E, 38°N-5°N)
  regionalX: number;
  regionalY: number;
  // Telemetry metrics
  depth: string;
  pressure: string;
  sst: string;
  sstVal: number;
  salinity: string;
  salinityVal: number;
  dissolvedOxygen: string;
  dissolvedOxygenVal: number;
  chlorophyll: string;
  chlorophyllVal: number;
  waveHeight: string;
  waveHeightVal: number;
  currentSpeed: string;
  currentSpeedVal: number;
  windSpeed: string;
  windDirection: string;
  semanticId?: string;
}

const GLOBAL_STATIONS: AltimetryStation[] = [
  // 1. 🏗️ CONSTRUCTION SITES
  {
    id: 'st-hazira',
    title: 'Hazira Deepwater Wharf & Piling Deck',
    stationCode: 'Hazira Wharf',
    category: 'construction',
    categoryLabel: 'Construction sites',
    categoryIcon: '🏗️',
    whatVigilShows: 'New buildings, expansion of built-up areas',
    changeDescription: 'New structural steel wharf deck and deepwater piling foundation (+4.2 ha)',
    areaChange: '+4.2 ha',
    areaChangeM2: 42000,
    ndbiDelta: '+0.34 NDBI',
    ndviDelta: '-0.18 NDVI',
    confidencePct: 96,
    sensor: 'Sentinel-2 (10m)',
    observationDate: '2025-04-28',
    type: 'tide-gauge',
    typeLabel: 'Wharf Construction',
    color: '#F59E0B',
    coordinates: '21.4587° N, 72.7812° E',
    lat: 21.4587,
    lon: 72.7812,
    globalX: 70.2,
    globalY: 38.2,
    regionalX: 37.0,
    regionalY: 50.1,
    depth: '18m',
    pressure: '18.50 dbar (1.82 atm)',
    sst: '28.4 °C',
    sstVal: 28.4,
    salinity: '34.2 PSU',
    salinityVal: 34.2,
    dissolvedOxygen: '5.1 mg/L',
    dissolvedOxygenVal: 5.1,
    chlorophyll: '0.95 mg/m³',
    chlorophyllVal: 0.95,
    waveHeight: '0.85m',
    waveHeightVal: 0.85,
    currentSpeed: '0.62 m/s',
    currentSpeedVal: 0.62,
    windSpeed: '6.1 m/s',
    windDirection: '190° S',
    semanticId: 'res-1'
  },
  {
    id: 'st-mumbai-airport',
    title: 'Navi Mumbai Aerocity & Terminal-1 Construction',
    stationCode: 'Navi Mumbai Aerocity',
    category: 'construction',
    categoryLabel: 'Construction sites',
    categoryIcon: '🏗️',
    whatVigilShows: 'New buildings, expansion of built-up areas',
    changeDescription: 'Terminal-1 foundation casting, apron paving & ATC superstructure erection',
    areaChange: '+12.4 ha',
    areaChangeM2: 124000,
    ndbiDelta: '+0.42 NDBI',
    ndviDelta: '-0.28 NDVI',
    confidencePct: 94,
    sensor: 'Sentinel-2 (10m)',
    observationDate: '2025-03-12',
    type: 'satellite-aoi',
    typeLabel: 'Airport Infrastructure',
    color: '#F59E0B',
    coordinates: '18.9900° N, 73.0700° E',
    lat: 18.9900,
    lon: 73.0700,
    globalX: 70.3,
    globalY: 39.4,
    regionalX: 37.7,
    regionalY: 57.6,
    depth: '8m MSL',
    pressure: '1.02 atm',
    sst: '28.1 °C',
    sstVal: 28.1,
    salinity: '35.0 PSU',
    salinityVal: 35.0,
    dissolvedOxygen: '4.8 mg/L',
    dissolvedOxygenVal: 4.8,
    chlorophyll: '0.62 mg/m³',
    chlorophyllVal: 0.62,
    waveHeight: '0.95m',
    waveHeightVal: 0.95,
    currentSpeed: '0.45 m/s',
    currentSpeedVal: 0.45,
    windSpeed: '7.2 m/s',
    windDirection: '240° WSW'
  },
  {
    id: 'st-noida-highrise',
    title: 'Noida Sector 150 Infrastructure & Residential Towers',
    stationCode: 'Noida Sec-150',
    category: 'construction',
    categoryLabel: 'Construction sites',
    categoryIcon: '🏗️',
    whatVigilShows: 'New buildings, expansion of built-up areas',
    changeDescription: 'Excavation of multi-acre foundations, 14 high-rise towers and podium assembly',
    areaChange: '+8.1 ha',
    areaChangeM2: 81000,
    ndbiDelta: '+0.38 NDBI',
    ndviDelta: '-0.24 NDVI',
    confidencePct: 91,
    sensor: 'Sentinel-1 (SAR)',
    observationDate: '2025-02-18',
    type: 'satellite-aoi',
    typeLabel: 'Commercial Towers',
    color: '#F59E0B',
    coordinates: '28.4600° N, 77.4800° E',
    lat: 28.4600,
    lon: 77.4800,
    globalX: 71.5,
    globalY: 34.2,
    regionalX: 48.7,
    regionalY: 28.9,
    depth: '198m MSL',
    pressure: '0.98 atm',
    sst: '24.2 °C',
    sstVal: 24.2,
    salinity: '0.2 PSU',
    salinityVal: 0.2,
    dissolvedOxygen: '6.4 mg/L',
    dissolvedOxygenVal: 6.4,
    chlorophyll: '1.40 mg/m³',
    chlorophyllVal: 1.40,
    waveHeight: '0.20m',
    waveHeightVal: 0.20,
    currentSpeed: '0.15 m/s',
    currentSpeedVal: 0.15,
    windSpeed: '4.8 m/s',
    windDirection: '290° WNW'
  },

  // 2. 🛣️ ROAD DEVELOPMENT
  {
    id: 'st-delhi-mumbai-exp',
    title: 'Delhi-Mumbai Expressway Greenfield Corridor',
    stationCode: 'NE-4 Expressway',
    category: 'road',
    categoryLabel: 'Road development',
    categoryIcon: '🛣️',
    whatVigilShows: 'New roads, road widening, extensions',
    changeDescription: 'Greenfield 8-lane asphalt corridor paving and cloverleaf interchange grading',
    areaChange: '+28.5 km corridor',
    areaChangeM2: 185000,
    ndbiDelta: '+0.29 NDBI',
    ndviDelta: '-0.22 NDVI',
    confidencePct: 95,
    sensor: 'Sentinel-2 (10m)',
    observationDate: '2025-01-30',
    type: 'satellite-aoi',
    typeLabel: 'Expressway Paving',
    color: '#38BDF8',
    coordinates: '22.3100° N, 73.1800° E',
    lat: 22.3100,
    lon: 73.1800,
    globalX: 70.3,
    globalY: 37.6,
    regionalX: 38.0,
    regionalY: 47.5,
    depth: '42m MSL',
    pressure: '1.00 atm',
    sst: '27.4 °C',
    sstVal: 27.4,
    salinity: '0.4 PSU',
    salinityVal: 0.4,
    dissolvedOxygen: '5.8 mg/L',
    dissolvedOxygenVal: 5.8,
    chlorophyll: '0.80 mg/m³',
    chlorophyllVal: 0.80,
    waveHeight: '0.10m',
    waveHeightVal: 0.10,
    currentSpeed: '0.12 m/s',
    currentSpeedVal: 0.12,
    windSpeed: '5.2 m/s',
    windDirection: '215° SW'
  },
  {
    id: 'st-bengaluru-strr',
    title: 'Bengaluru Satellite Town Ring Road (STRR)',
    stationCode: 'STRR Bypass',
    category: 'road',
    categoryLabel: 'Road development',
    categoryIcon: '🛣️',
    whatVigilShows: 'New roads, road widening, extensions',
    changeDescription: '6-lane bypass corridor expansion, flyover pier casting and earthworks',
    areaChange: '+16.2 km corridor',
    areaChangeM2: 115000,
    ndbiDelta: '+0.31 NDBI',
    ndviDelta: '-0.20 NDVI',
    confidencePct: 92,
    sensor: 'Landsat-8/9 (15m)',
    observationDate: '2024-11-20',
    type: 'satellite-aoi',
    typeLabel: 'Ring Road Widening',
    color: '#38BDF8',
    coordinates: '13.1200° N, 77.6200° E',
    lat: 13.1200,
    lon: 77.6200,
    globalX: 71.6,
    globalY: 42.7,
    regionalX: 49.1,
    regionalY: 75.4,
    depth: '915m MSL',
    pressure: '0.91 atm',
    sst: '23.8 °C',
    sstVal: 23.8,
    salinity: '0.1 PSU',
    salinityVal: 0.1,
    dissolvedOxygen: '6.2 mg/L',
    dissolvedOxygenVal: 6.2,
    chlorophyll: '0.50 mg/m³',
    chlorophyllVal: 0.50,
    waveHeight: '0.05m',
    waveHeightVal: 0.05,
    currentSpeed: '0.05 m/s',
    currentSpeedVal: 0.05,
    windSpeed: '6.4 m/s',
    windDirection: '110° ESE'
  },
  {
    id: 'st-dumas',
    title: 'Dumas Coastal Bund & Shoreline Highway',
    stationCode: 'Dumas Bund',
    category: 'road',
    categoryLabel: 'Road development',
    categoryIcon: '🛣️',
    whatVigilShows: 'New roads, road widening, extensions',
    changeDescription: 'Coastal seawall bund road widening, rock armor riprap stabilization (+1.8 km)',
    areaChange: '+3.1 ha (+1.8 km)',
    areaChangeM2: 31000,
    ndbiDelta: '+0.25 NDBI',
    ndviDelta: '-0.15 NDVI',
    confidencePct: 93,
    sensor: 'Sentinel-2 (10m)',
    observationDate: '2024-11-18',
    type: 'tide-gauge',
    typeLabel: 'Coastal Roadway',
    color: '#38BDF8',
    coordinates: '21.4632° N, 72.7845° E',
    lat: 21.4632,
    lon: 72.7845,
    globalX: 70.2,
    globalY: 38.1,
    regionalX: 37.4,
    regionalY: 49.8,
    depth: '12m',
    pressure: '12.40 dbar (1.22 atm)',
    sst: '28.2 °C',
    sstVal: 28.2,
    salinity: '34.0 PSU',
    salinityVal: 34.0,
    dissolvedOxygen: '5.2 mg/L',
    dissolvedOxygenVal: 5.2,
    chlorophyll: '0.88 mg/m³',
    chlorophyllVal: 0.88,
    waveHeight: '0.90m',
    waveHeightVal: 0.90,
    currentSpeed: '0.58 m/s',
    currentSpeedVal: 0.58,
    windSpeed: '6.4 m/s',
    windDirection: '195° S',
    semanticId: 'res-2'
  },

  // 3. 🌊 RIVER / WATER BODIES
  {
    id: 'st-ganga-sandbar',
    title: 'Ganges River Mid-Channel Sandbar & Hydrology',
    stationCode: 'Ganga Sandbar',
    category: 'water',
    categoryLabel: 'River / water bodies',
    categoryIcon: '🌊',
    whatVigilShows: 'Change in water extent, riverbank changes',
    changeDescription: 'Seasonal water spread retreat, dynamic sandbar accretion and bank erosion',
    areaChange: '-14.5% water extent',
    areaChangeM2: 95000,
    ndbiDelta: '-0.12 NDBI',
    ndviDelta: '+0.15 NDVI',
    confidencePct: 89,
    sensor: 'Sentinel-2 (10m)',
    observationDate: '2025-05-14',
    type: 'satellite-aoi',
    typeLabel: 'Hydrological Shift',
    color: '#00E5FF',
    coordinates: '25.5940° N, 85.1376° E',
    lat: 25.5940,
    lon: 85.1376,
    globalX: 73.6,
    globalY: 35.8,
    regionalX: 67.8,
    regionalY: 37.6,
    depth: '14m Riverbed',
    pressure: '1.40 dbar (1.13 atm)',
    sst: '26.8 °C',
    sstVal: 26.8,
    salinity: '0.3 PSU',
    salinityVal: 0.3,
    dissolvedOxygen: '6.8 mg/L',
    dissolvedOxygenVal: 6.8,
    chlorophyll: '1.80 mg/m³',
    chlorophyllVal: 1.80,
    waveHeight: '0.40m',
    waveHeightVal: 0.40,
    currentSpeed: '1.20 m/s',
    currentSpeedVal: 1.20,
    windSpeed: '4.5 m/s',
    windDirection: '180° S'
  },
  {
    id: 'st-brahmaputra',
    title: 'Brahmaputra River Braided Sand Island Drift',
    stationCode: 'Brahmaputra Spit',
    category: 'water',
    categoryLabel: 'River / water bodies',
    categoryIcon: '🌊',
    whatVigilShows: 'Change in water extent, riverbank changes',
    changeDescription: 'Hydrodynamic braided channel migration, monsoon sediment spit re-alignment',
    areaChange: '+18.2% island shift',
    areaChangeM2: 142000,
    ndbiDelta: '-0.08 NDBI',
    ndviDelta: '+0.10 NDVI',
    confidencePct: 88,
    sensor: 'Sentinel-1 (SAR)',
    observationDate: '2024-09-15',
    type: 'satellite-aoi',
    typeLabel: 'Braided Island Dynamics',
    color: '#00E5FF',
    coordinates: '26.1800° N, 91.7500° E',
    lat: 26.1800,
    lon: 91.7500,
    globalX: 75.5,
    globalY: 35.5,
    regionalX: 84.4,
    regionalY: 35.8,
    depth: '16m Riverbed',
    pressure: '1.60 dbar (1.15 atm)',
    sst: '24.5 °C',
    sstVal: 24.5,
    salinity: '0.2 PSU',
    salinityVal: 0.2,
    dissolvedOxygen: '7.4 mg/L',
    dissolvedOxygenVal: 7.4,
    chlorophyll: '1.25 mg/m³',
    chlorophyllVal: 1.25,
    waveHeight: '0.65m',
    waveHeightVal: 0.65,
    currentSpeed: '1.85 m/s',
    currentSpeedVal: 1.85,
    windSpeed: '5.8 m/s',
    windDirection: '085° E'
  },
  {
    id: 'st-sardar-sarovar',
    title: 'Sardar Sarovar Reservoir Water Surface Dynamics',
    stationCode: 'Narmada Reservoir',
    category: 'water',
    categoryLabel: 'River / water bodies',
    categoryIcon: '🌊',
    whatVigilShows: 'Change in water extent, riverbank changes',
    changeDescription: 'Reservoir catchment high-water perimeter fluctuation and shoreline drawdown',
    areaChange: '+8.6% water volume',
    areaChangeM2: 86000,
    ndbiDelta: '-0.15 NDBI',
    ndviDelta: '+0.08 NDVI',
    confidencePct: 93,
    sensor: 'Sentinel-2 (10m)',
    observationDate: '2024-10-05',
    type: 'satellite-aoi',
    typeLabel: 'Reservoir Storage',
    color: '#00E5FF',
    coordinates: '21.8300° N, 73.7500° E',
    lat: 21.8300,
    lon: 73.7500,
    globalX: 70.5,
    globalY: 37.9,
    regionalX: 39.4,
    regionalY: 49.0,
    depth: '138m Water Head',
    pressure: '14.2 dbar (1.40 atm)',
    sst: '25.6 °C',
    sstVal: 25.6,
    salinity: '0.1 PSU',
    salinityVal: 0.1,
    dissolvedOxygen: '7.1 mg/L',
    dissolvedOxygenVal: 7.1,
    chlorophyll: '0.75 mg/m³',
    chlorophyllVal: 0.75,
    waveHeight: '0.35m',
    waveHeightVal: 0.35,
    currentSpeed: '0.30 m/s',
    currentSpeedVal: 0.30,
    windSpeed: '5.5 m/s',
    windDirection: '220° SW'
  },
  {
    id: 'st-khambhat',
    title: 'Gulf of Khambhat Marine Gateway & Tidal Basin',
    stationCode: 'Gulf of Khambhat',
    category: 'water',
    categoryLabel: 'River / water bodies',
    categoryIcon: '🌊',
    whatVigilShows: 'Change in water extent, riverbank changes',
    changeDescription: 'High-energy macro-tidal sediment plume & oceanic bathymetry channel dynamics',
    areaChange: '24m Bathymetry',
    areaChangeM2: 24000,
    ndbiDelta: '-0.05 NDBI',
    ndviDelta: '+0.02 NDVI',
    confidencePct: 91,
    sensor: 'Sentinel-3 / Altimetry',
    observationDate: '2025-04-15',
    type: 'in-situ',
    typeLabel: 'Tidal Sediment Gateway',
    color: '#00E5FF',
    coordinates: '21.2000° N, 72.4000° E',
    lat: 21.2000,
    lon: 72.4000,
    globalX: 70.1,
    globalY: 38.4,
    regionalX: 36.0,
    regionalY: 50.9,
    depth: '24m Bathymetry',
    pressure: '24.80 dbar (2.44 atm)',
    sst: '27.8 °C',
    sstVal: 27.8,
    salinity: '33.8 PSU',
    salinityVal: 33.8,
    dissolvedOxygen: '5.0 mg/L',
    dissolvedOxygenVal: 5.0,
    chlorophyll: '1.20 mg/m³',
    chlorophyllVal: 1.20,
    waveHeight: '1.10m',
    waveHeightVal: 1.10,
    currentSpeed: '0.74 m/s',
    currentSpeedVal: 0.74,
    windSpeed: '7.8 m/s',
    windDirection: '210° SSW',
    semanticId: 'res-9'
  },
  {
    id: 'st-as',
    title: 'Arabian Sea Offshore Energy Corridor',
    stationCode: 'Arabian Sea',
    category: 'water',
    categoryLabel: 'River / water bodies',
    categoryIcon: '🌊',
    whatVigilShows: 'Change in water extent, riverbank changes',
    changeDescription: 'Deepwater offshore basin monitoring and thermocline altimetry observation',
    areaChange: '1,280m Depth',
    areaChangeM2: 0,
    ndbiDelta: '0.00 NDBI',
    ndviDelta: '0.00 NDVI',
    confidencePct: 92,
    sensor: 'Jason-3 / Sentinel-6',
    observationDate: '2025-04-20',
    type: 'in-situ',
    typeLabel: 'Offshore Energy Corridor',
    color: '#00E5FF',
    coordinates: '18.9220° N, 71.4500° E',
    lat: 18.922,
    lon: 71.450,
    globalX: 69.8,
    globalY: 39.5,
    regionalX: 33.6,
    regionalY: 57.8,
    depth: '1,280m',
    pressure: '1,318.40 dbar (130.12 atm)',
    sst: '28.1 °C',
    sstVal: 28.1,
    salinity: '36.5 PSU',
    salinityVal: 36.5,
    dissolvedOxygen: '4.2 mg/L',
    dissolvedOxygenVal: 4.2,
    chlorophyll: '0.38 mg/m³',
    chlorophyllVal: 0.38,
    waveHeight: '1.25m',
    waveHeightVal: 1.25,
    currentSpeed: '0.49 m/s',
    currentSpeedVal: 0.49,
    windSpeed: '8.2 m/s',
    windDirection: '240° WSW',
    semanticId: 'res-8'
  },
  {
    id: 'st-bob',
    title: 'Bay of Bengal Oceanic Station',
    stationCode: 'Bay of Bengal',
    category: 'water',
    categoryLabel: 'River / water bodies',
    categoryIcon: '🌊',
    whatVigilShows: 'Change in water extent, riverbank changes',
    changeDescription: 'Marine basin surface height topography & cyclone wave tracking',
    areaChange: '3,840m Depth',
    areaChangeM2: 0,
    ndbiDelta: '0.00 NDBI',
    ndviDelta: '0.00 NDVI',
    confidencePct: 90,
    sensor: 'CryoSat-2 / SARAL',
    observationDate: '2025-04-22',
    type: 'in-situ',
    typeLabel: 'Deep Oceanic Station',
    color: '#00E5FF',
    coordinates: '15.2970° N, 87.8680° E',
    lat: 15.297,
    lon: 87.868,
    globalX: 74.4,
    globalY: 41.5,
    regionalX: 74.7,
    regionalY: 68.8,
    depth: '3,840m',
    pressure: '3,955.20 dbar (390.41 atm)',
    sst: '28.9 °C',
    sstVal: 28.9,
    salinity: '32.8 PSU',
    salinityVal: 32.8,
    dissolvedOxygen: '4.6 mg/L',
    dissolvedOxygenVal: 4.6,
    chlorophyll: '0.52 mg/m³',
    chlorophyllVal: 0.52,
    waveHeight: '1.42m',
    waveHeightVal: 1.42,
    currentSpeed: '0.42 m/s',
    currentSpeedVal: 0.42,
    windSpeed: '7.4 m/s',
    windDirection: '205° SW',
    semanticId: 'res-7'
  },

  // 4. 🌳 VEGETATION / CLEARED LAND
  {
    id: 'st-aravalli-clearance',
    title: 'Aravalli Range Clearance & Quarry Surveillance',
    stationCode: 'Aravalli Canopy',
    category: 'vegetation',
    categoryLabel: 'Vegetation / cleared land',
    categoryIcon: '🌳',
    whatVigilShows: 'Forest/vegetation clearance',
    changeDescription: 'Scrub forest canopy loss, unpermitted quarrying scar and haulage track clearing',
    areaChange: '-7.2 ha canopy loss',
    areaChangeM2: 72000,
    ndbiDelta: '+0.36 NDBI',
    ndviDelta: '-0.32 NDVI',
    confidencePct: 94,
    sensor: 'Sentinel-2 (10m)',
    observationDate: '2025-02-04',
    type: 'satellite-aoi',
    typeLabel: 'Canopy Loss & Quarrying',
    color: '#10B981',
    coordinates: '27.8500° N, 76.1200° E',
    lat: 27.8500,
    lon: 76.1200,
    globalX: 71.1,
    globalY: 34.5,
    regionalX: 45.3,
    regionalY: 30.8,
    depth: '412m MSL',
    pressure: '0.96 atm',
    sst: '22.5 °C',
    sstVal: 22.5,
    salinity: '0.1 PSU',
    salinityVal: 0.1,
    dissolvedOxygen: '6.5 mg/L',
    dissolvedOxygenVal: 6.5,
    chlorophyll: '0.45 mg/m³',
    chlorophyllVal: 0.45,
    waveHeight: '0.00m',
    waveHeightVal: 0.00,
    currentSpeed: '0.00 m/s',
    currentSpeedVal: 0.00,
    windSpeed: '5.1 m/s',
    windDirection: '300° WNW'
  },
  {
    id: 'st-western-ghats-corridor',
    title: 'Western Ghats Linear Transmission Corridor Clearance',
    stationCode: 'Western Ghats Watch',
    category: 'vegetation',
    categoryLabel: 'Vegetation / cleared land',
    categoryIcon: '🌳',
    whatVigilShows: 'Forest/vegetation clearance',
    changeDescription: 'Linear canopy gap clearing for high-voltage powerline easement through dense forest',
    areaChange: '-5.4 ha canopy strip',
    areaChangeM2: 54000,
    ndbiDelta: '+0.22 NDBI',
    ndviDelta: '-0.35 NDVI',
    confidencePct: 91,
    sensor: 'Sentinel-2 (10m)',
    observationDate: '2024-12-10',
    type: 'satellite-aoi',
    typeLabel: 'Canopy Gap Analysis',
    color: '#10B981',
    coordinates: '10.1500° N, 76.9500° E',
    lat: 10.1500,
    lon: 76.9500,
    globalX: 71.4,
    globalY: 44.4,
    regionalX: 47.4,
    regionalY: 84.4,
    depth: '1,120m MSL',
    pressure: '0.89 atm',
    sst: '21.2 °C',
    sstVal: 21.2,
    salinity: '0.1 PSU',
    salinityVal: 0.1,
    dissolvedOxygen: '7.8 mg/L',
    dissolvedOxygenVal: 7.8,
    chlorophyll: '0.90 mg/m³',
    chlorophyllVal: 0.90,
    waveHeight: '0.00m',
    waveHeightVal: 0.00,
    currentSpeed: '0.00 m/s',
    currentSpeedVal: 0.00,
    windSpeed: '7.8 m/s',
    windDirection: '260° W'
  },

  // 5. 🏘️ URBAN AREAS
  {
    id: 'st-bengaluru-urban',
    title: 'Bengaluru Electronic City Peri-Urban Growth',
    stationCode: 'BLR Tech Infill',
    category: 'urban',
    categoryLabel: 'Urban areas',
    categoryIcon: '🏘️',
    whatVigilShows: 'New structures and urban expansion',
    changeDescription: 'High-density peri-urban expansion, multi-storey residential blocks and paved parking infill',
    areaChange: '+14.2 ha',
    areaChangeM2: 142000,
    ndbiDelta: '+0.45 NDBI',
    ndviDelta: '-0.29 NDVI',
    confidencePct: 95,
    sensor: 'Sentinel-2 (10m)',
    observationDate: '2025-04-10',
    type: 'satellite-aoi',
    typeLabel: 'High-Density Infill',
    color: '#A855F7',
    coordinates: '12.8400° N, 77.6700° E',
    lat: 12.8400,
    lon: 77.6700,
    globalX: 71.6,
    globalY: 42.9,
    regionalX: 49.2,
    regionalY: 76.2,
    depth: '890m MSL',
    pressure: '0.92 atm',
    sst: '25.0 °C',
    sstVal: 25.0,
    salinity: '0.2 PSU',
    salinityVal: 0.2,
    dissolvedOxygen: '5.9 mg/L',
    dissolvedOxygenVal: 5.9,
    chlorophyll: '0.35 mg/m³',
    chlorophyllVal: 0.35,
    waveHeight: '0.00m',
    waveHeightVal: 0.00,
    currentSpeed: '0.00 m/s',
    currentSpeedVal: 0.00,
    windSpeed: '5.6 m/s',
    windDirection: '140° SE'
  },
  {
    id: 'st-kolkata-rajarhat',
    title: 'Kolkata New Town Rajarhat Action Area III',
    stationCode: 'Rajarhat Sector V',
    category: 'urban',
    categoryLabel: 'Urban areas',
    categoryIcon: '🏘️',
    whatVigilShows: 'New structures and urban expansion',
    changeDescription: 'Commercial IT campus erection, urban infill and metro viaduct alignment',
    areaChange: '+9.5 ha',
    areaChangeM2: 95000,
    ndbiDelta: '+0.39 NDBI',
    ndviDelta: '-0.25 NDVI',
    confidencePct: 90,
    sensor: 'Landsat-8/9 (15m)',
    observationDate: '2025-01-14',
    type: 'satellite-aoi',
    typeLabel: 'Urban Expansion Corridor',
    color: '#A855F7',
    coordinates: '22.5800° N, 88.4700° E',
    lat: 22.5800,
    lon: 88.4700,
    globalX: 74.6,
    globalY: 37.5,
    regionalX: 76.2,
    regionalY: 46.7,
    depth: '9m MSL',
    pressure: '1.01 atm',
    sst: '26.4 °C',
    sstVal: 26.4,
    salinity: '0.5 PSU',
    salinityVal: 0.5,
    dissolvedOxygen: '5.2 mg/L',
    dissolvedOxygenVal: 5.2,
    chlorophyll: '1.10 mg/m³',
    chlorophyllVal: 1.10,
    waveHeight: '0.15m',
    waveHeightVal: 0.15,
    currentSpeed: '0.22 m/s',
    currentSpeedVal: 0.22,
    windSpeed: '4.8 m/s',
    windDirection: '190° S'
  },

  // 6. 🚜 OPEN/AGRICULTURAL LAND
  {
    id: 'st-amaravati-cropland',
    title: 'Amaravati Capital Region Agricultural Transition',
    stationCode: 'Amaravati Enclave',
    category: 'agriculture',
    categoryLabel: 'Open/agricultural land',
    categoryIcon: '🚜',
    whatVigilShows: 'Conversion of open land to built-up areas',
    changeDescription: 'Conversion of open agricultural cropland parcels into government administrative enclave',
    areaChange: '+22.0 ha converted',
    areaChangeM2: 220000,
    ndbiDelta: '+0.41 NDBI',
    ndviDelta: '-0.38 NDVI',
    confidencePct: 96,
    sensor: 'Sentinel-2 (10m)',
    observationDate: '2025-03-24',
    type: 'satellite-aoi',
    typeLabel: 'Cropland Conversion',
    color: '#84CC16',
    coordinates: '16.5100° N, 80.5100° E',
    lat: 16.5100,
    lon: 80.5100,
    globalX: 72.4,
    globalY: 40.8,
    regionalX: 56.3,
    regionalY: 65.1,
    depth: '22m MSL',
    pressure: '1.01 atm',
    sst: '29.2 °C',
    sstVal: 29.2,
    salinity: '0.2 PSU',
    salinityVal: 0.2,
    dissolvedOxygen: '5.6 mg/L',
    dissolvedOxygenVal: 5.6,
    chlorophyll: '0.90 mg/m³',
    chlorophyllVal: 0.90,
    waveHeight: '0.10m',
    waveHeightVal: 0.10,
    currentSpeed: '0.15 m/s',
    currentSpeedVal: 0.15,
    windSpeed: '6.0 m/s',
    windDirection: '160° SSE'
  },
  {
    id: 'st-pune-chakan',
    title: 'Pune Chakan Farmland Industrial Conversion',
    stationCode: 'Chakan SEZ',
    category: 'agriculture',
    categoryLabel: 'Open/agricultural land',
    categoryIcon: '🚜',
    whatVigilShows: 'Conversion of open land to built-up areas',
    changeDescription: 'Farmland soil leveling, pre-engineered factory shed erection and internal concrete roads',
    areaChange: '+11.8 ha converted',
    areaChangeM2: 118000,
    ndbiDelta: '+0.37 NDBI',
    ndviDelta: '-0.31 NDVI',
    confidencePct: 93,
    sensor: 'Sentinel-1 (SAR)',
    observationDate: '2024-10-18',
    type: 'satellite-aoi',
    typeLabel: 'Farmland to Auto Hub',
    color: '#84CC16',
    coordinates: '18.7600° N, 73.8600° E',
    lat: 18.7600,
    lon: 73.8600,
    globalX: 70.5,
    globalY: 39.6,
    regionalX: 39.7,
    regionalY: 58.3,
    depth: '645m MSL',
    pressure: '0.94 atm',
    sst: '25.8 °C',
    sstVal: 25.8,
    salinity: '0.1 PSU',
    salinityVal: 0.1,
    dissolvedOxygen: '6.1 mg/L',
    dissolvedOxygenVal: 6.1,
    chlorophyll: '0.40 mg/m³',
    chlorophyllVal: 0.40,
    waveHeight: '0.00m',
    waveHeightVal: 0.00,
    currentSpeed: '0.00 m/s',
    currentSpeedVal: 0.00,
    windSpeed: '6.8 m/s',
    windDirection: '270° W'
  },

  // 7. 🏭 INDUSTRIAL AREAS
  {
    id: 'st-adani',
    title: 'Adani Marine Logistics Container Berth Extension',
    stationCode: 'Adani Logistics',
    category: 'industrial',
    categoryLabel: 'Industrial areas',
    categoryIcon: '🏭',
    whatVigilShows: 'Expansion of industrial structures',
    changeDescription: 'Expansion of container yard, gantry rail installation and heavy-load concrete apron (+4.8 ha)',
    areaChange: '+4.8 ha',
    areaChangeM2: 48000,
    ndbiDelta: '+0.33 NDBI',
    ndviDelta: '-0.16 NDVI',
    confidencePct: 89,
    sensor: 'Sentinel-1 (SAR)',
    observationDate: '2024-06-15',
    type: 'tide-gauge',
    typeLabel: 'Marine Terminal & Berth',
    color: '#F97316',
    coordinates: '21.4521° N, 72.7763° E',
    lat: 21.4521,
    lon: 72.7763,
    globalX: 70.1,
    globalY: 38.3,
    regionalX: 36.8,
    regionalY: 50.4,
    depth: '16m',
    pressure: '16.20 dbar (1.60 atm)',
    sst: '28.3 °C',
    sstVal: 28.3,
    salinity: '34.1 PSU',
    salinityVal: 34.1,
    dissolvedOxygen: '5.1 mg/L',
    dissolvedOxygenVal: 5.1,
    chlorophyll: '0.91 mg/m³',
    chlorophyllVal: 0.91,
    waveHeight: '0.88m',
    waveHeightVal: 0.88,
    currentSpeed: '0.60 m/s',
    currentSpeedVal: 0.60,
    windSpeed: '6.2 m/s',
    windDirection: '192° S',
    semanticId: 'res-3'
  },
  {
    id: 'st-hyderabad-pharma',
    title: 'Hyderabad Mega Pharma City SEZ Corridor',
    stationCode: 'Pharma City Hub',
    category: 'industrial',
    categoryLabel: 'Industrial areas',
    categoryIcon: '🏭',
    whatVigilShows: 'Expansion of industrial structures',
    changeDescription: 'Erection of large-scale chemical manufacturing units, warehousing footprint & utility grid',
    areaChange: '+15.2 ha',
    areaChangeM2: 152000,
    ndbiDelta: '+0.44 NDBI',
    ndviDelta: '-0.27 NDVI',
    confidencePct: 94,
    sensor: 'Sentinel-2 (10m)',
    observationDate: '2025-02-28',
    type: 'satellite-aoi',
    typeLabel: 'Heavy Industrial SEZ',
    color: '#F97316',
    coordinates: '17.2200° N, 78.4800° E',
    lat: 17.2200,
    lon: 78.4800,
    globalX: 71.8,
    globalY: 40.4,
    regionalX: 51.2,
    regionalY: 63.0,
    depth: '510m MSL',
    pressure: '0.95 atm',
    sst: '28.5 °C',
    sstVal: 28.5,
    salinity: '0.2 PSU',
    salinityVal: 0.2,
    dissolvedOxygen: '5.4 mg/L',
    dissolvedOxygenVal: 5.4,
    chlorophyll: '0.60 mg/m³',
    chlorophyllVal: 0.60,
    waveHeight: '0.00m',
    waveHeightVal: 0.00,
    currentSpeed: '0.00 m/s',
    currentSpeedVal: 0.00,
    windSpeed: '5.4 m/s',
    windDirection: '210° SSW'
  },
  {
    id: 'st-paradip-refinery',
    title: 'Paradip Port Mega Petrochem Refinery Expansion',
    stationCode: 'Paradip Refinery',
    category: 'industrial',
    categoryLabel: 'Industrial areas',
    categoryIcon: '🏭',
    whatVigilShows: 'Expansion of industrial structures',
    changeDescription: 'Coastal petrochemical storage tank construction, refinery pipeline corridor installation',
    areaChange: '+13.6 ha',
    areaChangeM2: 136000,
    ndbiDelta: '+0.36 NDBI',
    ndviDelta: '-0.21 NDVI',
    confidencePct: 92,
    sensor: 'Sentinel-2 (10m)',
    observationDate: '2024-12-08',
    type: 'satellite-aoi',
    typeLabel: 'Petrochem Refinery SEZ',
    color: '#F97316',
    coordinates: '20.2600° N, 86.6700° E',
    lat: 20.2600,
    lon: 86.6700,
    globalX: 74.1,
    globalY: 38.7,
    regionalX: 71.7,
    regionalY: 53.8,
    depth: '14m MSL',
    pressure: '1.01 atm',
    sst: '27.9 °C',
    sstVal: 27.9,
    salinity: '31.2 PSU',
    salinityVal: 31.2,
    dissolvedOxygen: '5.5 mg/L',
    dissolvedOxygenVal: 5.5,
    chlorophyll: '1.20 mg/m³',
    chlorophyllVal: 1.20,
    waveHeight: '1.15m',
    waveHeightVal: 1.15,
    currentSpeed: '0.45 m/s',
    currentSpeedVal: 0.45,
    windSpeed: '7.6 m/s',
    windDirection: '185° S'
  },

  // 8. 🏞️ RIVERBANK AREAS
  {
    id: 'st-tapi',
    title: 'Tapi Rivermouth Pier Piling & Riprap Bar',
    stationCode: 'Tapi Rivermouth',
    category: 'riverbank',
    categoryLabel: 'Riverbank areas',
    categoryIcon: '🏞️',
    whatVigilShows: 'Construction or land-use changes near rivers',
    changeDescription: 'Pier pylons and rock riprap embankment along dynamic tidal rivermouth (+1.8 ha)',
    areaChange: '+1.8 ha',
    areaChangeM2: 18000,
    ndbiDelta: '+0.27 NDBI',
    ndviDelta: '-0.14 NDVI',
    confidencePct: 85,
    sensor: 'Sentinel-2 (10m)',
    observationDate: '2023-12-03',
    type: 'tide-gauge',
    typeLabel: 'Rivermouth Pylons',
    color: '#EC4899',
    coordinates: '21.4550° N, 72.7801° E',
    lat: 21.4550,
    lon: 72.7801,
    globalX: 70.2,
    globalY: 38.2,
    regionalX: 37.2,
    regionalY: 50.2,
    depth: '14m',
    pressure: '14.10 dbar (1.39 atm)',
    sst: '28.2 °C',
    sstVal: 28.2,
    salinity: '33.9 PSU',
    salinityVal: 33.9,
    dissolvedOxygen: '5.2 mg/L',
    dissolvedOxygenVal: 5.2,
    chlorophyll: '0.92 mg/m³',
    chlorophyllVal: 0.92,
    waveHeight: '0.86m',
    waveHeightVal: 0.86,
    currentSpeed: '0.65 m/s',
    currentSpeedVal: 0.65,
    windSpeed: '6.3 m/s',
    windDirection: '194° S',
    semanticId: 'res-4'
  },
  {
    id: 'st-yamuna-riverbank',
    title: 'Yamuna Riverfront Floodplain Stabilization & Bio-Bund',
    stationCode: 'Yamuna Bio-Bund',
    category: 'riverbank',
    categoryLabel: 'Riverbank areas',
    categoryIcon: '🏞️',
    whatVigilShows: 'Construction or land-use changes near rivers',
    changeDescription: 'Floodplain bio-embankment construction, drainage diversion channels and retaining wall',
    areaChange: '6.4 km riverbank',
    areaChangeM2: 64000,
    ndbiDelta: '+0.21 NDBI',
    ndviDelta: '-0.11 NDVI',
    confidencePct: 93,
    sensor: 'Sentinel-2 (10m)',
    observationDate: '2025-03-01',
    type: 'satellite-aoi',
    typeLabel: 'Riverbank Bio-Bund',
    color: '#EC4899',
    coordinates: '28.6600° N, 77.2400° E',
    lat: 28.6600,
    lon: 77.2400,
    globalX: 71.4,
    globalY: 34.1,
    regionalX: 48.1,
    regionalY: 28.3,
    depth: '210m MSL',
    pressure: '0.98 atm',
    sst: '24.1 °C',
    sstVal: 24.1,
    salinity: '0.3 PSU',
    salinityVal: 0.3,
    dissolvedOxygen: '5.5 mg/L',
    dissolvedOxygenVal: 5.5,
    chlorophyll: '1.30 mg/m³',
    chlorophyllVal: 1.30,
    waveHeight: '0.25m',
    waveHeightVal: 0.25,
    currentSpeed: '0.85 m/s',
    currentSpeedVal: 0.85,
    windSpeed: '4.6 m/s',
    windDirection: '310° NW'
  }
];

interface SatelliteAltimetryMapViewProps {
  onBackToSemanticSearch: () => void;
  onSelectStationForSearch?: (item: SearchResultItem) => void;
  groundTruthTargets: SearchResultItem[];
}

export const SatelliteAltimetryMapView: React.FC<SatelliteAltimetryMapViewProps> = ({
  onBackToSemanticSearch,
  onSelectStationForSearch,
  groundTruthTargets
}) => {
  // Navigation & Category state
  const [selectedCategory, setSelectedCategory] = useState<VigilFeatureCategory>('all');
  const [viewMode, setViewMode] = useState<'global' | 'regional' | 'tactical'>('regional');
  const [activeStation, setActiveStation] = useState<AltimetryStation>(() => {
    return GLOBAL_STATIONS.find(s => s.id === 'st-hazira') || GLOBAL_STATIONS[0];
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lon: number; x: number; y: number } | null>(null);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter stations based on search query and category
  const filteredStations = GLOBAL_STATIONS.filter(st => {
    // 1. Category Filter
    if (selectedCategory !== 'all' && st.category !== selectedCategory) {
      return false;
    }
    // 2. Text Search Filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return st.title.toLowerCase().includes(q) ||
           st.stationCode.toLowerCase().includes(q) ||
           st.categoryLabel.toLowerCase().includes(q) ||
           st.whatVigilShows.toLowerCase().includes(q) ||
           st.coordinates.toLowerCase().includes(q);
  });

  // Handle Canvas Click to interpolate accurate coordinates
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const normalizedX = (clickX - pan.x) / (rect.width * zoom);
    const normalizedY = (clickY - pan.y) / (rect.height * zoom);

    let lon: number;
    let lat: number;

    if (viewMode === 'regional') {
      // Calibrated to Indian Subcontinent (58°E - 98°E, 38°N - 5°N)
      lon = 58 + (normalizedX * 40);
      lat = 38 - (normalizedY * 33);
    } else if (viewMode === 'tactical') {
      lon = 72.76 + (normalizedX * 0.04);
      lat = 21.48 - (normalizedY * 0.04);
    } else {
      lon = (normalizedX * 360) - 180;
      lat = 90 - (normalizedY * 180);
    }

    const clampedLat = Math.max(-85, Math.min(85, lat));
    const clampedLon = Math.max(-180, Math.min(180, lon));

    const depthEst = Math.round(1500 + Math.abs(clampedLat) * 45 + (clampedLon % 30) * 20);
    const sstEst = +(28 - (Math.abs(clampedLat) * 0.35)).toFixed(1);
    const pressEst = +(depthEst * 1.03).toFixed(2);
    const salEst = +(34 + (Math.abs(clampedLat) % 3) * 0.7).toFixed(1);
    const doEst = +(4.2 + (Math.abs(clampedLat) * 0.04)).toFixed(1);
    const chlaEst = +(0.2 + (Math.abs(clampedLon) % 5) * 0.15).toFixed(2);
    const swhEst = +(1.2 + (Math.abs(clampedLat) * 0.025)).toFixed(2);
    const windEst = +(6.5 + (Math.abs(clampedLat) * 0.1)).toFixed(1);

    const dynamicStation: AltimetryStation = {
      id: `coord-${Date.now()}`,
      title: `Surveillance Coordinate: ${Math.abs(clampedLat).toFixed(2)}° ${clampedLat >= 0 ? 'N' : 'S'}, ${Math.abs(clampedLon).toFixed(2)}° ${clampedLon >= 0 ? 'E' : 'W'}`,
      stationCode: `${Math.abs(clampedLat).toFixed(2)}°N, ${Math.abs(clampedLon).toFixed(2)}°E`,
      category: 'construction',
      categoryLabel: 'Custom AOI Point',
      categoryIcon: '🛰️',
      whatVigilShows: 'User Inspected Satellite Surface Target',
      changeDescription: `Custom inspection coordinate within Indian Subcontinent baseline bounds`,
      areaChange: 'Inspected AOI',
      areaChangeM2: 25000,
      ndbiDelta: '+0.25 NDBI',
      ndviDelta: '-0.15 NDVI',
      confidencePct: 92,
      sensor: 'Sentinel-2 (10m)',
      observationDate: '2025-04-28',
      type: 'satellite-aoi',
      typeLabel: 'User Selected Coordinate',
      color: '#00E5FF',
      coordinates: `${Math.abs(clampedLat).toFixed(4)}° ${clampedLat >= 0 ? 'N' : 'S'}, ${Math.abs(clampedLon).toFixed(4)}° ${clampedLon >= 0 ? 'E' : 'W'}`,
      lat: clampedLat,
      lon: clampedLon,
      globalX: normalizedX * 100,
      globalY: normalizedY * 100,
      regionalX: normalizedX * 100,
      regionalY: normalizedY * 100,
      depth: `${depthEst}m Bathymetry`,
      pressure: `${pressEst} dbar (${(pressEst / 10.1325).toFixed(1)} atm)`,
      sst: `${sstEst} °C`,
      sstVal: sstEst,
      salinity: `${salEst} PSU`,
      salinityVal: salEst,
      dissolvedOxygen: `${doEst} mg/L`,
      dissolvedOxygenVal: doEst,
      chlorophyll: `${chlaEst} mg/m³`,
      chlorophyllVal: chlaEst,
      waveHeight: `${swhEst}m`,
      waveHeightVal: swhEst,
      currentSpeed: '0.35 m/s',
      currentSpeedVal: 0.35,
      windSpeed: `${windEst} m/s`,
      windDirection: '225° SW'
    };

    setClickedCoord({
      lat: clampedLat,
      lon: clampedLon,
      x: normalizedX * 100,
      y: normalizedY * 100
    });
    setActiveStation(dynamicStation);
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Jump to Semantic Search with selected station
  const handleFocusInSemanticSearch = () => {
    if (!onSelectStationForSearch) {
      onBackToSemanticSearch();
      return;
    }

    if (activeStation.semanticId) {
      const match = groundTruthTargets.find(t => t.id === activeStation.semanticId);
      if (match) {
        onSelectStationForSearch(match);
        return;
      }
    }

    // Dynamic SearchResultItem for any clicked point
    let imageCard = '/assets/card_1_construction.jpg';
    if (activeStation.category === 'road') imageCard = '/assets/card_4_bridge.jpg';
    else if (activeStation.category === 'water' || activeStation.category === 'riverbank') imageCard = '/assets/card_2_riverside.jpg';
    else if (activeStation.category === 'industrial') imageCard = '/assets/card_3_port.jpg';
    else if (activeStation.category === 'vegetation' || activeStation.category === 'agriculture') imageCard = '/assets/card_5_land.jpg';

    const dynamicItem: SearchResultItem = {
      id: activeStation.id,
      title: activeStation.title,
      date: activeStation.observationDate,
      sensor: activeStation.sensor,
      coordinates: activeStation.coordinates,
      matchType: `${activeStation.categoryLabel}`,
      confidencePct: activeStation.confidencePct,
      imageUrl: imageCard,
      beforeImgUrl: '/assets/before_scene.jpg',
      afterImgUrl: imageCard,
      areaHa: activeStation.areaChange,
      timeGap: 'Multi-Temporal Pass'
    };

    onSelectStationForSearch(dynamicItem);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#070D16] text-white font-sans select-none overflow-hidden relative">
      {/* 1. TOP HEADER & TELEMETRY TOOLBAR */}
      <header className="bg-[#0B1523]/95 border-b border-[#182A40] px-3 sm:px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-2.5 shrink-0 z-30 backdrop-blur-md">
        {/* Left: Back button & Title */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-between md:justify-start shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={onBackToSemanticSearch}
              className="h-8 px-2.5 rounded-lg bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-[#00E5FF] hover:text-white flex items-center space-x-1.5 text-xs font-semibold transition cursor-pointer shadow"
              title="Return to Semantic Search Workspace"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Search</span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
              <h1 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-none">
                VIGIL Construction & Earth Observation Map
              </h1>
              <span className="hidden lg:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 font-bold">
                LIVE SURVEILLANCE
              </span>
            </div>
          </div>

          <button
            onClick={handleFocusInSemanticSearch}
            className="flex h-8 px-2.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white items-center space-x-1.5 text-xs font-medium transition cursor-pointer shadow shrink-0"
            title="Focus the selected location in Semantic Search"
          >
            <span className="truncate max-w-[130px] sm:max-w-none">Inspect: {activeStation.stationCode}</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>

        {/* Center: Search input */}
        <div className="flex items-center space-x-2 w-full md:w-64 lg:w-72 shrink-0">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter construction, road, river..."
              className="w-full h-8 pl-8 pr-3 bg-[#070D16] border border-[#182A40] rounded-lg text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#00E5FF]"
            />
          </div>
        </div>

        {/* Right: View Projection Mode & Zoom Controls */}
        <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-1 bg-[#070D16] p-0.5 rounded-lg border border-[#182A40]">
            <button
              onClick={() => { setViewMode('regional'); setPan({ x: 0, y: 0 }); setZoom(1.0); }}
              className={`h-7 px-3 rounded text-[11px] font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'regional' ? 'bg-[#0284C7] text-white font-bold shadow' : 'text-[#94A3B8] hover:text-white'
              }`}
              title="India Subcontinent (Primary Focus)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>India (Main Focus)</span>
            </button>
            <button
              onClick={() => { setViewMode('global'); setPan({ x: 0, y: 0 }); setZoom(1.0); }}
              className={`h-7 px-2.5 rounded text-[11px] font-medium transition cursor-pointer ${
                viewMode === 'global' ? 'bg-[#0284C7] text-white shadow' : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Global World Map"
            >
              Global World
            </button>
            <button
              onClick={() => { setViewMode('tactical'); setPan({ x: 0, y: 0 }); setZoom(1.0); }}
              className={`h-7 px-2.5 rounded text-[11px] font-medium transition cursor-pointer ${
                viewMode === 'tactical' ? 'bg-[#0284C7] text-white shadow' : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Tactical Sentinel-2 (10m) AOI"
            >
              Tactical (10m)
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setZoom(z => Math.min(z + 0.25, 3.0))}
              className="w-7 h-7 rounded bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-white flex items-center justify-center transition cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(z - 0.25, 0.75))}
              className="w-7 h-7 rounded bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-white flex items-center justify-center transition cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1.0); }}
              className="w-7 h-7 rounded bg-[#0E1A2B] hover:bg-[#15273F] border border-[#182A40] text-white flex items-center justify-center transition cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. SUB-HEADER: VIGIL FEATURE CATEGORY BUTTONS (Construction, Roads, River, Vegetation, etc.) */}
      <div className="bg-[#070D16]/95 border-b border-[#182A40] px-3 sm:px-4 py-1.5 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0 z-20">
        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider flex items-center space-x-1 mr-1 shrink-0">
          <Filter className="w-3 h-3 text-[#00E5FF]" />
          <span className="hidden sm:inline">Features:</span>
        </span>

        {/* All Features Button */}
        <button
          onClick={() => setSelectedCategory('all')}
          className={`h-7 px-2.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-[#00E5FF] text-[#070D16] font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              : 'bg-[#0E1A2B] text-[#94A3B8] hover:text-white border border-[#182A40]'
          }`}
        >
          <span>All Features</span>
          <span className="text-[10px] font-mono px-1 rounded bg-[#070D16]/30">
            {GLOBAL_STATIONS.length}
          </span>
        </button>

        {/* 8 Requested Category Filter Buttons */}
        {VIGIL_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = GLOBAL_STATIONS.filter(s => s.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`h-7 px-2.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                isSelected
                  ? 'text-white font-bold border shadow-md'
                  : 'bg-[#0E1A2B] text-[#94A3B8] hover:text-white border border-[#182A40]'
              }`}
              style={{
                backgroundColor: isSelected ? cat.color : undefined,
                borderColor: isSelected ? cat.color : undefined,
                color: isSelected ? '#070D16' : undefined
              }}
              title={cat.whatVigilShows}
            >
              <span>{cat.icon}</span>
              <span className="whitespace-nowrap">{cat.name}</span>
              <span
                className="text-[10px] font-mono px-1 rounded"
                style={{ backgroundColor: isSelected ? 'rgba(7, 13, 22, 0.25)' : 'rgba(255, 255, 255, 0.08)' }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN MAP CANVAS (Interactive Satellite Earth Observation Canvas) */}
      <div
        ref={containerRef}
        onClick={handleMapClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 relative overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        style={{ backgroundColor: '#020617' }}
      >
        {/* Transformable Canvas Layer */}
        <div
          className="w-full h-full relative transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Authentic Satellite & Regional Imagery */}
          <div
            className={`w-full h-full bg-center bg-no-repeat transition-all duration-300 ${
              viewMode === 'regional' ? 'bg-cover' : 'bg-contain md:bg-cover'
            }`}
            style={{
              backgroundImage: `url(${
                viewMode === 'global'
                  ? '/assets/global_altimetry_map.jpg'
                  : viewMode === 'regional'
                  ? '/assets/regional_satellite_map.jpg'
                  : '/assets/satellite_map_base.jpg'
              })`
            }}
          />

          {/* SVG Overlay: Regional India Graticules & Geographic Basin Labels */}
          {viewMode === 'regional' && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 800" preserveAspectRatio="none">
              {/* Latitude Graticule Lines */}
              <line x1="0" y1="352" x2="1000" y2="352" stroke="#F59E0B" strokeWidth="0.9" strokeDasharray="5 3" strokeOpacity="0.6" />
              <text x="830" y="347" fill="#F59E0B" fontSize="10" fontFamily="monospace" opacity="0.85">Tropic of Cancer 23.5° N</text>

              <line x1="0" y1="558" x2="1000" y2="558" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="4 4" strokeOpacity="0.4" />
              <text x="880" y="553" fill="#94A3B8" fontSize="9" fontFamily="monospace" opacity="0.6">15.0° N</text>

              <line x1="0" y1="679" x2="1000" y2="679" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="4 4" strokeOpacity="0.4" />
              <text x="880" y="674" fill="#94A3B8" fontSize="9" fontFamily="monospace" opacity="0.6">10.0° N</text>

              {/* Geographic Basin Labels */}
              <text x="140" y="490" fill="#94A3B8" fontSize="13" fontFamily="sans-serif" letterSpacing="4" fontWeight="bold" opacity="0.6">ARABIAN SEA</text>
              <text x="700" y="490" fill="#94A3B8" fontSize="13" fontFamily="sans-serif" letterSpacing="4" fontWeight="bold" opacity="0.6">BAY OF BENGAL</text>
              <text x="400" y="770" fill="#00E5FF" fontSize="12" fontFamily="sans-serif" letterSpacing="4" fontWeight="bold" opacity="0.75">INDIAN OCEAN BASIN</text>
            </svg>
          )}

          {/* Feature Beacon Pins (Construction, Roads, River, Vegetation, Urban, etc.) */}
          {filteredStations
            .filter((st) => (viewMode === 'regional' ? st.regionalX > 0 : true))
            .map((st) => {
              const isSelected = activeStation.id === st.id;
              const posX = viewMode === 'regional' ? st.regionalX : st.globalX;
              const posY = viewMode === 'regional' ? st.regionalY : st.globalY;
              return (
                <div
                  key={st.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveStation(st);
                  }}
                  className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{
                    left: `${posX}%`,
                    top: `${posY}%`,
                  }}
                  title={`${st.title} (${st.categoryLabel})`}
                >
                  {/* Pulsing Beacon Waves */}
                  <div
                    className="absolute inset-0 -m-3 rounded-full opacity-75 animate-ping"
                    style={{ backgroundColor: st.color, animationDuration: isSelected ? '1.5s' : '3.5s' }}
                  />

                  {/* Center Target Dot with Category Icon */}
                  <div
                    className={`relative rounded-full border-2 transition-all flex items-center justify-center shadow-lg ${
                      isSelected
                        ? 'w-6 h-6 scale-125 border-white shadow-[0_0_20px_rgba(0,229,255,0.8)]'
                        : 'w-4 h-4 border-[#070D16] group-hover:scale-110 shadow-md'
                    }`}
                    style={{ backgroundColor: st.color }}
                  >
                    {isSelected ? (
                      <span className="text-[11px] leading-none select-none">{st.categoryIcon}</span>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Feature Tag Card */}
                  <div
                    className={`absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1.5 rounded-lg border text-[11px] font-sans transition-all shadow-2xl backdrop-blur-md ${
                      isSelected
                        ? 'bg-[#070D16]/95 border-[#00E5FF] text-white shadow-[0_0_20px_rgba(0,229,255,0.45)] z-30 scale-105'
                        : 'bg-[#0B1523]/90 border-[#182A40] text-[#94A3B8] group-hover:text-white group-hover:border-[#0284C7]'
                    }`}
                  >
                    {/* Header: Category Badge + Station Code */}
                    <div className="flex items-center space-x-1.5 font-bold">
                      <span className="text-xs">{st.categoryIcon}</span>
                      <span className="text-white">{st.stationCode}</span>
                      <span
                        className="text-[9px] px-1 py-0.2 rounded font-mono font-medium"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: st.color }}
                      >
                        {st.categoryLabel}
                      </span>
                    </div>

                    {/* What VIGIL can show summary */}
                    <div className="text-[10px] text-[#38BDF8] flex items-center space-x-1.5 font-medium mt-0.5">
                      <span>{st.whatVigilShows}</span>
                    </div>

                    {/* Delta & Sensor */}
                    <div className="text-[9px] font-mono text-[#94A3B8] flex items-center space-x-2 mt-0.5">
                      <span className="text-[#10B981] font-bold">{st.areaChange}</span>
                      <span>•</span>
                      <span>{st.sensor}</span>
                      <span>•</span>
                      <span className="text-[#F59E0B]">{st.confidencePct}% match</span>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* User Click Indicator Beacon (if clicked arbitrary spot) */}
          {clickedCoord && (
            <div
              className="absolute z-25 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${clickedCoord.x}%`, top: `${clickedCoord.y}%` }}
            >
              <div className="w-10 h-10 rounded-full border border-[#00E5FF] animate-ping" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#00E5FF] border border-white shadow-[0_0_15px_#00E5FF]" />
            </div>
          )}
        </div>

        {/* 4. VIGIL SATELLITE FEATURE LEGEND (Right side) */}
        <div
          className="hidden lg:block absolute top-4 right-4 z-30 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="bg-[#070D16]/95 border border-[#182A40] rounded-xl p-3 shadow-2xl backdrop-blur-md text-[11px] font-sans space-y-2.5 w-64 max-h-[calc(100vh-220px)] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-[#182A40] pb-1.5 text-[#64748B] font-bold tracking-wider uppercase text-[10px]">
              <span className="flex items-center space-x-1.5 text-white">
                <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>WHAT VIGIL SHOWS</span>
              </span>
              <button
                onClick={() => setShowLegend(!showLegend)}
                className="hover:text-white cursor-pointer px-1 text-xs"
              >
                {showLegend ? '−' : '+'}
              </button>
            </div>

            {showLegend && (
              <div className="space-y-1.5 text-[#94A3B8]">
                {VIGIL_CATEGORIES.map((cat) => {
                  const isFiltered = selectedCategory === cat.id;
                  const count = GLOBAL_STATIONS.filter(s => s.category === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        isFiltered
                          ? 'bg-[#0E355A] border-[#00E5FF]/50 text-white'
                          : 'border-transparent hover:bg-[#0E1A2B] hover:border-[#182A40]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 font-bold text-white text-xs">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </div>
                        <span
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold"
                          style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: cat.color }}
                        >
                          {count}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#64748B] mt-0.5 leading-snug pl-5">
                        {cat.whatVigilShows}
                      </div>
                    </div>
                  );
                })}

                <div className="pt-2 border-t border-[#182A40] text-[10px] text-[#64748B] text-center">
                  Click any category in the legend to filter map points
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. COMPASS & NORTH INDICATOR */}
        <div className="absolute bottom-16 right-4 z-20 flex items-center space-x-2 pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-[#070D16]/95 border border-[#182A40] flex flex-col items-center justify-center text-[10px] font-mono text-white backdrop-blur shadow-xl">
            <span className="text-[#00E5FF] font-bold">N</span>
            <div className="w-0.5 h-3 bg-[#00E5FF]" />
          </div>
        </div>
      </div>

      {/* 6. BOTTOM TELEMETRY GAUGES BAR */}
      <footer className="h-16 bg-[#0B1523]/95 border-t border-[#182A40] px-3 sm:px-4 flex items-center justify-between gap-3 shrink-0 z-30 backdrop-blur-md overflow-x-auto no-scrollbar">
        {/* Selected Point Title & Category */}
        <div className="bg-[#070D16] border border-[#182A40] rounded-lg px-3 py-1.5 min-w-[210px] shrink-0">
          <div className="flex items-center space-x-1.5">
            <span className="text-sm">{activeStation.categoryIcon}</span>
            <span className="text-xs font-bold text-white truncate max-w-[150px]">
              {activeStation.title}
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#00E5FF] truncate mt-0.5">
            {activeStation.coordinates}
          </div>
        </div>

        {/* Telemetry Metric 1: What VIGIL Detects */}
        <div className="bg-[#070D16] border border-[#182A40] rounded-lg px-2.5 py-1.5 min-w-[220px] shrink-0">
          <div className="text-[9px] text-[#64748B] uppercase font-bold truncate">What VIGIL Can Show</div>
          <div className="text-xs font-medium text-white truncate mt-0.5" title={activeStation.whatVigilShows}>
            {activeStation.whatVigilShows}
          </div>
        </div>

        {/* Telemetry Metric 2: Area / Surface Delta */}
        <div className="bg-[#070D16] border border-[#182A40] rounded-lg px-2.5 py-1.5 min-w-[130px] shrink-0">
          <div className="text-[9px] text-[#64748B] uppercase font-bold truncate">Observed Delta</div>
          <div className="text-xs font-mono font-bold text-[#10B981] mt-0.5">
            {activeStation.areaChange}
          </div>
        </div>

        {/* Telemetry Metric 3: NDBI (Built-up Index) */}
        <div className="bg-[#070D16] border border-[#182A40] rounded-lg px-2.5 py-1.5 min-w-[110px] shrink-0">
          <div className="text-[9px] text-[#64748B] uppercase font-bold truncate">NDBI (Built-up)</div>
          <div className="text-xs font-mono font-bold text-[#F59E0B] mt-0.5">
            {activeStation.ndbiDelta}
          </div>
        </div>

        {/* Telemetry Metric 4: NDVI (Vegetation Index) */}
        <div className="bg-[#070D16] border border-[#182A40] rounded-lg px-2.5 py-1.5 min-w-[110px] shrink-0">
          <div className="text-[9px] text-[#64748B] uppercase font-bold truncate">NDVI (Canopy)</div>
          <div className="text-xs font-mono font-bold text-[#38BDF8] mt-0.5">
            {activeStation.ndviDelta}
          </div>
        </div>

        {/* Telemetry Metric 5: Sensor & Confidence */}
        <div className="hidden xl:block bg-[#070D16] border border-[#182A40] rounded-lg px-2.5 py-1.5 min-w-[150px] shrink-0">
          <div className="text-[9px] text-[#64748B] uppercase font-bold truncate">Sensor Constellation</div>
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#A855F7] mt-0.5">
            <span>{activeStation.sensor}</span>
            <span className="text-[#00E5FF] ml-1.5">{activeStation.confidencePct}% match</span>
          </div>
        </div>

        {/* Right Corner: Mini Map Preview Thumbnail */}
        <div className="shrink-0 flex items-center space-x-2 pl-2 border-l border-[#182A40]/80">
          <div
            className="w-20 h-10 rounded border border-[#182A40] overflow-hidden relative shadow bg-cover bg-center cursor-pointer"
            onClick={() => setPan({ x: 0, y: 0 })}
            title="Reset Pan to Center India"
            style={{
              backgroundImage: `url(${viewMode === 'regional' ? '/assets/regional_satellite_map.jpg' : '/assets/global_altimetry_map.jpg'})`
            }}
          >
            <div className="absolute inset-0 bg-[#00E5FF]/10" />
            <div
              className="absolute w-2 h-2 rounded-full bg-[#00E5FF] animate-ping"
              style={{
                left: `${viewMode === 'regional' && activeStation.regionalX > 0 ? activeStation.regionalX : activeStation.globalX}%`,
                top: `${viewMode === 'regional' && activeStation.regionalY > 0 ? activeStation.regionalY : activeStation.globalY}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>
        </div>
      </footer>
    </div>
  );
};
