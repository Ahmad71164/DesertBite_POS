@echo off
title Desert Bite — POS Terminal
cd /d "%~dp0"

echo  Starting Desert Bite POS Terminal...

:: Check if API is already running
curl -s http://localhost:5000/api/health >nul 2>&1
if errorlevel 1 (
  echo  API not running — starting servers first...
  start "Desert Bite API" /min cmd /c "npm run dev:api"
  echo  Waiting for server...
  :WAIT
  timeout /t 2 /nobreak >nul
  curl -s http://localhost:5000/api/health >nul 2>&1
  if errorlevel 1 goto WAIT
  start "Desert Bite Web" /min cmd /c "npm run dev:web"
  timeout /t 4 /nobreak >nul
) else (
  echo  Server already running.
)

:: Open POS Terminal directly in full-screen browser
echo  Opening POS Terminal in full-screen mode...
start "" "http://localhost:5173/pos"

echo.
echo  POS Terminal is open in your browser.
echo  Press F11 for full-screen kiosk mode.
echo.
timeout /t 5 /nobreak >nul
