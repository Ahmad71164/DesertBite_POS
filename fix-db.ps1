# Fix database — MUST run from PROJECT ROOT
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "=== Desert Bite - Database Fix ===" -ForegroundColor Cyan
Write-Host "Folder: $PWD`n" -ForegroundColor Gray

if (-not (Test-Path "apps\api\prisma\schema.prisma")) {
  Write-Host "ERROR: Wrong folder! cd to project root (where package.json is)" -ForegroundColor Red
  exit 1
}

Write-Host "[1/3] Generate Prisma client + create DB..." -ForegroundColor Yellow
Push-Location apps\api
try {
  $env:DATABASE_URL = "file:$((Resolve-Path prisma).Path)\restaurant.db" -replace '\\','/'
  npx prisma generate
  npx prisma db push --accept-data-loss
} finally {
  Pop-Location
}

Write-Host "`n[2/3] Seed menu + users..." -ForegroundColor Yellow
npm run db:seed

Write-Host "`n[3/3] Verify..." -ForegroundColor Yellow
Push-Location apps\api
try {
  if (Test-Path "prisma\restaurant.db") {
    $size = (Get-Item "prisma\restaurant.db").Length
    Write-Host "OK: prisma\restaurant.db exists ($size bytes)" -ForegroundColor Green
  } else {
    Write-Host "WARNING: restaurant.db not found in apps\api\prisma\" -ForegroundColor Red
  }
} finally {
  Pop-Location
}

Write-Host "`n=== DONE ===" -ForegroundColor Green
Write-Host "Terminal 1: npm run dev:api"
Write-Host "Terminal 2: npm run dev:web"
Write-Host "Open: http://localhost:5173"
