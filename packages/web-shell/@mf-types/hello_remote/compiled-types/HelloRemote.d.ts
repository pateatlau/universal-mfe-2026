/**
 * @universal/web-remote-hello
 *
 * Web remote component exposed via Module Federation.
 *
 * This component uses the universal HelloUniversal component from shared-hello-ui,
 * which will be rendered via React Native Web on the web platform.
 */
export interface HelloRemoteProps {
    name?: string;
    onPress?: () => void;
}
/**
 * HelloRemote - Web remote component exposed via MF
 */
export default function HelloRemote({ name, onPress }: HelloRemoteProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=HelloRemote.d.ts.map