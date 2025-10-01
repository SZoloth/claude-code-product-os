(function () {
  const state = {
    selecting: false,
    highlight: null,
    info: null,
    lastTarget: null,
    toast: null,
    toastTimeout: null
  };

  const KEY_CODE = 'KeyL';

  document.addEventListener('keydown', handleKeyDown, true);

  function handleKeyDown(event) {
    if (event.code === KEY_CODE && event.ctrlKey && event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      state.selecting ? stopSelection('toggle') : startSelection();
      return;
    }

    if (state.selecting && event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      stopSelection('cancel');
      showToast('Selection cancelled.');
    }
  }

  function startSelection() {
    if (state.selecting) {
      return;
    }

    state.selecting = true;
    attachHighlight();
    document.addEventListener('mousemove', handlePointerMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('scroll', updateHighlight, true);
    showToast('Cursor bridge: click an element, or press Esc to cancel.');
  }

  function stopSelection(reason) {
    if (!state.selecting) {
      return;
    }

    state.selecting = false;
    document.removeEventListener('mousemove', handlePointerMove, true);
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('scroll', updateHighlight, true);
    removeHighlight();
    if (reason !== 'submit') {
      state.lastTarget = null;
    }
  }

  function attachHighlight() {
    if (!state.highlight) {
      const highlight = document.createElement('div');
      highlight.style.position = 'fixed';
      highlight.style.zIndex = '2147483646';
      highlight.style.pointerEvents = 'none';
      highlight.style.border = '2px solid #2563eb';
      highlight.style.background = 'rgba(37, 99, 235, 0.15)';
      highlight.style.borderRadius = '6px';
      highlight.style.transition = 'transform 80ms ease-out, width 80ms ease-out, height 80ms ease-out';
      highlight.style.boxSizing = 'border-box';
      state.highlight = highlight;
      document.documentElement.appendChild(highlight);
    }

    if (!state.info) {
      const info = document.createElement('div');
      info.style.position = 'fixed';
      info.style.zIndex = '2147483647';
      info.style.pointerEvents = 'none';
      info.style.padding = '4px 6px';
      info.style.background = '#111827';
      info.style.color = '#f9fafb';
      info.style.fontSize = '12px';
      info.style.fontFamily = 'system-ui, sans-serif';
      info.style.borderRadius = '4px';
      info.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.4)';
      info.style.transition = 'transform 80ms ease-out';
      state.info = info;
      document.documentElement.appendChild(info);
    }
  }

  function removeHighlight() {
    if (state.highlight && state.highlight.parentNode) {
      state.highlight.parentNode.removeChild(state.highlight);
    }
    if (state.info && state.info.parentNode) {
      state.info.parentNode.removeChild(state.info);
    }
    state.highlight = null;
    state.info = null;
    state.lastTarget = null;
  }

  function handlePointerMove(event) {
    if (!state.selecting) {
      return;
    }

    const target = event.target;
    if (!target || target === document.documentElement || target === document.body) {
      return;
    }

    state.lastTarget = target;
    updateHighlight();
  }

  function updateHighlight() {
    if (!state.selecting || !state.lastTarget || !state.highlight || !state.info) {
      return;
    }

    const rect = state.lastTarget.getBoundingClientRect();
    state.highlight.style.transform = `translate(${Math.round(rect.left)}px, ${Math.round(rect.top)}px)`;
    state.highlight.style.width = `${Math.round(rect.width)}px`;
    state.highlight.style.height = `${Math.round(rect.height)}px`;

    const label = buildLabel(state.lastTarget);
    state.info.textContent = label;

    const infoRect = state.info.getBoundingClientRect();
    let infoX = rect.left;
    let infoY = rect.top - infoRect.height - 6;

    if (infoY < 8) {
      infoY = rect.bottom + 6;
    }
    if (infoX + infoRect.width > window.innerWidth - 8) {
      infoX = window.innerWidth - infoRect.width - 8;
    }
    if (infoX < 8) {
      infoX = 8;
    }

    state.info.style.transform = `translate(${Math.round(infoX)}px, ${Math.round(infoY)}px)`;
  }

  function handleClick(event) {
    if (!state.selecting) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const target = event.target;
    stopSelection('submit');

    const prompt = window.prompt('Describe the change you want Cursor to make:', '');
    if (!prompt) {
      showToast('Prompt cancelled.');
      return;
    }

    const context = collectContext(target);
    const payload = { ...context, userPrompt: prompt.trim() };

    chrome.runtime.sendMessage({ type: 'SEND_PROMPT', payload }, (response) => {
      if (!response) {
        showToast('No response from bridge.');
        return;
      }

      if (response.ok) {
        showToast('Prompt sent to Cursor.');
      } else {
        const detail = response.error || (response.data && response.data.error) || 'Unknown error.';
        showToast(`Bridge error: ${detail}`);
      }
    });
  }

  function collectContext(target) {
    const rect = target.getBoundingClientRect();
    const html = (target.outerHTML || '').trim();
    const textContent = (target.textContent || '').trim();
    const snippetLimit = 8000;
    const textLimit = 1000;

    return {
      pageUrl: window.location.href,
      title: document.title,
      selector: buildSelector(target),
      elementHtml: html.length > snippetLimit ? `${html.slice(0, snippetLimit)}…` : html,
      textContent: textContent.length > textLimit ? `${textContent.slice(0, textLimit)}…` : textContent,
      boundingBox: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      },
      timestamp: new Date().toISOString()
    };
  }

  function buildSelector(element) {
    if (!element || element === document.body) {
      return 'body';
    }

    const path = [];
    let current = element;

    while (current && current !== document.documentElement) {
      let selector = current.nodeName.toLowerCase();
      if (current.id) {
        selector += `#${CSS.escape(current.id)}`;
        path.unshift(selector);
        break;
      }

      const classList = Array.from(current.classList || []).slice(0, 3);
      if (classList.length > 0) {
        selector += '.' + classList.map((cls) => CSS.escape(cls)).join('.');
      }

      const siblings = current.parentElement ? Array.from(current.parentElement.children) : [];
      if (siblings.length > 1) {
        const sameTagSiblings = siblings.filter((sibling) => sibling.nodeName === current.nodeName);
        if (sameTagSiblings.length > 1) {
          const index = sameTagSiblings.indexOf(current) + 1;
          selector += `:nth-of-type(${index})`;
        }
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }

  function buildLabel(element) {
    if (!element) {
      return '';
    }
    const tag = element.tagName ? element.tagName.toLowerCase() : 'element';
    const id = element.id ? `#${element.id}` : '';
    const className = element.classList && element.classList.length
      ? '.' + Array.from(element.classList).slice(0, 2).join('.')
      : '';
    return `${tag}${id}${className}`;
  }

  function showToast(message) {
    if (!message) {
      return;
    }

    if (!state.toast) {
      const toast = document.createElement('div');
      toast.style.position = 'fixed';
      toast.style.bottom = '24px';
      toast.style.right = '24px';
      toast.style.padding = '10px 12px';
      toast.style.background = '#2563eb';
      toast.style.color = '#f9fafb';
      toast.style.fontSize = '13px';
      toast.style.fontFamily = 'system-ui, sans-serif';
      toast.style.borderRadius = '6px';
      toast.style.boxShadow = '0 8px 24px rgba(30, 64, 175, 0.25)';
      toast.style.zIndex = '2147483647';
      toast.style.maxWidth = '320px';
      toast.style.lineHeight = '1.4';
      state.toast = toast;
      document.documentElement.appendChild(toast);
    }

    state.toast.textContent = message;

    if (state.toastTimeout) {
      clearTimeout(state.toastTimeout);
    }

    state.toastTimeout = setTimeout(() => {
      if (state.toast && state.toast.parentNode) {
        state.toast.parentNode.removeChild(state.toast);
      }
      state.toast = null;
      state.toastTimeout = null;
    }, 2600);
  }
})();
