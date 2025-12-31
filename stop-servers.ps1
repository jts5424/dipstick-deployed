# Stop All Node Servers
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "All servers stopped" -ForegroundColor Green

