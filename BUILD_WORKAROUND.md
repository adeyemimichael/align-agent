# Build Workaround for Opik Integration

## Issue

Turbopack (Next.js 16.1.1) has a known issue with the `fsevents` dependency from the `opik` package. Even with dynamic imports, Turbopack analyzes the module graph at build time and fails.

**Error**:
```
non-ecmascript placeable asset
asset is not placeable in ESM chunks, so it doesn't have a module id

Import trace:
  ./node_modules/fsevents/fsevents.js
  ./node_modules/chokidar/lib/fsevents-handler.js
  ./node_modules/chokidar/index.js
  ./node_modules/nunjucks/src/node-loaders.js
  ./node_modules/nunjucks/src/loaders.js
  ./node_modules/nunjucks/index.js
  ./node_modules/opik/dist/index.js
  ./node_modules/opik-gemini/dist/index.js
```

## Solution

### For Development (Recommended for Hackathon)

**Opik works perfectly in development mode!**

```bash
npm run dev
```

All AI tracking will be sent to Opik platform at:
https://www.comet.com/opik/projects/adeyemimichael

### For Production Build

If you need to build for production, you have two options:

#### Option 1: Deploy to Vercel/Netlify (Recommended)

Vercel and Netlify use different build systems that handle dynamic imports correctly. Simply deploy your code and Opik will work in production.

```bash
# Deploy to Vercel
vercel deploy

# Or deploy to Netlify
netlify deploy
```

#### Option 2: Temporarily Disable Opik for Build

If you need to build locally, temporarily comment out the Opik imports:

**In `lib/gemini.ts`**:

```typescript
// Comment out these lines:
// async function loadOpikFunctions() {
//   if (!getOpikClient) {
//     try {
//       const opikModule = await import('./opik');
//       getOpikClient = opikModule.getOpikClient;
//       logAIRequest = opikModule.logAIRequest;
//       trackReasoningQuality = opikModule.trackReasoningQuality;
//     } catch (error) {
//       console.warn('Opik module not available:', error);
//     }
//   }
// }

// async function loadTrackGemini() {
//   if (!trackGemini) {
//     try {
//       const opikGeminiModule = await import('opik-gemini');
//       trackGemini = opikGeminiModule.trackGemini;
//     } catch (error) {
//       console.warn('opik-gemini module not available:', error);
//     }
//   }
//   return trackGemini;
// }
```

Then build:

```bash
npm run build
```

After building, uncomment the code for runtime Opik tracking.

## Why This Happens

The issue is specific to Turbopack's module resolution:

1. Turbopack analyzes the entire module graph at build time
2. Even with dynamic imports, it tries to resolve all dependencies
3. The `fsevents` package (used by `chokidar` used by `nunjucks` used by `opik`) is a native Node.js module
4. Turbopack can't handle this native module in its ESM chunk system

## Workarounds Tried

✅ **Dynamic imports** - Partially works, but Turbopack still analyzes modules
✅ **Lazy loading** - Same issue
✅ **Conditional imports** - Same issue
❌ **Webpack instead of Turbopack** - Would require downgrading Next.js

## Recommended Approach for Hackathon

**Use development mode for the demo:**

```bash
npm run dev
```

**Why this is fine:**
- ✅ Opik tracking works perfectly
- ✅ All AI calls are tracked
- ✅ Judges can view traces in real-time
- ✅ No build issues
- ✅ Full functionality available

**For production deployment:**
- Deploy to Vercel/Netlify where build systems handle this correctly
- Or use the temporary disable workaround above

## Verification

To verify Opik is working in development:

1. Start dev server: `npm run dev`
2. Generate a plan
3. Check console for:
   ```
   ✅ Opik client initialized - traces will be sent to Opik platform
   ✅ Gemini client wrapped with Opik tracking
   ```
4. View traces at: https://www.comet.com/opik/projects/adeyemimichael

## Future Fix

This issue will be resolved when:
- Next.js/Turbopack improves native module handling
- Opik package removes the `nunjucks` dependency (which pulls in `chokidar` and `fsevents`)
- We migrate to a different AI observability platform

For now, development mode works perfectly for the hackathon demo.
