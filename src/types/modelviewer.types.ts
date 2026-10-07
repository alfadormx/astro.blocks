export type Vec3 = [number, number, number];

/** Recolours or retunes every mesh that uses the named glTF material. */
export interface ModelViewerMaterialEdit {
  type: 'material';
  /** glTF material name, or its family name without a trailing `_<n>`. */
  material: string;
  /** `#rgb` or `#rrggbb`, interpreted as sRGB. */
  color?: string;
  /** Between 0 and 1. */
  metalness?: number;
  /** Between 0 and 1. */
  roughness?: number;
}

/** Assigns another material from the same model file to a named part. */
export interface ModelViewerMaterialSwap {
  type: 'material';
  /** glTF node name. */
  part: string;
  /** glTF material name (or family name) of the variant to assign. */
  use: string;
}

/** Within a group, shows the listed parts and hides the parts other options list. */
export interface ModelViewerVisibility {
  type: 'visible';
  /** glTF node names; hiding a node hides its children. */
  parts: string[];
}

/** Replaces the model file; the last selected model mutation wins, falling back to src. */
export interface ModelViewerModelSwap {
  type: 'model';
  /** URL of a .glb or .gltf with the same part and material names. */
  src: string;
}

export type ModelViewerMutation =
  ModelViewerMaterialEdit | ModelViewerMaterialSwap | ModelViewerVisibility | ModelViewerModelSwap;

export interface ModelViewerCameraPreset {
  /** Camera position in model units. */
  position: Vec3;
  /** Point the camera looks at and orbits around. */
  target: Vec3;
  /** Vertical field of view in degrees; keeps the current fov when omitted. */
  fov?: number;
}

export interface ModelViewerSelectionGroup {
  /** Key of cameraPresets to move to when this group changes after another group did. */
  camera?: string;
  /** Mutations applied while each option code is selected. */
  options?: Record<string, ModelViewerMutation[]>;
}

/** An HDR environment for reflections and image-based lighting; never drawn as a background. */
export interface ModelViewerEnvironment {
  /** URL of a Radiance .hdr equirectangular image. */
  src: string;
  /** Turns the environment around the vertical axis, in degrees, to place highlights (default: 0). */
  rotation?: number;
  /** Spins the environment while the model and camera stay still; ignored under prefers-reduced-motion (default: false). */
  autoRotate?: boolean;
  /** Environment spin speed; 2 is one turn every 30 seconds (default: 2). */
  autoRotateSpeed?: number;
}

export interface ModelViewerProps {
  /** URL of the .glb or .gltf model; a .gltf loads its .bin and textures relative to this URL. */
  src: string;
  /** Accessible name of the rendered model, used as the canvas aria-label. */
  label: string;
  /** Lets the user orbit the model by dragging (default: true). */
  orbit?: boolean;
  /** Lets the user zoom with the wheel or a pinch (default: true). */
  zoom?: boolean;
  /** Spins the model continuously; ignored under prefers-reduced-motion (default: false). */
  autoRotate?: boolean;
  /** Autorotate speed; 2 is one turn every 30 seconds (default: 2). */
  autoRotateSpeed?: number;
  /** Camera position in model units; auto-framed from the model's bounds when omitted. */
  cameraPosition?: Vec3;
  /** Point the camera looks at and orbits around; the model's centre when omitted. */
  cameraTarget?: Vec3;
  /** Vertical field of view in degrees, between 0 and 180 exclusive (default: 45). */
  fov?: number;
  /** Lighting preset: sets the key light, shadow strength and environment intensity; the environment is generated unless `environment` is set (default: 'studio'). */
  lighting?: 'studio' | 'neutral' | 'soft';
  /** Tone-mapping exposure; higher is brighter (default: 1). */
  exposure?: number;
  /** Casts a soft shadow onto a ground plane under the model (default: false). */
  shadow?: boolean;
  /** Makes the highlights on diamond-like stones glow; draws the scene twice while the view moves. See "Bloom" above (default: false). */
  bloom?: boolean;
  /** HDR environment that replaces the generated studio for reflections and lighting; the canvas stays transparent. See "Environment" above. */
  environment?: ModelViewerEnvironment;
  /** Messages shown when WebGL is unavailable or the model fails to load (default: English text for each). */
  messages?: { webglUnavailable?: string; loadFailed?: string };
  /** CSS height, applied inline so it beats any class; when omitted the viewer is 400px tall through a class that `class` can override, breakpoint prefixes included. */
  height?: string;
  /** CSS width of the viewer (default: '100%'). */
  width?: string;
  /** Scene changes keyed by selection group, then option code; see "Selections" above (default: {}). */
  selections?: Record<string, ModelViewerSelectionGroup>;
  /** Named camera positions that selection groups can move to; see "Camera presets" above (default: {}). */
  cameraPresets?: Record<string, ModelViewerCameraPreset>;
  /** Additional classes on the viewer root; the canvas is transparent, so set a background here. */
  class?: string;
}

export type ModelViewerConfig = Required<
  Pick<
    ModelViewerProps,
    | 'src'
    | 'label'
    | 'orbit'
    | 'zoom'
    | 'autoRotate'
    | 'autoRotateSpeed'
    | 'fov'
    | 'lighting'
    | 'exposure'
    | 'shadow'
    | 'bloom'
  >
> &
  Pick<ModelViewerProps, 'cameraPosition' | 'cameraTarget' | 'selections' | 'cameraPresets'> & {
    environment?: Required<ModelViewerEnvironment>;
  };

export type ModelViewerErrorReason = 'webgl' | 'load';
