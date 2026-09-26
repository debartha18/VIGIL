@echo off
echo ===================================================
echo   KSHITIJ: Staging Offline Assets (SIH26227)
echo ===================================================
echo [1/3] Installing Python dependencies...
python -m pip install -r requirements.txt

echo [2/3] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo [3/3] Initializing local SQLite database & FAISS indices...
cd backend
python seed_data.py
cd ..

echo.
echo [COMPLETE] All assets staged. The workstation can now run 100%% offline!
pause
