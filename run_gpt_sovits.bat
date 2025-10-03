@echo off
echo Starting GPT-SoVITS API v3 with WebSocket TTS Integration...

set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
cd /d "C:\Users\SUBSECT\Downloads\GPT-SoVITS-v2pro-20250604\GPT-SoVITS-v2pro-20250604"
set "PATH=C:\Users\SUBSECT\Downloads\GPT-SoVITS-v2pro-20250604\GPT-SoVITS-v2pro-20250604\runtime;%PATH%"

echo Current directory: %CD%
echo Starting API server with WebSocket support on port 8765...

runtime\python.exe -I api_v3.py

pause