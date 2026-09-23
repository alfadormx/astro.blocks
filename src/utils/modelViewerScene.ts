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
import type { ModelViewerConfig, ModelViewerErrorReason } from '~/types/modelviewer.types';

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
  dispose(): void;
}

const VIEW_DIRECTION = new Vector3(1, 0.6, 1).normalize();
const FRAMING_MARGIN = 1.15;

type Lighting = ModelViewerConfig['lighting'];

const LIGHTING: Record<
  Lighting,
  { blur: number; environmentIntensity: number; keyLight: number; shadowOpacity: number }
> = {
  studio: { blur: 0, environmentIntensity: 0.25, keyLight: 6, shadowOpacity: 0.4 },
  neutral: { blur: 0.1, environmentIntensity: 1.3, keyLight: 0.3, shadowOpacity: 0.12 },
  soft: { blur: 0.5, environmentIntensity: 0.8, keyLight: 0.6, shadowOpacity: 0.2 },
};

function frameModel(
  model: Object3D,
  camera: PerspectiveCamera,
  controls: OrbitControls,
  config: ModelViewerConfig
): Sphere {
  const sphere = new Box3().setFromObject(model).getBoundingSphere(new Sphere());
  if (sphere.isEmpty() || sphere.radius === 0) throw new Error('model has no visible geometry');
  const target = config.cameraTarget ? new Vector3(...config.cameraTarget) : sphere.center;
  const fitDistance =
    (sphere.radius / Math.sin(MathUtils.degToRad(camera.fov) / 2)) * FRAMING_MARGIN;
  if (config.cameraPosition) camera.position.set(...config.cameraPosition);
  else camera.position.copy(target).addScaledVector(VIEW_DIRECTION, fitDistance);
  const distance = camera.position.distanceTo(target);
  camera.near = Math.min(distance, fitDistance) / 100;
  camera.far = Math.max(distance, fitDistance) * 100;
  camera.updateProjectionMatrix();
  controls.target.copy(target);
  // Widened around an explicit camera so OrbitControls never clamps the author's position.
  controls.minDistance = Math.min(sphere.radius, distance);
  controls.maxDistance = Math.max(fitDistance * 5, distance * 2);
  controls.update();
  return sphere;
}

function addLighting(
  scene: Scene,
  model: Object3D,
  bounds: Sphere,
  config: ModelViewerConfig
): void {
  const preset = LIGHTING[config.lighting];
  const key = new DirectionalLight(0xffffff, preset.keyLight);
  // Off the camera's azimuth, so the shadow falls beside the model instead of behind it.
  key.position.copy(bounds.center).add(new Vector3(-1, 2, 0.5).multiplyScalar(bounds.radius * 2));
  key.target.position.copy(bounds.center);
  scene.add(key, key.target);
  if (!config.shadow) return;

  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
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

  // A shadow-only plane reads as a contact shadow without extra render passes.
  const floorY = new Box3().setFromObject(model).min.y;
  const ground = new Mesh(
    new PlaneGeometry(bounds.radius * 6, bounds.radius * 6),
    new ShadowMaterial({ opacity: preset.shadowOpacity })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(bounds.center.x, floorY, bounds.center.z);
  ground.receiveShadow = true;
  scene.add(ground);
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
  let frameId = 0;
  let active = false;
  let lastTime = 0;

  function frame(time: number): void {
    frameId = 0;
    const delta = lastTime ? (time - lastTime) / 1000 : 0;
    lastTime = time;
    const moving = controls.update(delta);
    renderer.render(scene, camera);
    // Damping and autorotate need follow-up frames that no input event will request.
    if (moving || controls.autoRotate) requestRender();
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
    controls.dispose();
    disposeObject(scene);
    envTarget?.dispose();
    renderer.dispose();
    // Frees the context now instead of at GC, which Chrome's ~16-context cap needs.
    renderer.forceContextLoss();
    canvas.remove();
  }

  controls.addEventListener('change', requestRender);

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
    scene.add(gltf.scene);
    const bounds = frameModel(gltf.scene, camera, controls, config);
    addLighting(scene, gltf.scene, bounds, config);
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
      else stop();
    },
    dispose,
  };
}
