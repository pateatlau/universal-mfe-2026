/**
 * Setup symlinks for hoisted dependencies in Yarn workspaces monorepo.
 *
 * React Native's build system expects dependencies to be in the package's
 * node_modules folder, but Yarn workspaces hoists them to the root.
 * This script creates symlinks to make the hoisted packages accessible.
 */

const fs = require('fs');
const path = require('path');

const packageDir = path.resolve(__dirname, '..');
const nodeModulesDir = path.join(packageDir, 'node_modules');
const rootNodeModules = path.resolve(packageDir, '..', '..', 'node_modules');

// Ensure node_modules directory exists
if (!fs.existsSync(nodeModulesDir)) {
  fs.mkdirSync(nodeModulesDir, { recursive: true });
}

// Packages that need symlinks for React Native builds
const symlinks = [
  { name: 'react-native', target: path.join(rootNodeModules, 'react-native') },
  { name: '@react-native', target: path.join(rootNodeModules, '@react-native') },
  { name: '@callstack', target: path.join(rootNodeModules, '@callstack') },
];

for (const { name, target } of symlinks) {
  const linkPath = path.join(nodeModulesDir, name);

  // Check if target exists
  if (!fs.existsSync(target)) {
    console.log(`Skipping ${name}: target does not exist at ${target}`);
    continue;
  }

  // Remove existing symlink or directory
  if (fs.existsSync(linkPath)) {
    const stat = fs.lstatSync(linkPath);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(linkPath);
    } else {
      console.log(`Skipping ${name}: not a symlink`);
      continue;
    }
  }

  // Create symlink
  const relativePath = path.relative(nodeModulesDir, target);
  fs.symlinkSync(relativePath, linkPath);
  console.log(`Created symlink: ${name} -> ${relativePath}`);
}

console.log('Symlinks setup complete.');
