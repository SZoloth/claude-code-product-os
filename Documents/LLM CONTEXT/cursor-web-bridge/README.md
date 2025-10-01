# Cursor Web Bridge

Browser-to-Cursor workflow that lets you select an element on a local web page, describe a change, and send the context-rich prompt directly into Cursor.

## Structure

- `browser-extension/` – Manifest v3 extension that injects the selector overlay. Use `Ctrl+Shift+L` to toggle selection and submit prompts.
- `bridge-server/` – Local Express server that validates payloads and opens the custom Cursor deeplink.
- `cursor-extension/` – Cursor extension that decodes deeplinks and auto-submits the composer prompt.

## Prerequisites

- Node.js 18+
- `zip` CLI (for packaging the Chrome extension)
- Cursor desktop app (`cursor` CLI installed) or VS Code (`code` CLI)

Run once:

```bash
npm install
```

This bootstraps the bridge server dependencies and the packaging utilities.

## Packaging & Install Commands

- `npm run package:browser` – Creates `dist/browser-extension.zip` ready for Chrome.
- `npm run package:cursor` – Produces `dist/cursor-web-bridge.vsix` for Cursor/VS Code.
- `npm run install:cursor` – Installs the VSIX via `cursor` CLI (falls back to `code`).

The `dist/` folder contains the artifacts that persist across restarts.

## Setup

1. **Bridge server**
   ```bash
   cd cursor-web-bridge/bridge-server
   npm install
   npm start
   ```
   Optional: set `PORT`, `CURSOR_DEEPLINK`, or `BRIDGE_SECRET` env vars before `npm start`.

2. **Cursor extension**
   - In Cursor, open the Extensions view.
   - Choose “Install from disk” and pick `cursor-web-bridge/cursor-extension`.

3. **Browser extension**
   - After packaging, open `chrome://extensions`, enable “Developer mode”, then **Load unpacked** and select the unzipped folder *or* use “Pack extension” with `dist/browser-extension.zip`.

## Usage

1. Run the bridge server.
1. Start the bridge server (`npm run dev` from repo root or `npm start` inside `bridge-server`).
2. Open Cursor—ensure the “Cursor Web Bridge” extension is enabled.
3. In Chrome, browse to any app (localhost, Vercel preview, prod, etc.).
4. Press `Ctrl+Shift+L` to enter selection mode, hover to highlight the desired element, then click it.
5. When the prompt dialog appears, describe the change you want. The extension sends the context plus your prompt to the bridge.
6. Cursor opens a new Composer with the message queued and auto-submitted (unless you’ve disabled `autoSubmit`).

### Important scope note
- The browser overlay can run on any site, but Cursor can only modify files that exist in your local workspace. For remote-only deployments (e.g., Vercel preview without the repo locally), Cursor will still provide suggestions, yet you must apply them manually.
If you set `BRIDGE_SECRET`, configure the header in `background.js` or your injected script.
