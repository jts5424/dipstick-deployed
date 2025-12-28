# Restart Frontend and Backend Services

Write-Host "Stopping existing services..." -ForegroundColor Yellow

# Stop any existing node processes on ports 3000, 5000, 5001
Get-NetTCPConnection -LocalPort 3000,5000,5001 -ErrorAction SilentlyContinue | 
  ForEach-Object { 
    $processId = $_.OwningProcess
    if ($processId) {
      Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
      Write-Host "Stopped process on port $($_.LocalPort)" -ForegroundColor Gray
    }
  }

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Green

# Start Prototype Backend
Write-Host "1. Starting Prototype Backend (port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\prototype\backend'; npm start" -WindowStyle Minimized

Start-Sleep -Seconds 3

# Start Unified Frontend
Write-Host "2. Starting Unified Frontend (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Services starting..." -ForegroundColor Green
Write-Host "  - Prototype Backend: http://localhost:5000" -ForegroundColor Yellow
Write-Host "  - Unified Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Check the PowerShell windows for any errors." -ForegroundColor Gray

