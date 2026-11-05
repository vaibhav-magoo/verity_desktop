#!/usr/bin/env bash
# Verity 3D // Hermes Agent Unified Desktop Client Launcher
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/.."

echo "========================================================"
echo "   Verity 3D Unified Desktop Client for Hermes Agent"
echo "   Gateway: http://127.0.0.1:8642/v1"
echo "========================================================"

if [ "$1" == "--overlay" ] || [ "$1" == "-o" ]; then
    npx electron . --overlay
else
    npx electron .
fi
