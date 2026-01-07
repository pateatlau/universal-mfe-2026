/**
 * @universal/web-remote-hello
 *
 * Web remote component exposed via Module Federation.
 *
 * This component uses the universal HelloUniversal component from shared-hello-ui,
 * which will be rendered via React Native Web on the web platform.
 *
 * ## Event Bus Integration
 *
 * This remote demonstrates inter-MFE communication via the event bus:
 * - Emits `BUTTON_PRESSED` event when the button is clicked
 * - Host receives the event and can react (e.g., update state, analytics)
 * - Still supports `onPress` callback for backward compatibility
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
 * Wraps HelloUniversal with providers since remote modules load as separate
 * bundles and don't inherit context from the host.
 *
 * Provider order:
 * 1. EventBusProvider - For emitting events to the host
 * 2. I18nProvider - For translations
 * 3. ThemeProvider - For theming
 *
 * The locale prop allows the host to pass its current locale so the remote
 * can display translations in the same language as the host.
 */
export default function HelloRemote({ name, onPress, locale }: HelloRemoteProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=HelloRemote.d.ts.map