import { describe, expect, it } from 'vitest';
import type { PricingTier } from '~/types/pricing.types';
import {
  formatPrice,
  pricingColumnsClass,
  pricingGroupName,
  pricingOrderClass,
  validatePricing,
} from '~/utils/pricing';

const tier = (extra: Partial<PricingTier> = {}): PricingTier => ({
  name: 'Tier',
  price: { monthly: 9 },
  features: [],
  action: { label: 'Buy' },
  ...extra,
});

const yearlyTier = tier({ price: { monthly: 9, yearly: 90 } });

describe('formatPrice', () => {
  it('formatPrice renders a whole number without cents', () => {
    expect(formatPrice(29, 'USD', 'en-US')).toBe('$29');
  });

  it('formatPrice keeps two decimals for a fractional price', () => {
    expect(formatPrice(29.5, 'USD', 'en-US')).toBe('$29.50');
  });

  it('formatPrice returns a string price verbatim', () => {
    expect(formatPrice('Custom', 'USD', 'en-US')).toBe('Custom');
  });

  it("formatPrice follows the locale's currency layout", () => {
    expect(formatPrice(29, 'EUR', 'es-ES').replace(/\s/g, ' ')).toBe('29 €');
  });
});

describe('validatePricing', () => {
  it('validatePricing throws on zero tiers', () => {
    expect(() => validatePricing({ tiers: [] })).toThrow(/1 to 4 tiers/);
  });

  it('validatePricing throws on five tiers', () => {
    expect(() => validatePricing({ tiers: Array.from({ length: 5 }, () => tier()) })).toThrow(
      /1 to 4 tiers/
    );
  });

  it('validatePricing throws when two tiers are highlighted', () => {
    const highlighted = tier({ highlighted: true });
    expect(() => validatePricing({ tiers: [highlighted, highlighted] })).toThrow(/at most one/);
  });

  it('validatePricing throws when toggleGroup is set and no tier has a yearly price', () => {
    expect(() => validatePricing({ tiers: [tier()], toggleGroup: { label: 'Billing' } })).toThrow(
      /no tier has a yearly price/
    );
  });

  it('validatePricing allows toggleGroup false without yearly prices', () => {
    expect(() => validatePricing({ tiers: [tier()], toggleGroup: false })).not.toThrow();
  });

  it('validatePricing throws when the Yearly option starts selected', () => {
    expect(() =>
      validatePricing({
        tiers: [yearlyTier],
        toggleGroup: { options: [{ label: 'Monthly' }, { label: 'Yearly', selected: true }] },
      })
    ).toThrow(/Yearly option cannot start selected/);
  });
});

describe('layout classes', () => {
  it('pricingColumnsClass stacks below the first container step for every count', () => {
    for (const count of [1, 2, 3, 4] as const) {
      expect(pricingColumnsClass(count)).toMatch(/^grid-cols-1\b/);
    }
  });

  it('pricingOrderClass is empty for a single tier', () => {
    expect(pricingOrderClass(1)).toBe('');
  });

  it('pricingOrderClass undoes order-first at the step where columns appear', () => {
    expect(pricingOrderClass(2)).toContain('@lg:order-none');
    expect(pricingColumnsClass(2)).toContain('@lg:grid-cols-2');
    expect(pricingOrderClass(3)).toContain('@3xl:order-none');
    expect(pricingColumnsClass(3)).toContain('@3xl:grid-cols-3');
  });
});

describe('pricingGroupName', () => {
  it('pricingGroupName returns a new name on every call', () => {
    expect(pricingGroupName()).not.toBe(pricingGroupName());
  });
});
