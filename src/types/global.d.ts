import type { SelectionChangeDetail } from './selection.types';

declare global {
  interface Window {
    __headerScrollInitialized?: boolean;
    __headerOffsetObserver?: ResizeObserver;
  }

  interface DocumentEventMap {
    'selection:change': CustomEvent<SelectionChangeDetail>;
  }
}

export {};
