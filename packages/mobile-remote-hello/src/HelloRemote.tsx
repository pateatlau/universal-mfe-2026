/**
 * @universal/mobile-remote-hello
 *
 * Mobile remote component exposed via Module Federation v2.
 *
 * This component uses the universal HelloUniversal component from shared-hello-ui,
 * which will be rendered natively in React Native on mobile platforms.
 */

import React from 'react';
import { HelloUniversal } from '@universal/shared-hello-ui';

export interface HelloRemoteProps {
  name?: string;
  onPress?: () => void;
}

/**
 * HelloRemote - Mobile remote component exposed via MFv2
 */
export default function HelloRemote({ name, onPress }: HelloRemoteProps) {
  return (
    <HelloUniversal
      name={name}
      onPress={onPress}
    />
  );
}
