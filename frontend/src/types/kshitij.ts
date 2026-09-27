// KSHITIJ Data Contracts (Section A.5) - Single Source of Truth

export type Sensor = 'SENTINEL-2' | 'LANDSAT-8/9' | 'OTHER';
export type ChangeType = 'CONSTRUCTION' | 'CLEARANCE' | 'WATER_EXTENT' | 'ROAD_DEVELOPMENT' | 'OTHER';
export type Verdict = 'CONFIRMED' | 'REJECTED' | 'NEEDS_REVIEW' | 'PENDING';
export type RejectReason = 'CLOUD' | 'SHADOW' | 'SEASONAL' | 'ILLUMINATION' | 'MISREGISTRATION' | 'SENSOR_DIFF';

export interface Scene {
  id: string;
  sensor: Sensor;
  acquiredAt: string; // ISO 8601
  resolutionM: number;
  cloudPct: number;
  bbox: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  crs: string;
  format: 'COG' | 'GEOTIFF';
  sha256: string;
  processingStatus: 'INGESTED' | 'MASKED' | 'EMBEDDED' | 'INDEXED' | 'FAILED';
  ingestedAt: string;
}

export interface Tile {
  id: string;
  sceneId: string;
  bbox: [number, number, number, number];
  acquiredAt: string;
  embeddingId: number; // FAISS row id
  qualityMask: {
    cloud: number;
    shadow: number;
    snow: number;
    valid: number;
  }; // fractions 0-1
}

export interface ConfidenceBreakdown {
  semanticRelevance: number;      // cosine similarity to query, normalized 0-1
  temporalPersistence: number;    // change persists in N later clean observations
  registrationQuality: number;    // from phase-correlation residual
  observationCleanliness: number; // fraction of clean pixels in used scenes
  changeMagnitude: number;        // normalized spectral/embedding delta
  overall: number;                // weighted geometric mean, weights in config
}

export interface ProcessingStep {
  step: string;
  params: Record<string, unknown>;
  modelVersion?: string;
  at: string;
  durationMs: number;
}

export interface Candidate {
  id: string;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  areaM2: number;
  changeType: ChangeType;
  classifiedBy: 'CLASSICAL' | 'DEEP';
  firstEvidenceSceneId: string;
  firstEvidenceAt: string; // earliest supported observation
  confirmedAtSceneId?: string;
  observations: {
    sceneId: string;
    acquiredAt: string;
    state: string;
    usable: boolean;
    unusableReason?: string;
  }[];
  confidence: ConfidenceBreakdown;
  verdict: Verdict;
  queryId?: string;
  nearestRiverM?: number;
  processingLog: ProcessingStep[];
}

export interface RejectedCandidate {
  id: string;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  reason: RejectReason;
  evidence: {
    beforeSceneId: string;
    afterSceneId: string;
    maskRef: string;
    metric: string;
    value: number;
  };
}

export interface ParsedQuery {
  raw: string;
  concept: string; // semantic text sent to encoder
  dateRange?: [string, string];
  bbox?: [number, number, number, number];
  spatialRelations?: {
    relation: 'NEAR';
    layer: 'RIVERS' | 'ROADS';
    maxDistanceM: number;
  }[];
  sensors?: Sensor[];
  exemplarTileId?: string;
}

export interface ReviewDecision {
  id: string;
  candidateId: string;
  analyst: string;
  verdict: Verdict;
  comment: string;
  evidenceVersion: string;
  at: string;
}

export interface AuditEvent {
  seq: number;
  at: string;
  type: string;
  payload: unknown;
  prevHash: string;
  hash: string;
}

export interface IngestJob {
  id: string;
  file: string;
  status: 'RUNNING' | 'DONE' | 'FAILED';
  tilesAdded: number;
  indexSizeBefore: number;
  indexSizeAfter: number;
  durationMs: number;
  rebuilt: false;
}

export interface EvalReport {
  indexedAreaKm2: number;
  scenes: number;
  tiles: number;
  buildTimeS: number;
  storageBytes: number;
  queryLatencyMs: { p50: number; p95: number };
  hardware: string;
  retrieval: { recallAt10: number; precisionAt10: number; mrr: number };
  change: { precision: number; recall: number; f1: number; threshold: number };
  models: { name: string; version: string; origin: string; licence: string; sha256: string }[];
  datasets: { name: string; source: string; licence: string }[];
}

export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  archive: { status: 'ONLINE' | 'OFFLINE'; scenesCount: number; tilesCount: number };
  analysisEngine: { status: 'ONLINE' | 'OFFLINE'; model: string; device: string };
  index: { status: 'ONLINE' | 'OFFLINE'; vectorCount: number; type: string };
  dataStatus: {
    scenes: number;
    dateRange: [string, string];
    indexedPct: number;
    storage: string;
  };
}

// OIT User & Authentication Types
export type OitRole = 'oit_user' | 'oit_admin';

export interface OitUser {
  id: string;
  oit_user_id: string; // e.g. "OIT-IMINT-804"
  name: string;
  email: string;
  role: OitRole;
  organization: string;
  call_sign?: string;
  clearance?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface AuthSession {
  token: string;
  user: OitUser;
  expires_at: number; // millisecond timestamp
  remember_me: boolean;
}

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: OitUser;
  expires_at?: number;
  message?: string;
}

