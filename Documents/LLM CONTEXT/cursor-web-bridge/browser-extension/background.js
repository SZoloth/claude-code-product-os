const CONFIG_URL = 'http://localhost:5602/config.json';
let bridgeConfig = {
  promptUrl: 'http://localhost:5602/prompt',
  secret: null
};

async function refreshConfig() {
  try {
    const res = await fetch(CONFIG_URL, { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    if (data?.promptUrl) bridgeConfig.promptUrl = data.promptUrl;
  } catch (_err) {
    // ignore
  }
}

refreshConfig();
setInterval(refreshConfig, 60_000);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== 'SEND_PROMPT') {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  fetch(bridgeConfig.promptUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(bridgeConfig.secret ? { 'x-bridge-secret': bridgeConfig.secret } : {})
    },
    body: JSON.stringify(message.payload),
    signal: controller.signal
  })
    .then(async (res) => {
      clearTimeout(timeout);
      const data = await safeJson(res);
      sendResponse({ ok: res.ok, data });
    })
    .catch((error) => {
      clearTimeout(timeout);
      sendResponse({ ok: false, error: error.message });
    });

  return true;
});

async function safeJson(response) {
  try {
    return await response.json();
  } catch (_err) {
    return null;
  }
}
