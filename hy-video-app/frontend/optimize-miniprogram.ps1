# WeChat MiniProgram Optimization Script
# Auto-execute common optimization tasks

param(
    [switch]$CheckOnly,      # Check only, no optimization
    [switch]$FullOptimize,   # Full optimization (include subpackages)
    [switch]$BuildAfter      # Auto build after optimization
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WeChat MiniProgram Optimizer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$staticDir = Join-Path $projectRoot "src\static"
$apiDir = Join-Path $projectRoot "src\api"

# 1. Check large files
Write-Host "[1/6] Checking large files..." -ForegroundColor Yellow

if (Test-Path $staticDir) {
    $largeFiles = Get-ChildItem -Path $staticDir -Recurse -File | 
        Where-Object { $_.Length -gt 100KB } | 
        Select-Object Name, @{Name="Size";Expression={[math]::Round($_.Length/1KB, 2)}}

    if ($largeFiles) {
        Write-Host "  Found large files (> 100KB):" -ForegroundColor Red
        $largeFiles | ForEach-Object {
            Write-Host "    - $($_.Name): $($_.Size) KB" -ForegroundColor Red
        }
        Write-Host "  Suggestion: Compress or remove these files" -ForegroundColor Yellow
    } else {
        Write-Host "  [OK] No large files found" -ForegroundColor Green
    }
} else {
    Write-Host "  [Warning] static directory not found" -ForegroundColor Yellow
}

# 2. Check Mock data size
Write-Host ""
Write-Host "[2/6] Checking Mock data..." -ForegroundColor Yellow

$mockDataFile = Join-Path $apiDir "mockData.ts"
if (Test-Path $mockDataFile) {
    $mockDataSize = (Get-Item $mockDataFile).Length / 1KB
    Write-Host "  mockData.ts: $([math]::Round($mockDataSize, 2)) KB" -ForegroundColor Cyan
    
    if ($mockDataSize -gt 100) {
        Write-Host "  [Warning] Mock data is large, suggest removing in production" -ForegroundColor Yellow
    } else {
        Write-Host "  [OK] Mock data size is reasonable" -ForegroundColor Green
    }
} else {
    Write-Host "  [Info] mockData.ts not found" -ForegroundColor Gray
}

# 3. Check vite.config.ts
Write-Host ""
Write-Host "[3/6] Checking Vite config..." -ForegroundColor Yellow

$viteConfig = Join-Path $projectRoot "vite.config.ts"
if (Test-Path $viteConfig) {
    $viteContent = Get-Content $viteConfig -Raw

    if ($viteContent -match "minify.*terser") {
        Write-Host "  [OK] Code minification configured" -ForegroundColor Green
    } else {
        Write-Host "  [Warning] Code minification not configured" -ForegroundColor Yellow
    }

    if ($viteContent -match "drop_console") {
        Write-Host "  [OK] Console removal configured" -ForegroundColor Green
    } else {
        Write-Host "  [Warning] Console removal not configured" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [Error] vite.config.ts not found" -ForegroundColor Red
}

# 4. Check subpackage configuration
Write-Host ""
Write-Host "[4/6] Checking subpackage config..." -ForegroundColor Yellow

$pagesJson = Join-Path $projectRoot "src\pages.json"
if (Test-Path $pagesJson) {
    $pagesContent = Get-Content $pagesJson -Raw

    if ($pagesContent -match "subPackages") {
        Write-Host "  [OK] Subpackages configured" -ForegroundColor Green
    } else {
        Write-Host "  [Info] No subpackages configured" -ForegroundColor Yellow
        if ($FullOptimize) {
            Write-Host "  Tip: Use -FullOptimize requires manual subpackage configuration" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "  [Error] pages.json not found" -ForegroundColor Red
}

# 5. Estimate package size
Write-Host ""
Write-Host "[5/6] Estimating package size..." -ForegroundColor Yellow

$distDir = Join-Path $projectRoot "dist\build\mp-weixin"
if (Test-Path $distDir) {
    $totalSize = (Get-ChildItem -Path $distDir -Recurse -File | 
        Measure-Object -Property Length -Sum).Sum / 1MB
    
    Write-Host "  Current build size: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Cyan
    
    if ($totalSize -gt 2) {
        Write-Host "  [Error] Exceeds 2MB limit!" -ForegroundColor Red
    } elseif ($totalSize -gt 1.5) {
        Write-Host "  [Warning] Approaching 2MB limit" -ForegroundColor Yellow
    } else {
        Write-Host "  [OK] Size is reasonable" -ForegroundColor Green
    }
} else {
    Write-Host "  [Info] Build directory not found, please build first" -ForegroundColor Gray
}

# 6. Generate optimization suggestions
Write-Host ""
Write-Host "[6/6] Optimization suggestions..." -ForegroundColor Yellow
Write-Host ""

if ($CheckOnly) {
    Write-Host "Check completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Optimization suggestions:"
    Write-Host "  1. Use vite.config.optimized.ts to replace current config"
    Write-Host "  2. Compress or remove large files in static directory"
    Write-Host "  3. Remove Mock data in production"
    Write-Host "  4. For subpackages, see WECHAT-MINIPROGRAM-OPTIMIZATION.md"
    Write-Host ""
    exit 0
}

# Execute optimization (if not check-only mode)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting optimization..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Optimization 1: Backup current config
Write-Host "Backing up current vite.config.ts..." -ForegroundColor Yellow
$viteConfigBackup = Join-Path $projectRoot "vite.config.ts.backup"
if (Test-Path $viteConfig) {
    if (-not (Test-Path $viteConfigBackup)) {
        Copy-Item $viteConfig $viteConfigBackup
        Write-Host "  [OK] Backed up to vite.config.ts.backup" -ForegroundColor Green
    } else {
        Write-Host "  [Info] Backup already exists" -ForegroundColor Gray
    }
}

# Optimization 2: Ask to use optimized config
Write-Host ""
$response = Read-Host "Use optimized vite.config.ts? (y/n)"
if ($response -eq 'y') {
    $optimizedConfig = Join-Path $projectRoot "vite.config.optimized.ts"
    if (Test-Path $optimizedConfig) {
        Copy-Item $optimizedConfig $viteConfig -Force
        Write-Host "  [OK] vite.config.ts updated" -ForegroundColor Green
    } else {
        Write-Host "  [Warning] vite.config.optimized.ts not found" -ForegroundColor Yellow
    }
}

# Optimization 3: Build test
if ($BuildAfter) {
    Write-Host ""
    Write-Host "Starting build test..." -ForegroundColor Yellow
    
    $npmCmd = Get-Command pnpm -ErrorAction SilentlyContinue
    if ($npmCmd) {
        & pnpm run build:mp-weixin
    } else {
        & npm run build:mp-weixin
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Build successful" -ForegroundColor Green
        
        # Show build size
        if (Test-Path $distDir) {
            $finalSize = (Get-ChildItem -Path $distDir -Recurse -File | 
                Measure-Object -Property Length -Sum).Sum / 1MB
            
            Write-Host ""
            Write-Host "Final package size: $([math]::Round($finalSize, 2)) MB" -ForegroundColor Cyan
            
            if ($finalSize -le 2) {
                Write-Host "[Success] Package size meets requirements" -ForegroundColor Green
            } else {
                Write-Host "[Error] Package size still exceeds 2MB, need further optimization" -ForegroundColor Red
                Write-Host "Suggestions:" -ForegroundColor Yellow
                Write-Host "  1. Configure subpackages" -ForegroundColor Yellow
                Write-Host "  2. Remove more resources" -ForegroundColor Yellow
                Write-Host "  3. Use CDN for external links" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "  [Error] Build failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Optimization completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Open project in WeChat DevTools"
Write-Host "  2. Check 'Code Package Size' panel"
Write-Host "  3. Test all features"
Write-Host ""
Write-Host "Documentation:"
Write-Host "  - QUICK-OPTIMIZATION.md (Quick guide)"
Write-Host "  - WECHAT-MINIPROGRAM-OPTIMIZATION.md (Complete guide)"
Write-Host ""
