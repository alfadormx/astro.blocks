import type { PricingProps } from '~/types/pricing.types';

export type PricingColumns = 1 | 2 | 3 | 4;

function fail(message: string): never {
  throw new Error(`Pricing: ${message}`);
}

/** A string renders verbatim; a number formats as currency, with cents only when it has any. */
export function formatPrice(value: number | string, currency: string, locale: string): string {
  if (typeof value === 'string') return value;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export const hasYearly = (tiers: PricingProps['tiers']): boolean =>
  tiers.some((tier) => tier.price.yearly !== undefined);

/** Throws on a Pricing config that cannot render as designed. */
export function validatePricing(props: Pick<PricingProps, 'tiers' | 'toggleGroup'>): void {
  const { tiers, toggleGroup } = props;
  if (tiers.length < 1 || tiers.length > 4) fail(`expected 1 to 4 tiers, got ${tiers.length}`);
  if (tiers.filter((tier) => tier.highlighted).length > 1) {
    fail('at most one tier may be highlighted');
  }
  if (toggleGroup && !hasYearly(tiers)) fail('toggleGroup is set but no tier has a yearly price');
  if (toggleGroup && toggleGroup.options?.[1]?.selected) {
    fail('the Yearly option cannot start selected; pages without JS must show monthly prices');
  }
}

// Literal class strings only: Tailwind scans source text.
const TIER_COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 @lg:grid-cols-2',
  3: 'grid-cols-1 @3xl:grid-cols-3',
  4: 'grid-cols-1 @3xl:grid-cols-2 @5xl:grid-cols-4',
} as const;

// Undone at the first multi-column step, so wide layouts keep author order.
const HIGHLIGHT_ORDER = {
  1: '',
  2: 'order-first @lg:order-none',
  3: 'order-first @3xl:order-none',
  4: 'order-first @3xl:order-none',
} as const;

const TIER_GAP = {
  none: '',
  tight: 'gap-3 @3xl:gap-4 @5xl:gap-6',
  normal: 'gap-4 @3xl:gap-6 @5xl:gap-8',
  loose: 'gap-6 @3xl:gap-8 @5xl:gap-12',
} as const;

export function pricingColumnsClass(count: PricingColumns): string {
  return TIER_COLUMNS[count];
}

export function pricingOrderClass(count: PricingColumns): string {
  return HIGHLIGHT_ORDER[count];
}

export function pricingGapClass(gap: keyof typeof TIER_GAP): string {
  return TIER_GAP[gap];
}

// Module scope survives across renders within a build; frontmatter does not.
let pricingCount = 0;

/** A selection group name unique per Pricing render. */
export function pricingGroupName(): string {
  return `pricing-billing-${pricingCount++}`;
}
