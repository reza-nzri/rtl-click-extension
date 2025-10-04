const KEY = 'rtlEnabled';

async function getEnabled() {
  const r = await chrome.storage.sync.get(KEY);
  return !!r[KEY];
}
async function setEnabled(v) {
  await chrome.storage.sync.set({ [KEY]: !!v });
}

async function updateActionUI(enabled) {
  if (enabled) {
    // Show badge ON with green background
    await chrome.action.setBadgeText({ text: 'ON' });
    await chrome.action.setBadgeBackgroundColor({ color: '#00cc66' }); // green
  } else {
    // Clear badge
    await chrome.action.setBadgeText({ text: '' });
  }
  // Update tooltip text
  await chrome.action.setTitle({ title: enabled ? 'RTL Mode: ON' : 'RTL Mode: OFF' });
}

chrome.runtime.onInstalled.addListener(async () => {
  const cur = await getEnabled();
  await updateActionUI(cur);
});

chrome.action.onClicked.addListener(async (tab) => {
  const cur = await getEnabled();
  const next = !cur;
  await setEnabled(next);
  await updateActionUI(next);

  // Send message to content script for immediate update
  if (tab && tab.id && /^https:\/\/(chat\.openai|chatgpt)\.com/.test(tab.url || '')) {
    chrome.tabs.sendMessage(tab.id, { type: 'APPLY_RTL', enabled: next }).catch(() => {});
  }
});
