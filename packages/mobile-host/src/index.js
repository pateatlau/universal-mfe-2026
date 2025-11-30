/**
 * @universal/mobile-host
 * 
 * Entry point for mobile host application.
 * 
 * Registers the app with React Native.
 */

import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "../app.json";

AppRegistry.registerComponent(appName, () => App);

