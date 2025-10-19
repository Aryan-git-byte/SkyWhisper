#!/usr/bin/env node

/**
 * Render.com startup script (ES Module version)
 * 
 * This script handles the startup sequence for Render deployment:
 * 1. Starts the Inngest server in the background
 * 2. Waits for it to be ready
 * 3. Starts the main Mastra application
 */

import { spawn } from 'child_process';
import http from 'http';

const INNGEST_PORT = 3000;
const APP_PORT = 5000;

function log(message) {
  console.log(`[Render Startup] ${message}`);
}

function waitForPort(port, maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkPort = () => {
      attempts++;
      
      const req = http.get(`http://localhost:${port}`, (res) => {
        log(`✅ Port ${port} is ready (status: ${res.statusCode})`);
        resolve();
      });
      
      req.on('error', () => {
        if (attempts >= maxAttempts) {
          reject(new Error(`Port ${port} failed to respond after ${maxAttempts} attempts`));
        } else {
          if (attempts % 5 === 0) {
            log(`⏳ Still waiting for port ${port}... (attempt ${attempts}/${maxAttempts})`);
          }
          setTimeout(checkPort, 2000);
        }
      });
      
      req.end();
    };
    
    checkPort();
  });
}

async function main() {
  log('🚀 Starting deployment...');
  
  // Start Inngest server
  log('📊 Starting Inngest server...');
  const inngest = spawn('npx', [
    'inngest-cli',
    'dev',
    '-u',
    `http://localhost:${APP_PORT}/api/inngest`,
    '--host',
    '0.0.0.0',
    '--port',
    String(INNGEST_PORT),
    '--no-discovery',
    '--no-poll'
  ], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });
  
  inngest.on('error', (error) => {
    log(`❌ Inngest server error: ${error}`);
    process.exit(1);
  });
  
  // Wait for Inngest to be ready
  log('⏳ Waiting for Inngest server...');
  try {
    await waitForPort(INNGEST_PORT);
  } catch (error) {
    log(`❌ ${error.message}`);
    process.exit(1);
  }
  
  // Start main application
  log('🤖 Starting main application...');
  const app = spawn('node', [
    '--import=./.mastra/output/instrumentation.mjs',
    '.mastra/output/index.mjs'
  ], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });
  
  app.on('error', (error) => {
    log(`❌ Application error: ${error}`);
    process.exit(1);
  });
  
  app.on('exit', (code) => {
    log(`❌ Application exited with code ${code}`);
    inngest.kill();
    process.exit(code || 1);
  });
  
  // Handle shutdown gracefully
  process.on('SIGTERM', () => {
    log('🛑 Received SIGTERM, shutting down...');
    app.kill();
    inngest.kill();
  });
  
  process.on('SIGINT', () => {
    log('🛑 Received SIGINT, shutting down...');
    app.kill();
    inngest.kill();
  });
  
  log('✅ All services started successfully');
}

main().catch((error) => {
  log(`❌ Fatal error: ${error}`);
  process.exit(1);
});
