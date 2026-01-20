// Background service worker
// Handles icon clicks and updates the mode + dynamic icon text

// Extract domain from URL
function getDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch (e) {
    return "unknown";
  }
}

// Get mode for specific domain
async function getModeForDomain(domain) {
  const key = `mode_${domain}`;
  const r = await chrome.storage.sync.get(key);
  return r[key] || "off";
}

// Set mode for specific domain
async function setModeForDomain(domain, mode) {
  const key = `mode_${domain}`;
  await chrome.storage.sync.set({ [key]: mode });
}

// Legacy support - kept for backward compatibility
async function getMode() {
  const r = await chrome.storage.sync.get("mode");
  return r["mode"] || "off";
}
async function setMode(m) {
  await chrome.storage.sync.set({ mode: m });
}

function drawIcon(label, opts) {
  // Create imageData object for multiple sizes using OffscreenCanvas
  // Returns the generated imageData map; caller should pass tabId when setting icon
  const sizes = [16, 32, 48, 128];
  const imageData = {};

  sizes.forEach((sz) => {
    const c = new OffscreenCanvas(sz, sz);
    const g = c.getContext("2d");

    g.clearRect(0, 0, sz, sz);

    // Fill background with border color for visibility at small sizes
    g.fillStyle = opts.border;
    g.fillRect(0, 0, sz, sz);

    // Draw rounded border (visual only)
    const r = Math.round(sz * 0.2);
    g.lineWidth = Math.max(2, Math.round(sz * 0.08));
    g.strokeStyle = opts.border;
    g.beginPath();
    g.moveTo(r, 2);
    g.lineTo(sz - r, 2);
    g.quadraticCurveTo(sz - 2, 2, sz - 2, r);
    g.lineTo(sz - 2, sz - r);
    g.quadraticCurveTo(sz - 2, sz - 2, sz - r, sz - 2);
    g.lineTo(r, sz - 2);
    g.quadraticCurveTo(2, sz - 2, 2, sz - r);
    g.lineTo(2, r);
    g.quadraticCurveTo(2, 2, r, 2);
    g.stroke();

    // Label text - centered
    g.fillStyle = opts.text;
    g.font = `bold ${Math.round(sz * 0.5)}px Arial, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(label, sz / 2, sz / 2);

    imageData[sz] = c.transferToImageBitmap();
  });

  return imageData;
}

async function updateUI(mode, domain = "unknown", tabId = null) {
  // Update icon, badge and tooltip for a specific tab (if tabId provided)
  // If tabId is omitted, update the global action (fallback)
  const imageData =
    mode === "rtl"
      ? drawIcon("RTL", { border: "#00cc66", text: "#ffffff" })
      : mode === "ltr"
        ? drawIcon("LTR", { border: "#999999", text: "#ffffff" })
        : mode === "dyn"
          ? drawIcon("DYN", { border: "#ffffff", text: "#000000" })
          : null;

  const setIconArgs = imageData ? { imageData } : {};
  if (tabId) setIconArgs.tabId = tabId;

  try {
    if (imageData) {
      // Set icon for the tab or globally
      await chrome.action.setIcon(setIconArgs);
    } else {
      // No imageData for OFF mode - clear to default icon
      if (tabId) {
        try {
          await chrome.action.setIcon({ tabId });
        } catch (e) {
          console.warn("clear tab icon failed", e);
        }
      } else {
        try {
          await chrome.action.setIcon({});
        } catch (e) {
          console.warn("clear global icon failed", e);
        }
      }
    }
  } catch (err) {
    // OffscreenCanvas icon setting may fail on some platforms — badge is more reliable
    console.warn("setIcon failed", err);
  }

  // Badge and title (tab-scoped if supported)
  const badgeArgs = tabId ? { tabId } : {};
  console.log(
    `updateUI called — mode=${mode}, domain=${domain}, tabId=${tabId}`,
  );

  try {
    if (mode === "rtl") {
      console.log("setting RTL UI");
      await chrome.action.setBadgeText({ text: "RTL", ...badgeArgs });
      try {
        await chrome.action.setBadgeBackgroundColor({
          color: "#00cc66",
          ...badgeArgs,
        });
      } catch (e) {
        console.warn("setBadgeBackgroundColor failed", e);
      }
      await chrome.action.setTitle({
        title: `[${domain}]\nMode: RTL (click for LTR)`,
        ...badgeArgs,
      });
    } else if (mode === "ltr") {
      console.log("setting LTR UI");
      await chrome.action.setBadgeText({ text: "LTR", ...badgeArgs });
      try {
        await chrome.action.setBadgeBackgroundColor({
          color: "#999999",
          ...badgeArgs,
        });
      } catch (e) {
        console.warn("setBadgeBackgroundColor failed", e);
      }
      await chrome.action.setTitle({
        title: `[${domain}]\nMode: LTR (click for OFF)`,
        ...badgeArgs,
      });
    } else if (mode === "dyn") {
      await chrome.action.setBadgeText({ text: "DYN", ...badgeArgs });

      try {
        await chrome.action.setBadgeBackgroundColor({
          color: "#111111",
          ...badgeArgs,
        });
      } catch (e) {}

      await chrome.action.setTitle({
        title: `[${domain}]\nMode: DYN (click for OFF)`,
        ...badgeArgs,
      });
    } else {
      console.log("setting OFF UI");
      await chrome.action.setBadgeText({ text: "", ...badgeArgs });
      await chrome.action.setTitle({
        title: `[${domain}]\nMode: OFF (click for RTL)`,
        ...badgeArgs,
      });
    }
  } catch (err) {
    console.error("updateUI error", err);
  }
}

// Listener for updating UI when switching tabs
// Displays the saved mode status for the currently active website
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab?.url && /^https?:\/\//.test(tab.url)) {
      const domain = getDomain(tab.url);
      const mode = await getModeForDomain(domain);
      await updateUI(mode, domain, tab.id);
    }
  } catch (e) {
    // Tab might be closed or inaccessible
  }
});

// Listener for updating icon when page URL changes
// Ensures the correct mode is displayed when navigating to a new URL
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "loading" &&
    tab?.url &&
    /^https?:\/\//.test(tab.url)
  ) {
    const domain = getDomain(tab.url);
    const mode = await getModeForDomain(domain);
    await updateUI(mode, domain, tabId);
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  // Refresh UI for the active tab on install so icon reflects current site
  try {
    const tabs = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    if (tabs && tabs[0] && tabs[0].url && /^https?:\/\//.test(tabs[0].url)) {
      const domain = getDomain(tabs[0].url);
      const mode = await getModeForDomain(domain);
      await updateUI(mode, domain, tabs[0].id);
      console.log("onInstalled: UI refreshed for", domain);
    }
  } catch (e) {
    console.warn("onInstalled UI refresh failed", e);
  }
});

// On startup, refresh UI for the active tab
chrome.runtime.onStartup?.addListener?.(async () => {
  try {
    const tabs = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    if (tabs && tabs[0] && tabs[0].url && /^https?:\/\//.test(tabs[0].url)) {
      const domain = getDomain(tabs[0].url);
      const mode = await getModeForDomain(domain);
      await updateUI(mode, domain, tabs[0].id);
      console.log("onStartup: UI refreshed for", domain);
    }
  } catch (e) {
    console.warn("onStartup UI refresh failed", e);
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id || !tab?.url) return;

  const domain = getDomain(tab.url);
  const current = await getModeForDomain(domain);
  const next =
    current === "off"
      ? "rtl"
      : current === "rtl"
        ? "ltr"
        : current === "ltr"
          ? "dyn"
          : "off";

  await setModeForDomain(domain, next);
  await updateUI(next, domain, tab.id);

  // Send the new mode to the active tab for immediate application
  if (/^https?:\/\//.test(tab.url || "")) {
    chrome.tabs
      .sendMessage(tab.id, { type: "APPLY_MODE", mode: next, domain: domain })
      .catch(() => {});
  }
});
