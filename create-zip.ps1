# Creates restaurant-pro-erp-pos-complete.zip with all source code
# Run: powershell -ExecutionPolicy Bypass -File .\fix-db.ps1  (database fix first)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$zipPath = Join-Path $root "restaurant-pro-erp-pos-complete.zip"
$staging = Join-Path $env:TEMP "restaurant-pro-export-$(Get-Random)"

Write-Host "Exporting project from: $root"

if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
New-Item -ItemType Directory -Path $staging | Out-Null

$excludeDirs = @("node_modules", ".git", "dist", ".cursor", "mcps", "agent-transcripts", "terminals")
$excludeFiles = @("*.sqlite", "*.sqlite-journal", "restaurant-pro-erp-pos-complete.zip")

robocopy $root $staging /E /XD $excludeDirs /XF $excludeFiles /NFL /NDL /NJH /NJS | Out-Null

Compress-Archive -Path "$staging\*" -DestinationPath $zipPath -CompressionLevel Optimal -Force
Remove-Item $staging -Recurse -Force

$info = Get-Item $zipPath
Write-Host ""
Write-Host "ZIP CREATED SUCCESSFULLY" -ForegroundColor Green
Write-Host "Location: $($info.FullName)" -ForegroundColor Cyan
Write-Host "Size: $([math]::Round($info.Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "Included: all source code, configs, scripts, README"
Write-Host "Excluded: node_modules (run npm install after extract), .git, build cache"
