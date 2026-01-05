/**
 * Type declarations for Module Federation remote modules.
 * These modules are loaded dynamically at runtime.
 */

declare module 'hello_remote/HelloRemote' {
  import { ComponentType } from 'react';

  interface HelloRemoteProps {
    name?: string;
    onPress?: () => void;
  }

  const HelloRemote: ComponentType<HelloRemoteProps>;
  export default HelloRemote;
}
