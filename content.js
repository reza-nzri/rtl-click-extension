(() => {
  'use strict';
  const KEY = 'rtlEnabled';

  function apply(enabled) {
    const html = document.documentElement, body = document.body;
    if (!html || !body) return;
    if (enabled) {
      html.setAttribute('dir', 'rtl');
      body.setAttribute('dir', 'rtl');
      html.classList.add('chatgpt-rtl-on');
    } else {
      if (html.getAttribute('dir') === 'rtl') html.removeAttribute('dir');
      if (body.getAttribute('dir') === 'rtl') body.removeAttribute('dir');
      html.classList.remove('chatgpt-rtl-on');
    }
  }

  function init() {
    // حالت ذخیره‌شده را روی هر لود صفحه اعمال کن
    chrome.storage.sync.get(KEY, (r) => apply(!!r[KEY]));
    // اگر از سرویس‌ورکر پیام آمد، فوری اعمال کن
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg && msg.type === 'APPLY_RTL') apply(!!msg.enabled);
    });
    // اگر از جای دیگر تغییر کرد، همگام بمان
    chrome.storage.onChanged.addListener((c) => {
      if (KEY in c) apply(!!c[KEY].newValue);
    });
  }

  (document.readyState === 'loading')
    ? document.addEventListener('DOMContentLoaded', init, { once: true })
    : init();
})();
