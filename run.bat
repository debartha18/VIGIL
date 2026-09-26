@echo off
echo ===================================================
echo   KSHITIJ: Air-Gapped Satellite Intelligence (SIH26227)
echo ===================================================
echo Starting backend server on http://127.0.0.1:8000 ...
start "KSHITIJ Backend" cmd /k "cd backend && python -m uvicorn server:app --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

echo Starting frontend workstation on http://localhost:5173 ...
start "KSHITIJ Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Workstation launched!
echo Open your browser at http://localhost:5173
pause
