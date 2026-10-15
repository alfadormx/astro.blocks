import type { SelectionChangeDetail } from './selection.types';

declare global {
  interface Window {
    __headerScrollInitialized?: boolean;
  }

  interface DocumentEventMap {
    'selection:change': CustomEvent<SelectionChangeDetail>;
  }
}

export {};
