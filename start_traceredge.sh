#!/bin/bash
# ==============================================================================
# TracerEdge Production Unified Server Launcher (Linux / macOS / Cloud VPS)
# ==============================================================================
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "==================================================================="
echo "  TRACEREDGE - Institutional Equity Screener (NSE / BSE India)"
echo "  Unified Production Server running on port 8000"
echo "==================================================================="

# Use venv python if available, else system python3
if [ -f "./venv/bin/python" ]; then
    PYTHON_CMD="./venv/bin/python"
elif [ -f "./venv/Scripts/python.exe" ]; then
    PYTHON_CMD="./venv/Scripts/python.exe"
else
    PYTHON_CMD="python3"
fi

echo "Starting TracerEdge on http://0.0.0.0:8000 ..."
exec $PYTHON_CMD -m uvicorn main:app --app-dir backend --host 0.0.0.0 --port 8000
