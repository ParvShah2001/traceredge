@echo off
echo ==========================================================
echo Starting Bharat Screener (Live NSE & BSE Indian Screener)
echo ==========================================================

REM Start FastAPI Backend
start "Bharat Screener Backend" cmd /k "cd /d "%~dp0" && .\venv\Scripts\python.exe -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"

REM Start Vite Frontend
start "Bharat Screener Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Servers starting up!
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
