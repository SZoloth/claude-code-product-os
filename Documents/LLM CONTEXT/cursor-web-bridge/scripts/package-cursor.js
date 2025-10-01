const { mkdirSync, existsSync, rmSync } = require('fs');
const { join, resolve } = require('path');
const vsce = require('@vscode/vsce');

const root = resolve(__dirname, '..');
const extensionDir = join(root, 'cursor-extension');
const distDir = join(root, 'dist');
const output = join(distDir, 'cursor-web-bridge.vsix');

async function main() {
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }

  if (existsSync(output)) {
    rmSync(output);
  }

  await vsce.createVSIX({ cwd: extensionDir, packagePath: output });
  console.log(`Cursor extension packaged at ${output}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
