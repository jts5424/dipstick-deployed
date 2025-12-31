# Local Testing Script for Unified Frontend
# This script starts all three services for local testing

Write-Host "Starting Dipstick Local Services..." -ForegroundColor Green
Write-Host ""

# Start Prototype Backend (Port 5000)
Write-Host "1. Starting Prototype Backend on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\prototype\backend'; npm start" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Dev Backend (Port 5001) - Skip if canvas fails
Write-Host "2. Starting Dev Backend on port 5001..." -ForegroundColor Yellow
Write-Host "   Note: Dev backend may fail if canvas dependency is not installed" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\dev'; npm start" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Unified Frontend (Port 3000)
Write-Host "3. Starting Unified Frontend on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "All services starting..." -ForegroundColor Green
Write-Host "  - Prototype Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "  - Dev Backend: http://localhost:5001" -ForegroundColor Cyan
Write-Host "  - Unified Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit (services will continue running in their windows)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


