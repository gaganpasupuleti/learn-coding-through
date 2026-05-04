$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$runDir = Join-Path $repoRoot ".run"
$logDir = Join-Path $runDir "logs"
$stateFile = Join-Path $runDir "combined-dev.json"

New-Item -ItemType Directory -Path $runDir -Force | Out-Null
New-Item -ItemType Directory -Path $logDir -Force | Out-Null

function Stop-ListenerOnPort {
    param(
        [int]$Port
    )

    $listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if (-not $listeners) {
        return
    }

    foreach ($listener in $listeners) {
        try {
            $process = Get-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue
            if ($process -and ($process.ProcessName -like "python*" -or $process.ProcessName -like "node*" -or $process.ProcessName -eq "cmd")) {
                Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        } catch {
        }
    }
}

function Start-ServiceProcess {
    param(
        [string]$Name,
        [string]$WorkingDirectory,
        [string]$Command
    )

    $stdoutPath = Join-Path $logDir "$Name.out.log"
    $stderrPath = Join-Path $logDir "$Name.err.log"

    Remove-Item $stdoutPath -Force -ErrorAction SilentlyContinue
    Remove-Item $stderrPath -Force -ErrorAction SilentlyContinue

    $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $Command -WorkingDirectory $WorkingDirectory -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath

    return [pscustomobject]@{
        name = $Name
        pid = $process.Id
        cwd = $WorkingDirectory
        command = $Command
        stdout = $stdoutPath
        stderr = $stderrPath
    }
}

# Free expected ports from stale local dev processes.
Stop-ListenerOnPort -Port 5000
Stop-ListenerOnPort -Port 3000
Stop-ListenerOnPort -Port 8000
Stop-ListenerOnPort -Port 8001

$mainFrontendDir = $repoRoot
$mainBackendDir = Join-Path $repoRoot "backend"
$started = @()
$started += Start-ServiceProcess -Name "main-backend" -WorkingDirectory $mainBackendDir -Command "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
$started += Start-ServiceProcess -Name "main-frontend" -WorkingDirectory $mainFrontendDir -Command "npm run dev"

$state = [pscustomobject]@{
    startedAt = (Get-Date).ToString("o")
    processes = $started
}

$state | ConvertTo-Json -Depth 6 | Set-Content -Path $stateFile -Encoding UTF8

Write-Output "Combined dev stack started."
Write-Output "Main app:    http://localhost:5000"
Write-Output "Main API:    http://127.0.0.1:8000"
Write-Output "Logs dir:    $logDir"
Write-Output "Stop stack:  npm run dev:all:stop"
