import type { LayerConfig } from './config.types';
import type { HeadlineProps } from './headline.types';
import type { ItemProps } from './item.types';

/** A person card: name as `title`, role and bio as `content` (HTML), photo as `image`, links as `actions`. */
export type TeamMember = Omit<
  ItemProps,
  | 'icon'
  | 'orientation'
  | 'showConnector'
  | 'showConnectorLeft'
  | 'showConnectorRight'
  | 'connectorStyle'
  | 'connectorClass'
>;

export interface TeamProps {
  /** Headline above the members; not rendered when omitted (default: { htmlTag: 'h2', align: 'center' }) */
  headline?: HeadlineProps;
  /** The people. Each renders as an Item with an h3 name (`titleTag: 'h3'`) and a decorative photo (`image.alt: ''`); give every link an `aria-label` naming the person, e.g. 'Ana on LinkedIn' */
  members: TeamMember[];
  /** Columns at the widest size; steps down with the container width (default: 3) */
  columns?: 2 | 3 | 4;
  /** Space between members (default: 'normal') */
  gap?: 'none' | 'tight' | 'normal' | 'loose';
  /** Photo crop: round, or a square with rounded corners (default: 'circle') */
  imageShape?: 'square' | 'circle';
  /** A lone member in the last row spans the full row (default: false) */
  fillLastRow?: boolean;
  /** Item props merged under every member, over the internal defaults (ghost, neutral, sm, rounded links in a centred row; use `defaultActionConfig` to restyle every link) */
  defaultMemberConfig?: LayerConfig<TeamMember>;
  /** Classes on the grid */
  class?: string;
}
