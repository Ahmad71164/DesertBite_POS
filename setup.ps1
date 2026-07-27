# Restaurant Pro - Windows setup (run in PowerShell)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

Write-Host "Stopping Node processes that may lock files..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Removing old node_modules..." -ForegroundColor Yellow
@("node_modules", "apps\web\node_modules", "apps\api\node_modules", "package-lock.json") | ForEach-Object {
  if (Test-Path $_) { Remove-Item -Recurse -Force $_ -ErrorAction SilentlyContinue }
}

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm cache clean --force
npm install

if (-not (Test-Path "apps\api\.env")) {
  Copy-Item "apps\api\.env.example" "apps\api\.env"
  Write-Host "Created apps\api\.env" -ForegroundColor Green
}

Write-Host "Setting up database (from apps/api via npm scripts)..." -ForegroundColor Cyan
npm run setup:db

Write-Host ""
Write-Host "Setup complete. Start the app with:" -ForegroundColor Green
Write-Host "  Terminal 1: npm run dev:api"
Write-Host "  Terminal 2: npm run dev:web"
Write-Host ""
Write-Host "Login: admin@restaurant.local / admin123" -ForegroundColor Cyan
Write-Host "Open: http://localhost:5173" -ForegroundColor Green
