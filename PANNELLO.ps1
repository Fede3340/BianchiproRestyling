param([string]$Azione = "MENU")

# ---------------------------------------------------------------------------
# PANNELLO.ps1 - BianchiPro Restyling
# Pannello di controllo per avvio locale, condivisione online e chiusura.
# Compatibile con Windows PowerShell 5.1 (no ??, no &&, no $pid come variabile)
# Parametro: -Azione (MENU, AVVIA_LOCALE, CONDIVIDI_ONLINE, CHIUDI_TUTTO, LOG)
# ---------------------------------------------------------------------------

$ErrorActionPreference = "Continue"

$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$Project    = "BIANCHI PRO"
$FrontPort  = 3000
$LocalUrl   = "http://127.0.0.1:$FrontPort/"
$LogDir     = Join-Path $ScriptDir "_LOGS"
$StateFile  = Join-Path $ScriptDir "_STATE.json"

# ---------------------------------------------------------------------------
# Funzioni di output
# ---------------------------------------------------------------------------

function Info([string]$m)  { Write-Host $m -ForegroundColor Cyan }
function Ok([string]$m)    { Write-Host $m -ForegroundColor Green }
function Warn([string]$m)  { Write-Host $m -ForegroundColor Yellow }
function Err([string]$m)   { Write-Host $m -ForegroundColor Red }

function EnsureDir([string]$p) {
  if (-not (Test-Path -LiteralPath $p)) {
    New-Item -ItemType Directory -Path $p -Force | Out-Null
  }
}

function ReadKeyChar() {
  $k = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
  return $k.Character.ToString().ToUpper()
}

function PauseKey([string]$msg = "Premere un tasto per continuare...") {
  Write-Host ""
  Write-Host $msg -ForegroundColor DarkYellow
  [void]$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# ---------------------------------------------------------------------------
# TCP port check
# ---------------------------------------------------------------------------

function TestTcpPort([int]$port, [int]$timeoutMs = 500) {
  try {
    $cl = New-Object System.Net.Sockets.TcpClient
    $iar = $cl.BeginConnect("127.0.0.1", $port, $null, $null)
    $ok  = $iar.AsyncWaitHandle.WaitOne($timeoutMs, $false)
    if (-not $ok) { $cl.Close(); return $false }
    try { $cl.EndConnect($iar) } catch {}
    $cl.Close()
    return $true
  } catch {
    return $false
  }
}

function WaitPort([int]$port, [int]$timeoutSec, [int]$procId = 0) {
  Write-Host ("  Attendo porta " + $port + " (max " + $timeoutSec + "s) ") -ForegroundColor Cyan -NoNewline
  $end = (Get-Date).AddSeconds($timeoutSec)
  $ticks = 0
  while ((Get-Date) -lt $end) {
    # Se il processo e' morto, inutile aspettare
    if ($procId -gt 0) {
      $p = $null
      try { $p = Get-Process -Id $procId -ErrorAction SilentlyContinue } catch {}
      if ($null -eq $p) {
        Write-Host ""
        Err "  Il processo (PID $procId) e' terminato. Controlla _LOGS\front_err.log"
        return $false
      }
    }
    if (TestTcpPort $port 500) {
      Write-Host ""
      Ok "  Porta $port pronta!"
      return $true
    }
    Start-Sleep -Milliseconds 1000
    $ticks++
    if (($ticks % 3) -eq 0) { Write-Host "." -NoNewline -ForegroundColor DarkYellow }
  }
  Write-Host ""
  Err "  Timeout: porta $port non risponde dopo ${timeoutSec}s"
  return $false
}

# ---------------------------------------------------------------------------
# State management (JSON file for PID tracking)
# ---------------------------------------------------------------------------

function LoadState() {
  if (Test-Path -LiteralPath $StateFile) {
    try {
      $raw = Get-Content -LiteralPath $StateFile -Raw -ErrorAction Stop
      return ($raw | ConvertFrom-Json)
    } catch {
      return $null
    }
  }
  return $null
}

function SaveState($st) {
  try {
    ($st | ConvertTo-Json -Depth 4) | Set-Content -LiteralPath $StateFile -Encoding ASCII -Force
  } catch {
    Warn "  Impossibile salvare stato: $_"
  }
}

function NewState() {
  return [PSCustomObject]@{
    front_pid  = 0
    tunnel_pid = 0
    last_url   = ""
  }
}

# ---------------------------------------------------------------------------
# Process management
# ---------------------------------------------------------------------------

function KillTree([int]$procId) {
  if ($procId -le 4) { return }  # Mai toccare PID 0 o 4 (sistema)
  try {
    $p = Get-Process -Id $procId -ErrorAction SilentlyContinue
    if ($null -ne $p) {
      & taskkill /PID $procId /T /F 2>$null | Out-Null
    }
  } catch {}
}

function KillByPort([int]$port) {
  try {
    $cons = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($null -eq $cons) { return }
    foreach ($co in $cons) {
      if ($co.OwningProcess -le 4) { continue }  # Mai toccare PID di sistema
      $pr = $null
      try { $pr = Get-Process -Id $co.OwningProcess -ErrorAction SilentlyContinue } catch {}
      if ($null -ne $pr) {
        $nm = $pr.Name.ToLower()
        if ($nm -in @("node","npm","cmd","cloudflared","conhost")) {
          KillTree $pr.Id
        }
      }
    }
  } catch {}
}

# ---------------------------------------------------------------------------
# CHIUDI TUTTO
# ---------------------------------------------------------------------------

function StopAll() {
  Write-Host ""
  Info "  CHIUSURA - $Project"
  $st = LoadState
  if ($null -ne $st) {
    if ([int]$st.tunnel_pid -gt 4) { KillTree ([int]$st.tunnel_pid) }
    if ([int]$st.front_pid -gt 4)  { KillTree ([int]$st.front_pid) }
  }
  KillByPort $FrontPort
  if (Test-Path -LiteralPath $StateFile) {
    Remove-Item -LiteralPath $StateFile -Force -ErrorAction SilentlyContinue
  }
  Ok "  Tutto chiuso."
}

# ---------------------------------------------------------------------------
# AVVIA LOCALE
# ---------------------------------------------------------------------------

function StartLocal {
  param([bool]$OpenBrowser = $true)

  # Prima pulisci tutto
  StopAll
  EnsureDir $LogDir

  $logOut = Join-Path $LogDir "front_out.log"
  $logErr = Join-Path $LogDir "front_err.log"

  # Pulisci log precedenti
  if (Test-Path $logOut) { Remove-Item $logOut -Force -ErrorAction SilentlyContinue }
  if (Test-Path $logErr) { Remove-Item $logErr -Force -ErrorAction SilentlyContinue }

  Write-Host ""
  Info "  Avvio npm run dev (porta $FrontPort)..."

  # Verifica che npm sia raggiungibile
  $npmCmd = Get-Command "npm" -ErrorAction SilentlyContinue
  if ($null -eq $npmCmd) {
    $npmCmd = Get-Command "npm.cmd" -ErrorAction SilentlyContinue
  }
  if ($null -eq $npmCmd) {
    Err "  npm non trovato nel PATH!"
    Err "  Installa Node.js (v20 LTS) e riavvia il terminale."
    return $false
  }

  # Avvia con cmd.exe per gestire redirect dei log
  $cmdLine = "cd /d `"$ScriptDir`" && npm run dev -- --host 127.0.0.1 --port $FrontPort > `"$logOut`" 2> `"$logErr`""
  $frontProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c",$cmdLine -WorkingDirectory $ScriptDir -PassThru -WindowStyle Minimized

  $st = NewState
  $st.front_pid = $frontProc.Id
  SaveState $st

  if (-not (WaitPort $FrontPort 120 $frontProc.Id)) {
    Err "  Servizio non pronto."
    # Mostra ultime righe del log errore se esiste
    if (Test-Path $logErr) {
      $errContent = Get-Content $logErr -ErrorAction SilentlyContinue
      if ($errContent) {
        Warn "  Ultime righe di front_err.log:"
        $errContent | Select-Object -Last 5 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
      }
    }
    return $false
  }

  Ok "  Locale pronto: $LocalUrl"

  if ($OpenBrowser) {
    Start-Sleep -Seconds 1
    Start-Process $LocalUrl
  }
  return $true
}

# ---------------------------------------------------------------------------
# CONDIVIDI ONLINE (Cloudflare Quick Tunnel)
# ---------------------------------------------------------------------------

function WaitCloudReady([string]$url, [int]$timeoutSec) {
  Write-Host ("  Verifico raggiungibilita tunnel ") -ForegroundColor Cyan -NoNewline
  $end = (Get-Date).AddSeconds($timeoutSec)
  $attempt = 0
  while ((Get-Date) -lt $end) {
    $attempt++
    try {
      $req = [System.Net.HttpWebRequest]::Create($url)
      $req.Timeout = 8000
      $req.AllowAutoRedirect = $true
      $req.UserAgent = "Mozilla/5.0"
      $resp = $req.GetResponse()
      $resp.Close()
      Write-Host ""
      Ok ("  Tunnel raggiungibile (tentativo $attempt)")
      return $true
    } catch [System.Net.WebException] {
      # Se c'e' una risposta HTTP (anche errore), il tunnel funziona
      if ($null -ne $_.Exception.Response) {
        Write-Host ""
        Ok "  Tunnel raggiungibile (risponde con errore HTTP, ma e' attivo)"
        return $true
      }
      if ($attempt % 3 -eq 0) { Write-Host "." -NoNewline -ForegroundColor DarkYellow }
      Start-Sleep -Milliseconds 2000
    } catch {
      Start-Sleep -Milliseconds 2000
    }
  }
  Write-Host ""
  return $false
}

function ShareOnline {
  # Assicurati che il locale sia attivo
  if (-not (TestTcpPort $FrontPort 500)) {
    Warn "  Locale non attivo, lo avvio prima..."
    if (-not (StartLocal $false)) { return $false }
  }

  # Verifica cloudflared
  $cloudCmd = Get-Command "cloudflared" -ErrorAction SilentlyContinue
  if ($null -eq $cloudCmd) {
    $cloudCmd = Get-Command "cloudflared.exe" -ErrorAction SilentlyContinue
  }
  if ($null -eq $cloudCmd) {
    Err "  cloudflared non trovato nel PATH!"
    Err "  Scaricalo da: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
    return $false
  }

  # Chiudi tunnel precedente se esiste
  $st = LoadState
  if ($null -eq $st) { $st = NewState }
  if ([int]$st.tunnel_pid -gt 4) { KillTree ([int]$st.tunnel_pid) }

  EnsureDir $LogDir
  $logOut = Join-Path $LogDir "tunnel_out.log"
  $logErr = Join-Path $LogDir "tunnel_err.log"

  # Pulisci log tunnel precedenti (evita di leggere URL vecchi)
  if (Test-Path $logOut) { Remove-Item $logOut -Force -ErrorAction SilentlyContinue }
  if (Test-Path $logErr) { Remove-Item $logErr -Force -ErrorAction SilentlyContinue }

  # Rinomina temporaneamente config cloudflared se esiste (puo' interferire)
  $cfgDir = Join-Path $env:USERPROFILE ".cloudflared"
  $cfgYml = Join-Path $cfgDir "config.yml"
  $cfgYaml = Join-Path $cfgDir "config.yaml"
  $renamedCfg = @()
  foreach ($cf in @($cfgYml, $cfgYaml)) {
    if (Test-Path $cf) {
      $bak = $cf + ".bak_pannello"
      try {
        Rename-Item $cf $bak -Force -ErrorAction SilentlyContinue
        $renamedCfg += @{ orig = $cf; bak = $bak }
      } catch {}
    }
  }

  Write-Host ""
  Info "  Avvio tunnel Cloudflare..."

  $cmdLine = "cloudflared tunnel --url http://127.0.0.1:$FrontPort --no-autoupdate > `"$logOut`" 2> `"$logErr`""
  $tunnelProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c",$cmdLine -WorkingDirectory $ScriptDir -PassThru -WindowStyle Minimized

  $st.tunnel_pid = $tunnelProc.Id
  SaveState $st

  Info "  Attendo URL pubblico (max 60s)..."
  $tunnelUrl = ""
  $attempts = 0
  while ($attempts -lt 60 -and $tunnelUrl -eq "") {
    Start-Sleep -Milliseconds 1000
    $attempts++
    if ($attempts % 3 -eq 0) { Write-Host "." -NoNewline -ForegroundColor DarkYellow }

    # Cloudflared scrive l'URL su stderr (a volte su stdout)
    foreach ($logFile in @($logErr, $logOut)) {
      if ((Test-Path -LiteralPath $logFile) -and $tunnelUrl -eq "") {
        try {
          $logContent = Get-Content -LiteralPath $logFile -Raw -ErrorAction SilentlyContinue
          if ($logContent -match 'https://[a-z0-9-]+\.trycloudflare\.com') {
            $tunnelUrl = $Matches[0]
          }
        } catch {}
      }
    }
  }
  Write-Host ""

  # Ripristina config cloudflared rinominata
  foreach ($item in $renamedCfg) {
    try { Rename-Item $item.bak $item.orig -Force -ErrorAction SilentlyContinue } catch {}
  }

  if ($tunnelUrl -eq "") {
    Err "  URL pubblico non trovato nel log."
    if (Test-Path $logErr) {
      $errLines = Get-Content $logErr -ErrorAction SilentlyContinue
      if ($errLines) {
        Warn "  Ultime righe di tunnel_err.log:"
        $errLines | Select-Object -Last 5 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
      }
    }
    return $false
  }

  Info "  URL trovato: $tunnelUrl"

  # Verifica che il tunnel risponda davvero
  if (-not (WaitCloudReady $tunnelUrl 90)) {
    Warn "  Timeout verifica. Apro comunque - potrebbe servire un refresh."
  }

  $st.last_url = $tunnelUrl
  SaveState $st

  Ok "  Online pronto: $tunnelUrl"
  Write-Host ""
  Write-Host "  LINK DA CONDIVIDERE:" -ForegroundColor White
  Write-Host "  $tunnelUrl" -ForegroundColor Green
  Write-Host ""
  Warn "  Il link resta attivo finche' non chiudi il tunnel."

  Start-Process $tunnelUrl
  return $true
}

# ---------------------------------------------------------------------------
# APRI LOG
# ---------------------------------------------------------------------------

function OpenLogs {
  EnsureDir $LogDir
  Start-Process "explorer.exe" -ArgumentList $LogDir
}

# ---------------------------------------------------------------------------
# STATO ATTUALE
# ---------------------------------------------------------------------------

function GetStatusLine() {
  $localOk = TestTcpPort $FrontPort 300
  $st = LoadState
  $tunnelUrl = ""
  if ($null -ne $st -and $st.last_url -ne "") { $tunnelUrl = $st.last_url }

  $statusParts = @()
  if ($localOk) {
    $statusParts += "Locale: ATTIVO (porta $FrontPort)"
  } else {
    $statusParts += "Locale: spento"
  }
  if ($tunnelUrl -ne "") {
    $statusParts += "Tunnel: $tunnelUrl"
  }
  return $statusParts -join "  |  "
}

# ---------------------------------------------------------------------------
# MENU INTERATTIVO
# ---------------------------------------------------------------------------

function ShowMenu {
  while ($true) {
    Clear-Host
    Write-Host ""
    Write-Host "  ============================================" -ForegroundColor DarkCyan
    Write-Host "    PANNELLO - $Project" -ForegroundColor Cyan
    Write-Host "  ============================================" -ForegroundColor DarkCyan
    Write-Host ""

    # Mostra stato attuale
    $statusLine = GetStatusLine
    Write-Host "  Stato: $statusLine" -ForegroundColor DarkGray
    Write-Host ""

    Write-Host "  [1] Avvia locale" -ForegroundColor Green
    Write-Host "  [2] Condividi online (Cloudflare)" -ForegroundColor Yellow
    Write-Host "  [3] Apri cartella log" -ForegroundColor Cyan
    Write-Host "  [4] Chiudi tutto" -ForegroundColor Red
    Write-Host "  [Q] Esci" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Premi un tasto..." -ForegroundColor DarkYellow

    $k = ReadKeyChar
    switch ($k) {
      "1" { StartLocal $true  | Out-Null; PauseKey }
      "2" { ShareOnline       | Out-Null; PauseKey }
      "3" { OpenLogs }
      "4" { StopAll;                      PauseKey }
      "Q" { StopAll; return }
    }
  }
}

# ---------------------------------------------------------------------------
# ENTRY POINT
# ---------------------------------------------------------------------------

switch ($Azione.ToUpper()) {
  "AVVIA_LOCALE"      { StartLocal $true  | Out-Null; PauseKey }
  "CONDIVIDI_ONLINE"  { ShareOnline       | Out-Null; PauseKey }
  "CHIUDI_TUTTO"      { StopAll;                      PauseKey }
  "LOG"               { OpenLogs;                     PauseKey }
  "MENU"              { ShowMenu }
  default             { ShowMenu }
}
