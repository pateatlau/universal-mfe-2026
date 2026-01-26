/**
 * @universal/mobile-host
 *
 * Entry point for mobile host application.
 *
 * Registers the app with React Native.
 *
 * Note: Console initialization is handled by PatchMFConsolePlugin (see scripts/PatchMFConsolePlugin.mjs)
 * which prepends a console polyfill at the very start of the bundle, ensuring console exists
 * before webpack runtime code executes. React Native's own initialization will later replace
 * the polyfill with the real console implementation.
 */

import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "../app.json";

AppRegistry.registerComponent(appName, () => App);

