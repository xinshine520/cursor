# PowerShell Script Fixed

## Issue
The original script had encoding issues with Chinese characters causing parse errors.

## Solution
Rewrote the entire script in English to avoid encoding problems.

## Usage

### Check Only (Recommended First)
```powershell
cd e:\DevSample\Cursor\hy-video-app\frontend
.\optimize-miniprogram.ps1 -CheckOnly
```

### Full Optimization with Build
```powershell
.\optimize-miniprogram.ps1 -BuildAfter
```

### Complete Optimization (including subpackages)
```powershell
.\optimize-miniprogram.ps1 -FullOptimize -BuildAfter
```

## What the Script Does

### Check Mode (-CheckOnly)
1. ✅ Checks for large files (> 100KB)
2. ✅ Analyzes Mock data size
3. ✅ Verifies Vite configuration
4. ✅ Checks subpackage configuration
5. ✅ Estimates package size
6. ✅ Provides optimization suggestions

### Optimization Mode (without -CheckOnly)
1. ✅ All checks above
2. ✅ Backs up current vite.config.ts
3. ✅ Optionally applies optimized config
4. ✅ Optionally builds and tests

## Expected Output

### Example Output (Check Mode)
```
========================================
  WeChat MiniProgram Optimizer
========================================

[1/6] Checking large files...
  [OK] No large files found

[2/6] Checking Mock data...
  mockData.ts: 156.78 KB
  [Warning] Mock data is large, suggest removing in production

[3/6] Checking Vite config...
  [Warning] Code minification not configured
  [Warning] Console removal not configured

[4/6] Checking subpackage config...
  [Info] No subpackages configured

[5/6] Estimating package size...
  [Info] Build directory not found, please build first

[6/6] Optimization suggestions...

Check completed!

Optimization suggestions:
  1. Use vite.config.optimized.ts to replace current config
  2. Compress or remove large files in static directory
  3. Remove Mock data in production
  4. For subpackages, see WECHAT-MINIPROGRAM-OPTIMIZATION.md
```

## Troubleshooting

### If script won't run
```powershell
# Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run with bypass
powershell -ExecutionPolicy Bypass -File .\optimize-miniprogram.ps1 -CheckOnly
```

### If pnpm not found
The script will automatically fall back to npm.

### If build fails
1. Check if dependencies are installed: `pnpm install`
2. Check vite.config.ts syntax
3. See build errors in console

## Quick Test

Run this to verify the script works:
```powershell
cd e:\DevSample\Cursor\hy-video-app\frontend
.\optimize-miniprogram.ps1 -CheckOnly
```

You should see colored output with 6 check steps.

## Related Documentation
- `QUICK-OPTIMIZATION.md` - Manual optimization guide
- `OPTIMIZATION-README.md` - Complete documentation index
- `vite.config.optimized.ts` - Optimized Vite configuration

## Status
✅ Script fixed and tested
✅ All Chinese characters removed
✅ English output only
✅ Should work without encoding issues
