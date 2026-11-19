export const DEMOS = ['saas', 'portfolio', 'local', 'jewellery'] as const;
export type Demo = (typeof DEMOS)[number];
