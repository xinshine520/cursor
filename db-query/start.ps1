# Start Script for Database Query Tool
# This script starts both backend and frontend servers

Write-Host "=== Starting Database Query Tool ===" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Check if .env exists
if (-not (Test-Path "backend/.env")) {
    Write-Host "⚠ Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item "backend/.env.example" "backend/.env"
    Write-Host "⚠ Please edit backend/.env and add OPENAI_API_KEY (optional)" -ForegroundColor Yellow
    Write-Host ""
}

# Start backend in new window
Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Backend Server Starting...' -ForegroundColor Cyan; uv run uvicorn src.main:app --reload --port 8000"

# Wait for backend to initialize
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend
Write-Host "Starting frontend server..." -ForegroundColor Green
Write-Host ""
Write-Host "=== Application URLs ===" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Green
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the frontend server" -ForegroundColor Yellow
Write-Host "Close the backend PowerShell window to stop the backend server" -ForegroundColor Yellow
Write-Host ""

Set-Location frontend
npm run dev
