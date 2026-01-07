/**
 * @universal/web-remote-hello
 *
 * Web remote component exposed via Module Federation.
 *
 * This component uses the universal HelloUniversal component from shared-hello-ui,
 * which will be rendered via React Native Web on the web platform.
 *
 * ## MFE State Pattern
 *
 * This remote demonstrates the recommended MFE state pattern:
 *
 * 1. **Local State (Zustand)**: Each MFE owns its local state
 *    - Press count, preferences, etc. are MFE-local
 *    - State mutations happen within the MFE
 *    - No direct state sharing with host/other MFEs
 *
 * 2. **Inter-MFE Communication (Event Bus)**: Events notify other MFEs
 *    - Emits `BUTTON_PRESSED` event when the button is clicked
 *    - Host receives the event and can react (e.g., update its own state)
 *    - Events carry information, not state references
 *
 * 3. **Backward Compatibility**: Still supports `onPress` callback
 */
import { type ThemeName } from '@universal/shared-theme-context';
import { type LocaleCode } from '@universal/shared-i18n';
export interface HelloRemoteProps {
    name?: string;
    onPress?: () => void;
    /** Initial locale (deprecated: use event bus sync instead) */
    locale?: LocaleCode;
    /** Initial theme (deprecated: use event bus sync instead) */
    theme?: ThemeName;
}
/**
 * HelloRemote - Web remote component exposed via MF
 *
 * Wraps HelloUniversal with providers since remote modules load as separate
 * bundles and don't inherit context from the host.
 *
 * Provider order:
 * 1. EventBusProvider - For event bus communication with host
 * 2. EventSyncWrapper - Listens for theme/locale changes from host
 * 3. I18nProvider - For translations (synced via events)
 * 4. ThemeProvider - For theming (synced via events)
 *
 * Theme and locale sync via Event Bus:
 * - Host emits THEME_CHANGED when theme changes
 * - Host emits LOCALE_CHANGED when locale changes
 * - This component listens and updates its providers accordingly
 */
export default function HelloRemote({ name, onPress, locale: initialLocale, theme: initialTheme, }: HelloRemoteProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=HelloRemote.d.ts.map