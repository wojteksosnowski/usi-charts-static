@echo off
start "Vite dev" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 3 /nobreak >nul
start "Chart API" cmd /k "cd /d %~dp0 && npm run server"
