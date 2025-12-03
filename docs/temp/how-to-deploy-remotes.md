/docs/how-to-deploy-remotes.md

How to Deploy Web & Mobile Remotes

How to Deploy Remotes

This guide describes how to deploy web remotes and mobile remotes into a production-like environment.

We assume:

Hosts can be released independently

Remotes can be updated independently

You want safe, incremental rollout

1. General Deployment Principles

Hosts should be stable and rarely change.

Remotes should be frequently deployable.

Remotes must be backward compatible with host expectations.

All remotes must respect semantic versioning for breaking changes.

2. Web Remotes
   2.1 Build Step

Run from the web remote package:

cd packages/web-remote-hello
yarn build

This produces (path may vary):

dist/
remoteEntry.js
...

2.2 Hosting

Recommended options:

CDN (e.g., CloudFront, Fastly, Akamai)

Static hosting (e.g., S3 + CloudFront, Netlify, Vercel static assets)

Requirements:

Files must be served over HTTPS.

CORS headers must allow the host domain.

Cache headers should be tuned:

remoteEntry.js often needs cache-busting (via content hash or URL versioning).

Secondary chunks can be cached longer.

2.3 Host Configuration (Web Shell)

In web-shell MF config, update:

remotes: {
hello_remote: "hello_remote@https://cdn.example.com/remotes/hello-remote/remoteEntry.js"
}

You can parameterize the URL via environment variables:

const HELLO_REMOTE_URL = process.env.HELLO_REMOTE_URL;
// ...
remotes: {
hello_remote: `hello_remote@${HELLO_REMOTE_URL}`
}

2.4 Versioning Strategy (Web)

For non-breaking changes:

Deploy new remoteEntry.js to the same URL.

Browsers pull the updated remote on refresh.

For breaking changes:

Use versioned paths, e.g.:

.../hello-remote/v1/remoteEntry.js

.../hello-remote/v2/remoteEntry.js

Let the host choose which version to load per environment.

3. Mobile Remotes

Mobile remotes produce native-style JS bundles consumed via ScriptManager + MFv2.

3.1 Build Step

From mobile-remote-hello:

cd packages/mobile-remote-hello
yarn build:remote

This produces:

dist/
HelloRemote.container.js.bundle
HelloRemote.container.js.bundle.map

3.2 Hosting

Again, recommended:

CDN or static hosting

HTTPS-only

Reasonable caching

Example deployment location:

https://cdn.example.com/mf/mobile/HelloRemote/v1/HelloRemote.container.js.bundle

3.3 ScriptManager Resolver (Mobile Host)

In mobile-host bootstrap:

ScriptManager.shared.addResolver(async (scriptId, caller) => {
switch (scriptId) {
case "HelloRemote":
return {
url: "https://cdn.example.com/mf/mobile/HelloRemote/v1/HelloRemote.container.js.bundle"
};
case "MobileRemoteNotifications":
return {
url: "https://cdn.example.com/mf/mobile/Notifications/v1/Notifications.container.js.bundle"
};
default:
throw new Error(`Unknown scriptId: ${scriptId}`);
}
});

Now the host does not hardcode the MF config; it simply asks ScriptManager to resolve script URLs.

3.4 Versioning Strategy (Mobile)

Non-breaking change:

Deploy new bundle to v1 path, update host if needed only for bugfixes.

Breaking change:

Create v2 path:

.../HelloRemote/v2/HelloRemote.container.js.bundle

Update ScriptManager resolver in mobile host to point to v2 when you ship the new compatible host version.

3.5 OTA vs App Store Releases

You can combine:

Host updates via App Store/Play Store

Remote updates via CDN / OTA

Rules of thumb:

Minor UI tweaks / bugfixes → remote-only deploy.

Changes to navigation / shell / critical flows → host + remote coordinated release.

Breaking interface changes → use versioned remote URLs.

4. Environment-Specific Configuration

Use environment variables or config files:

HELLO_REMOTE_WEB_URL

HELLO_REMOTE_MOBILE_BUNDLE_URL

Example pattern:

config/remote-manifest.dev.json

config/remote-manifest.staging.json

config/remote-manifest.prod.json

Hosts can load a manifest and use it to configure MF and ScriptManager resolvers.

5. Validating a Deployment

For each deployment (web or mobile):

Build succeeded with no errors.

MF config points to the new URL.

ScriptManager resolver and web shell env vars are updated (where relevant).

Integration tested in:

Dev

Staging

Production (canary / partial rollout)

6. Rollback Plan

Always prepare a rollback procedure:

Web:

Point host back to previous remoteEntry URL.

Or redeploy previous remoteEntry.js.

Mobile:

Update ScriptManager resolver to point back to previous bundle version.

If critical & remote cannot be rolled back, ship a host hotfix.

7. Summary

Web remotes are standard MF remoteEntry.js bundles served over HTTPS.

Mobile remotes are MFv2 container bundles consumed via ScriptManager.

Both can be deployed independently of hosts.

Versioning and URL indirection (env vars / config) enable safe rollout.
