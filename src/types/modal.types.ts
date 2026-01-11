import type { HTMLAttributes } from 'astro/types';
import type { ButtonProps } from './button.types';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

export interface ModalProps extends Omit<HTMLAttributes<'div'>, 'class'> {
  id?: string;
  open?: boolean;
  size?: ModalSize;
  position?: ModalPosition;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  backdropClass?: string;
  class?: string;
  closeButtonConfig?: ButtonProps;
}
