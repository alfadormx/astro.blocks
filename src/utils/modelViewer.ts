import type { ModelViewerProps } from '~/types/modelviewer.types';

function fail(message: string): never {
  throw new Error(`modelViewer: ${message}`);
}

function checkVector(name: string, value: readonly number[] | undefined): void {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.length !== 3 || !value.every(Number.isFinite)) {
    fail(`${name} must be three finite numbers; got ${JSON.stringify(value)}`);
  }
}

/** Throws on a ModelViewer config that cannot load, cannot be labelled or cannot be framed. */
export function validateModelViewer(
  props: Pick<
    ModelViewerProps,
    'src' | 'label' | 'fov' | 'cameraPosition' | 'cameraTarget' | 'exposure'
  >
): void {
  const { src, label, fov, cameraPosition, cameraTarget, exposure } = props;
  if (!src?.trim()) fail('src is required');
  if (!label?.trim()) fail(`model "${src}" needs a label`);
  const path = src.split(/[?#]/, 1)[0];
  if (!/\.(glb|gltf)$/i.test(path)) fail(`src "${src}" must point to a .glb or .gltf file`);
  if (fov !== undefined && !(fov > 0 && fov < 180)) {
    fail(`model "${src}" has fov ${fov}; expected a value between 0 and 180`);
  }
  checkVector('cameraPosition', cameraPosition);
  checkVector('cameraTarget', cameraTarget);
  if (exposure !== undefined && !(Number.isFinite(exposure) && exposure >= 0)) {
    fail(`model "${src}" has exposure ${exposure}; expected a finite number of 0 or more`);
  }
}
