#!/usr/bin/env node

/**
 * VERITY 3D // Unified Desktop Client for Hermes Agent
 * ====================================================
 * Entry point for launching Verity as the official 3D embodied interaction layer
 * on top of Nous Research's Hermes Agent.
 * 
 * Usage:
 *   npx verity-hermes [--overlay] [--gateway <url>] [--model <name>]
 *   node bin/verity-hermes.js --overlay
 */

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const args = process.argv.slice(2);

// Parse flags
let gatewayUrl = 'http://127.0.0.1:8642/v1';
let modelName = 'nousresearch/hermes-3-llama-3.1-8b';
let isOverlay = false;
let port = 4777;
let apiKey = process.env.HERMES_API_KEY || '';
let cfId = process.env.CF_ACCESS_CLIENT_ID || '';
let cfSecret = process.env.CF_ACCESS_CLIENT_SECRET || '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--overlay' || args[i] === '-o') {
    isOverlay = true;
  } else if ((args[i] === '--gateway' || args[i] === '-g') && args[i + 1]) {
    gatewayUrl = args[++i];
  } else if ((args[i] === '--model' || args[i] === '-m') && args[i + 1]) {
    modelName = args[++i];
  } else if ((args[i] === '--port' || args[i] === '-p') && args[i + 1]) {
    port = parseInt(args[++i], 10);
  } else if ((args[i] === '--api-key' || args[i] === '-k') && args[i + 1]) {
    apiKey = args[++i];
  } else if (args[i] === '--cf-id' && args[i + 1]) {
    cfId = args[++i];
  } else if (args[i] === '--cf-secret' && args[i + 1]) {
    cfSecret = args[++i];
  }
}

process.env.HERMES_GATEWAY_URL = gatewayUrl;
process.env.HERMES_MODEL = modelName;
process.env.VERITY_PORT = String(port);
if (apiKey) process.env.HERMES_API_KEY = apiKey;
if (cfId) process.env.CF_ACCESS_CLIENT_ID = cfId;
if (cfSecret) process.env.CF_ACCESS_CLIENT_SECRET = cfSecret;

const rootDir = path.resolve(__dirname, '..');
console.log('===============================================================');
console.log('   VERITY 3D // HERMES AGENT UNIFIED DESKTOP CLIENT');
console.log('===============================================================');
console.log(`[Config] Hermes Gateway: ${gatewayUrl}`);
console.log(`[Config] Default Model : ${modelName}`);
console.log(`[Config] Mode          : ${isOverlay ? 'Floating Desktop Sphere (Overlay)' : 'Full Studio UI'}`);
console.log(`[Config] Server Port   : ${port}`);
console.log('---------------------------------------------------------------\n');

// Find Electron binary
const electronPath = path.join(rootDir, 'node_modules', 'electron', 'dist', 'electron.exe');
const electronFallback = 'electron';

const electronArgs = [rootDir];
if (isOverlay) {
  electronArgs.push('--overlay');
}

const exeToRun = fs.existsSync(electronPath) ? electronPath : electronFallback;

console.log(`Starting Verity Companion via ${exeToRun}...`);
const child = spawn(exeToRun, electronArgs, {
  cwd: rootDir,
  stdio: 'inherit',
  env: process.env
});

child.on('error', (err) => {
  console.error('[Launch Error]: Could not spawn Electron desktop client.', err.message);
  console.log('Fallback: Starting local web studio server...');
  require('../launch.js');
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
