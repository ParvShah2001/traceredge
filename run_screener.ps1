# Bharat Screener PowerShell Launcher
Write-Host "Starting Bharat Screener (NSE & BSE)..." -ForegroundColor Cyan

$baseDir = $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir'; .\venv\Scripts\python.exe -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\frontend'; npm run dev"

Write-Host "Services started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend API: http://127.0.0.1:8000" -ForegroundColor Yellow
