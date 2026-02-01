# Test Setup Script for Database Query Tool

Write-Host "=== Database Query Tool - Test Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Python not found. Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check uv
Write-Host "Checking uv..." -ForegroundColor Yellow
$uvVersion = uv --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ uv found: $uvVersion" -ForegroundColor Green
} else {
    Write-Host "✗ uv not found. Installing..." -ForegroundColor Yellow
    Write-Host "  Run: pip install uv" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Backend Setup ===" -ForegroundColor Cyan
Set-Location backend

if (Test-Path ".env") {
    Write-Host "✓ .env file exists" -ForegroundColor Green
} else {
    Write-Host "⚠ .env file not found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env -ErrorAction SilentlyContinue
    Write-Host "  Please edit .env and add your OPENAI_API_KEY" -ForegroundColor Yellow
}

Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
uv sync
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Frontend Setup ===" -ForegroundColor Cyan
Set-Location ../frontend

if (Test-Path "node_modules") {
    Write-Host "✓ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host "  1. Terminal 1: cd backend && uv run uvicorn src.main:app --reload --port 8000" -ForegroundColor White
Write-Host "  2. Terminal 2: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open: http://localhost:5173" -ForegroundColor Green

Set-Location ..
