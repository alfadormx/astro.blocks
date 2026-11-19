import type { CodeBlockProps } from './codeblock.types';
import type { ContainerProps } from './container.types';
import type { LayerConfig } from './config.types';

/**
 * Props for the Example component that renders live documentation examples
 * with preview and optional synchronized source code display.
 */
export interface ExampleProps {
  /** Raw source string (from `?raw` import, prioritized over sourceFile). */
  source?: string;

  /** Fallback path to example file, resolved relative to component (Astro files only). */
  sourceFile?: string;

  /**
   * Display scope for the source code.
   * - `full`: entire file including imports (default)
   * - `template-only`: template only, imports removed
   */
  sourceType?: 'full' | 'template-only';

  /**
   * Whether to show the CodeBlock with source code.
   * Default: `true` (show code). Pass `false` to hide source for purely visual examples.
   */
  code?: boolean | false;

  /**
   * CodeBlock configuration merged over internal defaults.
   * Accepts any CodeBlockProps except the `code` prop (source is provided by Example).
   */
  defaultCodeBlockConfig?: LayerConfig<Omit<CodeBlockProps, 'code'>>;

  /**
   * Section identifier used in the `data-doc-section` attribute on the preview wrapper.
   * Used by browser tests to scope to this example. If not provided, falls back to 'example'.
   */
  name?: string;

  /** Classes added to the outer wrapper. */
  class?: string;

  /**
   * Container configuration for the Example wrapper.
   * This field is set on every render; to style only one context, use a default…Config layer.
   */
  container?: Omit<ContainerProps, 'children' | 'default'>;

  /**
   * Default Container config merged before the `container` instance.
   * Use this to set baseline padding, border, or spacing for all Example uses.
   */
  defaultContainerConfig?: LayerConfig<Omit<ContainerProps, 'children' | 'default'>>;

  /**
   * Props for the preview content wrapper (`<div data-doc-section>`).
   * This field is set on every render; to style only one context, use a default…Config layer.
   */
  exampleSlot?: {
    /** Additional CSS classes on the preview wrapper. */
    class?: string;
  };

  /**
   * Default example slot config merged before the `exampleSlot` instance.
   * Use this to set baseline padding, border or border styling for all Example previews.
   */
  defaultExampleSlotConfig?: LayerConfig<{
    /** Additional CSS classes on the preview wrapper. */
    class?: string;
  }>;
}
