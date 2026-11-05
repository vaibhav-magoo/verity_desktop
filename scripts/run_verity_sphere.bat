@echo off
title Verity 3D Floating Desktop Sphere
cd /d "%~dp0.."
echo ========================================================
echo    Launching Verity 3D Always-On-Top Desktop Sphere
echo ========================================================
call .\node_modules\electron\dist\electron.exe . --overlay
