// Content script
// Applies direction changes to the ChatGPT page

(() => {
  'use strict';
  const KEY = 'mode';

  function apply(mode) {
    const html = document.documentElement, body = document.body;
    if (!html || !body) return;

    // Reset any previous settings
    html.classList.remove('chatgpt-rtl-on', 'chatgpt-ltr-on');
    ['dir'].forEach(attr => {
      if (html.hasAttribute(attr)) html.removeAttribute(attr);
      if (body.hasAttribute(attr)) body.removeAttribute(attr);
    });

    // Apply based on mode
    if (mode === 'rtl') {
      html.setAttribute('dir', 'rtl');
      body.setAttribute('dir', 'rtl');
      html.classList.add('chatgpt-rtl-on');
    } else if (mode === 'ltr') {
      html.setAttribute('dir', 'ltr');
      body.setAttribute('dir', 'ltr');
      html.classList.add('chatgpt-ltr-on');
    }
    // off → no changes (default site)
  }

  function init() {
    chrome.storage.sync.get(KEY, r => apply(r[KEY] || 'off'));
    chrome.runtime.onMessage.addListener(msg => {
      if (msg?.type === 'APPLY_MODE') apply(msg.mode);
    });
    chrome.storage.onChanged.addListener(ch => {
      if (KEY in ch) apply(ch[KEY].newValue || 'off');
    });
  }

  (document.readyState === 'loading')
    ? document.addEventListener('DOMContentLoaded', init, { once: true })
    : init();
})();
