@echo off
title Verity // Hermes Agent Floating 3D Companion Sphere
cd /d "%~dp0.."
echo ========================================================
echo    Verity 3D Floating Companion Sphere for Hermes Agent
echo    Mode: Always-on-Top Floating Desktop Overlay
echo    Gateway: http://127.0.0.1:8642/v1
echo ========================================================
echo.
echo Make sure your Hermes Gateway is running ('hermes gateway').
echo Launching Always-On-Top Floating Sphere...
echo.
call .\node_modules\electron\dist\electron.exe . --overlay
