/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

/**
 * Copy required folders to standalone output directory
 * This is required for Next.js standalone builds to serve static assets
 * - public folder: user-uploaded static files
 * - .next/static folder: Next.js generated static assets (fonts, CSS, JS chunks)
 */
const standaloneBase = path.join(__dirname, '..', '.next', 'standalone', 'apps', 'web');

// Check if standalone directory exists
if (!fs.existsSync(path.join(__dirname, '..', '.next', 'standalone'))) {
  console.log('⚠️  Standalone build not found, skipping copy');
  process.exit(0);
}

/**
 * Recursively copy directory
 */
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    // Create destination directory
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    // Copy all files and subdirectories
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      copyRecursive(srcPath, destPath);
    }
  } else {
    // Copy file
    fs.copyFileSync(src, dest);
  }
}

/**
 * Copy a folder if it exists
 */
function copyIfExists(sourcePath, targetPath, name) {
  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  ${name} directory not found, skipping copy`);
    return false;
  }
  
  try {
    console.log(`📁 Copying ${name} to standalone output...`);
    copyRecursive(sourcePath, targetPath);
    console.log(`✅ ${name} copied successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error copying ${name}:`, error);
    return false;
  }
}

// Copy public folder
const publicSource = path.join(__dirname, '..', 'public');
const publicTarget = path.join(standaloneBase, 'public');
copyIfExists(publicSource, publicTarget, 'Public folder');

// Copy .next/static folder (contains fonts, CSS, JS chunks)
const staticSource = path.join(__dirname, '..', '.next', 'static');
const staticTarget = path.join(standaloneBase, '.next', 'static');
const staticCopied = copyIfExists(staticSource, staticTarget, 'Static assets folder');

if (!staticCopied) {
  console.error('❌ Static assets folder is required for standalone builds');
  process.exit(1);
}

// Verify critical static files exist
const chunksDir = path.join(staticTarget, 'chunks');
if (fs.existsSync(chunksDir)) {
  const chunkFiles = fs.readdirSync(chunksDir);
  const jsFiles = chunkFiles.filter(f => f.endsWith('.js'));
  const cssFiles = chunkFiles.filter(f => f.endsWith('.css'));
  console.log(`✅ Verified: ${jsFiles.length} JS chunks, ${cssFiles.length} CSS chunks copied`);
  
  if (jsFiles.length === 0 && cssFiles.length === 0) {
    console.warn('⚠️  Warning: No chunk files found in static/chunks directory');
  }
} else {
  console.warn('⚠️  Warning: chunks directory not found after copy');
}

