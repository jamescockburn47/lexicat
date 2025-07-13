# PowerShell script to launch Home Hub via WSL
Write-Host "🚀 Starting Home Hub via WSL"
wsl -d Ubuntu-22.04 -- bash -lc "cd '/home/jcockburn/Home Hub' && ./start-home-hub.sh"
