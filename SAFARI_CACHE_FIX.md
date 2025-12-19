# Safari Cache Fix - December 2024

## Issue Summary
iPhone Safari in normal mode was rendering the site without styles (broken layout, plain text navigation). The site worked correctly in Safari Private Browsing mode.

## Root Cause
**File:** `netlify.toml` (lines 33-40)

CSS and JS files were cached with aggressive headers:
```toml
Cache-Control = "public, max-age=31536000, immutable"
```

- Files cached for **1 year** with `immutable` flag
- Safari normal mode aggressively cached and **never checked for updates**
- Safari private mode doesn't use persistent cache → always fetched fresh files → worked fine
- When `styles.css` or `main.js` were updated, Safari kept serving stale cached versions

## Solution Applied
Changed CSS/JS cache headers in `netlify.toml` to:
```toml
Cache-Control = "public, max-age=86400, must-revalidate"
```

- Cache for **24 hours** instead of 1 year
- `must-revalidate` forces Safari to check with server before using cached version
- Balances performance (still caches) with freshness (checks for updates)
- Images kept at 1 year cache (they rarely change)

## How to Avoid This in Future

### Option 1: Use Versioned Filenames (Recommended for production)
When building assets, include version hash in filename:
```html
<link rel="stylesheet" href="/css/styles.a3f2b1c.css">
<script src="/js/main.d4e5f6g.js"></script>
```

Then you CAN use `immutable` caching safely because filename changes force new downloads.

### Option 2: Use Query String Versioning
Add version parameter to asset URLs:
```html
<link rel="stylesheet" href="/css/styles.css?v=1.2.0">
<script src="/js/main.js?v=1.2.0"></script>
```

Increment version when files change.

### Option 3: Keep Current Setup
If not using versioned filenames:
- Use `must-revalidate` for CSS/JS (as implemented)
- Accept the trade-off: more server checks, but guaranteed fresh content
- Good for small sites with infrequent updates

## Testing the Fix

### After deploying:
1. Clear Safari cache on iPhone (Settings → Safari → Clear History and Website Data)
2. Visit site in normal Safari mode → should render correctly
3. Make a CSS change and deploy
4. Reload page within 24 hours → should see update (may need hard refresh)

### Prevent regressions:
- When updating `netlify.toml`, never set `max-age > 86400` for CSS/JS without versioned filenames
- Always test in Safari normal mode, not just private mode
- If adding build tools later, implement asset versioning

## Related Files
- `netlify.toml` - Caching headers configuration
- `index.html` - Loads `/css/styles.css` and `/js/main.js`

---
**Fixed:** December 19, 2024
**Commit:** Safari cache fix - use must-revalidate for CSS/JS
