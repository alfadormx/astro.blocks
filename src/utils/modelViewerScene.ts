import {
  Box3,
  DirectionalLight,
  Light,
  Line,
  LoaderUtils,
  MathUtils,
  Mesh,
  NeutralToneMapping,
  PCFSoftShadowMap,
  PMREMGenerator,
  PlaneGeometry,
  PerspectiveCamera,
  Points,
  Scene,
  ShadowMaterial,
  Sphere,
  Texture,
  Vector3,
  WebGLRenderer,
  type Material,
  type Object3D,
  type WebGLRenderTarget,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import type {
  ModelViewerCameraPreset,
  ModelViewerConfig,
  ModelViewerErrorReason,
} from '~/types/modelviewer.types';
import {
  applyState,
  createBaseline,
  type Baseline,
  type SelectionState,
} from '~/utils/modelViewerMutations';

export class ModelViewerError extends Error {
  readonly reason: ModelViewerErrorReason;

  constructor(reason: ModelViewerErrorReason, options?: ErrorOptions) {
    super(reason === 'webgl' ? 'WebGL is unavailable' : 'The model failed to load', options);
    this.name = 'ModelViewerError';
    this.reason = reason;
  }
}

export interface SceneHandle {
  resize(width: number, height: number): void;
  setActive(active: boolean): void;
  /** Applies the selection state to the model and returns a warning per missing name. */
  apply(state: SelectionState): string[];
  /** Moves the camera to a preset, easing unless `animate` is false or the viewer is inactive. */
  setCamera(preset: ModelViewerCameraPreset, options: { animate: boolean }): void;
  /** Replaces the model, keeping the camera; the caller re-applies the selection state. */
  swapModel(src: string, signal: AbortSignal): Promise<void>;
  dispose(): void;
}

interface LoadedModel {
  root: Object3D;
  // Includes unassigned variants and materials swapped out by `use`, which traversal misses.
  materials: Set<Material>;
  baseline: Baseline;
}

const VIEW_DIRECTION = new Vector3(1, 0.6, 1).normalize();
const FRAMING_MARGIN = 1.15;
const TWEEN_MS = 600;

interface CameraPose {
  position: Vector3;
  target: Vector3;
  fov: number;
}

interface Tween {
  start: number;
  from: CameraPose;
  to: CameraPose;
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

type Lighting = ModelViewerConfig['lighting'];

const LIGHTING: Record<
  Lighting,
  { blur: number; environmentIntensity: number; keyLight: number; shadowOpacity: number }
> = {
  studio: { blur: 0, environmentIntensity: 0.25, keyLight: 6, shadowOpacity: 0.4 },
  neutral: { blur: 0.1, environmentIntensity: 1.3, keyLight: 0.3, shadowOpacity: 0.12 },
  soft: { blur: 0.5, environmentIntensity: 0.8, keyLight: 0.6, shadowOpacity: 0.2 },
};

function measure(model: Object3D): Sphere {
  const sphere = new Box3().setFromObject(model).getBoundingSphere(new Sphere());
  if (sphere.isEmpty() || sphere.radius === 0) throw new Error('model has no visible geometry');
  return sphere;
}

function fitDistance(bounds: Sphere, camera: PerspectiveCamera): number {
  return (bounds.radius / Math.sin(MathUtils.degToRad(camera.fov) / 2)) * FRAMING_MARGIN;
}

// Near/far and zoom limits follow the bounds; the camera position and target stay put.
function fitRange(bounds: Sphere, camera: PerspectiveCamera, controls: OrbitControls): void {
  const fit = fitDistance(bounds, camera);
  const distance = camera.position.distanceTo(controls.target);
  camera.near = Math.min(distance, fit) / 100;
  camera.far = Math.max(distance, fit) * 100;
  camera.updateProjectionMatrix();
  // Widened around an explicit camera so OrbitControls never clamps the author's position.
  controls.minDistance = Math.min(bounds.radius, distance);
  controls.maxDistance = Math.max(fit * 5, distance * 2);
}

function frameModel(
  bounds: Sphere,
  camera: PerspectiveCamera,
  controls: OrbitControls,
  config: ModelViewerConfig
): void {
  const target = config.cameraTarget ? new Vector3(...config.cameraTarget) : bounds.center;
  if (config.cameraPosition) camera.position.set(...config.cameraPosition);
  else camera.position.copy(target).addScaledVector(VIEW_DIRECTION, fitDistance(bounds, camera));
  controls.target.copy(target);
  fitRange(bounds, camera, controls);
  controls.update();
}

interface Rig {
  key: DirectionalLight;
  ground?: Mesh;
}

function createRig(scene: Scene, config: ModelViewerConfig): Rig {
  const preset = LIGHTING[config.lighting];
  const key = new DirectionalLight(0xffffff, preset.keyLight);
  scene.add(key, key.target);
  if (!config.shadow) return { key };

  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  // A shadow-only plane reads as a contact shadow without extra render passes.
  const ground = new Mesh(
    new PlaneGeometry(1, 1),
    new ShadowMaterial({ opacity: preset.shadowOpacity })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  return { key, ground };
}

function placeRig({ key, ground }: Rig, model: Object3D, bounds: Sphere): void {
  // Off the camera's azimuth, so the shadow falls beside the model instead of behind it.
  key.position.copy(bounds.center).add(new Vector3(-1, 2, 0.5).multiplyScalar(bounds.radius * 2));
  key.target.position.copy(bounds.center);
  if (!ground) return;

  const extent = bounds.radius * 1.5;
  Object.assign(key.shadow.camera, {
    left: -extent,
    right: extent,
    top: extent,
    bottom: -extent,
    near: bounds.radius * 0.1,
    far: bounds.radius * 8,
  });
  key.shadow.camera.updateProjectionMatrix();
  model.traverse((object) => {
    if (object instanceof Mesh) object.castShadow = true;
  });
  const floorY = new Box3().setFromObject(model).min.y;
  ground.scale.set(bounds.radius * 6, bounds.radius * 6, 1);
  ground.position.set(bounds.center.x, floorY, bounds.center.z);
}

function disposeMaterial(material: Material): void {
  for (const value of Object.values(material)) {
    if (value instanceof Texture) value.dispose();
  }
  material.dispose();
}

function disposeObject(root: Object3D): void {
  root.traverse((object) => {
    // Shadow maps are render targets owned by the light.
    if (object instanceof Light) {
      object.dispose();
      return;
    }
    if (!(object instanceof Mesh || object instanceof Line || object instanceof Points)) return;
    object.geometry.dispose();
    const materials: Material[] = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach(disposeMaterial);
  });
}

async function prepareModel(gltf: GLTF, config: ModelViewerConfig): Promise<LoadedModel> {
  const fileMaterials: Material[] = await gltf.parser.getDependencies('material');
  const materials = new Set(fileMaterials);
  gltf.scene.traverse((object) => {
    if (object instanceof Mesh) [object.material].flat().forEach((m) => materials.add(m));
  });
  return {
    root: gltf.scene,
    materials,
    baseline: createBaseline(gltf.scene, fileMaterials, config.selections ?? {}),
  };
}

// Double disposal is safe: the renderer drops its dispose listener on the first call.
function disposeModel(model: LoadedModel): void {
  disposeObject(model.root);
  model.materials.forEach(disposeMaterial);
}

async function loadModel(src: string, signal: AbortSignal): Promise<GLTF> {
  const url = new URL(src, document.baseURI).href;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const buffer = await response.arrayBuffer();
  // External .bin and texture URIs in a .gltf resolve against this base.
  const gltf = await new GLTFLoader().parseAsync(buffer, LoaderUtils.extractUrlBase(url));
  if (signal.aborted) {
    disposeObject(gltf.scene);
    throw signal.reason;
  }
  return gltf;
}

export async function createScene(
  host: HTMLElement,
  config: ModelViewerConfig,
  signal: AbortSignal
): Promise<SceneHandle> {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
  } catch (cause) {
    throw new ModelViewerError('webgl', { cause });
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = config.exposure;
  if (config.shadow) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
  }
  const canvas = renderer.domElement;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', config.label);
  Object.assign(canvas.style, { display: 'block', width: '100%', height: '100%' });
  host.append(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(config.fov, 1);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableRotate = config.orbit;
  controls.enableZoom = config.zoom;
  controls.enableDamping = true;
  controls.autoRotate =
    config.autoRotate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  controls.autoRotateSpeed = config.autoRotateSpeed;

  let envTarget: WebGLRenderTarget | undefined;
  let model: LoadedModel | undefined;
  const rig = createRig(scene, config);
  let frameId = 0;
  let active = false;
  let lastTime = 0;
  let tween: Tween | undefined;

  function placeCamera({ position, target, fov }: CameraPose): void {
    camera.position.copy(position);
    controls.target.copy(target);
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }

  function stepTween(time: number): void {
    const { start, from, to } = tween!;
    const t = MathUtils.clamp((time - start) / TWEEN_MS, 0, 1);
    const k = easeInOutCubic(t);
    placeCamera({
      position: new Vector3().lerpVectors(from.position, to.position, k),
      target: new Vector3().lerpVectors(from.target, to.target, k),
      fov: MathUtils.lerp(from.fov, to.fov, k),
    });
    if (t === 1) tween = undefined;
  }

  function finishTween(): void {
    if (!tween) return;
    const { to } = tween;
    tween = undefined;
    placeCamera(to);
    controls.update();
  }

  // Keeps OrbitControls from clamping a preset that sits outside the fitted range.
  function widenRange(distance: number): void {
    controls.minDistance = Math.min(controls.minDistance, distance);
    controls.maxDistance = Math.max(controls.maxDistance, distance);
    camera.near = Math.min(camera.near, distance / 100);
    camera.far = Math.max(camera.far, distance * 100);
    camera.updateProjectionMatrix();
  }

  const cancelTween = () => (tween = undefined);

  function frame(time: number): void {
    frameId = 0;
    const delta = lastTime ? (time - lastTime) / 1000 : 0;
    lastTime = time;
    if (tween) stepTween(time);
    const moving = controls.update(delta);
    renderer.render(scene, camera);
    // Damping, autorotate and tweens need follow-up frames that no input event will request.
    if (moving || controls.autoRotate || tween) requestRender();
    else lastTime = 0;
  }

  function requestRender(): void {
    if (active && !frameId) frameId = requestAnimationFrame(frame);
  }

  function stop(): void {
    cancelAnimationFrame(frameId);
    frameId = 0;
    lastTime = 0;
  }

  function dispose(): void {
    active = false;
    stop();
    controls.removeEventListener('change', requestRender);
    controls.removeEventListener('start', cancelTween);
    controls.dispose();
    disposeObject(scene);
    if (model) disposeModel(model);
    envTarget?.dispose();
    renderer.dispose();
    // Frees the context now instead of at GC, which Chrome's ~16-context cap needs.
    renderer.forceContextLoss();
    canvas.remove();
  }

  controls.addEventListener('change', requestRender);
  controls.addEventListener('start', cancelTween);

  try {
    const pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const preset = LIGHTING[config.lighting];
    envTarget = pmrem.fromScene(room, preset.blur);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = preset.environmentIntensity;
    room.dispose();
    pmrem.dispose();

    const gltf = await loadModel(config.src, signal);
    model = await prepareModel(gltf, config);
    scene.add(model.root);
    const bounds = measure(model.root);
    frameModel(bounds, camera, controls, config);
    placeRig(rig, model.root, bounds);
  } catch (err) {
    dispose();
    if (signal.aborted) throw err;
    throw new ModelViewerError('load', { cause: err });
  }

  return {
    resize(width, height) {
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      requestRender();
    },
    setActive(next) {
      active = next;
      if (next) requestRender();
      else {
        // A tween only advances in frames, so an off-screen viewer would stall mid-move.
        finishTween();
        stop();
      }
    },
    apply(state) {
      if (!model) return [];
      const warnings = applyState(model.baseline, config.selections ?? {}, state);
      requestRender();
      return warnings;
    },
    setCamera(preset, { animate }) {
      controls.autoRotate = false;
      const to: CameraPose = {
        position: new Vector3(...preset.position),
        target: new Vector3(...preset.target),
        fov: preset.fov ?? camera.fov,
      };
      widenRange(to.position.distanceTo(to.target));
      tween = {
        start: performance.now(),
        from: {
          position: camera.position.clone(),
          target: controls.target.clone(),
          fov: camera.fov,
        },
        to,
      };
      if (!animate || !active) finishTween();
      requestRender();
    },
    async swapModel(src, signal) {
      const next = await prepareModel(await loadModel(src, signal), config);
      let bounds: Sphere;
      try {
        if (signal.aborted) throw signal.reason;
        bounds = measure(next.root);
      } catch (err) {
        disposeModel(next);
        throw err;
      }
      const previous = model!;
      scene.remove(previous.root);
      scene.add(next.root);
      model = next;
      fitRange(bounds, camera, controls);
      controls.update();
      placeRig(rig, next.root, bounds);
      disposeModel(previous);
      requestRender();
    },
    dispose,
  };
}
