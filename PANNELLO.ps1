param([string]$Azione = "MENU")

# ============================================================
# PANNELLO BianchiPro Restyling
# Pannello unico per avvio locale, condivisione online, chiusura
# Compatibile con Windows PowerShell 5.1 (niente ??, niente &&)
# Nessun uso di $pid (variabile riservata PowerShell)
# Tutto self-contained: nessun file esterno richiesto
# ============================================================

$ErrorActionPreference = "Stop"
$root      = Split-Path -Parent $MyInvocation.MyCommand.Path
$stateFile = Join-Path $root "_STATE.json"
$logDir    = Join-Path $root "_LOG"
$urlFile   = Join-Path $root "URL_ONLINE.txt"

if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

# --- Utilita' ---

function T([string]$msg, [string]$color = "Cyan") {
    $ts = (Get-Date).ToString("HH:mm:ss")
    Write-Host "[$ts] $msg" -ForegroundColor $color
}

function Save-State($obj) {
    $json = $obj | ConvertTo-Json -Depth 10
    $enc  = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($stateFile, $json, $enc)
}

function Load-State {
    if (Test-Path $stateFile) {
        try { return (Get-Content $stateFile -Raw | ConvertFrom-Json) } catch { return $null }
    }
    return $null
}

function Kill-PidTree([int]$procId) {
    if ($procId -le 4) { return }
    try {
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        if (-not $proc) { return }
    } catch { return }
    cmd /c "taskkill /PID $procId /T /F >nul 2>&1" | Out-Null
}

function Get-PidsByPort([int]$port) {
    $result = @{}
    try {
        $lines = netstat -ano | Select-String (":$port\s")
        foreach ($l in $lines) {
            $s = ($l.Line -replace "\s+", " ").Trim()
            if ($s -match "\sLISTENING\s(\d+)$") {
                $id = [int]$matches[1]
                if ($id -gt 4) { $result["$id"] = $true }
            }
        }
    } catch {}
    return @($result.Keys | ForEach-Object { [int]$_ })
}

function Kill-ByPort([int]$port) {
    $ids = Get-PidsByPort $port
    foreach ($id in $ids) { Kill-PidTree $id }
}

function Wait-Http([string]$url, [int]$timeoutSec = 180) {
    $start = Get-Date
    while ((Get-Date) - $start -lt [TimeSpan]::FromSeconds($timeoutSec)) {
        try {
            Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 -Uri $url | Out-Null
            return $true
        } catch {
            try {
                if ($_.Exception.Response) { return $true }
            } catch {}
        }
        Start-Sleep -Milliseconds 500
    }
    return $false
}

function Remove-BomIfPresent([string]$path) {
    if (-not (Test-Path $path)) { return $false }
    $bytes = [System.IO.File]::ReadAllBytes($path)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        $newBytes = $bytes[3..($bytes.Length - 1)]
        [System.IO.File]::WriteAllBytes($path, $newBytes)
        return $true
    }
    return $false
}

function Fix-PostCss {
    $candidates = @(
        (Join-Path $root "postcss.config.json"),
        (Join-Path $root ".postcssrc"),
        (Join-Path $root ".postcssrc.json"),
        (Join-Path $root ".postcssrc.jsonc"),
        (Join-Path $root "postcss.config.cjs"),
        (Join-Path $root "vite.config.ts")
    )
    $fixedAny = $false
    foreach ($p in $candidates) {
        if (Test-Path $p) {
            if (Remove-BomIfPresent $p) {
                $fixedAny = $true
                T "Riparato BOM: $([System.IO.Path]::GetFileName($p))" "Green"
            }
        }
    }
    return $fixedAny
}

# --- Azioni principali ---

function Stop-All {
    T "Chiusura totale (BianchiPro)..." "Yellow"

    $st = Load-State
    if ($st) {
        if ($st.vite -and [int]$st.vite -gt 4) { Kill-PidTree ([int]$st.vite) }
        if ($st.cloudflared -and [int]$st.cloudflared -gt 4) { Kill-PidTree ([int]$st.cloudflared) }
    }

    # Fallback: chiudi qualunque cosa sulla porta 3000
    Kill-ByPort 3000

    Remove-Item $stateFile -Force -ErrorAction SilentlyContinue | Out-Null
    Remove-Item $urlFile -Force -ErrorAction SilentlyContinue | Out-Null
    T "Tutto chiuso." "Green"
}

function Ensure-NpmInstall {
    if (-not (Test-Path (Join-Path $root "package.json"))) {
        throw "In $root non trovo package.json: non sembra un progetto Node/Vite."
    }
    if (-not (Test-Path (Join-Path $root "node_modules"))) {
        T "Manca node_modules: installo dipendenze (npm install)..." "Yellow"
        $outLog = Join-Path $logDir "npm_install_out.log"
        $errLog = Join-Path $logDir "npm_install_err.log"
        Remove-Item $outLog, $errLog -Force -ErrorAction SilentlyContinue | Out-Null

        $npmProc = Start-Process -FilePath "cmd.exe" -WorkingDirectory $root -PassThru -WindowStyle Hidden `
            -ArgumentList "/c", "npm install" -RedirectStandardOutput $outLog -RedirectStandardError $errLog

        $npmProc.WaitForExit()
        if ($npmProc.ExitCode -ne 0) {
            T "ERRORE npm install. Log: $errLog" "Red"
            throw "npm install fallito"
        }
        T "npm install completato." "Green"
    }
}

function Start-Local {
    param([switch]$NoOpenBrowser)

    Stop-All

    T "Controllo PostCSS/BOM..." "DarkCyan"
    Fix-PostCss | Out-Null

    Ensure-NpmInstall

    $port = 3000
    $base = "http://127.0.0.1:$port"

    $outLog = Join-Path $logDir "vite_out.log"
    $errLog = Join-Path $logDir "vite_err.log"
    Remove-Item $outLog, $errLog -Force -ErrorAction SilentlyContinue | Out-Null

    T "Avvio Vite su $base ..." "Cyan"
    $viteProc = Start-Process -FilePath "cmd.exe" -WorkingDirectory $root -PassThru -WindowStyle Hidden `
        -ArgumentList "/c", "npx vite --host 127.0.0.1 --port $port" `
        -RedirectStandardOutput $outLog -RedirectStandardError $errLog

    Save-State @{ vite = $viteProc.Id; cloudflared = 0; port = $port }

    T "Attendo che il server sia pronto..." "DarkCyan"
    if (-not (Wait-Http $base 180)) {
        T "ERRORE: il server non risponde su $base" "Red"
        T "Controlla i log con il menu -> 6" "Yellow"
        return
    }

    T "PRONTO (locale): $base" "Green"
    if (-not $NoOpenBrowser) {
        Start-Process $base | Out-Null
    }
}

function Get-CloudflaredPath {
    $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    # Percorsi tipici su Windows
    $p1 = Join-Path $env:ProgramFiles "Cloudflare\Cloudflared\cloudflared.exe"
    if (Test-Path $p1) { return $p1 }

    $p2 = ""
    try { $p2 = Join-Path ${env:ProgramFiles(x86)} "Cloudflare\Cloudflared\cloudflared.exe" } catch {}
    if ($p2 -and (Test-Path $p2)) { return $p2 }

    throw "cloudflared non trovato. Installare Cloudflare Tunnel."
}

function Share-Online {
    Start-Local -NoOpenBrowser

    $st = Load-State
    $port = 3000
    if ($st -and $st.port) { $port = [int]$st.port }
    $base = "http://127.0.0.1:$port"

    $cf = Get-CloudflaredPath

    $outLog = Join-Path $logDir "cloudflared_out.log"
    $errLog = Join-Path $logDir "cloudflared_err.log"
    Remove-Item $outLog, $errLog -Force -ErrorAction SilentlyContinue | Out-Null

    # Se esiste config cloudflared che blocca i quick tunnel, spostarla temporaneamente
    $cfDir = Join-Path $env:USERPROFILE ".cloudflared"
    $bakFiles = @()
    try {
        foreach ($name in @("config.yml", "config.yaml")) {
            $cfgPath = Join-Path $cfDir $name
            if (Test-Path $cfgPath) {
                $bakPath = "$cfgPath.bak_" + (Get-Date).ToString("yyyyMMdd_HHmmss")
                Move-Item $cfgPath $bakPath -Force
                $bakFiles += ,@($cfgPath, $bakPath)
            }
        }

        T "Avvio tunnel Cloudflare verso $base ..." "Cyan"
        $tunProc = Start-Process -FilePath $cf -WorkingDirectory $root -PassThru -WindowStyle Hidden `
            -ArgumentList "tunnel", "--url", $base `
            -RedirectStandardOutput $outLog -RedirectStandardError $errLog

        # Aggiorna stato con PID tunnel
        $vitePidVal = 0
        if ($st -and $st.vite) { $vitePidVal = [int]$st.vite }
        Save-State @{ vite = $vitePidVal; cloudflared = $tunProc.Id; port = $port }

        # Cerca URL pubblico nei log
        $pattern = 'https://[^\s"]+\.trycloudflare\.com'
        $publicUrl = $null
        $start = Get-Date
        while (-not $publicUrl -and ((Get-Date) - $start).TotalSeconds -lt 120) {
            $txt = ""
            if (Test-Path $outLog) { $txt += (Get-Content $outLog -Raw -ErrorAction SilentlyContinue) }
            if (Test-Path $errLog) { $txt += "`n" + (Get-Content $errLog -Raw -ErrorAction SilentlyContinue) }
            if ($txt -match $pattern) { $publicUrl = $matches[0] }
            Start-Sleep -Milliseconds 500
        }

        if (-not $publicUrl) {
            T "ERRORE: link pubblico non trovato entro 2 minuti. Vedi log cloudflared." "Red"
            return
        }

        # Salva URL
        $enc = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($urlFile, $publicUrl, $enc)

        T "PRONTO (online): $publicUrl" "Green"
        T "Link salvato in: URL_ONLINE.txt" "DarkGreen"

        # Aspetta che il tunnel risponda, poi apri browser
        [void](Wait-Http $publicUrl 120)
        Start-Process $publicUrl | Out-Null

    } finally {
        # Ripristina config cloudflared se spostata
        foreach ($pair in $bakFiles) {
            $origPath = $pair[0]
            $bakPath = $pair[1]
            if (Test-Path $bakPath) { Move-Item $bakPath $origPath -Force }
        }
    }
}

function Open-Local {
    $port = 3000
    $st = Load-State
    if ($st -and $st.port) { $port = [int]$st.port }
    Start-Process "http://127.0.0.1:$port" | Out-Null
}

function Open-Online {
    if (Test-Path $urlFile) {
        $u = (Get-Content $urlFile -Raw).Trim()
        if ($u) { Start-Process $u | Out-Null; return }
    }
    T "Non trovo URL_ONLINE.txt (prima avvia 'Condividi online')." "Yellow"
}

function Show-Log {
    Write-Host ""
    Write-Host "  1 = Vite (stdout)" -ForegroundColor Yellow
    Write-Host "  2 = Vite (stderr)" -ForegroundColor Yellow
    Write-Host "  3 = Cloudflared (stdout)" -ForegroundColor Yellow
    Write-Host "  4 = Cloudflared (stderr)" -ForegroundColor Yellow
    Write-Host ""
    $c = Read-Host "Scelta"
    if ($c -eq $null) { $c = "" }
    $c = $c.Trim()

    $map = @{
        "1" = (Join-Path $logDir "vite_out.log")
        "2" = (Join-Path $logDir "vite_err.log")
        "3" = (Join-Path $logDir "cloudflared_out.log")
        "4" = (Join-Path $logDir "cloudflared_err.log")
    }

    if (-not $map.ContainsKey($c)) {
        T "Scelta non valida." "Yellow"
        return
    }

    $logPath = $map[$c]
    if (-not (Test-Path $logPath)) {
        T "Log non trovato: $logPath" "Yellow"
        return
    }

    T "Apro log (Ctrl+C per tornare al menu)..." "Cyan"
    Get-Content -Path $logPath -Tail 200 -Wait
}

# --- Menu ---

function Show-Header {
    $st = Load-State
    $port = 3000
    if ($st -and $st.port) { $port = [int]$st.port }

    Write-Host ""
    Write-Host "  ======================================" -ForegroundColor Yellow
    Write-Host "    BIANCHIPRO RESTYLING - PANNELLO" -ForegroundColor Yellow
    Write-Host "  ======================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Cartella : $root" -ForegroundColor DarkGray
    Write-Host "  Locale   : http://127.0.0.1:$port" -ForegroundColor Cyan

    if (Test-Path $urlFile) {
        $u = ""
        try { $u = (Get-Content $urlFile -Raw).Trim() } catch {}
        if ($u) {
            Write-Host "  Online   : $u" -ForegroundColor Green
        }
    } else {
        Write-Host "  Online   : (non attivo)" -ForegroundColor DarkGray
    }

    if ($st) {
        $v = 0; if ($st.vite) { $v = $st.vite }
        $t = 0; if ($st.cloudflared) { $t = $st.cloudflared }
        Write-Host "  PID Vite : $v   PID Tunnel: $t" -ForegroundColor DarkGray
    } else {
        Write-Host "  Stato    : (nessun processo attivo)" -ForegroundColor DarkGray
    }

    Write-Host ""
    Write-Host "  1 = Avvia locale" -ForegroundColor White
    Write-Host "  2 = Condividi online (link pubblico)" -ForegroundColor White
    Write-Host "  3 = Chiudi tutto" -ForegroundColor White
    Write-Host "  4 = Apri locale nel browser" -ForegroundColor White
    Write-Host "  5 = Apri link online nel browser" -ForegroundColor White
    Write-Host "  6 = Vedi log" -ForegroundColor White
    Write-Host "  7 = Ripara PostCSS (BOM)" -ForegroundColor White
    Write-Host "  Q = Esci" -ForegroundColor White
    Write-Host ""
}

function Run-Menu {
    while ($true) {
        Show-Header
        $k = Read-Host "Scelta"
        if ($k -eq $null) { $k = "" }
        $k = $k.Trim().ToUpper()

        try {
            if ($k -eq "1") { Start-Local; continue }
            if ($k -eq "2") { Share-Online; continue }
            if ($k -eq "3") { Stop-All; continue }
            if ($k -eq "4") { Open-Local; continue }
            if ($k -eq "5") { Open-Online; continue }
            if ($k -eq "6") { Show-Log; continue }
            if ($k -eq "7") { Fix-PostCss | Out-Null; T "Controllo completato." "Green"; continue }
            if ($k -eq "Q") { break }
            T "Scelta non valida." "Yellow"
        } catch {
            T "ERRORE: $($_.Exception.Message)" "Red"
        }
    }
}

# --- Entrypoint ---

$act = $Azione
if ($act -eq $null) { $act = "MENU" }
$act = $act.Trim().ToUpper()

try {
    if ($act -eq "AVVIA_LOCALE")     { Start-Local; Run-Menu; exit }
    if ($act -eq "CONDIVIDI_ONLINE") { Share-Online; Run-Menu; exit }
    if ($act -eq "CHIUDI_TUTTO")     { Stop-All; Run-Menu; exit }
} catch {
    T "ERRORE: $($_.Exception.Message)" "Red"
}

Run-Menu