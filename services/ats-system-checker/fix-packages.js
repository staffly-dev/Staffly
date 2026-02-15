#!/usr/bin/env node
// Cross-platform wrapper for fix-packages.ps1
// Only runs on Windows where PowerShell is available

const { execSync } = require('child_process');
const os = require('os');

if (os.platform() === 'win32') {
  try {
    execSync('powershell -ExecutionPolicy Bypass -File ./fix-packages.ps1', {
      stdio: 'inherit',
      shell: true
    });
  } catch (error) {
    console.log('Warning: Could not run fix-packages.ps1:', error.message);
    process.exit(0); // Don't fail the build if this script fails
  }
} else {
  console.log('Skipping package fix (Windows-only, not needed on Linux)');
  process.exit(0);
}

