import type { CombinationSpec } from '~/types/combinationcode.types';

export const FINISH_GROUP = 'combinationcode-doc-finish';
export const EXTRAS_GROUP = 'combinationcode-doc-extras';
export const ENGRAVING_GROUP = 'combinationcode-doc-engraving';
export const ENGRAVING_MAX_LENGTH = 20;

export const finishOptions = [
  { code: 'SV', label: 'Silver', selected: true },
  { code: 'GD', label: 'Gold' },
  { code: 'RG', label: 'Rose gold' },
];

export const extrasItems = [
  { code: 'GW', icon: { name: 'heroicons:gift' }, title: 'Gift wrap', selected: true },
  { code: 'IN', icon: { name: 'heroicons:shield-check' }, title: 'Insurance' },
  { code: 'EX', icon: { name: 'heroicons:bolt' }, title: 'Express' },
  { code: 'CD', icon: { name: 'heroicons:envelope' }, title: 'Card' },
];

export const demoSpec: CombinationSpec = {
  product: 'RING01',
  groups: [
    { name: FINISH_GROUP, mode: 'single', options: finishOptions.map(({ code }) => code) },
    { name: EXTRAS_GROUP, mode: 'multiple', options: extrasItems.map(({ code }) => code) },
    { name: ENGRAVING_GROUP, mode: 'text' },
  ],
};
