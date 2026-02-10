param([string]$Action = "")
$ErrorActionPreference = "Stop"

$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$Project    = "BIANCHI PRO"
$FrontPort  = 3000
$LocalUrl   = "http://127.0.0.1:$FrontPort/"
$LogDir     = Join-Path $ScriptDir "_LOGS"
$StateFile  = Join-Path $ScriptDir "_PANNELLO_STATE.json"

function Info([string]$m)  { Write-Host $m -ForegroundColor Cyan }
function Ok([string]$m)    { Write-Host $m -ForegroundColor Green }
function Warn([string]$m)  { Write-Host $m -ForegroundColor Yellow }
function Err([string]$m)   { Write-Host $m -ForegroundColor Red }
function Ensure-Dir([string]$p) { if(-not (Test-Path -LiteralPath $p)){ New-Item -ItemType Directory -Path $p -Force | Out-Null } }
function ReadKeyChar() { $k = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown"); return $k.Character.ToString().ToUpper() }
function PauseKey([string]$msg = "Premere un tasto...") { Write-Host ""; Write-Host $msg -ForegroundColor Yellow; [void]$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }

function TestTcpPort([int]$port, [int]$timeoutMs = 400) {
  try {
    $cl = New-Object System.Net.Sockets.TcpClient
    $iar = $cl.BeginConnect("127.0.0.1", $port, $null, $null)
    $ok  = $iar.AsyncWaitHandle.WaitOne($timeoutMs, $false)
    if (-not $ok) { $cl.Close(); return $false }
    $cl.EndConnect($iar) | Out-Null
    $cl.Close()
    return $true
  } catch { return $false }
}

function WaitPort([int]$port, [int]$timeoutSec, [int]$processPid = 0) {
  Write-Host ("Attendo porta " + $port + " (max " + $timeoutSec + "s) ") -ForegroundColor Cyan -NoNewline
  $end = (Get-Date).AddSeconds($timeoutSec)
  $elapsed = 0
  while ((Get-Date) -lt $end) {
    if ($processPid -gt 0) {
      $proc = Get-Process -Id $processPid -ErrorAction SilentlyContinue
      if (-not $proc) {
        Write-Host ""
        Err "Processo terminato! Controlla _LOGS\front_err.log"
        return $false
      }
    }
    if (TestTcpPort $port 400) {
      Write-Host ""
      Ok "Porta pronta!"
      return $true
    }
    Start-Sleep -Milliseconds 1000
    $elapsed++
    if (($elapsed % 2) -eq 0) { Write-Host "." -NoNewline -ForegroundColor DarkYellow }
  }
  Write-Host ""
  Err "Timeout raggiunto"
  return $false
}

function LoadState() {
  if (Test-Path -LiteralPath $StateFile) {
    try { return (Get-Content -LiteralPath $StateFile -Raw | ConvertFrom-Json) } catch { return $null }
  }
  return $null
}
function SaveState($st) { ($st | ConvertTo-Json -Depth 6) | Set-Content -LiteralPath $StateFile -Encoding Ascii -Force }
function NewState() { return [PSCustomObject]@{ front_pid = 0; tunnel_pid = 0; last_url = "" } }

function KillTree([int]$procId) {
  if ($procId -le 0) { return }
  try { & taskkill /PID $procId /T /F 2>$null | Out-Null } catch {}
}
function KillByPort([int]$port) {
  try {
    $cons = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($co in $cons) {
      $pr = Get-Process -Id $co.OwningProcess -ErrorAction SilentlyContinue
      if ($pr) {
        $nm = $pr.Name.ToLower()
        if ($nm -in @("node","cmd","cloudflared")) { KillTree $pr.Id }
      }
    }
  } catch {}
}

function StopAll() {
  Info "CHIUSURA - $Project"
  $st = LoadState
  if ($st) { KillTree ([int]$st.tunnel_pid); KillTree ([int]$st.front_pid) }
  KillByPort $FrontPort
  if (Test-Path -LiteralPath $StateFile) { Remove-Item -LiteralPath $StateFile -Force -ErrorAction SilentlyContinue }
  Ok "OK: chiuso."
}

function Start-Local { param([bool]$OpenBrowser = $true)
  StopAll
  Ensure-Dir $LogDir
  $logOut = Join-Path $LogDir "front_out.log"
  $logErr = Join-Path $LogDir "front_err.log"

  Info "Avvio npm run dev..."
  
  # CRITICAL: Usa cmd.exe con redirect > per i log, NO -RedirectStandardOutput
  $cmdLine = "cd /d `"$ScriptDir`" && npm run dev -- --host 127.0.0.1 --port $FrontPort > `"$logOut`" 2> `"$logErr`""
  $proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c",$cmdLine -WorkingDirectory $ScriptDir -PassThru -WindowStyle Minimized

  $st = NewState
  $st.front_pid = $proc.Id
  SaveState $st

  if (-not (WaitPort $FrontPort 120 $proc.Id)) {
    Err "Servizio non pronto. Controlla _LOGS\front_err.log"
    return $false
  }

  Ok ("Locale pronto: " + $LocalUrl)
  if ($OpenBrowser) {
    Start-Sleep -Seconds 2
    Start-Process $LocalUrl
  }
  return $true
}

function WaitCloudReady([string]$url, [int]$timeoutSec) {
  Write-Host ("Verifico raggiungibilita tunnel ") -ForegroundColor Cyan -NoNewline
  $end = (Get-Date).AddSeconds($timeoutSec)
  $attempt = 0
  while ((Get-Date) -lt $end) {
    $attempt++
    try {
      $req = [System.Net.HttpWebRequest]::Create($url)
      $req.Timeout = 5000
      $req.AllowAutoRedirect = $true
      $resp = $req.GetResponse()
      $resp.Close()
      Write-Host ""
      Ok ("Tunnel raggiungibile dopo " + $attempt + " tentativi")
      return $true
    } catch [System.Net.WebException] {
      if ($_.Exception.Response -ne $null) {
        Write-Host ""
        Ok "Tunnel raggiungibile (HTTP error ma risponde)"
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

function Share-Online {
  if (-not (TestTcpPort $FrontPort 400)) {
    Warn "Locale non attivo, avvio..."
    if (-not (Start-Local $false)) { return $false }
  }

  $cloud = Get-Command "cloudflared.exe" -ErrorAction SilentlyContinue
  if (-not $cloud) { Err "cloudflared.exe non trovato nel PATH"; return $false }

  $st = LoadState
  if (-not $st) { $st = NewState }
  if ([int]$st.tunnel_pid -gt 0) { KillTree ([int]$st.tunnel_pid) }

  $logOut = Join-Path $LogDir "tunnel_out.log"
  $logErr = Join-Path $LogDir "tunnel_err.log"

  Info "Avvio tunnel Cloudflare..."
  $cmdLine = "cloudflared tunnel --url http://127.0.0.1:$FrontPort --no-autoupdate > `"$logOut`" 2> `"$logErr`""
  $tp = Start-Process -FilePath "cmd.exe" -ArgumentList "/c",$cmdLine -WorkingDirectory $ScriptDir -PassThru -WindowStyle Minimized

  $st.tunnel_pid = $tp.Id
  SaveState $st

  Info "Attendo URL pubblico (max 60s)..."
  $url = ""
  $attempts = 0
  while ($attempts -lt 60 -and $url -eq "") {
    Start-Sleep -Milliseconds 1000
    $attempts++
    if ($attempts % 3 -eq 0) { Write-Host "." -NoNewline -ForegroundColor DarkYellow }
    
    if (Test-Path -LiteralPath $logOut) {
      $logContent = Get-Content -LiteralPath $logOut -Raw -ErrorAction SilentlyContinue
      if ($logContent -match 'https://[a-z0-9-]+\.trycloudflare\.com') {
        $url = $Matches[0]
      }
    }
    if (Test-Path -LiteralPath $logErr) {
      $logContent = Get-Content -LiteralPath $logErr -Raw -ErrorAction SilentlyContinue
      if ($logContent -match 'https://[a-z0-9-]+\.trycloudflare\.com') {
        $url = $Matches[0]
      }
    }
  }
  Write-Host ""

  if ($url -eq "") {
    Err "URL non trovato nel log. Controlla _LOGS\tunnel_err.log"
    return $false
  }

  Info ("URL trovato: " + $url)
  
  # Aspetta che il tunnel risponda davvero
  if (-not (WaitCloudReady $url 90)) {
    Warn "Timeout verifica. Apro comunque, potrebbe servire un refresh."
  }

  $st.last_url = $url
  SaveState $st
  
  Ok ("Online pronto: " + $url)
  Start-Process $url
  return $true
}

function Open-Logs { Ensure-Dir $LogDir; Start-Process "explorer.exe" $LogDir }

function Title {
  Clear-Host
  Write-Host "==========================================" -ForegroundColor DarkCyan
  Write-Host ("  PANNELLO - " + $Project) -ForegroundColor Cyan
  Write-Host "==========================================" -ForegroundColor DarkCyan
  Write-Host ""
}

function Menu {
  while ($true) {
    Title
    Write-Host "  [1] Avvia locale" -ForegroundColor Green
    Write-Host "  [2] Condividi online (Cloudflare)" -ForegroundColor Yellow
    Write-Host "  [3] Apri log" -ForegroundColor Cyan
    Write-Host "  [4] Chiudi tutto" -ForegroundColor Red
    Write-Host "  [Q] Esci" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Premi un tasto..." -ForegroundColor DarkYellow
    $k = ReadKeyChar
    switch ($k) {
      "1" { Start-Local $true  | Out-Null; PauseKey }
      "2" { Share-Online       | Out-Null; PauseKey }
      "3" { Open-Logs;                     PauseKey }
      "4" { StopAll;                       PauseKey }
      "Q" { return }
    }
  }
}

switch ($Action) {
  "start" { Start-Local $true  | Out-Null; PauseKey }
  "share" { Share-Online       | Out-Null; PauseKey }
  "stop"  { StopAll;                       PauseKey }
  "logs"  { Open-Logs;                     PauseKey }
  default { Menu }
}
