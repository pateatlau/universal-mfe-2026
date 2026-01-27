#!/bin/bash
# Copyright (c) Universal MFE Project
# Custom bundling script for Re.Pack iOS builds (mobile-remote-hello standalone)

set -e

echo "🔧 Custom Re.Pack bundling script for iOS (mobile-remote-hello)"

# Destination for the bundle
DEST=$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH

# Project root is one level up from ios directory
PROJECT_ROOT="$PROJECT_DIR/.."

cd "$PROJECT_ROOT" || exit 1

echo "📂 Project root: $PROJECT_ROOT"
echo "📦 Configuration: $CONFIGURATION"
echo "🎯 Platform: $PLATFORM_NAME"

# For Debug builds on simulator, skip bundling (use dev server)
case "$CONFIGURATION" in
  *Debug*)
    if [[ "$PLATFORM_NAME" == *simulator ]]; then
      echo "⏭️  Skipping bundling in Debug for Simulator (using dev server)"
      exit 0
    fi
    ;;
esac

# For Release builds, create production bundle
echo "🏗️  Building standalone production bundle with Re.Pack..."

# Use yarn to ensure correct node_modules resolution in monorepo
PLATFORM=ios NODE_ENV=production yarn build:standalone

# Copy the bundle to Xcode's destination
BUNDLE_FILE="$PROJECT_ROOT/dist/standalone/ios/index.bundle"

if [ -f "$BUNDLE_FILE" ]; then
  echo "✅ Bundle created: $BUNDLE_FILE"
  # Copy to main.jsbundle (standard React Native bundle name)
  cp "$BUNDLE_FILE" "$DEST/main.jsbundle"
  echo "✅ Bundle copied to: $DEST/main.jsbundle"

  # Also copy assets if they exist
  ASSETS_DIR="$PROJECT_ROOT/dist/standalone/ios/assets"
  if [ -d "$ASSETS_DIR" ]; then
    echo "📦 Copying assets..."
    cp -R "$ASSETS_DIR/"* "$DEST/" 2>/dev/null || true
    echo "✅ Assets copied"
  fi
else
  echo "❌ Error: Bundle file not found at $BUNDLE_FILE"
  exit 1
fi

echo "✨ Re.Pack bundling complete!"
