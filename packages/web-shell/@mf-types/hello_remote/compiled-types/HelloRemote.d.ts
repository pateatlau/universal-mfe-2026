/**
 * @universal/web-remote-hello
 *
 * Web remote component exposed via Module Federation.
 *
 * This component uses the universal HelloUniversal component from shared-hello-ui,
 * which will be rendered via React Native Web on the web platform.
 */
import { type LocaleCode } from '@universal/shared-i18n';
export interface HelloRemoteProps {
    name?: string;
    onPress?: () => void;
    /** Locale passed from host for i18n synchronization */
    locale?: LocaleCode;
}
/**
 * HelloRemote - Web remote component exposed via MF
 *
 * Wraps HelloUniversal with ThemeProvider and I18nProvider since remote modules
 * load as separate bundles and don't inherit context from the host.
 *
 * The locale prop allows the host to pass its current locale so the remote
 * can display translations in the same language as the host.
 */
export default function HelloRemote({ name, onPress, locale }: HelloRemoteProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=HelloRemote.d.ts.map