@echo off
cd /d "%~dp0"
where node >nul 2>&1 || (echo Node.js required. & pause & exit /b 1)
if not exist node_modules (
  echo Installing...
  call npm install || (pause & exit /b 1)
)
start "" "http://127.0.0.1:5204"
call npm run dev
pause
