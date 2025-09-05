#!/usr/bin/env node

/**
 * Deploy Privacy Policy to Vercel
 * This script prepares only the privacy policy for Vercel deployment
 * without affecting the Chrome extension code
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

console.log('🚀 Preparing Privacy Policy for Vercel Deployment...\n');

try {
  // Get the project root directory (parent of vercel directory)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '..');
  console.log(`📁 Project root: ${projectRoot}`);
  
  // Create a temporary directory for Vercel deployment
  const vercelDir = path.join(projectRoot, 'vercel-deploy');
  
  // Clean up any existing vercel directory
  if (fs.existsSync(vercelDir)) {
    console.log('🧹 Cleaning existing vercel directory...');
    fs.rmSync(vercelDir, { recursive: true, force: true });
  }
  
  // Create vercel directory
  fs.mkdirSync(vercelDir);
  console.log('✅ Created vercel directory\n');
  
  // Copy only the files needed for Vercel deployment
  console.log('📋 Copying privacy policy files...');
  
  // Copy privacy policy HTML (from project root)
  fs.copyFileSync(path.join(projectRoot, 'privacy-policy.html'), path.join(vercelDir, 'privacy-policy.html'));
  
  // Copy Vercel configuration
  fs.copyFileSync('vercel.json', path.join(vercelDir, 'vercel.json'));
  
  // Copy .vercelignore
  fs.copyFileSync('.vercelignore', path.join(vercelDir, '.vercelignore'));
  
  // Copy package.json for Vercel
  fs.copyFileSync('package-vercel.json', path.join(vercelDir, 'package.json'));
  
  console.log('✅ Files copied successfully\n');
  
  // Change to vercel directory
  process.chdir(vercelDir);
  
  console.log('📦 Installing Vercel CLI...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Vercel CLI might already be installed or installation failed');
  }
  
  console.log('\n🎯 Ready for Vercel deployment!');
  console.log('\n📋 Next steps:');
  console.log('1. Run: vercel login');
  console.log('2. Run: vercel --prod');
  console.log('\nOr deploy manually:');
  console.log('1. Go to https://vercel.com');
  console.log('2. Import this project from GitHub');
  console.log('3. Vercel will automatically deploy the privacy policy');
  
  console.log('\n✅ Privacy policy deployment preparation completed!');
  console.log(`📁 Files ready in: ${path.resolve(vercelDir)}`);
  console.log(`📁 Vercel config files in: ${path.resolve('./vercel')}`);
  
} catch (error) {
  console.error('❌ Error preparing Vercel deployment:', error.message);
  process.exit(1);
}
