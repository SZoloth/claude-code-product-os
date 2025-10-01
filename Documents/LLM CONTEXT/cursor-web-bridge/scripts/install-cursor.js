const { existsSync } = require('fs');
const { join, resolve } = require('path');
const { spawnSync } = require('child_process');

const root = resolve(__dirname, '..');
const vsixPath = join(root, 'dist', 'cursor-web-bridge.vsix');

if (!existsSync(vsixPath)) {
  console.error('VSIX not found. Run `npm run package:cursor` first.');
  process.exit(1);
}

function tryInstall(command) {
  const result = spawnSync(command, ['--install-extension', vsixPath], {
    stdio: 'inherit'
  });
  return result.status === 0;
}

if (tryInstall('cursor')) {
  process.exit(0);
}

console.warn('Cursor CLI not found or install failed. Trying VS Code CLI (`code`).');

if (tryInstall('code')) {
  process.exit(0);
}

console.error('Failed to install extension. Ensure `cursor` or `code` CLI is available in PATH.');
process.exit(1);
