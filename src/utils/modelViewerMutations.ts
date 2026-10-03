import { Color, Mesh, SRGBColorSpace, type Material, type Object3D } from 'three';
import type { ModelViewerMutation, ModelViewerSelectionGroup } from '~/types/modelviewer.types';

export { effectiveSrc } from '~/utils/modelViewerSrc';

export type SelectionState = Readonly<Record<string, readonly string[]>>;
export type Selections = Readonly<Record<string, ModelViewerSelectionGroup>>;

type Tunable = Material & { color?: Color; metalness?: number; roughness?: number };

interface Tuning {
  color?: Color;
  metalness?: number;
  roughness?: number;
}

export interface Baseline {
  readonly parts: ReadonlyMap<string, readonly Object3D[]>;
  readonly materials: ReadonlyMap<string, readonly Material[]>;
  readonly tuning: ReadonlyMap<Tunable, Tuning>;
  readonly assigned: ReadonlyMap<Mesh, Material | Material[]>;
  readonly visible: ReadonlyMap<Object3D, boolean>;
}

// GLTFLoader sanitizes and de-duplicates `name`; the author's glTF node name survives in userData.
export function partName(object: Object3D): string {
  return typeof object.userData.name === 'string' ? object.userData.name : object.name;
}

function add<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const list = map.get(key);
  if (!list) map.set(key, [value]);
  else if (!list.includes(value)) list.push(value);
}

function meshesUnder(nodes: readonly Object3D[]): Mesh[] {
  const meshes = new Set<Mesh>();
  for (const node of nodes) {
    node.traverse((object) => {
      if (object instanceof Mesh) meshes.add(object);
    });
  }
  return [...meshes];
}

function allMutations(selections: Selections): ModelViewerMutation[] {
  return Object.values(selections).flatMap(({ options = {} }) => Object.values(options).flat());
}

export function createBaseline(
  root: Object3D,
  fileMaterials: readonly Material[],
  selections: Selections
): Baseline {
  const parts = new Map<string, Object3D[]>();
  const materials = new Map<string, Material[]>();
  root.traverse((object) => {
    add(parts, partName(object), object);
    if (object instanceof Mesh) for (const m of [object.material].flat()) add(materials, m.name, m);
  });
  // After mesh materials, so `use` prefers the loader's assigned clone over the unassigned original.
  for (const m of fileMaterials) add(materials, m.name, m);

  const tuning = new Map<Tunable, Tuning>();
  const assigned = new Map<Mesh, Material | Material[]>();
  const visible = new Map<Object3D, boolean>();
  for (const mutation of allMutations(selections)) {
    if (mutation.type === 'model') continue;
    if (mutation.type === 'visible') {
      for (const name of mutation.parts) {
        for (const node of parts.get(name) ?? []) visible.set(node, node.visible);
      }
      continue;
    }
    if ('use' in mutation) {
      for (const mesh of meshesUnder(parts.get(mutation.part) ?? [])) {
        assigned.set(mesh, mesh.material);
      }
      continue;
    }
    for (const m of (materials.get(mutation.material) ?? []) as Tunable[]) {
      tuning.set(m, { color: m.color?.clone(), metalness: m.metalness, roughness: m.roughness });
    }
  }
  return { parts, materials, tuning, assigned, visible };
}

function restore(baseline: Baseline): void {
  for (const [material, { color, metalness, roughness }] of baseline.tuning) {
    if (color) material.color?.copy(color);
    if (metalness !== undefined) material.metalness = metalness;
    if (roughness !== undefined) material.roughness = roughness;
  }
  for (const [mesh, material] of baseline.assigned) mesh.material = material;
  for (const [node, shown] of baseline.visible) node.visible = shown;
}

function managedParts(
  baseline: Baseline,
  options: Record<string, ModelViewerMutation[]>
): Object3D[] {
  return Object.values(options)
    .flat()
    .flatMap((m) => (m.type === 'visible' ? m.parts : []))
    .flatMap((name) => baseline.parts.get(name) ?? []);
}

function applyMutation(
  baseline: Baseline,
  mutation: ModelViewerMutation,
  warnings: string[]
): void {
  if (mutation.type === 'model') return;
  if (mutation.type === 'visible') {
    for (const name of mutation.parts) {
      const nodes = baseline.parts.get(name);
      if (!nodes) warnings.push(`part "${name}" is not in the model`);
      else nodes.forEach((node) => (node.visible = true));
    }
    return;
  }
  if ('use' in mutation) {
    const nodes = baseline.parts.get(mutation.part);
    const variant = baseline.materials.get(mutation.use)?.[0];
    if (!nodes) warnings.push(`part "${mutation.part}" is not in the model`);
    if (!variant) warnings.push(`material "${mutation.use}" is not in the model`);
    if (!nodes || !variant) return;
    for (const mesh of meshesUnder(nodes)) mesh.material = variant;
    return;
  }
  const targets = baseline.materials.get(mutation.material) as Tunable[] | undefined;
  if (!targets) {
    warnings.push(`material "${mutation.material}" is not in the model`);
    return;
  }
  for (const material of targets) {
    if (mutation.color !== undefined) material.color?.setStyle(mutation.color, SRGBColorSpace);
    if (mutation.metalness !== undefined && material.metalness !== undefined) {
      material.metalness = mutation.metalness;
    }
    if (mutation.roughness !== undefined && material.roughness !== undefined) {
      material.roughness = mutation.roughness;
    }
  }
}

/** Resets every targeted material and part, then applies each group's codes in declaration order. */
export function applyState(
  baseline: Baseline,
  selections: Selections,
  state: SelectionState
): string[] {
  restore(baseline);
  const warnings: string[] = [];
  for (const [group, { options = {} }] of Object.entries(selections)) {
    const codes = state[group] ?? [];
    // Only with a selection, so an empty group falls back to the file's visibility.
    if (codes.length) for (const node of managedParts(baseline, options)) node.visible = false;
    for (const code of codes) {
      for (const mutation of options[code] ?? []) applyMutation(baseline, mutation, warnings);
    }
  }
  return warnings;
}
