param([string]$Azione = "MENU")

$ErrorActionPreference = "Stop"
$root    = Split-Path -Parent $MyInvocation.MyCommand.Path
$state   = Join-Path $root "_STATE.json"
$logDir  = Join-Path $root "_LOG"
$urlFile = Join-Path $root "URL_ONLINE.txt"

if(-not (Test-Path $logDir)){ New-Item -ItemType Directory -Path $logDir | Out-Null }

function T([string]$m,[string]$c="Cyan"){
  $ts=(Get-Date).ToString("HH:mm:ss")
  Write-Host "[$ts] $m" -ForegroundColor $c
}

function Save-State($obj){
  $json = $obj | ConvertTo-Json -Depth 20
  $enc  = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($state, $json, $enc)
}

function Load-State(){
  if(Test-Path $state){
    try { return (Get-Content $state -Raw | ConvertFrom-Json) } catch { return $null }
  }
  return $null
}

function Kill-PidTree([int]$procId){
  if($procId -le 0){ return }
  cmd /c "taskkill /PID $procId /T /F >nul 2>&1" | Out-Null
}

function Get-PidsByPort([int]$port){
  $pids = @{}
  try{
    $lines = netstat -ano | Select-String (":$port\s")
    foreach($l in $lines){
      $s = ($l.Line -replace "\s+"," ").Trim()
      if($s -match "\sLISTENING\s(\d+)$"){
        $id = [int]$matches[1]
        $pids["$id"] = $true
      }
    }
  } catch {}
  return @($pids.Keys | ForEach-Object { [int]$_ })
}

function Kill-ByPort([int]$port){
  $ids = Get-PidsByPort $port
  foreach($id in $ids){ Kill-PidTree $id }
}

function Wait-Http([string]$url,[int]$timeoutSec=180){
  $start = Get-Date
  while((Get-Date) - $start -lt [TimeSpan]::FromSeconds($timeoutSec)){
    try{
      Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 -Uri $url | Out-Null
      return $true
    } catch {
      try{
        # anche una risposta "errore" ma con server vivo va bene: es. 404/500
        if($_.Exception.Response){ return $true }
      } catch {}
    }
    Start-Sleep -Milliseconds 400
  }
  return $false
}

function Remove-BomIfPresent([string]$path){
  if(-not (Test-Path $path)){ return $false }
  $bytes = [System.IO.File]::ReadAllBytes($path)
  if($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF){
    $newBytes = $bytes[3..($bytes.Length-1)]
    [System.IO.File]::WriteAllBytes($path, $newBytes)
    return $true
  }
  return $false
}

function Fix-PostCss(){
  # Vite cerca PostCSS config anche in JSON: se c'è BOM -> JSON.parse esplode con "Unexpected token '﻿'"
  $candidates = @(
    (Join-Path $root "postcss.config.json"),
    (Join-Path $root ".postcssrc"),
    (Join-Path $root ".postcssrc.json"),
    (Join-Path $root ".postcssrcc"),
    (Join-Path $root ".postcssrc.jsonc")
  )
  $fixedAny = $false
  foreach($p in $candidates){
    if(Test-Path $p){
      if(Remove-BomIfPresent $p){
        $fixedAny = $true
        T "Riparato BOM nel file PostCSS: $([System.IO.Path]::GetFileName($p))" "Green"
      }
    }
  }
  return $fixedAny
}

function Stop-All(){
  T "Chiusura totale (BianchiPro)..." "Yellow"

  $s = Load-State
  if($s){
    if($s.vite){ Kill-PidTree ([int]$s.vite) }
    if($s.cloudflared){ Kill-PidTree ([int]$s.cloudflared) }
  }

  # sicurezza: ammazza qualsiasi cosa stia ancora in ascolto sulla porta 3000
  Kill-ByPort 3000

  Remove-Item $state -Force -ErrorAction SilentlyContinue | Out-Null
  T "Tutto chiuso." "Green"
}

function Ensure-NpmInstall(){
  if(-not (Test-Path (Join-Path $root "package.json"))){
    throw "In $root non trovo package.json: non sembra un progetto Node/Vite."
  }
  if(-not (Test-Path (Join-Path $root "node_modules"))){
    T "Manca node_modules: avvio installazione dipendenze (npm install)..." "Yellow"
    $o = Join-Path $logDir "npm_install_out.log"
    $e = Join-Path $logDir "npm_install_err.log"
    Remove-Item $o,$e -Force -ErrorAction SilentlyContinue | Out-Null

    $p = Start-Process -FilePath "cmd.exe" -WorkingDirectory $root -PassThru -WindowStyle Hidden `
      -ArgumentList "/c","npm install" -RedirectStandardOutput $o -RedirectStandardError $e

    $p.WaitForExit()
    if($p.ExitCode -ne 0){
      T "ERRORE npm install. Apri il log: $e" "Red"
      throw "npm install fallito"
    }
    T "npm install completato." "Green"
  }
}

function Start-Local([switch]$NonAprireBrowser){
  Stop-All

  T "Riparazione PostCSS (se serve)..." "DarkCyan"
  Fix-PostCss | Out-Null

  Ensure-NpmInstall

  $port = 3000
  $base = "http://127.0.0.1:$port"

  $out = Join-Path $logDir "vite_out.log"
  $err = Join-Path $logDir "vite_err.log"
  Remove-Item $out,$err -Force -ErrorAction SilentlyContinue | Out-Null

  # Permettere host trycloudflare per eventuale tunnel rapido
  $env:__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = ".trycloudflare.com"

  T "Avvio locale su $base" "Cyan"
  $pVite = Start-Process -FilePath "cmd.exe" -WorkingDirectory $root -PassThru -WindowStyle Hidden `
    -ArgumentList "/c","npx vite --host 127.0.0.1 --port $port" `
    -RedirectStandardOutput $out -RedirectStandardError $err

  Save-State @{ vite = $pVite.Id; cloudflared = 0; port = $port }

  T "Attendere avvio server..." "DarkCyan"
  if(-not (Wait-Http $base 180)){
    T "ERRORE: non risponde $base" "Red"
    T "Apri log con menu -> 5" "Yellow"
    throw "Vite non risponde"
  }

  # Se PostCSS era rotto, Vite può risultare su ma pagina bianca con overlay: lo vedi nel browser e nel log
  T "PRONTO (locale): $base" "Green"
  if(-not $NonAprireBrowser){ Start-Process $base | Out-Null }
}

function Get-CloudflaredPath(){
  $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
  if($cmd){ return $cmd.Source }

  $p1 = Join-Path $env:ProgramFiles "Cloudflare\Cloudflared\cloudflared.exe"
  $p2 = Join-Path ${env:ProgramFiles(x86)} "Cloudflare\Cloudflared\cloudflared.exe"
  if(Test-Path $p1){ return $p1 }
  if(Test-Path $p2){ return $p2 }

  throw "cloudflared non trovato. Installare Cloudflare Tunnel."
}

function Share-Online(){
  Start-Local -NonAprireBrowser

  $s = Load-State
  $port = 3000
  if($s -and $s.port){ $port = [int]$s.port }
  $base = "http://127.0.0.1:$port"

  # Quick Tunnel Cloudflare (trycloudflare) crea un sottodominio random su trycloudflare.com :contentReference[oaicite:1]{index=1}
  $cf = Get-CloudflaredPath

  $out = Join-Path $logDir "cloudflared_out.log"
  $err = Join-Path $logDir "cloudflared_err.log"
  Remove-Item $out,$err -Force -ErrorAction SilentlyContinue | Out-Null

  # Se esiste config cloudflared che blocca i quick tunnel, la mettiamo temporaneamente da parte
  $cfDir = Join-Path $env:USERPROFILE ".cloudflared"
  $bak = @()
  try{
    foreach($name in @("config.yml","config.yaml")){
      $p = Join-Path $cfDir $name
      if(Test-Path $p){
        $b = "$p.bak_" + (Get-Date).ToString("yyyyMMdd_HHmmss")
        Move-Item $p $b -Force
        $bak += @(@($p,$b))
      }
    }

    T "Avvio link pubblico (Cloudflare) verso $base" "Cyan"
    $pTun = Start-Process -FilePath $cf -WorkingDirectory $root -PassThru -WindowStyle Hidden `
      -ArgumentList @("tunnel","--url",$base) `
      -RedirectStandardOutput $out -RedirectStandardError $err

    Save-State @{ vite = (Load-State).vite; cloudflared = $pTun.Id; port = $port }

    $pattern = 'https://[^\s"]+\.trycloudflare\.com'
    $pub = $null
    $start = Get-Date
    while(-not $pub -and ((Get-Date)-$start).TotalSeconds -lt 120){
      $txt = ""
      if(Test-Path $out){ $txt += (Get-Content $out -Raw) }
      if(Test-Path $err){ $txt += "`n" + (Get-Content $err -Raw) }
      if($txt -match $pattern){ $pub = $matches[0] }
      Start-Sleep -Milliseconds 400
    }
    if(-not $pub){
      T "ERRORE: non trovo il link pubblico. Vedi log cloudflared." "Red"
      throw "Link pubblico non trovato"
    }

    $enc = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($urlFile, $pub, $enc)

    T "PRONTO (online): $pub" "Green"
    T "Link salvato in: $urlFile" "DarkGreen"

    # aspetta che risponda, poi apri
    [void](Wait-Http $pub 120)
    Start-Process $pub | Out-Null

  } finally {
    foreach($pair in $bak){
      $orig = $pair[0]; $backup = $pair[1]
      if(Test-Path $backup){ Move-Item $backup $orig -Force }
    }
  }
}

function Open-Local(){
  $port = 3000
  $s = Load-State
  if($s -and $s.port){ $port = [int]$s.port }
  Start-Process "http://127.0.0.1:$port" | Out-Null
}

function Open-Online(){
  if(Test-Path $urlFile){
    $u = (Get-Content $urlFile -Raw).Trim()
    if($u){ Start-Process $u | Out-Null; return }
  }
  T "Non trovo URL_ONLINE.txt (prima fare 'Condividi online')." "Yellow"
}

function Tail-Log(){
  T "Scegli log: 1=Vite OUT | 2=Vite ERR | 3=Cloudflared OUT | 4=Cloudflared ERR" "Yellow"
  $c = Read-Host "Scelta"
  if($c -eq $null){ $c = "" }
  $c = $c.Trim()

  $map = @{
    "1" = (Join-Path $logDir "vite_out.log")
    "2" = (Join-Path $logDir "vite_err.log")
    "3" = (Join-Path $logDir "cloudflared_out.log")
    "4" = (Join-Path $logDir "cloudflared_err.log")
  }

  if(-not $map.ContainsKey($c)){
    T "Scelta non valida." "Yellow"
    return
  }

  $p = $map[$c]
  if(-not (Test-Path $p)){
    T "Log non trovato: $p" "Yellow"
    return
  }

  T "Apro log (Ctrl+C per tornare al menu)..." "Cyan"
  Get-Content -Path $p -Tail 200 -Wait
}

function Show-Status(){
  $s = Load-State
  $port = 3000
  if($s -and $s.port){ $port = [int]$s.port }

  Write-Host ""
  Write-Host "==============================" -ForegroundColor Yellow
  Write-Host "BIANCHIPRO - PANNELLO" -ForegroundColor Yellow
  Write-Host "Cartella: $root" -ForegroundColor DarkGray
  Write-Host "Locale : http://127.0.0.1:$port" -ForegroundColor Cyan

  if(Test-Path $urlFile){
    $u = (Get-Content $urlFile -Raw).Trim()
    if($u){ Write-Host "Online : $u" -ForegroundColor Green }
  } else {
    Write-Host "Online : (non attivo)" -ForegroundColor DarkGray
  }

  if($s){
    $v = $s.vite
    $t = $s.cloudflared
    Write-Host "PID Vite      : $v" -ForegroundColor DarkGray
    Write-Host "PID Cloudflared: $t" -ForegroundColor DarkGray
  } else {
    Write-Host "Stato: (nessuno)" -ForegroundColor DarkGray
  }
  Write-Host "==============================" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "1 = Avvia locale" -ForegroundColor Yellow
  Write-Host "2 = Condividi online (link pubblico)" -ForegroundColor Yellow
  Write-Host "3 = Chiudi tutto" -ForegroundColor Yellow
  Write-Host "4 = Apri locale nel browser" -ForegroundColor Yellow
  Write-Host "5 = Vedi log" -ForegroundColor Yellow
  Write-Host "6 = Ripara PostCSS (BOM)" -ForegroundColor Yellow
  Write-Host "Q = Esci" -ForegroundColor Yellow
  Write-Host ""
}

function Menu(){
  while($true){
    Show-Status
    $k = Read-Host "Scelta"
    if($k -eq $null){ $k = "" }
    $k = $k.Trim().ToUpper()

    if($k -eq "1"){ Start-Local; continue }
    if($k -eq "2"){ Share-Online; continue }
    if($k -eq "3"){ Stop-All; continue }
    if($k -eq "4"){ Open-Local; continue }
    if($k -eq "5"){ Tail-Log; continue }
    if($k -eq "6"){ Fix-PostCss | Out-Null; Read-Host "Invio per continuare" | Out-Null; continue }
    if($k -eq "Q"){ break }

    T "Scelta non valida." "Yellow"
  }
}

# Azione diretta da .bat
$act = $Azione
if($act -eq $null){ $act = "MENU" }
$act = $act.Trim().ToUpper()

if($act -eq "AVVIA_LOCALE"){ Start-Local; Menu; exit }
if($act -eq "CONDIVIDI_ONLINE"){ Share-Online; Menu; exit }
if($act -eq "CHIUDI_TUTTO"){ Stop-All; Menu; exit }

Menu