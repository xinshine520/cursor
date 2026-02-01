# Test Application Script for Database Query Tool

Write-Host "=== Database Query Tool - Application Test ===" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
$nodeVersion = node --version 2>&1
$uvVersion = uv --version 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Python: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Python not found" -ForegroundColor Red
    exit 1
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found" -ForegroundColor Red
    exit 1
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ uv: $uvVersion" -ForegroundColor Green
} else {
    Write-Host "⚠ uv not found - install with: pip install uv" -ForegroundColor Yellow
}

Write-Host ""

# Setup backend .env if needed
Write-Host "=== Backend Setup ===" -ForegroundColor Cyan
Set-Location backend

if (-not (Test-Path .env)) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠ Please edit backend/.env and add your OPENAI_API_KEY" -ForegroundColor Yellow
    Write-Host "  (Optional - only needed for Natural Language to SQL feature)" -ForegroundColor Gray
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}

Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
uv sync
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Frontend Setup ===" -ForegroundColor Cyan
Set-Location ../frontend

if (-not (Test-Path node_modules)) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ Frontend dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Starting Application ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Yellow
Write-Host "  Backend will run on: http://localhost:8000" -ForegroundColor Gray
Write-Host "  API docs will be at: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "Starting frontend dev server..." -ForegroundColor Yellow
Write-Host "  Frontend will run on: http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start backend in background
Set-Location ../backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; uv run uvicorn src.main:app --reload --port 8000"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Set-Location ../frontend
Write-Host "Starting frontend..." -ForegroundColor Green
npm run dev
