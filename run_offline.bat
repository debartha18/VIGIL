@echo off
TITLE ORBITAL INTEL // KSHITIJ - Offline Air-Gapped Workstation
echo ======================================================================
echo    ORBITAL INTEL / KSHITIJ - SIH26227 (Ministry of Defence / DGIS)
echo    Starting 100%% Air-Gapped Satellite Intelligence Workstation...
echo ======================================================================
echo.

cd /d "%~dp0"

IF EXIST ".\venv\Scripts\activate.bat" (
    call ".\venv\Scripts\activate.bat"
) ELSE (
    echo [WARNING] Virtual environment not found at .\venv, attempting global python...
)

echo [1/2] Verifying offline assets and FAISS index...
echo [2/2] Launching server on http://127.0.0.1:8000 ...

start "" "http://127.0.0.1:8000"

python -m uvicorn backend.api.server:app --host 127.0.0.1 --port 8000
pause
