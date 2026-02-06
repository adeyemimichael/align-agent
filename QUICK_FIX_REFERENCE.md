# Quick Fix Reference

## 🔴 Problem 1: Todoist Disconnect - HTTP 405
**Status**: ✅ FIXED

The disconnect button now properly sends a DELETE request instead of POST.

**No action needed** - Just restart your dev server and test.

---

## 🔴 Problem 2: Google Calendar - redirect_uri_mismatch  
**Status**: ⚠️ REQUIRES GOOGLE CLOUD CONSOLE SETUP

### Quick Fix (5 minutes):

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Click**: Your OAuth 2.0 Client ID (or create one)
3. **Add this URI** under "Authorized redirect URIs":
   ```
   http://localhost:3000/api/integrations/google-calendar/callback
   ```
4. **Click**: Save
5. **Restart** your dev server

### That's it! 

For detailed instructions, see `GOOGLE_OAUTH_SETUP.md`

---

## Test Your Fixes

```bash
# Restart dev server
npm run dev

# Then visit:
# http://localhost:3000/integrations
```

### Test Todoist Disconnect:
1. Click "Disconnect" on Todoist card
2. Confirm dialog
3. Should reload with Todoist disconnected ✅

### Test Google Calendar Connect:
1. Click "Connect Google Calendar"
2. Should redirect to Google OAuth (not error page) ✅
3. Grant permissions
4. Should redirect back to dashboard ✅

---

## Still Having Issues?

### Todoist Disconnect Still Failing?
- Check browser console for errors
- Make sure you're logged in
- Try clearing browser cache

### Google Calendar Still Showing redirect_uri_mismatch?
- Double-check the URI in Google Cloud Console (no typos!)
- Make sure NEXTAUTH_URL in .env is `http://localhost:3000`
- Restart dev server after any .env changes
- Try in incognito/private browsing mode

---

## Environment Variables Check

Your `.env` should have:
```bash
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

Make sure:
- No trailing slashes on NEXTAUTH_URL
- Client ID and Secret are from Google Cloud Console
- No extra quotes or spaces
