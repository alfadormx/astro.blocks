import { describe, expect, it } from 'vitest';
import { nextAccordionName, validateAccordion } from '~/utils/accordion';

type ValidatedProps = Parameters<typeof validateAccordion>[0];

const items = [
  { title: 'One', content: '<p>1</p>' },
  { title: 'Two', content: '<p>2</p>' },
];
const noSlots = () => false;

describe('validateAccordion', () => {
  const throwCases: Array<{ name: string; input: ValidatedProps; expected: RegExp }> = [
    {
      name: 'single mode with two defaultOpen indices',
      input: { items, mode: 'single', defaultOpen: [0, 1], hasSlot: noSlots },
      expected: /at most one item/,
    },
    {
      name: 'defaultOpen index past the last item',
      input: { items, defaultOpen: [2], hasSlot: noSlots },
      expected: /index 2 is out of range/,
    },
    {
      name: 'negative defaultOpen index',
      input: { items, defaultOpen: [-1], hasSlot: noSlots },
      expected: /out of range/,
    },
    {
      name: 'item with neither content nor slot',
      input: { items: [{ title: 'Empty' }], hasSlot: noSlots },
      expected: /item 0 \("Empty"\) needs content or an item-0 slot/,
    },
    {
      name: 'message prefix',
      input: { items, defaultOpen: [5], hasSlot: noSlots },
      expected: /^Accordion: /,
    },
  ];

  for (const { name, input, expected } of throwCases) {
    it(`throws for ${name}`, () => {
      expect(() => validateAccordion(input)).toThrow(expected);
    });
  }

  it('accepts multiple defaultOpen indices in multiple mode', () => {
    expect(() => validateAccordion({ items, defaultOpen: [0, 1], hasSlot: noSlots })).not.toThrow();
  });

  it('accepts an item without content when its slot is present', () => {
    expect(() =>
      validateAccordion({ items: [{ title: 'Slotted' }], hasSlot: (i) => i === 0 })
    ).not.toThrow();
  });
});

describe('nextAccordionName', () => {
  it('returns a new accordion-prefixed name on every call', () => {
    const first = nextAccordionName();
    const second = nextAccordionName();
    expect(first).toMatch(/^accordion-\d+$/);
    expect(second).toMatch(/^accordion-\d+$/);
    expect(second).not.toBe(first);
  });
});
