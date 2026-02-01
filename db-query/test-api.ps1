# Quick API Test Script

$API_URL = "http://localhost:8000"

Write-Host "=== Testing Backend API ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/health" -Method Get
    Write-Host "   ✓ Health check: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Health check failed: $_" -ForegroundColor Red
    Write-Host "   Make sure backend is running on port 8000" -ForegroundColor Yellow
    exit 1
}

# Test 2: List Connections
Write-Host "2. Testing list connections..." -ForegroundColor Yellow
try {
    $connections = Invoke-RestMethod -Uri "$API_URL/connections" -Method Get
    Write-Host "   ✓ Found $($connections.Count) connections" -ForegroundColor Green
    if ($connections.Count -gt 0) {
        $connections | ForEach-Object {
            Write-Host "     - $($_.name) (ID: $($_.id))" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   ⚠ List connections failed: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== API Tests Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test creating a connection:" -ForegroundColor Yellow
Write-Host '  $body = @{name="Test DB"; connectionUrl="postgresql://user:pass@host:5432/db"} | ConvertTo-Json' -ForegroundColor White
Write-Host '  Invoke-RestMethod -Uri "$API_URL/connections" -Method Post -Body $body -ContentType "application/json"' -ForegroundColor White
