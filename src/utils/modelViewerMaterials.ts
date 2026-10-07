import { Mesh, type Material, type Object3D } from 'three';
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
