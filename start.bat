@echo off
title Desert Bite POS — Starting...
cd /d "%~dp0"
color 0A

echo.
echo  ██████╗ ███████╗███████╗███████╗██████╗ ████████╗    ██████╗ ██╗████████╗███████╗
echo  ██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗╚══██╔══╝    ██╔══██╗██║╚══██╔══╝██╔════╝
echo  ██║  ██║█████╗  ███████╗█████╗  ██████╔╝   ██║       ██████╔╝██║   ██║   █████╗
echo  ██║  ██║██╔══╝  ╚════██║██╔══╝  ██╔══██╗   ██║       ██╔══██╗██║   ██║   ██╔══╝
echo  ██████╔╝███████╗███████║███████╗██║  ██║   ██║       ██████╔╝██║   ██║   ███████╗
echo  ╚═════╝ ╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝       ╚═════╝ ╚═╝   ╚═╝   ╚══════╝
echo.
echo  Desert Bite POS  ^|  Pizza Kitchen ERP
echo  ============================================
echo.

:: ── Check if node_modules exist ──────────────────────────────
if not exist "node_modules\" (
  echo  [1/3] Installing dependencies (first run only)...
  call npm install --silent
  echo  [1/3] Done.
) else (
  echo  [1/3] Dependencies OK.
)

:: ── Start API Server in background ───────────────────────────
echo  [2/3] Starting API server on port 5000...
start "Desert Bite API" /min cmd /c "npm run dev:api"

:: ── Wait for API to be ready ─────────────────────────────────
echo  [3/3] Waiting for server to be ready...
:WAIT_LOOP
timeout /t 2 /nobreak >nul
curl -s http://localhost:5000/api/health >nul 2>&1
if errorlevel 1 goto WAIT_LOOP

:: ── Start Web Frontend ────────────────────────────────────────
echo.
echo  Server is ONLINE. Starting web interface...
start "Desert Bite Web" /min cmd /c "npm run dev:web"
timeout /t 4 /nobreak >nul

:: ── Open Browser ─────────────────────────────────────────────
echo  Opening browser at http://localhost:5173
start "" "http://localhost:5173"

echo.
echo  ============================================
echo   Desert Bite POS is RUNNING
echo   Browser: http://localhost:5173
echo   API:     http://localhost:5000
echo  ============================================
echo.
echo  This window can be minimized. DO NOT close it.
echo  To stop: Close both "Desert Bite API" and "Desert Bite Web" windows.
echo.
pause
