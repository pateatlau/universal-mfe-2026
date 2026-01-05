/**
 * @universal/mobile-remote-hello
 *
 * Entry point for the mobile remote.
 *
 * This file serves two purposes:
 * 1. MFv2 container entry - imports HelloRemote for federation
 * 2. Standalone app entry - registers App with AppRegistry for standalone mode
 */

import { AppRegistry } from 'react-native';
import App from './App';

// Import the remote component to ensure it's included in the bundle
import './HelloRemote';

// Register the standalone app
// This is used when running mobile-remote-hello as an independent app
AppRegistry.registerComponent('MobileRemoteHello', () => App);

