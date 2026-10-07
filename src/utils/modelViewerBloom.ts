import {
  HalfFloatType,
  MeshBasicMaterial,
  Vector2,
  WebGLRenderTarget,
  type Camera,
  type Material,
  type Mesh,
  type Object3D,
  type Scene,
  type WebGLRenderer,
} from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { isStone } from '~/utils/modelViewerMaterials';

// Threshold is linear HDR read before tone mapping. Stone reflections are boosted well past white,
// so it sits high enough that only the brightest facets qualify, not whole stones.
// The wider blur levels spread a haze well beyond the stone, so they are left out.
export const BLOOM = {
  threshold: 3,
  strength: 0.25,
  radius: 0,
  mipWeights: [1, 0.3, 0, 0, 0],
};

export interface BloomPipeline {
  render(): void;
  setSize(width: number, height: number): void;
  dispose(): void;
}

type Renderable = Object3D & { material: Material | Material[] };

// Polished metal reflects brighter than stone facets, so only stones feed the glow.
function maskToStones(scene: Scene, occluder: Material, hidden: Material): () => void {
  const swapped: [Renderable, Material | Material[]][] = [];
  const mask = (material: Material) =>
    isStone(material) ? material : material.transparent ? hidden : occluder;
  scene.traverseVisible((object) => {
    if (!('material' in object)) return;
    const renderable = object as Renderable;
    const original = renderable.material;
    if ((object as Mesh).isMesh) {
      renderable.material = Array.isArray(original) ? original.map(mask) : mask(original);
    } else {
      renderable.material = hidden;
    }
    swapped.push([renderable, original]);
  });
  return () => {
    for (const [renderable, original] of swapped) renderable.material = original;
  };
}

const mixShader = {
  uniforms: { tDiffuse: { value: null }, tBloom: { value: null } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D tBloom;
    varying vec2 vUv;
    void main() {
      vec4 base = texture2D(tDiffuse, vUv);
      vec4 glow = texture2D(tBloom, vUv);
      gl_FragColor = vec4(base.rgb + glow.rgb, min(base.a + glow.a, 1.0));
    }`,
};

export function createBloom(renderer: WebGLRenderer, scene: Scene, camera: Camera): BloomPipeline {
  // The renderer's antialias only covers the canvas, so the offscreen target brings its own MSAA.
  const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  const size = renderer.getSize(new Vector2());
  const pixels = size.clone().multiplyScalar(renderer.getPixelRatio());
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(size.x, size.y);

  const stones = new WebGLRenderTarget(pixels.x, pixels.y, { type: HalfFloatType });
  const occluder = new MeshBasicMaterial({ colorWrite: false });
  const hidden = new MeshBasicMaterial({ visible: false });
  const bloom = new UnrealBloomPass(pixels, BLOOM.strength, BLOOM.radius, BLOOM.threshold);

  // A plain shader object, so the pass clones its uniforms per viewer.
  bloom.compositeMaterial.uniforms.bloomFactors.value = BLOOM.mipWeights;

  const mix = new ShaderPass(mixShader);
  // Holds the glow alone; the pass's last step adds it onto `stones`, which nothing reads.
  mix.uniforms.tBloom.value = bloom.renderTargetsHorizontal[0].texture;
  const output = new OutputPass();
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(mix);
  composer.addPass(output);

  // The stone pass runs before the main pass, so on the first frame it must draw the shadow map
  // itself: a shadow sampler bound to the missing map's placeholder is a GL_INVALID_OPERATION.
  let shadowsDrawn = false;

  function renderStones(): void {
    const restore = maskToStones(scene, occluder, hidden);
    const shadowUpdate = renderer.shadowMap.autoUpdate;
    renderer.shadowMap.autoUpdate = shadowUpdate && !shadowsDrawn;
    try {
      renderer.setRenderTarget(stones);
      renderer.render(scene, camera);
      shadowsDrawn ||= renderer.shadowMap.enabled;
    } finally {
      renderer.shadowMap.autoUpdate = shadowUpdate;
      restore();
    }
    bloom.render(renderer, stones, stones, 0, false);
  }

  return {
    render() {
      renderStones();
      composer.render();
    },
    setSize(width, height) {
      composer.setSize(width, height);
      const ratio = renderer.getPixelRatio();
      stones.setSize(width * ratio, height * ratio);
      bloom.setSize(width * ratio, height * ratio);
    },
    dispose() {
      bloom.dispose();
      mix.dispose();
      output.dispose();
      stones.dispose();
      occluder.dispose();
      hidden.dispose();
      // Also disposes `target` and the clone it made from it.
      composer.dispose();
    },
  };
}
