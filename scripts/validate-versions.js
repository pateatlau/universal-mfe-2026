#!/usr/bin/env node

/**
 * Version Validation Script
 *
 * Validates that the project follows version management best practices:
 * 1. No ^ or ~ in dependencies (exact versions required)
 * 2. Node.js version matches .nvmrc
 * 3. Yarn version matches packageManager field
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
let hasErrors = false;

function error(message) {
  console.error(`❌ ${message}`);
  hasErrors = true;
}

function success(message) {
  console.log(`✅ ${message}`);
}

function warn(message) {
  console.warn(`⚠️  ${message}`);
}

/**
 * Check that all dependencies use exact versions (no ^ or ~)
 */
function checkExactVersions() {
  console.log('\n📦 Checking for exact dependency versions...\n');

  const packageJsonFiles = [
    'package.json',
    'packages/web-shell/package.json',
    'packages/web-remote-hello/package.json',
    'packages/mobile-host/package.json',
    'packages/mobile-remote-hello/package.json',
    'packages/shared-utils/package.json',
    'packages/shared-hello-ui/package.json',
  ];

  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies'];
  let totalChecked = 0;
  let rangeVersions = [];

  // Workspace packages that are allowed to use "*" for internal deps
  const workspacePackages = ['@universal/'];

  for (const file of packageJsonFiles) {
    const filePath = path.join(ROOT_DIR, file);
    if (!fs.existsSync(filePath)) {
      warn(`File not found: ${file}`);
      continue;
    }

    const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const depType of depTypes) {
      const deps = pkg[depType] || {};
      for (const [name, version] of Object.entries(deps)) {
        // Skip internal workspace dependencies (they use "*" or "workspace:*")
        const isWorkspaceDep = workspacePackages.some(prefix => name.startsWith(prefix));
        if (isWorkspaceDep && (version === '*' || version.startsWith('workspace:'))) {
          continue;
        }

        totalChecked++;
        // Check for ^ or ~ prefix (version ranges)
        if (version.startsWith('^') || version.startsWith('~')) {
          rangeVersions.push({ file, depType, name, version });
        }
        // Also check for other range patterns like >= or *
        if (version.includes('>=') || version.includes('<=') || version === '*' || version.includes(' ')) {
          rangeVersions.push({ file, depType, name, version });
        }
      }
    }
  }

  if (rangeVersions.length > 0) {
    error(`Found ${rangeVersions.length} dependencies with version ranges:`);
    for (const { file, depType, name, version } of rangeVersions) {
      console.error(`   ${file} → ${depType}.${name}: "${version}"`);
    }
  } else {
    success(`All ${totalChecked} dependencies use exact versions`);
  }
}

/**
 * Check that Node.js version matches .nvmrc
 */
function checkNodeVersion() {
  console.log('\n🟢 Checking Node.js version...\n');

  const nvmrcPath = path.join(ROOT_DIR, '.nvmrc');
  if (!fs.existsSync(nvmrcPath)) {
    error('.nvmrc file not found');
    return;
  }

  const expectedVersion = fs.readFileSync(nvmrcPath, 'utf8').trim();
  const actualVersion = process.version.replace('v', '');

  if (actualVersion === expectedVersion) {
    success(`Node.js version matches .nvmrc (${expectedVersion})`);
  } else {
    error(`Node.js version mismatch: running ${actualVersion}, expected ${expectedVersion} (from .nvmrc)`);
  }
}

/**
 * Check that Yarn version matches packageManager field
 */
function checkYarnVersion() {
  console.log('\n🧶 Checking Yarn version...\n');

  const pkgPath = path.join(ROOT_DIR, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  if (!pkg.packageManager) {
    error('packageManager field not found in root package.json');
    return;
  }

  const match = pkg.packageManager.match(/yarn@(\d+\.\d+\.\d+)/);
  if (!match) {
    error(`Invalid packageManager format: ${pkg.packageManager}`);
    return;
  }

  const expectedVersion = match[1];

  try {
    const { execSync } = require('child_process');
    const actualVersion = execSync('yarn --version', { encoding: 'utf8' }).trim();

    if (actualVersion === expectedVersion) {
      success(`Yarn version matches packageManager (${expectedVersion})`);
    } else {
      error(`Yarn version mismatch: running ${actualVersion}, expected ${expectedVersion} (from packageManager)`);
    }
  } catch (err) {
    error(`Failed to check Yarn version: ${err.message}`);
  }
}

// Run all checks
console.log('='.repeat(60));
console.log('  Version Validation');
console.log('='.repeat(60));

checkExactVersions();
checkNodeVersion();
checkYarnVersion();

console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('  ❌ Validation FAILED');
  console.log('='.repeat(60) + '\n');
  process.exit(1);
} else {
  console.log('  ✅ Validation PASSED');
  console.log('='.repeat(60) + '\n');
  process.exit(0);
}
