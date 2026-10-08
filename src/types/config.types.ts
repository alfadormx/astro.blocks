type PerInstanceKey = 'id' | 'name' | 'anchorId';

/** Shared defaults merged under every repeated child; per-instance keys are left out. */
export type LayerConfig<T> = Partial<Omit<T, PerInstanceKey>>;
