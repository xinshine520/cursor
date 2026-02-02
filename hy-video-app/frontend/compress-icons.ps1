# Compress TabBar icons to under 40KB
# Resize and optimize PNG images

Add-Type -AssemblyName System.Drawing

$sourceDir = "C:\Users\Administrator\.cursor\projects\e-DevSample-Cursor\assets"
$targetDir = "e:\DevSample\Cursor\hy-video-app\frontend\src\static"

# Icon files to compress
$icons = @(
    @{Source="home-small.png"; Target="home.png"},
    @{Source="home-active-small.png"; Target="home-active.png"},
    @{Source="folder-small.png"; Target="folder.png"},
    @{Source="folder-active-small.png"; Target="folder-active.png"},
    @{Source="briefcase-small.png"; Target="briefcase.png"},
    @{Source="briefcase-active-small.png"; Target="briefcase-active.png"},
    @{Source="user-small.png"; Target="user.png"},
    @{Source="user-active-small.png"; Target="user-active.png"}
)

Write-Host "Compressing icons to 81x81 pixels..." -ForegroundColor Yellow

foreach ($icon in $icons) {
    $sourcePath = Join-Path $sourceDir $icon.Source
    $targetPath = Join-Path $targetDir $icon.Target
    
    if (Test-Path $sourcePath) {
        try {
            # Load original image
            $originalImage = [System.Drawing.Image]::FromFile($sourcePath)
            
            # Create 81x81 bitmap (WeChat recommended size)
            $newWidth = 81
            $newHeight = 81
            $bitmap = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            
            # High quality resizing
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            
            # Draw resized image
            $graphics.DrawImage($originalImage, 0, 0, $newWidth, $newHeight)
            
            # Save as PNG (PNG doesn't support quality, but smaller size helps)
            $bitmap.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
            
            # Cleanup
            $graphics.Dispose()
            $bitmap.Dispose()
            $originalImage.Dispose()
            
            $sizeKB = [math]::Round((Get-Item $targetPath).Length / 1KB, 2)
            $status = if ($sizeKB -lt 40) { "OK" } else { "WARNING - Still too large" }
            $color = if ($sizeKB -lt 40) { "Green" } else { "Yellow" }
            
            Write-Host "  $($icon.Target) : $sizeKB KB [$status]" -ForegroundColor $color
            
        } catch {
            Write-Host "  Error processing $($icon.Source) : $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  File not found: $sourcePath" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Compression complete!" -ForegroundColor Green
Write-Host ""
Write-Host "If files are still too large, try:" -ForegroundColor Cyan
Write-Host "  1. Use online PNG compressor (tinypng.com)" -ForegroundColor Cyan
Write-Host "  2. Use ImageMagick: magick convert input.png -quality 85 -resize 81x81 output.png" -ForegroundColor Cyan
Write-Host "  3. Use simpler icon designs" -ForegroundColor Cyan
