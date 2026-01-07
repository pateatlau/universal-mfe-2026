/**
 * User Interaction Events
 *
 * Events emitted by MFE components in response to user interactions.
 * These allow MFEs to notify the host (and other MFEs) about user actions
 * without tight coupling.
 *
 * ## Use Cases
 *
 * - Remote button clicked → host updates counter/analytics
 * - Remote form submitted → host navigates or shows notification
 * - Remote item selected → host updates global selection state
 *
 * ## Event Flow
 *
 * ```
 * Remote MFE                    Host App
 *    │                            │
 *    │──BUTTON_PRESSED──────────▶ │ (host receives, updates state)
 *    │                            │
 *    │◀─STATE_UPDATED────────────│ (optional: host broadcasts update)
 *    │                            │
 * ```
 */

import type { BaseEvent } from '../types';

/**
 * Event type constants for user interaction events.
 */
export const InteractionEventTypes = {
  /** A button in a remote MFE was pressed */
  BUTTON_PRESSED: 'BUTTON_PRESSED',
  /** A form in a remote MFE was submitted */
  FORM_SUBMITTED: 'FORM_SUBMITTED',
  /** An item in a remote MFE was selected */
  ITEM_SELECTED: 'ITEM_SELECTED',
  /** A custom action occurred in a remote MFE */
  CUSTOM_ACTION: 'CUSTOM_ACTION',
} as const;

/**
 * Event emitted when a button in a remote MFE is pressed.
 *
 * @example
 * ```ts
 * // Remote MFE emits
 * bus.emit({
 *   type: 'BUTTON_PRESSED',
 *   payload: {
 *     buttonId: 'hello-press-me',
 *     label: 'Press Me',
 *     metadata: { pressCount: 5 },
 *   },
 *   source: 'HelloRemote',
 * });
 *
 * // Host listens
 * bus.subscribe('BUTTON_PRESSED', (event) => {
 *   console.log(`Button ${event.payload.buttonId} was pressed`);
 *   setState(prev => ({ ...prev, pressCount: prev.pressCount + 1 }));
 * });
 * ```
 */
export interface ButtonPressedEvent extends BaseEvent {
  type: typeof InteractionEventTypes.BUTTON_PRESSED;
  payload: {
    /** Unique identifier for the button */
    buttonId: string;
    /** Display label of the button */
    label?: string;
    /** Additional metadata about the press */
    metadata?: Record<string, unknown>;
  };
}

/**
 * Event emitted when a form in a remote MFE is submitted.
 *
 * @example
 * ```ts
 * bus.emit({
 *   type: 'FORM_SUBMITTED',
 *   payload: {
 *     formId: 'contact-form',
 *     values: { name: 'John', email: 'john@example.com' },
 *     isValid: true,
 *   },
 *   source: 'ContactRemote',
 * });
 * ```
 */
export interface FormSubmittedEvent extends BaseEvent {
  type: typeof InteractionEventTypes.FORM_SUBMITTED;
  payload: {
    /** Unique identifier for the form */
    formId: string;
    /** Form field values (sanitized - never include passwords) */
    values: Record<string, unknown>;
    /** Whether the form passed validation */
    isValid: boolean;
    /** Validation errors if any */
    errors?: Record<string, string>;
  };
}

/**
 * Event emitted when an item in a remote MFE is selected.
 *
 * @example
 * ```ts
 * bus.emit({
 *   type: 'ITEM_SELECTED',
 *   payload: {
 *     itemId: 'product-123',
 *     itemType: 'product',
 *     data: { name: 'Widget', price: 9.99 },
 *   },
 *   source: 'ProductListRemote',
 * });
 * ```
 */
export interface ItemSelectedEvent extends BaseEvent {
  type: typeof InteractionEventTypes.ITEM_SELECTED;
  payload: {
    /** Unique identifier for the selected item */
    itemId: string;
    /** Type of item (e.g., 'product', 'user', 'category') */
    itemType: string;
    /** Item data */
    data?: Record<string, unknown>;
    /** Previous selected item ID (if any) */
    previousItemId?: string;
  };
}

/**
 * Generic event for custom actions not covered by specific event types.
 *
 * @example
 * ```ts
 * bus.emit({
 *   type: 'CUSTOM_ACTION',
 *   payload: {
 *     action: 'copy_to_clipboard',
 *     data: { text: 'Hello World' },
 *   },
 *   source: 'TextEditorRemote',
 * });
 * ```
 */
export interface CustomActionEvent extends BaseEvent {
  type: typeof InteractionEventTypes.CUSTOM_ACTION;
  payload: {
    /** Name of the custom action */
    action: string;
    /** Action-specific data */
    data?: Record<string, unknown>;
  };
}

/**
 * Union of all interaction events.
 */
export type InteractionEvents =
  | ButtonPressedEvent
  | FormSubmittedEvent
  | ItemSelectedEvent
  | CustomActionEvent;
