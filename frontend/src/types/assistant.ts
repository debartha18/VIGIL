export type AssistantLanguage = 'en' | 'hi' | 'bn';

export interface AOIContext {
  id: string;
  name: string;
  locationName: string;
  coordinates: string;
  latitude: number;
  longitude: number;
  boundingBox?: [number, number, number, number];
  region: string;
  distanceFromBorder?: string;
}

export interface ImageryContext {
  sensor: string;
  acquisitionDate: string;
  resolution: string;
  cloudCoverage: string;
  beforeCloudCover?: string;
  imageIds: string[];
  imageSource: string;
  currentImageUrl?: string;
  beforeImageUrl?: string;
}

export interface TemporalComparisonContext {
  baselineDate: string;
  currentDate: string;
  observationPeriod: string;
  timeGap: string;
}

export interface ChangeAnalysisContext {
  changeType: string;
  changedArea: string;
  changePercentage: string;
  confidenceScore: number | string;
  detectedRegions: string[];
  changePolygonsMaskAvailable: boolean;
  detectionExplanation: string;
  falseChangeChecks: string;
  availableMetrics: Record<string, any>;
}

export interface SearchContext {
  originalQuery: string;
  retrievedLocationsCount: number;
  topMatchTitle?: string;
  allResultsSummary?: { id: string; title: string; confidence: number; sensor: string }[];
}

export interface VisualizationStateContext {
  currentViewMode: 'visual' | 'comparison' | 'change-map';
  showChangeMask: boolean;
  showBoundingBox: boolean;
  spectralMode: 'RGB' | 'FALSE_COLOR' | 'NDVI' | 'NDWI';
}

export interface AnalysisContext {
  aoi: AOIContext;
  imagery: ImageryContext;
  temporalComparison: TemporalComparisonContext;
  changeAnalysis: ChangeAnalysisContext;
  searchContext: SearchContext;
  visualizationState: VisualizationStateContext;
}

export interface UIActionTrigger {
  type: 'SET_VIEW_MODE' | 'TOGGLE_MASK' | 'SET_SPECTRAL_MODE' | 'EXECUTE_SEARCH' | 'VIEW_FULL_REPORT' | 'SELECT_TARGET';
  payload?: any;
  description: string;
}

export interface EvidenceItem {
  label: string;
  value: string;
  tag?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isAnalystMode?: boolean;
  language?: AssistantLanguage;
  uiAction?: UIActionTrigger;
  evidence?: EvidenceItem[];
  suggestedFollowUps?: string[];
  isError?: boolean;
}
