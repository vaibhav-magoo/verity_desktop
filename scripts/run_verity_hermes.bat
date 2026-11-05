@echo off
title Verity // Hermes Agent Unified Desktop Studio
cd /d "%~dp0.."
echo ========================================================
echo    Verity 3D Unified Desktop Client for Hermes Agent
echo    Gateway: http://127.0.0.1:8642/v1
echo ========================================================
echo.
echo Make sure your Hermes Gateway is running ('hermes gateway').
echo Starting Verity Studio...
echo.
call .\node_modules\electron\dist\electron.exe .
