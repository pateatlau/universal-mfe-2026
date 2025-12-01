# Android Build - Disk Space Issue Fix

## Problem

Android build fails with:
```
fatal error: error in backend: IO failure on output stream: No space left on device
```

This indicates your disk is full and the Android NDK compiler cannot write build artifacts.

---

## Quick Fix Steps

### 1. Check Disk Space

```bash
df -h /
```

**If usage is > 90%, you need to free up space.**

### 2. Clean Android Build Artifacts

**Clean the Android build directory:**
```bash
cd packages/mobile-host/android
./gradlew clean
```

**Remove C++ build cache:**
```bash
cd packages/mobile-host/android
rm -rf app/.cxx
```

**Remove build directories:**
```bash
cd packages/mobile-host/android
rm -rf app/build
rm -rf build
```

### 3. Clean Gradle Cache (if needed)

**Warning:** This will remove all Gradle caches. Only do this if you have plenty of space elsewhere.

```bash
# Check size first
du -sh ~/.gradle/caches

# Clean if needed (this will require re-downloading dependencies)
rm -rf ~/.gradle/caches
```

**Alternative - Clean only old/unused caches:**
```bash
cd ~/.gradle
./gradlew cleanBuildCache  # If available
# Or manually remove old cache directories
```

### 4. Clean Other Large Directories (if needed)

**Check for other large directories:**
```bash
# Check node_modules size
du -sh node_modules 2>/dev/null
du -sh packages/*/node_modules 2>/dev/null

# Check iOS build artifacts
du -sh packages/mobile-host/ios/build 2>/dev/null
du -sh packages/mobile-host/ios/Pods 2>/dev/null

# Check dist directories
du -sh packages/*/dist 2>/dev/null
```

**Clean if needed:**
```bash
# Remove iOS build artifacts (will need to rebuild)
rm -rf packages/mobile-host/ios/build

# Remove dist directories (will need to rebuild)
find packages -type d -name "dist" -exec rm -rf {} + 2>/dev/null
```

### 5. Rebuild Android App

After freeing space:

```bash
cd packages/mobile-host
PLATFORM=android yarn android:app
```

---

## Prevention

### Regular Cleanup Script

Add this to your workflow:

```bash
# Clean Android build artifacts
cd packages/mobile-host/android
./gradlew clean
rm -rf app/.cxx app/build build

# Clean iOS build artifacts (if not needed)
rm -rf ../ios/build

# Clean dist directories
find ../../packages -type d -name "dist" -exec rm -rf {} + 2>/dev/null
```

### Monitor Disk Space

```bash
# Add to your shell profile (.zshrc or .bashrc)
alias diskspace='df -h / && echo "---" && du -sh ~/.gradle/caches 2>/dev/null && du -sh packages/*/android/.cxx 2>/dev/null'
```

---

## Common Large Directories

| Directory | Typical Size | Safe to Delete? |
|-----------|--------------|-----------------|
| `~/.gradle/caches` | 1-10 GB | ✅ Yes (will re-download) |
| `packages/mobile-host/android/.cxx` | 500 MB - 2 GB | ✅ Yes (rebuilds on next build) |
| `packages/mobile-host/android/app/build` | 200 MB - 1 GB | ✅ Yes (rebuilds on next build) |
| `packages/mobile-host/ios/build` | 500 MB - 2 GB | ✅ Yes (rebuilds on next build) |
| `packages/*/dist` | 10-100 MB each | ✅ Yes (rebuilds on next build) |
| `node_modules` | 500 MB - 2 GB | ⚠️ Only if you can reinstall |

---

## Quick Cleanup Command

**Single command to clean Android build artifacts:**

```bash
cd packages/mobile-host/android && ./gradlew clean && rm -rf app/.cxx app/build build && echo "✅ Android build artifacts cleaned"
```

---

**Last Updated:** 2026-01-XX

