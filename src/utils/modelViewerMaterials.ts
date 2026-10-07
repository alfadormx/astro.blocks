import { Mesh, MeshPhysicalMaterial, type Material, type Object3D, type Scene } from 'three';
import type { GLTFParser } from 'three/addons/loaders/GLTFLoader.js';

export type GltfMaterialSource = Pick<GLTFParser, 'json' | 'associations'>;

export interface MergeResult {
  /** Instances no mesh uses any more. */
  merged: Material[];
  /** Survivor → original names of the materials it replaced. */
  aliases: ReadonlyMap<Material, readonly string[]>;
}

type Variant = Material & {
  vertexColors: boolean;
  flatShading?: boolean;
  normalScale?: { y: number };
};

/** `Gold_#1_6` → `Gold_#1`, `Stone_3` → `Stone`, `Band` → `Band`. */
export function familyName(name: string): string {
  return name.replace(/_\d+$/, '');
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const entries = Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value);
}

// The glTF def covers textures, KHR_materials_* and extras; the flags cover the loader's clone
// variants. The loader flips normalScale.y for derivative tangents, so its sign marks that variant.
function mergeKey(material: Variant, parser: GltfMaterialSource): string | undefined {
  const index = parser.associations.get(material)?.materials;
  if (index === undefined) return undefined;
  const def = Object.entries(parser.json.materials[index] as Record<string, unknown>).filter(
    ([key]) => key !== 'name'
  );
  const flags = [
    material.vertexColors,
    material.flatShading,
    Math.sign(material.normalScale?.y ?? 1),
  ];
  return `${familyName(material.name)}\n${canonical(Object.fromEntries(def))}\n${canonical(flags)}`;
}

/** Collapses mesh materials of one family with identical glTF definitions to one instance. */
export function mergeMaterials(root: Object3D, parser: GltfMaterialSource): MergeResult {
  const survivors = new Map<string, Material>();
  const replaced = new Map<Material, Material>();
  const aliases = new Map<Material, string[]>();

  const pick = (material: Material): Material => {
    const known = replaced.get(material);
    if (known) return known;
    const key = mergeKey(material as Variant, parser);
    if (key === undefined) return material;
    const survivor = survivors.get(key);
    if (!survivor) {
      survivors.set(key, material);
      return material;
    }
    if (survivor === material) return material;
    replaced.set(material, survivor);
    const names = aliases.get(survivor) ?? [];
    if (material.name !== survivor.name && !names.includes(material.name)) {
      names.push(material.name);
    }
    aliases.set(survivor, names);
    return survivor;
  };

  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.material = Array.isArray(object.material)
      ? object.material.map(pick)
      : pick(object.material);
  });
  return { merged: [...replaced.keys()], aliases };
}

// Diamond 2.42 and cubic zirconia ~2.15 qualify; sapphire ~1.77 and glass 1.5 are not
// diamond-like, so they keep the file's look.
const STONE_MIN_IOR = 2;
// Stands in for dispersion, which three only applies to transmission: a transparent canvas gives
// the transmission pass a flat white backdrop, so there is nothing for dispersion to split.
// Above ~0.3 the thin film tints whole facets instead of flashing.
const STONE_IRIDESCENCE = 0.15;
const STONE_ENV_BOOST = 3;

export function isStone(material: Material): material is MeshPhysicalMaterial {
  return material instanceof MeshPhysicalMaterial && material.ior >= STONE_MIN_IOR;
}

export type StoneEnvironment = Pick<
  Scene,
  'environment' | 'environmentIntensity' | 'environmentRotation'
>;

/**
 * Gives high-IOR materials a thin-film colour shift (unless the file declares one) and a stronger
 * environment reflection. Safe to run more than once.
 */
export function tuneStones(materials: Iterable<Material>, scene: StoneEnvironment): void {
  for (const material of materials) {
    if (!isStone(material)) continue;
    if (material.iridescence === 0) material.iridescence = STONE_IRIDESCENCE;
    if (!scene.environment) continue;
    // three only honours envMapIntensity on a material's own envMap; sharing the scene's Euler
    // keeps the rotation prop and environment spin in step.
    material.envMap = scene.environment;
    material.envMapRotation = scene.environmentRotation;
    material.envMapIntensity = scene.environmentIntensity * STONE_ENV_BOOST;
  }
}
