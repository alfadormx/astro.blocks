import type { SelectionChangeDetail } from '~/types/selection.types';

declare global {
  interface Window {
    __headerScrollInitialized?: boolean;
  }

  interface DocumentEventMap {
    'selection:change': CustomEvent<SelectionChangeDetail>;
  }
}

export {};
