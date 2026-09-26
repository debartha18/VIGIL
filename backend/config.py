"""
Central Configuration for KSHITIJ / ORBITAL INTEL
"""
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent
DATA_DIR = ROOT_DIR / "data"
INCOMING_DIR = DATA_DIR / "incoming"
DB_PATH = BACKEND_DIR / "database" / "orbital_intel.db"
INDEX_PATH = BACKEND_DIR / "index" / "faiss_vectors.index"
MODELS_YAML_PATH = ROOT_DIR / "models.yaml"

INCOMING_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)

# Geospatial & Sensor parameters
CRS = "EPSG:32644"  # UTM Zone 44N (Indian Subcontinent & Coast)
DEFAULT_RESOLUTION_M = 10.0
TILE_SIZE_PX = 256
TILE_OVERLAP_RATIO = 0.15
EMBEDDING_DIM = 512

# Confidence Weights (Geometric Mean)
CONFIDENCE_WEIGHTS = {
    "semanticRelevance": 0.25,
    "temporalPersistence": 0.30,
    "registrationQuality": 0.15,
    "observationCleanliness": 0.15,
    "changeMagnitude": 0.15,
}

# Precision over Recall threshold - Abstain if below this score
CONFIDENCE_ABSTAIN_THRESHOLD = 0.65
MAX_REGISTRATION_RESIDUAL_PX = 0.80
MAX_SCL_CLOUD_FRACTION = 0.15
MAX_SCL_SHADOW_FRACTION = 0.12
MIN_PERSISTENCE_CLEAN_SCENES = 2
