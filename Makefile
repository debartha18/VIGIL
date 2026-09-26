# KSHITIJ (SIH26227) Air-Gapped Satellite Intelligence Workstation
# Unified Makefile for offline staging and execution

.PHONY: stage run test clean

stage:
	@echo "[KSHITIJ STAGE] Staging local datasets, weights and dependencies..."
	cd frontend && npm install
	python -m pip install -r requirements.txt
	cd backend && python seed_data.py
	@echo "[KSHITIJ STAGE] All local assets, SQLite databases, and FAISS indices staged. Ready for offline air-gapped operation."

run:
	@echo "[KSHITIJ RUN] Launching offline backend and frontend..."
	start cmd /k "cd backend && uvicorn server:app --host 127.0.0.1 --port 8000"
	start cmd /k "cd frontend && npm run dev"
	@echo "[KSHITIJ RUN] Frontend: http://localhost:5173 | Backend: http://localhost:8000"

test:
	@echo "[KSHITIJ TEST] Running audit chain verification and ingestion CLI test..."
	cd backend && python -c "from database import db; res = db.verify_audit_chain(); print(res); assert res['valid']"
	cd backend && python ingest_cli.py --file test_scene.tif
	cd frontend && npm run build
	@echo "[KSHITIJ TEST] All tests passed!"

clean:
	@echo "[KSHITIJ CLEAN] Cleaning temporary artifacts..."
	rmdir /s /q frontend\dist 2>nul || true
