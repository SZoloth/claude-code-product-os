const vscode = require('vscode');

function activate(context) {
  let lastPayload = null;

  const handler = {
    handleUri: async (uri) => {
      try {
        const params = new URLSearchParams(uri.query);
        const encoded = params.get('data');
        if (!encoded) {
          throw new Error('Missing data parameter.');
        }

        const json = Buffer.from(encoded, 'base64').toString('utf8');
        const payload = JSON.parse(json);
        lastPayload = payload;

        const message = buildMessage(payload);
        await vscode.commands.executeCommand('composer.createNew', {
          partialState: {
            inputText: message,
            autoSubmit: payload.autoSubmit !== false,
            metadata: {
              origin: 'cursor-web-bridge',
              pageUrl: payload.pageUrl || '',
              selector: payload.selector || ''
            }
          }
        });

        vscode.window.showInformationMessage('Cursor Web Bridge prompt queued.');
      } catch (error) {
        vscode.window.showErrorMessage(`Cursor Web Bridge error: ${error.message}`);
      }
    }
  };

  const disposable = vscode.window.registerUriHandler(handler);
  context.subscriptions.push(disposable);

  const showLast = vscode.commands.registerCommand('cursor-web-bridge.showLastPayload', async () => {
    if (!lastPayload) {
      vscode.window.showInformationMessage('No payload received yet.');
      return;
    }

    const doc = await vscode.workspace.openTextDocument({
      content: JSON.stringify(lastPayload, null, 2),
      language: 'json'
    });
    vscode.window.showTextDocument(doc, { preview: true });
  });

  context.subscriptions.push(showLast);
}

function buildMessage(payload) {
  const lines = [];

  if (payload.userPrompt) {
    lines.push(payload.userPrompt.trim());
  }

  const contextLines = [];
  if (payload.pageUrl) {
    contextLines.push(`Page: ${payload.pageUrl}`);
  }
  if (payload.selector) {
    contextLines.push(`Selector: ${payload.selector}`);
  }
  if (payload.textContent) {
    contextLines.push('Text Content:');
    contextLines.push(payload.textContent);
  }
  if (payload.elementHtml) {
    contextLines.push('HTML Snippet:');
    contextLines.push(payload.elementHtml);
  }

  if (contextLines.length > 0) {
    lines.push('', 'Context from browser:', ...contextLines);
  }

  return lines.join('\n');
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
