# FORCE STOP everything on ports 3000 and 5001
Write-Host "Forcefully stopping everything on ports 3000 and 5001..." -ForegroundColor Red
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { 
    Write-Host "Killing process $($_.OwningProcess) on port 3000" -ForegroundColor Yellow
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
}
Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue | ForEach-Object { 
    Write-Host "Killing process $($_.OwningProcess) on port 5001" -ForegroundColor Yellow
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
}
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "Ports cleared!" -ForegroundColor Green

# Start Backend (ALWAYS port 5001)
Write-Host "Starting Backend on port 5001..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\prototype\backend'; Write-Host '=== BACKEND SERVER (Port 5001) ===' -ForegroundColor Green; Write-Host 'Starting...' -ForegroundColor Yellow; npm start" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend (ALWAYS port 3000)
Write-Host "Starting Frontend on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '=== FRONTEND SERVER (Port 3000) ===' -ForegroundColor Cyan; Write-Host 'Proxy: localhost:5001' -ForegroundColor Yellow; Write-Host 'Starting...' -ForegroundColor Yellow; npm run dev" -WindowStyle Normal

Write-Host "`n✅ Both servers starting in separate windows" -ForegroundColor Green
Write-Host "Backend: http://localhost:5001 (FIXED)" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000 (FIXED)" -ForegroundColor Yellow
Write-Host "`nWait 5-10 seconds for both to start, then open http://localhost:3000" -ForegroundColor Gray

