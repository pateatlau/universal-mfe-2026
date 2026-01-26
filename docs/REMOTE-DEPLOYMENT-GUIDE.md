# Remote Module Deployment Guide

This guide explains how to deploy the mobile remote bundles so they're accessible to release builds on real devices.

## Problem

The mobile-host app loads remote modules dynamically using Module Federation. In development, remotes run on:
- Android emulator: `http://10.0.2.2:9004`
- iOS simulator: `http://localhost:9005`

These addresses **don't work on real devices**. Release builds need remotes deployed to a publicly accessible URL.

## Solution: Deploy Remote to Firebase Hosting

Firebase Hosting provides free, fast CDN hosting for static files - perfect for remote bundles.

### Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project already set up (you're using Firebase App Distribution)
- Admin access to the Firebase project

---

## Step-by-Step Deployment

### 1. Build the Remote Bundle

```bash
# From project root
cd packages/mobile-remote-hello

# Build for Android
PLATFORM=android yarn build:remote

# The bundle is output to: dist/android/
```

### 2. Configure Firebase Hosting

Create or update `firebase.json` in the project root:

```json
{
  "hosting": {
    "public": "packages/mobile-remote-hello/dist/android",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "**/*.bundle",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/javascript"
          },
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          },
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600"
          }
        ]
      }
    ]
  }
}
```

### 3. Deploy to Firebase Hosting

```bash
# Login to Firebase (if not already)
firebase login

# Deploy
firebase deploy --only hosting

# You'll get a URL like: https://your-project.web.app
```

### 4. Update Remote URL in Host App

Edit `packages/mobile-host/src/config/remoteConfig.ts`:

```typescript
const PRODUCTION_REMOTE_URL = 'https://your-project.web.app'; // Update this line
```

### 5. Rebuild the Host App

```bash
cd packages/mobile-host

# Clean previous build
yarn clean:android
cd android
./gradlew clean
cd ..

# Rebuild
cd android
./gradlew assembleRelease --no-daemon
```

The new APK will be at:
`android/app/build/outputs/apk/release/app-release.apk`

### 6. Test Locally

Before distributing, test the release build:

```bash
# Install the release APK on a connected device or emulator
adb install android/app/build/outputs/apk/release/app-release.apk

# Check logs to verify remote loading
adb logcat | grep -i "RemoteConfig\|ScriptManager"
```

You should see logs like:
```
[RemoteConfig] Using production remote: https://your-project.web.app
[ScriptManager resolver] resolved URL for HelloRemote: https://your-project.web.app/HelloRemote.container.js.bundle
```

### 7. Distribute via Firebase App Distribution

Push to Firebase App Distribution or create a new GitHub release tag to trigger CI/CD.

---

## Alternative: Temporary Testing with ngrok

For quick testing without deploying, use ngrok to expose your local dev server:

### 1. Start the Remote Dev Server

```bash
cd packages/mobile-remote-hello
PLATFORM=android yarn serve:android
# Server running on http://localhost:9004
```

### 2. Expose with ngrok

```bash
# Install ngrok
brew install ngrok

# Expose port 9004
ngrok http 9004

# Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)
```

### 3. Update Remote URL

Edit `packages/mobile-host/src/config/remoteConfig.ts`:

```typescript
const PRODUCTION_REMOTE_URL = 'https://abc123.ngrok-free.app'; // Your ngrok URL
```

### 4. Rebuild and Test

**Note:** ngrok free URLs expire when you stop ngrok. For persistent testing, use Firebase Hosting.

---

## Verification Checklist

After deploying and rebuilding:

- [ ] Firebase Hosting shows your remote bundles
- [ ] `https://your-project.web.app/HelloRemote.container.js.bundle` is accessible
- [ ] Host app `remoteConfig.ts` points to correct production URL
- [ ] Host app rebuilt with updated config
- [ ] Release APK tested on real device (not emulator)
- [ ] App loads without crash/minimize
- [ ] Remote module functionality works correctly
- [ ] No network errors in logcat

---

## Troubleshooting

### Issue: App crashes on launch

**Cause:** Remote URL unreachable or incorrect

**Solution:**
1. Verify Firebase Hosting URL is correct
2. Check bundle files are deployed: `curl https://your-project.web.app/HelloRemote.container.js.bundle`
3. Check logs: `adb logcat | grep -i error`

### Issue: Remote module doesn't load

**Cause:** CORS or content-type headers

**Solution:**
- Ensure `firebase.json` has correct headers (see Step 2)
- Redeploy: `firebase deploy --only hosting`

### Issue: ngrok URL doesn't work

**Cause:** ngrok free tier has limitations

**Solution:**
- Check ngrok is still running
- Use HTTPS URL (not HTTP)
- Consider Firebase Hosting for reliable testing

---

## CI/CD Integration

To automate remote deployment on every release:

### Option 1: GitHub Actions

Add to `.github/workflows/deploy-android.yml`:

```yaml
- name: Deploy Remote to Firebase Hosting
  run: |
    cd packages/mobile-remote-hello
    PLATFORM=android yarn build:remote
    cd ../../
    firebase deploy --only hosting --token ${{ secrets.FIREBASE_TOKEN }}
```

### Option 2: Manual Script

Create `scripts/deploy-remote.sh`:

```bash
#!/bin/bash
set -e

echo "Building mobile remote..."
cd packages/mobile-remote-hello
PLATFORM=android yarn build:remote

echo "Deploying to Firebase Hosting..."
cd ../../
firebase deploy --only hosting

echo "✅ Remote deployed successfully!"
echo "Don't forget to rebuild the host app if the remote URL changed."
```

Make executable: `chmod +x scripts/deploy-remote.sh`

Run: `./scripts/deploy-remote.sh`

---

## Best Practices

1. **Version your remotes:** Use versioned URLs for production
   - Example: `https://your-project.web.app/v1.0.0/HelloRemote.container.js.bundle`

2. **Environment variables:** Use different remote URLs for staging/production
   - Create `remoteConfig.staging.ts` and `remoteConfig.production.ts`

3. **Cache control:** Set appropriate cache headers in `firebase.json`

4. **Monitoring:** Log remote loading success/failure for debugging

5. **Rollback plan:** Keep previous remote versions deployed for backward compatibility

---

## Next Steps

After successfully deploying:

1. Test thoroughly on multiple real devices
2. Share Firebase App Distribution link with testers
3. Monitor crash reports and logs
4. Plan for production deployment strategy (versioning, rollbacks, etc.)

---

## Related Documentation

### Internal Documentation
- [Mobile Release Build Fixes](./MOBILE-RELEASE-BUILD-FIXES.md) - Critical fixes for Android release builds
- [PatchMFConsolePlugin Guide](./PATCHMFCONSOLEPLUGIN-GUIDE.md) - Console polyfill plugin guide
- [CI/CD Implementation Plan](./CI-CD-IMPLEMENTATION-PLAN.md) - Automated deployment workflows
- [CI/CD Testing Guide](./CI-CD-TESTING-GUIDE.md) - Testing deployment pipelines
- [Git Flow Workflow](./GIT-FLOW-WORKFLOW.md) - Development and release process

### External References
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Re.Pack Documentation](https://re-pack.dev/)
- Project [README](../README.md) and [CLAUDE.md](../CLAUDE.md)
