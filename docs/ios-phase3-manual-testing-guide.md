# iOS Phase 3 - Manual Testing & Verification Guide

**Phase:** 3 - Build & Test iOS Remote Bundle  
**Purpose:** Verify iOS remote bundle builds correctly and is accessible via dev server

---

## Prerequisites

Before starting, ensure:

- ✅ Node.js and npm are installed
- ✅ All dependencies installed (`yarn install` from root)
- ✅ iOS remote package exists at `packages/mobile-remote-hello/`
- ✅ Re.Pack and Rspack are installed

---

## Quick Reference (From Project Root)

**Build iOS remote bundle:**

```bash
# From project root
PLATFORM=ios npx yarn workspace @universal/mobile-remote-hello build:remote
```

**Serve iOS remote bundle:**

```bash
# From project root
PLATFORM=ios npx yarn workspace @universal/mobile-remote-hello serve
```

**Verify bundles are accessible:**

```bash
# Container bundle (iOS uses port 9005)
curl -I http://localhost:9005/HelloRemote.container.js.bundle

# Expose bundle
curl -I http://localhost:9005/__federation_expose_HelloRemote.bundle

# Manifest
curl http://localhost:9005/mf-manifest.json
```

---

## Step 1: Build iOS Remote Bundle

### 1.1 Build from Project Root (Recommended)

**Option A: Using workspace command (if yarn is in PATH)**

```bash
# From project root
PLATFORM=ios yarn workspace @universal/mobile-remote-hello build:remote
```

**Option B: Using npx yarn workspace command (if yarn not in PATH)**

```bash
# From project root
PLATFORM=ios npx yarn workspace @universal/mobile-remote-hello build:remote
```

### 1.2 Build from Package Directory (Alternative)

If you prefer to work from the package directory:

```bash
cd packages/mobile-remote-hello
PLATFORM=ios npx yarn build:remote
```

**Or using direct Rspack:**

```bash
cd packages/mobile-remote-hello
PLATFORM=ios npx rspack build --config ./repack.remote.config.mjs --env PLATFORM=ios
```

### 1.3 Expected Output

**Success Indicators:**

- ✅ Build completes without errors
- ✅ Console shows: `Rspack compiled successfully in X.XX s`
- ✅ No red error messages

**Failure Indicators:**

- ❌ Build errors or warnings
- ❌ Missing dependencies
- ❌ Configuration errors

---

## Step 2: Verify Bundle Output Files

### 2.1 Check Output Directory

```bash
ls -lh dist/
```

### 2.2 Required Files Checklist

Verify these files exist in `dist/`:

#### ✅ Container Bundle (Required)

```bash
test -f dist/HelloRemote.container.js.bundle && echo "✅ Container bundle exists" || echo "❌ Container bundle missing"
```

**Expected:**

- File: `HelloRemote.container.js.bundle`
- Size: ~4.0MB (approximate)
- Format: Hermes bytecode (ASCII text)

#### ✅ Expose Bundle (Required)

```bash
test -f dist/__federation_expose_HelloRemote.bundle && echo "✅ Expose bundle exists" || echo "❌ Expose bundle missing"
```

**Expected:**

- File: `__federation_expose_HelloRemote.bundle`
- Size: ~1.6KB (approximate)
- Format: Hermes bytecode

#### ✅ Manifest (Required)

```bash
test -f dist/mf-manifest.json && echo "✅ Manifest exists" || echo "❌ Manifest missing"
```

**Expected:**

- File: `mf-manifest.json`
- Size: ~9.1KB (approximate)
- Format: JSON

#### ✅ Source Maps (Optional, for debugging)

```bash
test -f dist/HelloRemote.container.js.bundle.map && echo "✅ Source map exists" || echo "⚠️  Source map missing (optional)"
```

### 2.3 Verify File Contents

**Check Container Bundle Format:**

```bash
file dist/HelloRemote.container.js.bundle
```

**Expected Output:**

```
dist/HelloRemote.container.js.bundle: ASCII text
```

**Check Manifest Structure:**

```bash
cat dist/mf-manifest.json | jq . 2>/dev/null || cat dist/mf-manifest.json
```

**Expected:** Valid JSON with `id`, `name`, `metaData`, and `remoteEntry` fields

---

## Step 3: Start Dev Server

### 3.1 Start Server from Project Root (Recommended)

**Option A: Using workspace command (if yarn is in PATH)**

```bash
# From project root
PLATFORM=ios yarn workspace @universal/mobile-remote-hello serve
```

**Option B: Using npx yarn workspace command (if yarn not in PATH)**

```bash
# From project root
PLATFORM=ios npx yarn workspace @universal/mobile-remote-hello serve
```

### 3.2 Start Server from Package Directory (Alternative)

If you prefer to work from the package directory:

```bash
cd packages/mobile-remote-hello
PLATFORM=ios npx yarn serve
```

**Or using direct Rspack:**

```bash
cd packages/mobile-remote-hello
PLATFORM=ios npx rspack serve --config ./repack.remote.config.mjs --env PLATFORM=ios
```

### 3.2 Expected Server Output

**Success Indicators:**

- ✅ Server starts without errors
- ✅ Console shows: `Server running at http://0.0.0.0:9005` (iOS) or `http://0.0.0.0:9004` (Android)
- ✅ No port conflicts

**Failure Indicators:**

- ❌ Port 9005 (iOS) or 9004 (Android) already in use
- ❌ Configuration errors
- ❌ Missing dependencies

### 3.3 Keep Server Running

**Important:** Keep the dev server running in a separate terminal window/tab. You'll need it for Step 4.

**To run in background from project root:**

```bash
PLATFORM=ios yarn workspace @universal/mobile-remote-hello serve > /tmp/remote-server.log 2>&1 &
```

**Or from package directory:**

```bash
cd packages/mobile-remote-hello
PLATFORM=ios npx yarn serve > /tmp/remote-server.log 2>&1 &
```

**To stop server:**

```bash
# Find process
lsof -ti:9004

# Kill process
kill $(lsof -ti:9004)
```

---

## Step 4: Verify Bundle Accessibility

### 4.1 Test Container Bundle HTTP Access

**From a new terminal (server should be running):**

```bash
# iOS uses port 9005
curl -I http://localhost:9005/HelloRemote.container.js.bundle
```

**Expected Output:**

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/javascript
Content-Length: [size in bytes]
Access-Control-Allow-Origin: *
```

**Success Criteria:**

- ✅ HTTP status: `200 OK`
- ✅ `Access-Control-Allow-Origin: *` header present
- ✅ Content-Type is `application/javascript` or similar

**Failure Indicators:**

- ❌ `404 Not Found` - Bundle file missing
- ❌ `Connection refused` - Server not running
- ❌ No CORS headers - Configuration issue

### 4.2 Test Expose Bundle HTTP Access

```bash
curl -I http://localhost:9005/__federation_expose_HelloRemote.bundle
```

**Expected Output:**

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/javascript
Content-Length: [size in bytes]
Access-Control-Allow-Origin: *
```

**Success Criteria:**

- ✅ HTTP status: `200 OK`
- ✅ CORS headers present

### 4.3 Test Manifest HTTP Access

```bash
curl http://localhost:9005/mf-manifest.json
```

**Expected Output:**

```json
{
  "id": "HelloRemote",
  "name": "HelloRemote",
  "metaData": {
    "name": "HelloRemote",
    "type": "app",
    "buildInfo": {
      "buildVersion": "0.1.0",
      "buildName": "@universal/mobile-remote-hello"
    },
    "remoteEntry": {
      "name": "HelloRemote.container.js.bundle",
      "path": "",
      "type": "global"
    },
    ...
  }
}
```

**Success Criteria:**

- ✅ Valid JSON response
- ✅ Contains `id: "HelloRemote"`
- ✅ Contains `remoteEntry` with correct bundle name

### 4.4 Test Bundle Content Download

**Download and verify container bundle:**

```bash
curl -o /tmp/test-container.bundle http://localhost:9005/HelloRemote.container.js.bundle
ls -lh /tmp/test-container.bundle
```

**Expected:**

- ✅ File downloads successfully
- ✅ File size matches `dist/HelloRemote.container.js.bundle`

**Compare checksums:**

```bash
md5 dist/HelloRemote.container.js.bundle
md5 /tmp/test-container.bundle
```

**Expected:** Checksums match (or file sizes match if md5 not available)

---

## Step 5: Verify iOS-Specific Configuration

### 5.1 Check Platform Variable

Verify the build used iOS platform:

```bash
grep -r "platform.*ios" dist/ 2>/dev/null || echo "Platform info not in bundle (normal)"
```

**Note:** Platform info may not be directly visible in bundle files, but the build should have used `PLATFORM=ios`.

### 5.2 Verify Hermes Format

**Check bundle format:**

```bash
head -20 dist/HelloRemote.container.js.bundle
```

**Expected:**

- ✅ Hermes bytecode format (may appear as ASCII text)
- ✅ Not plain JavaScript source code
- ✅ Contains module federation container code

---

## Step 6: Network Accessibility Test (iOS Simulator)

### 6.1 Test from iOS Simulator Context

**Note:** iOS simulator uses `localhost` to access the host machine.

**From macOS terminal (where server is running):**

```bash
# Test that localhost:9005 is accessible (iOS uses port 9005)
curl http://localhost:9005/HelloRemote.container.js.bundle -I
```

**Expected:** `200 OK` response

### 6.2 Verify CORS Headers

```bash
curl -H "Origin: http://localhost:8081" \
     -H "Access-Control-Request-Method: GET" \
     -I http://localhost:9005/HelloRemote.container.js.bundle
```

**Expected:**

- ✅ `Access-Control-Allow-Origin: *` header present
- ✅ Allows requests from any origin

---

## Verification Checklist

Use this checklist to verify Phase 3 completion:

### Build Verification

- [ ] Build completes without errors
- [ ] Container bundle exists (`HelloRemote.container.js.bundle`)
- [ ] Expose bundle exists (`__federation_expose_HelloRemote.bundle`)
- [ ] Manifest exists (`mf-manifest.json`)
- [ ] Bundle files are non-empty (check sizes)

### Server Verification

- [ ] Dev server starts on port 9005 (iOS) or 9004 (Android)
- [ ] Server runs without errors
- [ ] Server serves static files from `dist/`

### HTTP Access Verification

- [ ] Container bundle accessible via HTTP (`200 OK`)
- [ ] Expose bundle accessible via HTTP (`200 OK`)
- [ ] Manifest accessible via HTTP (`200 OK`)
- [ ] CORS headers present in responses
- [ ] Bundle content downloads correctly

### iOS-Specific Verification

- [ ] Build used `PLATFORM=ios` environment variable
- [ ] Bundles are in Hermes-compatible format
- [ ] `localhost:9005` is accessible (for iOS simulator)

---

## Troubleshooting

### Issue: Build Fails

**Symptoms:**

- Build errors or warnings
- Missing dependencies

**Solutions:**

1. Check Node.js version compatibility
2. Run `yarn install` from root
3. Verify `repack.remote.config.mjs` exists
4. Check for TypeScript errors: `yarn tsc --noEmit`

### Issue: Bundle Files Missing

**Symptoms:**

- `dist/` directory empty or missing files

**Solutions:**

1. Check build output for errors
2. Verify `output.path` in config
3. Check file permissions
4. Rebuild: `PLATFORM=ios yarn build:remote`

### Issue: Server Won't Start

**Symptoms:**

- Port 9004 already in use
- Server crashes on start

**Solutions:**

1. Check if port is in use: `lsof -ti:9005` (iOS) or `lsof -ti:9004` (Android)
2. Kill existing process: `kill $(lsof -ti:9005)` or `kill $(lsof -ti:9004)`
3. Verify `PLATFORM=ios` is set for iOS builds
4. Check server logs for errors

### Issue: Bundles Not Accessible

**Symptoms:**

- `404 Not Found` when accessing bundles
- Connection refused

**Solutions:**

1. Verify server is running: `curl http://localhost:9005` (iOS) or `curl http://localhost:9004` (Android)
2. Check server is serving from `dist/` directory
3. Verify file paths match URLs
4. Check CORS configuration

### Issue: Wrong Bundle Format

**Symptoms:**

- Bundle appears as plain JavaScript
- Hermes errors when loading

**Solutions:**

1. Verify `hermes: true` in Re.Pack config
2. Rebuild with `PLATFORM=ios`
3. Check Re.Pack version compatibility

---

## Success Criteria

Phase 3 is **complete** when:

1. ✅ iOS remote bundle builds successfully
2. ✅ All required bundle files exist in `dist/`
3. ✅ Dev server runs on port 9005 (iOS) or 9004 (Android)
4. ✅ All bundles are accessible via HTTP (`200 OK`)
5. ✅ CORS headers are present
6. ✅ Bundles are in Hermes-compatible format
7. ✅ Port separation allows simultaneous Android/iOS testing

---

## Next Steps

After completing Phase 3 verification:

**Phase 4:** Build & Run iOS Host

- Build iOS host bundle
- Start iOS host dev server
- Launch iOS app in simulator

**Phase 5:** Test Remote Loading

- Load remote component in iOS app
- Verify ScriptManager resolver
- Test component rendering

---

**Document Version:** 1.0  
**Last Updated:** 2026
