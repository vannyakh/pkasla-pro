#!/usr/bin/env node
// Cloudflare Pages deployment wrapper
// This script ensures we use the correct Pages command
const { execSync } = require('child_process');

try {
  console.log('Deploying to Cloudflare Pages...');
  execSync('npx wrangler pages deploy .next', { stdio: 'inherit' });
} catch (error) {
  console.error('Deployment failed:', error.message);
  process.exit(1);
}

