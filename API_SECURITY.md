# API Security & Rotation Guide

## 🔄 API Key Rotation

To prevent quota exhaustion (Error 429/403), the application now supports multiple YouTube API keys. If one key hits its limit, the app will automatically switch to the next one.

### Configuration

1. Open your `.env` (or `.env.local`) file.
2. Update the `YOUTUBE_API_KEY` variable to include all your keys, separated by commas.

**Example:**

```env
# Single key
YOUTUBE_API_KEY=AIzaSy...

# Multiple keys (Rotation enabled)
YOUTUBE_API_KEY=AIzaSyKey1...,AIzaSyKey2...,AIzaSyKey3...
```

The application will extract individual keys and rotate through them automatically when a quota error occurs.

---

## 🛡️ Hiding API Keys (Best Practices)

Since this is a client-side application (running in the browser), **it is impossible to completely hide API keys from users**. Anyone can inspect the network traffic and see the key.

**To protect your quota and wallet, you MUST use API Restrictions.**

### Steps to Secure Your Keys:

1. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Click on your API Key to edit it.
3. Under **Application restrictions**, select **HTTP referrers (web sites)**.
4. Under **Website restrictions**, add your domains:
   - `http://localhost:3000/*` (for local development)
   - `http://localhost:5173/*` (if using Vite default port)
   - `https://your-production-domain.com/*`
5. Click **Save**.

**Result**: Even if someone steals your key, they cannot use it on their own website because Google will reject requests not coming from your allowed domains.
