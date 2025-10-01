// ==UserScript==
// @name         ChatGPT Direction Toggle (Menu-based)
// @namespace    https://github.com/sasha/chatgpt-direction-toggle
// @version      1.1
// @description  Toggle ChatGPT text direction LTR/RTL via Tampermonkey menu (no in-page button).
// @author       Reza Nazari
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
  'use strict';

  const KEY = 'dirMode'; // 'ltr' | 'rtl'
  const mode = GM_getValue(KEY, 'ltr');

  // Styles scoped with body class; do NOT alter layout frames, only text direction.
  GM_addStyle(`
    body.chatdir-rtl [data-message-author-role],
    body.chatdir-rtl [data-message-author-role] .markdown,
    body.chatdir-rtl [data-message-author-role] .prose,
    body.chatdir-rtl .text-message,
    body.chatdir-rtl textarea,
    body.chatdir-rtl [contenteditable="true"] {
      direction: rtl !important;
      text-align: right !important;
      unicode-bidi: plaintext !important;
    }

    body.chatdir-ltr [data-message-author-role],
    body.chatdir-ltr [data-message-author-role] .markdown,
    body.chatdir-ltr [data-message-author-role] .prose,
    body.chatdir-ltr .text-message,
    body.chatdir-ltr textarea,
    body.chatdir-ltr [contenteditable="true"] {
      direction: ltr !important;
      text-align: left !important;
      unicode-bidi: plaintext !important;
    }
  `);

  function apply(m) {
    const b = document.body;
    if (!b) return;
    b.classList.toggle('chatdir-rtl', m === 'rtl');
    b.classList.toggle('chatdir-ltr', m === 'ltr');
    // also set logical dir for caret/selection in inputs
    document.documentElement.setAttribute('dir', m);
  }

  function setMode(m) {
    GM_setValue(KEY, m);
    apply(m);
  }

  // Initial apply (no observers, no heavy loops)
  apply(mode);

  // Menu commands (open Tampermonkey icon → this script → choose an action)
  GM_registerMenuCommand(`Toggle (current: ${mode.toUpperCase()})`, () => {
    const next = (GM_getValue(KEY, 'ltr') === 'rtl') ? 'ltr' : 'rtl';
    setMode(next);
    alert(`Direction: ${next.toUpperCase()}`);
  });
  GM_registerMenuCommand('Force RTL', () => setMode('rtl'));
  GM_registerMenuCommand('Force LTR', () => setMode('ltr'));

  // Optional: quick keyboard toggle without adding any DOM UI
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      const next = (GM_getValue(KEY, 'ltr') === 'rtl') ? 'ltr' : 'rtl';
      setMode(next);
    }
  }, { passive: false });
})();
