"""
Incoming Directory Watcher & Pipeline Status Tracker
Monitors data/incoming/ for newly deposited GeoTIFFs, reports ingestion queue state.
"""
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime
from backend.config import INCOMING_DIR, DATA_DIR
from backend.database.db import db_manager


class IngestWatcher:
    def __init__(self, incoming_dir: Path = INCOMING_DIR):
        self.incoming_dir = incoming_dir
        self.incoming_dir.mkdir(parents=True, exist_ok=True)
        self.db = db_manager

    def scan_incoming(self) -> List[Dict[str, Any]]:
        """
        Scans data/incoming/ for files awaiting ingestion.
        """
        files = []
        for file_path in self.incoming_dir.glob("*.*"):
            if file_path.suffix.lower() in [".tif", ".tiff", ".h5", ".nc", ".tar", ".zip"]:
                stat = file_path.stat()
                files.append({
                    "filename": file_path.name,
                    "path": str(file_path),
                    "size_mb": round(stat.st_size / (1024 * 1024), 2),
                    "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "status": "QUEUED_FOR_INGESTION"
                })
        return files

    def get_ingest_status(self) -> Dict[str, Any]:
        """
        Returns full overview of archive, incoming queue, and processing status.
        """
        incoming_files = self.scan_incoming()

        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT count(*) FROM scenes")
            total_scenes = cursor.fetchone()[0]

            cursor.execute("SELECT count(*) FROM tiles")
            total_tiles = cursor.fetchone()[0]

            cursor.execute("SELECT sensor, count(*) as count FROM scenes GROUP BY sensor")
            sensor_counts = {row["sensor"]: row["count"] for row in cursor.fetchall()}

            cursor.execute("SELECT processing_status, count(*) as count FROM scenes GROUP BY processing_status")
            status_counts = {row["processing_status"]: row["count"] for row in cursor.fetchall()}

        return {
            "incoming_queue": incoming_files,
            "incoming_count": len(incoming_files),
            "archive_scenes": total_scenes,
            "archive_tiles": total_tiles,
            "sensor_distribution": sensor_counts,
            "pipeline_status_counts": status_counts,
            "incoming_directory": str(self.incoming_dir),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }


ingest_watcher = IngestWatcher()
