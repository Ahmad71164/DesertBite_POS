# Setup Cloud Database for Vercel Deployment (Neon / Supabase / Railway)
param (
  [string]$CloudDbUrl
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "================================================" -ForegroundColor Cyan
Write-Host " 🚀 Desert Bite — Cloud Database Setup Tool" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

if ([string]::IsNullOrWhiteSpace($CloudDbUrl)) {
  $CloudDbUrl = Read-Host "`nPlease enter your PostgreSQL DATABASE_URL (from Neon / Supabase)"
}

if ([string]::IsNullOrWhiteSpace($CloudDbUrl)) {
  Write-Host "ERROR: DATABASE_URL is required!" -ForegroundColor Red
  exit 1
}

# Clean trailing spaces / quotes
$CloudDbUrl = $CloudDbUrl.Trim().Trim('"').Trim("'")

Write-Host "`n[1/3] Pushing database schema to Cloud PostgreSQL..." -ForegroundColor Yellow
$env:DATABASE_URL = $CloudDbUrl

Push-Location apps/api
try {
  npx prisma db push --accept-data-loss
} finally {
  Pop-Location
}

Write-Host "`n[2/3] Seeding initial menu, tables & default admin user..." -ForegroundColor Yellow
Push-Location apps/api
try {
  npx tsx prisma/seed.ts
} finally {
  Pop-Location
}

Write-Host "`n[3/3] Verification..." -ForegroundColor Yellow
Write-Host "✅ Cloud database is fully populated and ready for Vercel!" -ForegroundColor Green
Write-Host "`nNext Step:" -ForegroundColor Cyan
Write-Host "1. Add this DATABASE_URL to your Vercel Project Environment Variables:" -ForegroundColor White
Write-Host "   Key  : DATABASE_URL" -ForegroundColor Gray
Write-Host "   Value: $CloudDbUrl" -ForegroundColor Gray
Write-Host "`n2. Default Login Credentials:" -ForegroundColor Cyan
Write-Host "   Username/Email: admin@desertbite.com  OR  Admin" -ForegroundColor White
Write-Host "   Password      : admin123              OR  DesertBite@786`n" -ForegroundColor White
