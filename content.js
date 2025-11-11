// Content script
// Applies direction changes to the websites page

(() => {
  'use strict';

  // Extract domain from current page URL
  function getDomain() {
    try {
      return new URL(window.location.href).hostname;
    } catch (e) {
      return "unknown";
    }
  }

  // Get storage key for this domain
  function getStorageKey() {
    return `mode_${getDomain()}`;
  }

  function apply(mode) {
    const html = document.documentElement, body = document.body;
    if (!html || !body) return;

    // Reset any previous settings
    html.classList.remove('rtl-on', 'ltr-on');
    ['dir'].forEach(attr => {
      if (html.hasAttribute(attr)) html.removeAttribute(attr);
      if (body.hasAttribute(attr)) body.removeAttribute(attr);
    });

    // Apply based on mode
    if (mode === 'rtl') {
      html.setAttribute('dir', 'rtl');
      body.setAttribute('dir', 'rtl');
      html.classList.add('rtl-on');
    } else if (mode === 'ltr') {
      html.setAttribute('dir', 'ltr');
      body.setAttribute('dir', 'ltr');
      html.classList.add('ltr-on');
    }
    // OFF mode - no direction changes (default site behavior)
  }

  function init() {
    const key = getStorageKey();
    chrome.storage.sync.get(key, r => apply(r[key] || 'off'));
    
    chrome.runtime.onMessage.addListener(msg => {
      if (msg?.type === 'APPLY_MODE') apply(msg.mode);
    });
    
    chrome.storage.onChanged.addListener(ch => {
      const key = getStorageKey();
      if (key in ch) apply(ch[key].newValue || 'off');
    });
  }

  (document.readyState === 'loading')
    ? document.addEventListener('DOMContentLoaded', init, { once: true })
    : init();
})();
