#!/usr/bin/env node

/**
 * Render.com startup script - Start app FIRST, then Inngest
 */

import { spawn } from 'child_process';
import http from 'http';

const APP_PORT = parseInt(process.env.PORT || "10000");
const INNGEST_PORT = 3000;

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
  log(`📍 APP_PORT=${APP_PORT}, INNGEST_PORT=${INNGEST_PORT}`);
  
  // Start main application FIRST (so Render detects the correct port)
  log('🤖 Starting main application on port ' + APP_PORT);
  const app = spawn('node', [
    '--import=./.mastra/output/instrumentation.mjs',
    '.mastra/output/index.mjs'
  ], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(APP_PORT),
    },
  });
  
  app.on('error', (error) => {
    log(`❌ Application error: ${error}`);
    process.exit(1);
  });
  
  app.on('exit', (code) => {
    log(`❌ Application exited with code ${code}`);
    process.exit(code || 1);
  });
  
  // Wait for main app to be ready
  log('⏳ Waiting for main application...');
  try {
    await waitForPort(APP_PORT);
  } catch (error) {
    log(`❌ ${error.message}`);
    process.exit(1);
  }
  
  // Now start Inngest server (pointing to the main app)
  log('📊 Starting Inngest server on port ' + INNGEST_PORT);
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
    app.kill();
    process.exit(1);
  });
  
  inngest.on('exit', (code) => {
    log(`❌ Inngest exited with code ${code}`);
    app.kill();
    process.exit(code || 1);
  });
  
  // Handle shutdown gracefully
  process.on('SIGTERM', () => {
    log('🛑 Received SIGTERM, shutting down...');
    inngest.kill();
    app.kill();
  });
  
  process.on('SIGINT', () => {
    log('🛑 Received SIGINT, shutting down...');
    inngest.kill();
    app.kill();
  });
  
  log('✅ All services started successfully');
  log(`📡 Telegram webhooks should go to: http://0.0.0.0:${APP_PORT}/webhooks/telegram/action`);
}

main().catch((error) => {
  log(`❌ Fatal error: ${error}`);
  process.exit(1);
});
