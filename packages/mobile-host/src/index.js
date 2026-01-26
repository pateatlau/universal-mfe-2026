/**
 * @universal/mobile-host
 *
 * Entry point for mobile host application.
 *
 * Registers the app with React Native.
 */

// CRITICAL: Import React Native's core initialization FIRST
// This sets up global variables like console, setTimeout, etc.
// Required for Module Federation and Re.Pack in release builds
import 'react-native/Libraries/Core/InitializeCore';

import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "../app.json";

AppRegistry.registerComponent(appName, () => App);

