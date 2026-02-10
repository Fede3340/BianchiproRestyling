@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -NoExit -File "%~dp0PANNELLO.ps1" -Azione AVVIA_LOCALE
