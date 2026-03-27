$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$stateFile = Join-Path $repoRoot ".run\combined-dev.json"

function Stop-ProcessSafe {
    param(
        [int]$ProcessId
    )

    try {
        Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
    } catch {
    }
}

if (Test-Path $stateFile) {
    $state = Get-Content $stateFile -Raw | ConvertFrom-Json
    foreach ($proc in $state.processes) {
        Stop-ProcessSafe -ProcessId ([int]$proc.pid)
    }
    Remove-Item $stateFile -Force -ErrorAction SilentlyContinue
}

# Cleanup any remaining listeners on our known local dev ports.
$ports = @(5000, 3000, 8000, 8001)
foreach ($port in $ports) {
    $listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($listener in $listeners) {
        Stop-ProcessSafe -ProcessId ([int]$listener.OwningProcess)
    }
}

Write-Output "Combined dev stack stopped."
