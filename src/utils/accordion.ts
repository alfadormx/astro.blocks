import type { AccordionProps } from '~/types/accordion.types';

function fail(message: string): never {
  throw new Error(`Accordion: ${message}`);
}

type ValidatedProps = Pick<AccordionProps, 'items' | 'mode' | 'defaultOpen'> & {
  hasSlot: (index: number) => boolean;
};

/** Throws on an Accordion config that cannot render as asked. */
export function validateAccordion(props: ValidatedProps): void {
  const { items, mode = 'multiple', defaultOpen = [], hasSlot } = props;
  if (mode === 'single' && defaultOpen.length > 1) {
    fail("'single' mode opens at most one item; pass one index in defaultOpen");
  }
  for (const index of defaultOpen) {
    if (!Number.isInteger(index) || index < 0 || index >= items.length) {
      fail(`defaultOpen index ${index} is out of range for ${items.length} items`);
    }
  }
  items.forEach((item, index) => {
    if (item.content === undefined && !hasSlot(index)) {
      fail(`item ${index} ("${item.title}") needs content or an item-${index} slot`);
    }
  });
}

let accordionCount = 0;

// Module-scoped so every single-mode Accordion in a build gets its own group.
export function nextAccordionName(): string {
  accordionCount += 1;
  return `accordion-${accordionCount}`;
}
