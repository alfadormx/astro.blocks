export const DEMOS = ['saas', 'portfolio', 'local'] as const;
export type Demo = (typeof DEMOS)[number];
