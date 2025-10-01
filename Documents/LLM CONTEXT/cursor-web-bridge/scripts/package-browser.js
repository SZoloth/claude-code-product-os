const { mkdirSync, existsSync, rmSync } = require('fs');
const { join, resolve } = require('path');
const { spawnSync } = require('child_process');

const root = resolve(__dirname, '..');
const sourceDir = join(root, 'browser-extension');
const distDir = join(root, 'dist');
const output = join(distDir, 'browser-extension.zip');

function ensureDist() {
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }
  if (existsSync(output)) {
    rmSync(output);
  }
}

function createZip() {
  const result = spawnSync('zip', ['-r', output, '.'], {
    cwd: sourceDir,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    throw new Error('Failed to create browser extension zip. Ensure the `zip` CLI is available.');
  }
}

try {
  ensureDist();
  createZip();
  console.log(`Browser extension package created at ${output}`);
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
