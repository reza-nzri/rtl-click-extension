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

  const DYN_ATTR = "data-rtlclick-dyn";
  let dynObserver = null;

  function detectDir(text) {
    if (!text) return null;

    const cleaned = text.replace(
      /[\s0-9!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]+/g,
      "",
    );
    if (cleaned.length < 6) return null;

    const rtl = (
      cleaned.match(
        /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g,
      ) || []
    ).length;
    const ltr = (cleaned.match(/[A-Za-z]/g) || []).length;

    if (rtl + ltr === 0) return null;

    const ratio = rtl / (rtl + ltr);
    if (ratio >= 0.6) return "rtl";
    if (ratio <= 0.4) return "ltr";
    return null;
  }

  function applyDynToRoot(root) {
    const nodes = root.querySelectorAll(
      "p, li, blockquote, h1, h2, h3, h4, h5, h6",
    );
    for (const el of nodes) {
      if (el.children.length > 3) continue;

      const text = (el.innerText || el.textContent || "").trim();
      if (!text) continue;

      const dir = detectDir(text);
      if (!dir) continue;

      // store previous state once
      if (!el.hasAttribute(DYN_ATTR)) {
        el.setAttribute(DYN_ATTR, "1");
        el.dataset.rtlclickPrevDir = el.getAttribute("dir") ?? "";
        el.dataset.rtlclickPrevUb = el.style.unicodeBidi ?? "";
      }

      el.setAttribute("dir", dir);
      el.style.unicodeBidi = "plaintext";
    }
  }

  function cleanupDyn() {
    // remove all dyn-applied changes
    const nodes = document.querySelectorAll(`[${DYN_ATTR}]`);
    for (const el of nodes) {
      const prevDir = el.dataset.rtlclickPrevDir;
      const prevUb = el.dataset.rtlclickPrevUb;

      if (prevDir === undefined) {
        // nothing to restore
      } else if (prevDir === "") {
        el.removeAttribute("dir");
      } else {
        el.setAttribute("dir", prevDir);
      }

      el.style.unicodeBidi = prevUb || "";

      el.removeAttribute(DYN_ATTR);
      delete el.dataset.rtlclickPrevDir;
      delete el.dataset.rtlclickPrevUb;
    }

    if (dynObserver) {
      dynObserver.disconnect();
      dynObserver = null;
    }
  }

  function startDynObserver() {
    if (dynObserver) return;

    let scheduled = false;
    dynObserver = new MutationObserver((mutations) => {
      if (scheduled) return;
      scheduled = true;

      setTimeout(() => {
        scheduled = false;
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (node.nodeType !== 1) continue;
            applyDynToRoot(node);
          }
        }
      }, 150);
    });

    dynObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function apply(mode) {
    const html = document.documentElement;
    const body = document.body;
    if (!html || !body) return;

    const KEY = "rtlClickApplied";
    const PREV_HTML_DIR = "rtlClickPrevHtmlDir";
    const PREV_BODY_DIR = "rtlClickPrevBodyDir";

    const wasApplied = html.dataset[KEY] === "1";

    // 1) If leaving DYN (going to rtl/ltr/off), cleanup dyn changes
    if (mode !== "dyn") {
      cleanupDyn();
      html.classList.remove("dyn-on");
    }

    // 2) OFF: restore only if we previously forced RTL/LTR
    if (mode === "off") {
      if (!wasApplied) return;

      const prevHtml = html.dataset[PREV_HTML_DIR];
      const prevBody = body.dataset[PREV_BODY_DIR];

      if (prevHtml !== undefined) {
        if (prevHtml === "") html.removeAttribute("dir");
        else html.setAttribute("dir", prevHtml);
      }

      if (prevBody !== undefined) {
        if (prevBody === "") body.removeAttribute("dir");
        else body.setAttribute("dir", prevBody);
      }

      html.classList.remove("rtl-on", "ltr-on");

      delete html.dataset[KEY];
      delete html.dataset[PREV_HTML_DIR];
      delete body.dataset[PREV_BODY_DIR];
      return;
    }

    // 3) DYN: do NOT touch html/body dir; only per-block direction
    if (mode === "dyn") {
      // If we previously forced RTL/LTR, undo it first (clean transition)
      if (wasApplied) {
        const prevHtml = html.dataset[PREV_HTML_DIR];
        const prevBody = body.dataset[PREV_BODY_DIR];

        if (prevHtml !== undefined) {
          if (prevHtml === "") html.removeAttribute("dir");
          else html.setAttribute("dir", prevHtml);
        }

        if (prevBody !== undefined) {
          if (prevBody === "") body.removeAttribute("dir");
          else body.setAttribute("dir", prevBody);
        }

        html.classList.remove("rtl-on", "ltr-on");

        delete html.dataset[KEY];
        delete html.dataset[PREV_HTML_DIR];
        delete body.dataset[PREV_BODY_DIR];
      }

      // Now run dynamic mode
      cleanupDyn(); // remove previous dyn marks before reapplying
      applyDynToRoot(document);
      startDynObserver();

      // Optional stable class for CSS hooks
      html.classList.add("dyn-on");
      return;
    }

    // 4) RTL/LTR: force page direction (store originals once)
    if (!wasApplied) {
      html.dataset[KEY] = "1";
      html.dataset[PREV_HTML_DIR] = html.getAttribute("dir") ?? "";
      body.dataset[PREV_BODY_DIR] = body.getAttribute("dir") ?? "";
    }

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
