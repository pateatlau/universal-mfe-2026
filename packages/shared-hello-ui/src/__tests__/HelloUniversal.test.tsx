/**
 * Unit tests for HelloUniversal component
 *
 * Tests cover:
 * - Rendering with different props
 * - Theme integration
 * - Accessibility attributes
 * - i18n integration
 * - Button press handling
 *
 * Note: Uses @testing-library/react with react-native mocks instead of
 * @testing-library/react-native to avoid complex Babel/Metro setup.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelloUniversal, HelloUniversalProps } from '../HelloUniversal';
import { ThemeProvider } from '@universal/shared-theme-context';
import { I18nProvider, locales, LocaleCode } from '@universal/shared-i18n';

// Helper to render component with required providers
function renderWithProviders(
  props: HelloUniversalProps = {},
  options: { theme?: 'light' | 'dark'; locale?: LocaleCode } = {}
) {
  const { theme = 'light', locale = 'en' } = options;

  return render(
    <I18nProvider translations={locales} initialLocale={locale}>
      <ThemeProvider defaultTheme={theme}>
        <HelloUniversal {...props} />
      </ThemeProvider>
    </I18nProvider>
  );
}

describe('HelloUniversal', () => {
  describe('rendering', () => {
    it('renders default greeting when no name provided', () => {
      renderWithProviders();

      // Default greeting from i18n hello namespace
      expect(screen.getByText('Hello from Remote!')).toBeInTheDocument();
    });

    it('renders personalized greeting when name provided', () => {
      renderWithProviders({ name: 'Alice' });

      // Personalized greeting uses greetingWithName key
      expect(screen.getByText('Hello, Alice!')).toBeInTheDocument();
    });

    it('does not render button when onPress not provided', () => {
      renderWithProviders();

      // Button text is "Click me" from i18n hello.buttonLabel
      expect(screen.queryByText('Click me')).not.toBeInTheDocument();
    });

    it('renders button when onPress is provided', () => {
      const onPress = jest.fn();
      renderWithProviders({ onPress });

      expect(screen.getByText('Click me')).toBeInTheDocument();
    });
  });

  describe('button interaction', () => {
    it('calls onPress when button is clicked', () => {
      const onPress = jest.fn();
      renderWithProviders({ onPress });

      const button = screen.getByText('Click me');
      fireEvent.click(button);

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('calls onPress multiple times on multiple clicks', () => {
      const onPress = jest.fn();
      renderWithProviders({ onPress });

      const button = screen.getByText('Click me');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(onPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('accessibility', () => {
    it('has accessible container with greeting label', () => {
      renderWithProviders({ name: 'Bob' });

      // Container should have accessibility label with greeting context
      const container = screen.getByLabelText('Greeting card: Hello, Bob!');
      expect(container).toBeInTheDocument();
    });

    it('button has correct accessibility role', () => {
      const onPress = jest.fn();
      renderWithProviders({ onPress });

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('uses custom accessibility label when provided', () => {
      const onPress = jest.fn();
      renderWithProviders({
        onPress,
        buttonAccessibilityLabel: 'Custom button label',
      });

      const button = screen.getByLabelText('Custom button label');
      expect(button).toBeInTheDocument();
    });

    it('uses default i18n accessibility label when not customized', () => {
      const onPress = jest.fn();
      renderWithProviders({ onPress });

      // Default from i18n hello.buttonLabel: "Click me"
      const button = screen.getByLabelText('Click me');
      expect(button).toBeInTheDocument();
    });
  });

  describe('i18n integration', () => {
    it('renders Spanish greeting when locale is es', () => {
      renderWithProviders({}, { locale: 'es' });

      // Spanish greeting from es.hello.greeting
      expect(screen.getByText('¡Hola desde Remoto!')).toBeInTheDocument();
    });

    it('renders Spanish personalized greeting', () => {
      renderWithProviders({ name: 'Carlos' }, { locale: 'es' });

      expect(screen.getByText('¡Hola, Carlos!')).toBeInTheDocument();
    });

    it('renders Spanish button text', () => {
      const onPress = jest.fn();
      renderWithProviders({ onPress }, { locale: 'es' });

      // Spanish button from es.hello.buttonLabel
      expect(screen.getByText('Hazme clic')).toBeInTheDocument();
    });
  });

  describe('theme integration', () => {
    it('renders in light theme without errors', () => {
      const { container } = renderWithProviders({}, { theme: 'light' });

      // Should render without throwing
      expect(container).toBeInTheDocument();
    });

    it('renders in dark theme without errors', () => {
      const { container } = renderWithProviders({}, { theme: 'dark' });

      // Should render without throwing
      expect(container).toBeInTheDocument();
    });

    it('renders button in both themes', () => {
      const onPress = jest.fn();

      // Light theme
      const { unmount } = renderWithProviders({ onPress }, { theme: 'light' });
      expect(screen.getByText('Click me')).toBeInTheDocument();
      unmount();

      // Dark theme
      renderWithProviders({ onPress }, { theme: 'dark' });
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });
  });
});
