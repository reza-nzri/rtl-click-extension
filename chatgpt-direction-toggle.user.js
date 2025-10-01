// ==UserScript==
// @name         ChatGPT LTR/RTL Toggle
// @namespace    https://sasha.tools
// @version      1.0
// @description  Toggle chat text direction (LTR/RTL) on ChatGPT with one click
// @author       Reza Nazari
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  const KEY = 'chatgpt_dir_mode'; // 'ltr' | 'rtl'
  const initial = localStorage.getItem(KEY) || 'ltr';

  // Styles scoped via body class to avoid breaking whole UI layout
  GM_addStyle(`
    body.chatdir-rtl [data-message-author-role] .markdown,
    body.chatdir-rtl [data-message-author-role] .prose,
    body.chatdir-rtl .text-message,
    body.chatdir-rtl .prose,
    body.chatdir-rtl [data-message-author-role] {
      direction: rtl !important;
      text-align: right !important;
      unicode-bidi: plaintext !important;
    }
    body.chatdir-rtl textarea,
    body.chatdir-rtl [contenteditable="true"] {
      direction: rtl !important;
      text-align: right !important;
      unicode-bidi: plaintext !important;
    }

    body.chatdir-ltr [data-message-author-role] .markdown,
    body.chatdir-ltr [data-message-author-role] .prose,
    body.chatdir-ltr .text-message,
    body.chatdir-ltr .prose,
    body.chatdir-ltr [data-message-author-role] {
      direction: ltr !important;
      text-align: left !important;
      unicode-bidi: plaintext !important;
    }
    body.chatdir-ltr textarea,
    body.chatdir-ltr [contenteditable="true"] {
      direction: ltr !important;
      text-align: left !important;
      unicode-bidi: plaintext !important;
    }

    /* Toggle button */
    #dirToggleBtn {
      position: fixed;
      bottom: 14px;
      right: 14px;
      z-index: 99999;
      padding: 8px 12px;
      background: #111;
      color: #fff;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.2);
      font-size: 12px;
      line-height: 1;
      cursor: pointer;
      user-select: none;
      opacity: 0.9;
    }
    #dirToggleBtn:hover { opacity: 1; }
  `);

  function apply(mode) {
    document.body.classList.toggle('chatdir-rtl', mode === 'rtl');
    document.body.classList.toggle('chatdir-ltr', mode === 'ltr');
    localStorage.setItem(KEY, mode);
    updateBtn(mode);
  }

  function updateBtn(mode) {
    const btn = document.getElementById('dirToggleBtn');
    if (btn) btn.textContent = mode === 'rtl' ? 'RTL • Click for LTR' : 'LTR • Click for RTL';
  }

  function makeBtn() {
    if (document.getElementById('dirToggleBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'dirToggleBtn';
    btn.addEventListener('click', () => {
      const next = (localStorage.getItem(KEY) || 'ltr') === 'rtl' ? 'ltr' : 'rtl';
      apply(next);
    });
    document.body.appendChild(btn);
    updateBtn(localStorage.getItem(KEY) || 'ltr');
  }

  // Handle SPA navigations / dynamic DOM
  const ensure = () => {
    makeBtn();
    apply(localStorage.getItem(KEY) || initial);
  };

  // Initial
  ensure();

  // Watch for route/content changes
  const mo = new MutationObserver(() => ensure());
  mo.observe(document.documentElement, { subtree: true, childList: true });

  // Optional: keyboard shortcut Alt+R
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      const next = (localStorage.getItem(KEY) || 'ltr') === 'rtl' ? 'ltr' : 'rtl';
      apply(next);
    }
  });
})();
