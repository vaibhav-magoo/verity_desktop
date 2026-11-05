@echo off
title Verity 3D Character Studio
cd /d "%~dp0.."
echo ========================================================
echo       Launching Verity 3D Character Studio & Brain
echo ========================================================
call .\node_modules\electron\dist\electron.exe .
