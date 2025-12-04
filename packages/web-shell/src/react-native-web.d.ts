/**
 * Type declarations for React Native Web className support
 * 
 * This extends React Native types to support className prop,
 * which is used by Tailwind CSS on web via React Native Web.
 */

import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }

  interface TextProps {
    className?: string;
  }

  interface PressableProps {
    className?: string;
  }

  interface ImageProps {
    className?: string;
  }

  interface TextInputProps {
    className?: string;
  }

  interface ScrollViewProps {
    className?: string;
  }
}

