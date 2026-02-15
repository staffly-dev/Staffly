# Fix packages installed in temporary directories due to Windows path length limitations
# This script copies packages from .package-* temp directories to their proper locations

Write-Host "Fixing packages in temporary directories..." -ForegroundColor Yellow

$nodeModulesPath = Join-Path $PSScriptRoot "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "node_modules directory not found. Skipping fix." -ForegroundColor Red
    exit 0
}

$tempDirs = Get-ChildItem $nodeModulesPath -Filter ".*" -Directory | Where-Object { $_.Name -match '^\.\w+-' }
$fixedCount = 0

foreach ($dir in $tempDirs) {
    $packageName = ($dir.Name -replace '^\.(\w+)-.*', '$1')
    $target = Join-Path $nodeModulesPath $packageName
    
    if (-not (Test-Path $target)) {
        try {
            Copy-Item -Path $dir.FullName -Destination $target -Recurse -Force -ErrorAction Stop
            Write-Host "  Fixed: $packageName" -ForegroundColor Green
            $fixedCount++
        } catch {
            Write-Host "  Failed to fix: $packageName - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

if ($fixedCount -gt 0) {
    Write-Host "`nFixed $fixedCount package(s)." -ForegroundColor Green
} else {
    Write-Host "No packages needed fixing." -ForegroundColor Green
}

