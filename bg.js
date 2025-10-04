// Background service worker
// Handles icon clicks and updates the mode + dynamic icon text

const KEY = 'mode'; // values: 'off' | 'rtl' | 'ltr'

async function getMode() {
  const r = await chrome.storage.sync.get(KEY);
  return r[KEY] || 'off';
}
async function setMode(m) { await chrome.storage.sync.set({ [KEY]: m }); }

function drawIcon(label, opts) {
  // Draw a dynamic icon with text and border using OffscreenCanvas
  const sizes = [16, 32, 48, 128];
  const paths = {};
  sizes.forEach(sz => {
    const c = new OffscreenCanvas(sz, sz);
    const g = c.getContext('2d');

    g.clearRect(0, 0, sz, sz);

    // Rounded border
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

    // Label text
    g.fillStyle = opts.text;
    g.font = `${Math.round(sz * 0.45)}px system-ui,Segoe UI,Arial`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(label, sz / 2, sz / 2 + (sz >= 32 ? 1 : 0));

    paths[`${sz}`] = c.transferToImageBitmap();
  });
  chrome.action.setIcon({ imageData: paths });
}

async function updateUI(mode) {
  if (mode === 'rtl') {
    drawIcon('RTL', { border: '#00cc66', text: '#ffffff' });
    await chrome.action.setTitle({ title: 'Mode: RTL (click for LTR)' });
  } else if (mode === 'ltr') {
    drawIcon('LTR', { border: '#999999', text: '#ffffff' });
    await chrome.action.setTitle({ title: 'Mode: LTR (click for OFF)' });
  } else {
    // OFF → clear icon (transparent)
    const sizes = [16, 32, 48, 128];
    const imgs = {};
    sizes.forEach(sz => {
      const c = new OffscreenCanvas(sz, sz);
      imgs[`${sz}`] = c.transferToImageBitmap();
    });
    await chrome.action.setIcon({ imageData: imgs });
    await chrome.action.setTitle({ title: 'Mode: OFF (click for RTL)' });
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const m = await getMode();
  await updateUI(m);
});

chrome.action.onClicked.addListener(async (tab) => {
  const current = await getMode();
  const next = current === 'off' ? 'rtl' : current === 'rtl' ? 'ltr' : 'off';
  await setMode(next);
  await updateUI(next);

  if (tab && tab.id && /^https:\/\/(chat\.openai|chatgpt)\.com/.test(tab.url || '')) {
    chrome.tabs.sendMessage(tab.id, { type: 'APPLY_MODE', mode: next }).catch(() => {});
  }
});
