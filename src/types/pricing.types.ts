import type { ButtonProps } from './button.types';
import type { LayerConfig } from './config.types';
import type { ContainerProps } from './container.types';
import type { HeadlineProps } from './headline.types';
import type { IconConfig } from './icon.types';
import type {
  ToggleGroupAppearance,
  ToggleGroupOption,
  ToggleGroupProps,
} from './togglegroup.types';

/** A feature line. A plain string is an included feature. */
export type PricingFeature = string | { label: string; included: boolean };

export interface PricingPrice {
  /** Monthly price. A number is formatted as currency in the page language; a string renders verbatim. */
  monthly: number | string;
  /** Yearly price. When any tier sets it, the billing toggle renders. */
  yearly?: number | string;
}

export interface PricingPeriod {
  /** Label after the monthly price (default: '/month') */
  monthly?: string;
  /** Label after the yearly price (default: '/year') */
  yearly?: string;
}

export interface PricingTier {
  /** Tier name, rendered as a heading at `nameTag` */
  name: string;
  /** Short line under the name */
  description?: string;
  /** Prices per billing period */
  price: PricingPrice;
  /** ISO 4217 currency code for numeric prices (default: 'USD') */
  currency?: string;
  /** Period labels after the price (default: { monthly: '/month', yearly: '/year' }) */
  period?: PricingPeriod;
  /** Feature checklist; strings are included features */
  features: PricingFeature[];
  /** Call to action at the bottom of the card (default: { width: 'full', variant: 'outline' }, 'solid' when highlighted) */
  action: ButtonProps;
  /** Emphasises this tier and puts it first when tiers stack. At most one tier (default: false) */
  highlighted?: boolean;
  /** Pill text shown on the card's top edge */
  badge?: string;
  /** Heading level of the tier name (default: 'h3') */
  nameTag?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Icon for included features (default: { name: 'heroicons:check' }) */
  includedIcon?: IconConfig;
  /** Icon for excluded features (default: { name: 'heroicons:x-mark' }) */
  excludedIcon?: IconConfig;
  /** Screen-reader prefix for included features (default: 'Included') */
  includedLabel?: string;
  /** Screen-reader prefix for excluded features (default: 'Not included') */
  excludedLabel?: string;
  /** Classes on the card */
  class?: string;
  /** Classes on the tier name */
  nameClass?: string;
  /** Classes on the price line */
  priceClass?: string;
  /** Classes on the feature list */
  featuresClass?: string;
  /** Classes on the badge */
  badgeClass?: string;
}

type PricingToggleOption = Omit<ToggleGroupOption, 'code'>;

/** ToggleGroup for the billing switch. Pricing sets the option codes; `group` is generated unless set. */
export type PricingToggleGroup = Omit<ToggleGroupProps, 'group' | 'options'> &
  ToggleGroupAppearance & {
    /** Selection group name (default: 'pricing-billing-<n>') */
    group?: string;
    /** Monthly then Yearly. Codes are set by Pricing (default: [{ label: 'Monthly', selected: true }, { label: 'Yearly' }]) */
    options?: [PricingToggleOption, PricingToggleOption];
  };

export interface PricingProps {
  /** Configuration for the outer Container */
  container?: ContainerProps;
  /** Headline above the tiers; not rendered when omitted (default: { htmlTag: 'h2', align: 'center' }) */
  headline?: HeadlineProps;
  /** One to four tiers */
  tiers: PricingTier[];
  /** Billing switch; renders when any tier has a yearly price. `false` hides it (default: { label: 'Billing period' }) */
  toggleGroup?: PricingToggleGroup | false;
  /** Screen-reader text announced after the billing changes (default: { monthly: 'Showing monthly prices', yearly: 'Showing yearly prices' }) */
  billingAnnouncement?: { monthly: string; yearly: string };
  /** Layer merged into every tier */
  defaultTierConfig?: LayerConfig<Omit<PricingTier, 'features' | 'highlighted'>>;
  /** Layer merged into the highlighted tier, over `defaultTierConfig` */
  highlightedTierConfig?: LayerConfig<Omit<PricingTier, 'features' | 'highlighted'>>;
  /** Space between tiers (default: 'normal') */
  gap?: 'none' | 'tight' | 'normal' | 'loose';
  /** Classes on the tiers grid */
  tiersClass?: string;
  /** Classes on the billing toggle wrapper */
  toggleGroupClass?: string;
}
