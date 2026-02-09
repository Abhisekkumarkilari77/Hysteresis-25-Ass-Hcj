# 🔍 GitHub Profile Finder - Setup & Troubleshooting Guide

## 🚀 How to Run the Project

### Option 1: Use Python's Built-in Server (Easiest)

1. **Open PowerShell** in the project folder
2. **Run this command:**

```powershell
python -m http.server 8000
```

3. **Open browser:** `http://localhost:8000`
4. **Done!** Start searching for GitHub profiles

---

### Option 2: Use Node.js HTTP Server

1. **Install http-server globally:**

```powershell
npm install -g http-server
```

2. **Run from project folder:**

```powershell
http-server
```

3. **Open browser:** `http://127.0.0.1:8080` (or the URL shown in terminal)

---

### Option 3: Use VS Code Live Server Extension

1. **Install "Live Server"** extension in VS Code
2. **Right-click on `index.html`**
3. **Select "Open with Live Server"**
4. **Browser opens automatically!**

---

## 🐛 If It Still Doesn't Work

### Step 1: Check Browser Console for Errors
1. **Open the page** in browser
2. **Press `F12`** to open Developer Tools
3. **Click "Console"** tab
4. **Look for red error messages**
5. **Share the error message with me**

### Step 2: Verify File Paths
All three files should be in the same folder:
- `index.html`
- `style.css`
- `script.js`

### Step 3: Test the Search
1. Enter `octocat` (GitHub's test account)
2. Click Search
3. Should show profile in 2-3 seconds

---

## ✅ Expected Behavior

1. **Search box appears** at top
2. **Enter username** (e.g., "octocat")
3. **Click Search** or press Enter
4. **Loading spinner appears** for 2-3 seconds
5. **Profile card appears** with:
   - Avatar image
   - Name, username, bio
   - Public repos, followers, stats
   - Latest repositories

---

## 🔗 Test Usernames
- `octocat` — GitHub mascot (most reliable)
- `torvalds` — Linux creator
- `gvanrossum` — Python creator
- `evanw` — Esbuild creator

---

## ⚠️ Rate Limiting
GitHub API allows **60 requests per hour** for unauthenticated users.
If you get a rate limit error, wait 1 hour before searching again.

---

Let me know which option works best for you! 🚀
