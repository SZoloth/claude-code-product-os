# Working Log: Cursor Web Bridge

## Current Session: 2025-10-02

### Questions Explored
- What packaging steps are required so the Chrome and Cursor extensions persist without manual reloads?
- How should the bridge communicate configuration (deeplink, prompt URL, secrets) to the browser script?

### Insights Generated
- Added root npm project with packaging scripts, producing reusable `browser-extension.zip` and `cursor-web-bridge.vsix` artifacts.
- Bridge server now exposes `/config.json`, letting the extension refresh connection details without hardcoding URLs.

### Connections Made
- The installation scripts align with existing CLI tooling (`cursor`, `code`) for consistent setup across devices.

### Need to Explore Further
- Add a lightweight result log so we can inspect which prompts were fired and their status.
- Decide whether to automate element-context collection beyond manual hotkeys.

---

## Previous Sessions
