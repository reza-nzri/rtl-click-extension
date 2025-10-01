# <img src="logo-1.png" alt="ChatGPT Direction Toggle Logo" width="25px" style="border-radius:8px; vertical-align:middle;"> **ChatGPT Direction Toggle**

Tampermonkey / Greasemonkey userscript that adds a simple **LTR ↔ RTL toggle button** to ChatGPT.  
It lets you switch the direction of all chat messages and input fields with a single click.

<details>
<summary><h2>🖥 Demo</h2></summary>

<img width="600" alt="Demo Screenshot - ChatGPT Direction Toggle" src="https://github.com/user-attachments/assets/b1b641db-7af6-455a-b49d-ef19b5691355" />
<img width="678" height="277" alt="RTL" src="https://github.com/user-attachments/assets/ec7e7a0d-ff81-4656-a5ad-9b5314df6ff8" />
<img width="683" height="291" alt="LTR" src="https://github.com/user-attachments/assets/333adace-f64c-48db-bdd8-35ddc4707a41" />


<details>
  <summary><h3>Explained</h3></summary>
This userscript injects a floating button in the bottom-right corner:  

* **Click once** → Switch to **RTL** (Right-to-Left).  
* **Click again** → Switch back to **LTR** (Left-to-Right).  
* It also supports **Alt+R keyboard shortcut** for quick toggling.  

**In short:** you can read and write in any direction you prefer.  
</details>
</details>

<details>
<summary><h2>💡 Why & Benefits</h2></summary>

- Makes ChatGPT easier to use for **RTL languages** (Persian, Arabic, Hebrew).  
- Quick toggle without reloading or extra settings.  
- Works with **messages, input box, and editor**.  
- Remembers your last choice using localStorage.  

</details>

<details>
<summary><h2>✨ Features</h2></summary>

- Floating toggle button (LTR/RTL).  
- Keyboard shortcut: **Alt+R**.  
- Persistent setting (saves last state).  
- Works with dynamic ChatGPT DOM updates.  
- Lightweight, no dependencies.  

</details>

<details>
<summary><h2>⚙️ Installation</h2></summary>

1. Install [Tampermonkey](https://www.tampermonkey.net/) (or any compatible userscript manager).  
2. [Click here to install the script](./chatgpt-direction-toggle.user.js).  
   *(or copy & paste the code into a new Tampermonkey script).*  
3. Open [ChatGPT](https://chat.openai.com/) or [chatgpt.com](https://chatgpt.com/).  
4. Use the **button or Alt+R** to switch between LTR and RTL.  

</details>

<details>
<summary><h2>❓ FAQ</h2></summary>

<details>
<summary><h3>🔹 Does it affect only ChatGPT?</h3></summary>
Yes. The script is scoped to <b>chat.openai.com</b> and <b>chatgpt.com</b>.
</details>

<details>
<summary><h3>🔹 Does it break the layout?</h3></summary>
No. It only changes <b>text direction</b> and <b>alignment</b> for chat messages and input fields.
</details>

<details>
<summary><h3>🔹 How can I switch quickly?</h3></summary>
Use the floating button or press <b>Alt+R</b>.
</details>

<details>
<summary><h3>🔹 Does it save my last choice?</h3></summary>
Yes. The script uses <b>localStorage</b> to remember whether you last used RTL or LTR.
</details>

</details>

<details>
<summary><h2>🔑 SEO Keywords</h2></summary>

chatgpt rtl, chatgpt direction toggle, tampermonkey chatgpt, chatgpt persian arabic hebrew, rtl support chatgpt, greasemonkey chatgpt, chatgpt userscript rtl, chatgpt text alignment script  

</details>

<details>
<summary><h3>⚠️ Disclaimer</h3></summary>

This project is created **for educational and personal learning purposes only**.  
It is not affiliated with, endorsed by, or connected to **OpenAI** or **ChatGPT**.  
Use at your own risk. The author assumes no responsibility for any consequences arising from the use of this script.  

</details>

### 🤝 Contributing

Contributions, bug reports, and feature ideas are welcome!  

[![Reza Nazari](https://images.weserv.nl/?url=https://avatars.githubusercontent.com/u/127698692?v=4&w=35&h=35&mask=circle)](https://github.com/reza-nzri)
