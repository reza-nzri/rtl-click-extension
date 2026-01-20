# <img src="logo-1.png" alt="RTL Click Extension Logo" width="25px" style="border-radius:8px; vertical-align:middle;"> **rtl-click-extension**

A lightweight **Google Chrome Extension** that lets you toggle page direction per-site: **LTR ↔ RTL ↔ OFF**.  
Ideal for users of **Persian, Arabic, Hebrew** and other RTL languages who want per-website control over text direction.

<details>
<summary><h2>🖥 Demo</h2></summary>

<img width="500" height="500" alt="image" src="https://github.com/user-attachments/assets/542ea778-334d-4d45-82c2-51aa9c50b5f8" />
<img width="500" height="514" alt="image" src="https://github.com/user-attachments/assets/26ef73d9-3b57-48db-9ea6-5de9146d7946" />
<img width="100" height="186" alt="Screenshot 2025-10-04 230338" src="https://github.com/user-attachments/assets/d7f8977b-d9f1-4034-85cc-0ffb4d979b50" />

<details>
  <summary><h3>Explained</h3></summary>
This extension adds a toggle on the browser toolbar that cycles the current site's direction mode:

* **Click once** → Switch to **RTL** (Right-to-Left).
* **Click again** → Switch to **LTR** (Left-to-Right).
* **Click again** → Switch to **DYN** (Dynamic per-block RTL/LTR).
* **Click again** → Switch to **OFF** (no changes).

The extension shows a badge and a dynamic icon to indicate the active state for the current website:
- `RTL` / `LTR` / `DYN`
</details>
</details>

<details>
<summary><h2>💡 Why & Benefits</h2></summary>

- Provides per-site direction control for RTL languages (Persian, Arabic, Hebrew).
- One-click toggle from the toolbar that persists per-domain.
- Non-invasive: only the page direction is changed (no external libraries or heavy DOM rewrites).

</details>

<details>
<summary><h2>✨ Features</h2></summary>

- Toggle via **extension icon click** (cycles: OFF → RTL → LTR).
- Badge indicator shows mode for the active site (e.g. `RTL`, `LTR`).
- Per-domain persistence: each hostname stores its own mode.
- Dynamic toolbar icon rendering for visual feedback.
- Lightweight and framework-free.
- New **DYN mode**: automatically sets direction per paragraph/block based on text content (RTL vs LTR).
- True **OFF mode**: restores original page direction and removes all extension-applied changes.

</details>

<details>
<summary><h2>⚙️ Installation</h2></summary>

This is a **local Chrome Extension** (not yet published to the Chrome Web Store).

1. Clone or download this repository.
2. Open Chrome → go to `chrome://extensions/`.
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** and select the project folder.
5. The extension icon will appear in your toolbar.

</details>

<details>
<summary><h2>❓ FAQ</h2></summary>

<details>
<summary><h3>🔹 Does it work on any site?</h3></summary>
Yes. This extension can run on any website where content scripts are injected (permissioned via the manifest). It applies direction changes per-site.
</details>

<details>
<summary><h3>🔹 Will it break page layouts?</h3></summary>
No — the extension only changes the `dir` attribute and adds small helper classes. Some sites with aggressive CSS may need a reload or manual `off` toggle.
</details>

<details>
<summary><h3>🔹 How can I tell which mode is active?</h3></summary>
The toolbar badge and icon show the current mode for the active site (e.g. `RTL`, `LTR`, `DYN`). Hovering the icon shows the site and mode in the tooltip.
</details>

<details>
<summary><h3>🔹 Does it remember my choices?</h3></summary>
Yes — each hostname's mode is saved in `chrome.storage.sync` under a `mode_<hostname>` key.
</details>

<details>
<summary><h3>🔹 What is DYN mode?</h3></summary>
DYN (Dynamic) scans text blocks (e.g. paragraphs, list items, headings) and sets `dir="rtl"` or `dir="ltr"` per block based on the dominant script. It does not force the whole page direction.
</details>

<details>
<summary><h3>🔹 What does OFF mode do exactly?</h3></summary>
OFF fully restores the original page direction (previous `dir` values) and removes all extension-applied changes, so the page behaves as if the extension was not active.
</details>

</details>

<details>
<summary><h2>📌 Changelog</h2></summary>

- **v2.1** – True OFF restore + new DYN (dynamic per-block direction) mode.
- **v2.0** – Per-site persistence, dynamic toolbar icon, tab-aware UI updates.
- **v1.1** – Toggle and persistence improvements.
- **v1.0** – Initial release.

</details>

<details>
<summary><h2>🔑 Keywords</h2></summary>

rtl, rtl chrome extension, rtl ltr toggle, rtl per-site, rtl-click-extension, persian arabic hebrew

</details>

<details>
<summary><h3>⚠️ Disclaimer</h3></summary>

This project is provided for educational and personal use. It is not affiliated with or endorsed by any third-party service. Use at your own risk.

</details>

### 🤝 Contributing

Contributions, bug reports, and feature requests are welcome.

[![Author](https://images.weserv.nl/?url=https://avatars.githubusercontent.com/u/127698692?v=4&w=35&h=35&mask=circle)](https://github.com/reza-nzri)
