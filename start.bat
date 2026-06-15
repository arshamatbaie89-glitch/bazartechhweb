@echo off
cd /d "%~dp0"
echo Starting Mallmart...
call npm run dev
echo Server stopped.
pause
