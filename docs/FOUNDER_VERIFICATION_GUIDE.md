# ORVIXA — FOUNDER LOCAL LAUNCH & VERIFICATION GUIDE

This document guides the Founder through starting Orvixa locally, loading the unpacked extension in Chrome, and validating its context learning capabilities against real-world websites.

---

## 🚀 STEP-BY-STEP STARTUP FLOW

Follow these manual steps to boot and configure the platform:

### STEP 1: Launch Servers
1. Open a PowerShell terminal in the repository root folder.
2. Run the startup script:
   ```powershell
   .\start.ps1
   ```
3. This opens two separate PowerShell windows running the **FastAPI Backend Server** (port 8000) and **Vite Frontend Dev Server** (port 5173).

### STEP 2: Load Extension in Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable the **Developer Mode** toggle at the top right corner.
3. Click the **Load unpacked** button at the top left.
4. Select the `/dist` directory in your cloned `orvixa` workspace repository folder.
5. Confirm the extension *“Orvixa — Intelligence Layer for the Web”* is listed and active.

### STEP 3: Configure Gemini API Key
1. Click the Orvixa extension icon in your Chrome toolbar, or open `http://localhost:5173/` in your browser.
2. If the first-time welcome screen is shown, click **Start Learning**.
3. Click the **Settings** cog wheel icon in the TopBar.
4. Input your Google Gemini API key into the credentials field and click **Save Changes**.
5. Ensure a green message *“Preferences saved successfully!”* appears.

---

## 🔍 REAL-WORLD VALIDATION STEPS

Test the extension against real sites (e.g. Wikipedia, LeetCode, MDN Web Docs):

### STEP 4: Summons Sidebar
1. Go to any public web article (e.g., [Wikipedia - Binary Search](https://en.wikipedia.org/wiki/Binary_search_algorithm)).
2. Press **`Ctrl + Shift + K`** (or **`Cmd + Shift + K`** on macOS).
3. Verify that the Orvixa sidebar slide-dock transitions smoothly onto the page.

### STEP 5: Ask a Question
1. Highlight any paragraph or code snippet on the page.
2. Click the **Explain** pill in the top row, or type your query in the bottom input box and hit Enter.
3. Verify that the AI response streams token-by-token.

### STEP 6: Validate Follow-Up & Session Memory
1. Type a follow-up question in the input bar (e.g., *"Show me code for this"*).
2. Hit Enter and verify that the AI utilizes prior context to answer without errors.

---

## 🛠️ RUNTIME DIAGNOSTICS & TROUBLESHOOTING

| Diagnostic Symptom | Probable Cause | Actionable Fix |
| :--- | :--- | :--- |
| **Iframe remains empty** | Frontend server isn't running | Verify Vite is active at `http://localhost:5173` |
| **`Connection Interrupted` card** | Backend API is offline | Verify uvicorn server is active at `http://localhost:8000` |
| **Generic fallback text output** | Gemini API key unconfigured | Add your API key in settings or inside `/backend/.env` |
| **Port Conflict** | Port 8000 or 5173 occupied | Free active processes on target ports and rerun `.\start.ps1` |
