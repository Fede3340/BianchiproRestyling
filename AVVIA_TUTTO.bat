@@ -1,3 +1,4 @@
@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -NoExit -File "%~dp0PANNELLO.ps1" -Azione AVVIA_LOCALE
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0PANNELLO.ps1" start
pause