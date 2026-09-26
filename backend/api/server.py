"""
FastAPI Main Application Server for KSHITIJ / ORBITAL INTEL
Run with:
uvicorn backend.api.server:app --host 127.0.0.1 --port 8000 --reload
"""
import sys
from pathlib import Path

# Add project root to sys.path so backend.* imports work in all contexts
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router

app = FastAPI(
    title="KSHITIJ / ORBITAL INTEL",
    description="Offline Air-Gapped Satellite Semantic Retrieval and Multi-Temporal Change Analysis Workstation",
    version="2.0.0"
)

# Air-gapped localhost CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

app.include_router(router)

# Air-gapped offline static frontend distribution
dist_dir = ROOT_DIR / "frontend" / "dist"
if dist_dir.exists():
    app.mount("/", StaticFiles(directory=str(dist_dir), html=True), name="static_frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api.server:app", host="127.0.0.1", port=8000, reload=True)

