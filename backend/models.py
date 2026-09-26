"""
KSHITIJ Data Contracts (Section A.5) - Pydantic definitions strictly matching TypeScript interfaces.
"""
from typing import List, Optional, Dict, Any, Tuple, Literal
from pydantic import BaseModel, Field

Sensor = Literal['SENTINEL-2', 'LANDSAT-8/9', 'OTHER']
ChangeType = Literal['CONSTRUCTION', 'CLEARANCE', 'WATER_EXTENT', 'ROAD_DEVELOPMENT', 'OTHER']
Verdict = Literal['CONFIRMED', 'REJECTED', 'NEEDS_REVIEW', 'PENDING']
RejectReason = Literal['CLOUD', 'SHADOW', 'SEASONAL', 'ILLUMINATION', 'MISREGISTRATION', 'SENSOR_DIFF']


class QualityMask(BaseModel):
    cloud: float = 0.0
    shadow: float = 0.0
    snow: float = 0.0
    valid: float = 1.0


class Scene(BaseModel):
    id: str = Field(alias="id", default="")
    sensor: Sensor
    acquiredAt: str  # ISO 8601
    resolutionM: float
    cloudPct: float
    bbox: Tuple[float, float, float, float]
    crs: str
    format: Literal['COG', 'GEOTIFF']
    sha256: str
    processingStatus: Literal['INGESTED', 'MASKED', 'EMBEDDED', 'INDEXED', 'FAILED']
    ingestedAt: str


class Tile(BaseModel):
    id: str
    sceneId: str
    bbox: Tuple[float, float, float, float]
    acquiredAt: str
    embeddingId: int  # FAISS row id
    qualityMask: QualityMask


class ConfidenceBreakdown(BaseModel):
    semanticRelevance: float      # cosine similarity to query, normalized 0-1
    temporalPersistence: float    # change persists in N later clean observations
    registrationQuality: float    # from phase-correlation residual
    observationCleanliness: float # fraction of clean pixels in used scenes
    changeMagnitude: float        # normalized spectral/embedding delta
    overall: float                # weighted geometric mean, weights in config


class ProcessingStep(BaseModel):
    step: str
    params: Dict[str, Any] = Field(default_factory=dict)
    modelVersion: Optional[str] = None
    at: str
    durationMs: float


class CandidateObservation(BaseModel):
    sceneId: str
    acquiredAt: str
    state: str
    usable: bool
    unusableReason: Optional[str] = None


class GeoJSONPolygon(BaseModel):
    type: Literal['Polygon'] = 'Polygon'
    coordinates: List[List[List[float]]]


class Candidate(BaseModel):
    id: str
    geometry: GeoJSONPolygon
    areaM2: float
    changeType: ChangeType
    classifiedBy: Literal['CLASSICAL', 'DEEP']
    firstEvidenceSceneId: str
    firstEvidenceAt: str
    confirmedAtSceneId: Optional[str] = None
    observations: List[CandidateObservation] = Field(default_factory=list)
    confidence: ConfidenceBreakdown
    verdict: Verdict = 'PENDING'
    queryId: Optional[str] = None
    nearestRiverM: Optional[float] = None
    processingLog: List[ProcessingStep] = Field(default_factory=list)


class RejectedEvidence(BaseModel):
    beforeSceneId: str
    afterSceneId: str
    maskRef: str
    metric: str
    value: float


class RejectedCandidate(BaseModel):
    id: str
    geometry: GeoJSONPolygon
    reason: RejectReason
    evidence: RejectedEvidence


class SpatialRelation(BaseModel):
    relation: Literal['NEAR'] = 'NEAR'
    layer: Literal['RIVERS', 'ROADS']
    maxDistanceM: float


class ParsedQuery(BaseModel):
    raw: str
    concept: str
    dateRange: Optional[Tuple[str, str]] = None
    bbox: Optional[Tuple[float, float, float, float]] = None
    spatialRelations: Optional[List[SpatialRelation]] = None
    sensors: Optional[List[Sensor]] = None
    exemplarTileId: Optional[str] = None


class ReviewDecision(BaseModel):
    id: str
    candidateId: str
    analyst: str
    verdict: Verdict
    comment: str
    evidenceVersion: str
    at: str


class AuditEvent(BaseModel):
    seq: int
    at: str
    type: str
    payload: Any
    prevHash: str
    hash: str


class IngestJob(BaseModel):
    id: str
    file: str
    status: Literal['RUNNING', 'DONE', 'FAILED']
    tilesAdded: int
    indexSizeBefore: int
    indexSizeAfter: int
    durationMs: float
    rebuilt: Literal[False] = False


class QueryLatency(BaseModel):
    p50: float
    p95: float


class RetrievalMetrics(BaseModel):
    recallAt10: float
    precisionAt10: float
    mrr: float


class ChangeMetrics(BaseModel):
    precision: float
    recall: float
    f1: float
    threshold: float


class ModelInfo(BaseModel):
    name: str
    version: str
    origin: str
    licence: str
    sha256: str


class DatasetInfo(BaseModel):
    name: str
    source: str
    licence: str


class EvalReport(BaseModel):
    indexedAreaKm2: float
    scenes: int
    tiles: int
    buildTimeS: float
    storageBytes: int
    queryLatencyMs: QueryLatency
    hardware: str
    retrieval: RetrievalMetrics
    change: ChangeMetrics
    models: List[ModelInfo]
    datasets: List[DatasetInfo]


class SystemHealth(BaseModel):
    status: Literal['HEALTHY', 'DEGRADED', 'DOWN']
    archive: Dict[str, Any]
    analysisEngine: Dict[str, Any]
    index: Dict[str, Any]
    dataStatus: Dict[str, Any]
