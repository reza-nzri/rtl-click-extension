// Content script
// Applies direction changes to the websites page

(() => {
  "use strict";

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
    const html = document.documentElement;
    const body = document.body;
    if (!html || !body) return;

    const KEY = "rtlClickApplied";
    const PREV_HTML_DIR = "rtlClickPrevHtmlDir";
    const PREV_BODY_DIR = "rtlClickPrevBodyDir";

    const wasApplied = html.dataset[KEY] === "1";

    // OFF = اگر قبلا چیزی اعمال نکرده‌ایم، دست نزن
    if (mode === "off") {
      if (!wasApplied) return;

      // restore previous dir values
      const prevHtml = html.dataset[PREV_HTML_DIR];
      const prevBody = body.dataset[PREV_BODY_DIR];

      if (prevHtml === undefined) {
        // nothing stored; be safe: don't touch
      } else if (prevHtml === "") {
        html.removeAttribute("dir");
      } else {
        html.setAttribute("dir", prevHtml);
      }

      if (prevBody === undefined) {
        // nothing stored; be safe: don't touch
      } else if (prevBody === "") {
        body.removeAttribute("dir");
      } else {
        body.setAttribute("dir", prevBody);
      }

      html.classList.remove("rtl-on", "ltr-on");

      // cleanup
      delete html.dataset[KEY];
      delete html.dataset[PREV_HTML_DIR];
      delete body.dataset[PREV_BODY_DIR];
      return;
    }

    // First time applying RTL/LTR: store original dirs once
    if (!wasApplied) {
      html.dataset[KEY] = "1";
      html.dataset[PREV_HTML_DIR] = html.getAttribute("dir") ?? "";
      body.dataset[PREV_BODY_DIR] = body.getAttribute("dir") ?? "";
    }

    // switch mode (keep originals stored)
    html.classList.remove("rtl-on", "ltr-on");

    if (mode === "rtl") {
      html.setAttribute("dir", "rtl");
      body.setAttribute("dir", "rtl");
      html.classList.add("rtl-on");
    } else if (mode === "ltr") {
      html.setAttribute("dir", "ltr");
      body.setAttribute("dir", "ltr");
      html.classList.add("ltr-on");
    }
  }

  function init() {
    const key = getStorageKey();
    chrome.storage.sync.get(key, (r) => apply(r[key] || "off"));

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg?.type === "APPLY_MODE") apply(msg.mode);
    });

    chrome.storage.onChanged.addListener((ch) => {
      const key = getStorageKey();
      if (key in ch) apply(ch[key].newValue || "off");
    });
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init, { once: true })
    : init();
})();
