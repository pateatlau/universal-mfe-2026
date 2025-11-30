/docs/how-to-add-a-new-remote.md

How to Add a New Remote (Web + Mobile)

How to Add a New Remote

This guide walks you through adding a new feature remote to the Universal MFE Platform:

A web remote consumed by web-shell

A mobile remote consumed by mobile-host

Shared universal RN UI + shared logic

We’ll call the new feature notifications as an example.

1. Plan the Remote

Before creating anything, answer:

What is the feature? (e.g. notifications, profile, settings)

Does it need to exist on:

Web only?

Mobile only?

Both web and mobile?

For both platforms, you will add:

packages/web-remote-notifications

packages/mobile-remote-notifications

Shared code in shared-\* (if needed)

2. Create Shared UI & Utils (Optional but Recommended)

If the remote has reusable domain logic or UI:

Add new shared util functions in:

packages/shared-utils/src/notifications.ts

Add a universal RN component in:

packages/shared-hello-ui/src/NotificationsWidget.tsx (or another shared UI package)

Example:

import React from "react";
import { View, Text } from "react-native";
import { getUserNotificationSummary } from "@universal/shared-utils";

export function NotificationsWidget() {
const summary = getUserNotificationSummary();
return (
<View>
<Text>Notifications</Text>
<Text>{summary}</Text>
</View>
);
}

3. Add the Web Remote
   3.1 Scaffold the package

Create directory:

packages/web-remote-notifications/

Add package.json:

{
"name": "@universal/web-remote-notifications",
"version": "0.0.1",
"main": "dist/index.js",
"scripts": {
"dev": "rspack serve --config ./rspack.config.mjs",
"build": "rspack build --config ./rspack.config.mjs"
},
"dependencies": {
"react": "19.2.0",
"react-dom": "19.2.0",
"react-native-web": "0.21.2",
"@universal/shared-utils": "_",
"@universal/shared-hello-ui": "_"
}
}

3.2 Implement the remote component

src/NotificationsRemote.tsx:

import React from "react";
import { NotificationsWidget } from "@universal/shared-hello-ui";

export default function NotificationsRemote() {
return <NotificationsWidget />;
}

3.3 Configure Rspack MF

rspack.config.mjs:

import { ModuleFederationPlugin } from "@rspack/core";

export default {
// ...entry, output, resolve, etc.
plugins: [
new ModuleFederationPlugin({
name: "web_remote_notifications",
filename: "remoteEntry.js",
exposes: {
"./NotificationsRemote": "./src/NotificationsRemote"
},
shared: {
react: { singleton: true },
"react-dom": { singleton: true },
"react-native-web": { singleton: true },
"@universal/shared-utils": { singleton: true },
"@universal/shared-hello-ui": { singleton: true }
}
})
]
};

3.4 Register remote in web shell

In web-shell MF config:

remotes: {
hello_remote: "hello_remote@http://localhost:9003/remoteEntry.js",
web_remote_notifications: "web_remote_notifications@http://localhost:9010/remoteEntry.js"
}

And in code:

const NotificationsRemote = React.lazy(() =>
import("web_remote_notifications/NotificationsRemote")
);

4. Add the Mobile Remote

Now we mirror this for mobile using Re.Pack + MFv2.

4.1 Scaffold mobile remote

packages/mobile-remote-notifications/:

{
"name": "@universal/mobile-remote-notifications",
"version": "0.0.1",
"main": "dist/index.js",
"scripts": {
"build:remote": "repack build --config ./repack.remote.config.mjs",
"serve": "repack serve --config ./repack.remote.config.mjs"
},
"dependencies": {
"react": "19.2.0",
"react-native": "0.80.x",
"@universal/shared-utils": "_",
"@universal/shared-hello-ui": "_"
}
}

4.2 Implement mobile remote component

src/NotificationsRemote.tsx:

import React from "react";
import { NotificationsWidget } from "@universal/shared-hello-ui";

export default function NotificationsRemote() {
return <NotificationsWidget />;
}

Entry file src/main.ts:

// Entry for MFv2 container
import "./NotificationsRemote";

4.3 Configure Re.Pack MFv2

repack.remote.config.mjs:

import \* as Repack from "@callstack/repack";
import path from "node:path";

const dirname = Repack.getDirname(import.meta.url);

export default {
context: dirname,
entry: {
app: "./src/main.ts"
},
output: {
path: path.join(dirname, "dist"),
filename: "[name].js"
},
module: {
rules: [
...Repack.getJsTransformRules(),
...Repack.getAssetTransformRules()
]
},
plugins: [
new Repack.RepackPlugin({ platform: "android" }),
new Repack.plugins.ModuleFederationPluginV2({
name: "MobileRemoteNotifications",
filename: "MobileRemoteNotifications.container.js.bundle",
exposes: {
"./NotificationsRemote": "./src/NotificationsRemote"
},
shared: {
react: { singleton: true },
"react-native": { singleton: true },
"@universal/shared-utils": { singleton: true },
"@universal/shared-hello-ui": { singleton: true }
},
dts: false
})
]
};

4.4 Register mobile remote in mobile host

In mobile-host MFv2 config:

remotes: {
HelloRemote: "HelloRemote",
MobileRemoteNotifications: "MobileRemoteNotifications"
}

In mobile host code:

const NotificationsRemote = React.lazy(() =>
Federated.importModule(
"MobileRemoteNotifications",
"./NotificationsRemote",
"default"
)
);

5. Test End-to-End

Start web-remote-notifications dev server.

Start web-shell dev server.

Confirm web shell loads NotificationsRemote.

Build & serve mobile-remote-notifications.

Run mobile-host app.

Confirm mobile host can dynamically load NotificationsRemote.
