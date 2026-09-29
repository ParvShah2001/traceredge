@echo off
title TracerEdge - Institutional Indian Stock Screener
echo ===================================================================
echo   TRACEREDGE - Institutional Equity Screener (NSE / BSE India)
echo   Unified Production Server (Port 8000)
echo ===================================================================
echo.

cd /d "%~dp0"

REM Activate virtual environment and launch single unified server
if exist ".\venv\Scripts\python.exe" (
    echo Starting TracerEdge on http://localhost:8000 ...
    .\venv\Scripts\python.exe -m uvicorn main:app --app-dir backend --host 0.0.0.0 --port 8000
) else (
    echo [ERROR] Virtual environment not found at .\venv
    echo Please create virtualenv and install dependencies.
    pause
)
