type PerInstanceKey = 'id' | 'name' | 'anchorId';

/** Shared defaults merged under every repeated child; per-instance keys are left out. Distributes over unions so a discriminated child keeps its discriminant. */
export type LayerConfig<T> = T extends unknown ? Partial<Omit<T, PerInstanceKey>> : never;
