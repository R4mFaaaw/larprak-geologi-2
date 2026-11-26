@echo off
title GeoStruktur Studio - Riana Amelia
echo Memulai server lokal GeoStruktur Studio...
start "" "http://127.0.0.1:8080"
python "%~dp0server.py"
pause
