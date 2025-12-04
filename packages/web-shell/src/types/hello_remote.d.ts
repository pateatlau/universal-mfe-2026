/**
 * Type declarations for Module Federation remote: hello_remote
 */

declare module 'hello_remote/HelloRemote' {
  export interface HelloRemoteProps {
    name?: string;
    onPress?: () => void;
  }
  const HelloRemote: React.ComponentType<HelloRemoteProps>;
  export default HelloRemote;
}

