import type { ModelViewerMutation, ModelViewerProps } from '~/types/modelviewer.types';

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function fail(message: string): never {
  throw new Error(`modelViewer: ${message}`);
}

function checkVector(name: string, value: readonly number[] | undefined, required = false): void {
  if (value === undefined && !required) return;
  if (!Array.isArray(value) || value.length !== 3 || !value.every(Number.isFinite)) {
    fail(`${name} must be three finite numbers; got ${JSON.stringify(value)}`);
  }
}

function checkFov(where: string, fov: number | undefined): void {
  if (fov !== undefined && !(fov > 0 && fov < 180)) {
    fail(`${where} has fov ${fov}; expected a value between 0 and 180`);
  }
}

function checkSrc(where: string, src: string): void {
  const path = src.split(/[?#]/, 1)[0];
  if (!/\.(glb|gltf)$/i.test(path)) fail(`${where} "${src}" must point to a .glb or .gltf file`);
}

function checkName(where: string, field: string, value: unknown): void {
  if (typeof value !== 'string' || !value.trim()) fail(`${where} needs a non-empty ${field}`);
}

function checkUnit(where: string, field: string, value: number | undefined): void {
  if (value !== undefined && !(value >= 0 && value <= 1)) {
    fail(`${where} has ${field} ${value}; expected a value between 0 and 1`);
  }
}

function checkMutation(where: string, mutation: ModelViewerMutation): void {
  switch (mutation.type) {
    case 'material':
      if ('use' in mutation) {
        checkName(where, 'part', mutation.part);
        checkName(where, 'use', mutation.use);
        return;
      }
      checkName(where, 'material', mutation.material);
      if (mutation.color !== undefined && !HEX_COLOR.test(mutation.color)) {
        fail(`${where} has color "${mutation.color}"; expected #rgb or #rrggbb`);
      }
      checkUnit(where, 'metalness', mutation.metalness);
      checkUnit(where, 'roughness', mutation.roughness);
      return;
    case 'visible':
      if (!Array.isArray(mutation.parts) || mutation.parts.length === 0) {
        fail(`${where} needs at least one part`);
      }
      mutation.parts.forEach((p) => checkName(where, 'parts entry', p));
      return;
    case 'model':
      checkName(where, 'src', mutation.src);
      checkSrc(where, mutation.src);
      return;
    default:
      fail(`${where} has unknown type ${JSON.stringify((mutation as { type: unknown }).type)}`);
  }
}

function checkCameraPresets(cameraPresets: ModelViewerProps['cameraPresets']): void {
  for (const [name, preset] of Object.entries(cameraPresets ?? {})) {
    checkVector(`cameraPresets.${name}.position`, preset.position, true);
    checkVector(`cameraPresets.${name}.target`, preset.target, true);
    checkFov(`cameraPresets.${name}`, preset.fov);
  }
}

function checkSelections(
  selections: ModelViewerProps['selections'],
  cameraPresets: ModelViewerProps['cameraPresets']
): void {
  for (const [group, { camera, options = {} }] of Object.entries(selections ?? {})) {
    // JS orders integer-like keys first, which would silently break "later group wins".
    if (/^(0|[1-9]\d*)$/.test(group)) {
      fail(`selections group "${group}" must not be an integer-like key`);
    }
    if (camera !== undefined && !cameraPresets?.[camera]) {
      fail(`selections.${group}.camera "${camera}" is not a key of cameraPresets`);
    }
    for (const [code, mutations] of Object.entries(options)) {
      mutations.forEach((mutation, i) =>
        checkMutation(`selections.${group}.options.${code}[${i}]`, mutation)
      );
    }
  }
}

/** Throws on a ModelViewer config that cannot load, cannot be labelled or cannot be framed. */
export function validateModelViewer(
  props: Pick<
    ModelViewerProps,
    | 'src'
    | 'label'
    | 'fov'
    | 'cameraPosition'
    | 'cameraTarget'
    | 'exposure'
    | 'selections'
    | 'cameraPresets'
  >
): void {
  const { src, label, fov, cameraPosition, cameraTarget, exposure, selections, cameraPresets } =
    props;
  if (!src?.trim()) fail('src is required');
  if (!label?.trim()) fail(`model "${src}" needs a label`);
  checkSrc('src', src);
  checkFov(`model "${src}"`, fov);
  checkVector('cameraPosition', cameraPosition);
  checkVector('cameraTarget', cameraTarget);
  if (exposure !== undefined && !(Number.isFinite(exposure) && exposure >= 0)) {
    fail(`model "${src}" has exposure ${exposure}; expected a finite number of 0 or more`);
  }
  checkCameraPresets(cameraPresets);
  checkSelections(selections, cameraPresets);
}
