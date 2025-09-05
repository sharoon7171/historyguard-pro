#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building and Packaging Block History Extension...\n');

try {
  // Check if node_modules exists
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed\n');
  }

  // Clean dist directory
  if (fs.existsSync('dist')) {
    console.log('🧹 Cleaning dist directory...');
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('✅ Dist directory cleaned\n');
  }

  // Run webpack build
  console.log('🔨 Building with webpack...');
  execSync('npx webpack --mode production', { stdio: 'inherit' });
  console.log('✅ Webpack build completed\n');

  // Verify build output
  const distFiles = fs.readdirSync('dist');
  const requiredFiles = [
    'manifest.json',
    'popup',
    'background',
    'assets'
  ];

  const missingFiles = requiredFiles.filter(file => {
    if (file === 'assets' || file === 'popup' || file === 'background') {
      return !fs.existsSync(path.join('dist', file));
    }
    return !distFiles.includes(file);
  });

  if (missingFiles.length > 0) {
    throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
  }

  // Get build info
  const manifest = JSON.parse(fs.readFileSync('dist/manifest.json', 'utf8'));
  const stats = fs.statSync('dist');
  
  console.log('📊 Build Summary:');
  console.log(`   Extension: ${manifest.name} v${manifest.version}`);
  console.log(`   Files: ${distFiles.length}`);
  console.log(`   Size: ${(getDirSize('dist') / 1024).toFixed(2)} KB`);
  console.log(`   Built: ${new Date().toLocaleString()}\n`);

  console.log('✅ Build completed successfully!');
  console.log('📦 Creating package...');
  
  // PACKAGING SECTION (merged from package.mjs)
  const version = manifest.version;
  const name = manifest.name.toLowerCase().replace(/\s+/g, '-');
  
  // Create packages directory
  const packagesDir = 'packages';
  if (!fs.existsSync(packagesDir)) {
    fs.mkdirSync(packagesDir);
  }

  // Create zip filename
  const zipName = `${name}-v${version}.zip`;
  const zipPath = path.join(packagesDir, zipName);

  // Remove existing zip if it exists
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  // Create zip using system zip command
  console.log('🗜️  Creating zip package...');
  execSync(`cd dist && zip -r ../${zipPath} .`, { stdio: 'inherit' });
  
  // Verify zip was created
  if (!fs.existsSync(zipPath)) {
    throw new Error('Failed to create zip package');
  }

  // Get package info
  const zipStats = fs.statSync(zipPath);
  const sizeKB = (zipStats.size / 1024).toFixed(2);
  const sizeMB = (zipStats.size / (1024 * 1024)).toFixed(2);

  console.log('\n📊 Package Summary:');
  console.log(`   Name: ${zipName}`);
  console.log(`   Size: ${sizeKB} KB (${sizeMB} MB)`);
  console.log(`   Location: ${zipPath}`);
  console.log(`   Created: ${new Date().toLocaleString()}`);

  // Check Chrome Web Store limits
  const maxSizeMB = 128;
  if (zipStats.size > maxSizeMB * 1024 * 1024) {
    console.log(`\n⚠️  Warning: Package size exceeds Chrome Web Store limit (${maxSizeMB}MB)`);
  } else {
    console.log(`\n✅ Package size within Chrome Web Store limits`);
  }
  
  // Clean up dist directory after packaging
  console.log('\n🧹 Cleaning up dist directory...');
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('✅ Dist directory cleaned');
  
  console.log(`\n✅ Extension packaged successfully!`);
  console.log(`📁 Package: ${zipPath}`);

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

function getDirSize(dirPath) {
  let size = 0;
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      size += getDirSize(filePath);
    } else {
      size += stats.size;
    }
  }
  
  return size;
}
