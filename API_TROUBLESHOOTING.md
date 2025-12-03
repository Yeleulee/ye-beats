# YouTube API Troubleshooting Guide

## How to Test the API

### Step 1: Open Browser Console
1. Open your app in the browser
2. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
3. Go to the **Console** tab

### Step 2: Search for a Song
1. Click the search icon in your app
2. Type in a song name (e.g., "The Weeknd Blinding Lights")
3. Press Enter or click search

### Step 3: Check Console Logs
You should see detailed logs like:

```
🔍 Searching YouTube for: "The Weeknd Blinding Lights"
📡 Fetching search results for: "The Weeknd Blinding Lights"
📹 Fetching video details for 20 videos
✅ Found 15 embeddable videos out of 20
🎵 Total results found: 15
```

## Common Issues & Solutions

### Issue 1: API Quota Exceeded (403 Error)
**Console shows:**
```
❌ Search API error (403): { error: { code: 403, message: "quotaExceeded" } }
⚠️ YouTube API quota exceeded, using fallback data
```

**Solution:**
- YouTube API has daily quota limits (10,000 units/day by default)
- Each search uses ~100 units
- **Wait 24 hours** for quota to reset, OR
- Get a new API key from [Google Cloud Console](https://console.cloud.google.com/)

### Issue 2: Invalid API Key
**Console shows:**
```
❌ YouTube API key is not configured properly
```

**Solution:**
1. Check your API key in `constants.ts`
2. Verify it's a valid 39-character string
3. Ensure YouTube Data API v3 is enabled in Google Cloud Console

### Issue 3: No Search Results
**Console shows:**
```
ℹ️ No results for "your query"
🎵 Total results found: 0
```

**Reasons:**
- Query too specific or misspelled
- No embeddable videos found (region restrictions)
- App will automatically show fallback MOCK_SONGS

### Issue 4: CORS Errors
**Console shows:**
```
Access to fetch at 'https://www.googleapis.com/youtube/v3/...' has been blocked by CORS policy
```

**Solution:**
- This should NOT happen with YouTube Data API
- If it does, check if you're using browser key restrictions
- Remove HTTP referrer restrictions in Google Cloud Console

## Testing Your Current API Key

Run this in the browser console when the app is loaded:

```javascript
// Test search
fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&maxResults=1&key=AIzaSyDG7ZgeboRkseyPsL65kf6peqE4_hhWeYE')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Expected Response (if working):**
```json
{
  "kind": "youtube#searchListResponse",
  "items": [...]
}
```

**Error Response (if quota exceeded):**
```json
{
  "error": {
    "code": 403,
    "message": "The request cannot be completed because you have exceeded your quota."
  }
}
```

## API Quota Usage

Every operation uses quota units:
- **Search**: ~100 units per call
- **Video details**: 1 unit per video
- **Trending videos**: 1 unit + 1 per video

With 10,000 units/day, you can perform ~100 searches per day.

## Getting a New API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "YouTube Data API v3"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the key and update `constants.ts`

## Fallback Behavior

If the API fails for ANY reason, the app will:
1. Show detailed error in console (with emoji icons for easy scanning)  
2. Return `MOCK_SONGS` as fallback data
3. Continue working (degraded, but functional)

This ensures the app never crashes due to API issues! 🎉
