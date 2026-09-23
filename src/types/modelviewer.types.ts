export type Vec3 = [number, number, number];

/** Recolours or retunes every mesh that uses the named glTF material. */
export interface ModelViewerMaterialEdit {
  type: 'material';
  /** glTF material name. */
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
  /** glTF material name of the variant to assign. */
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
  /** Lighting preset built from a generated studio environment, no HDR asset needed (default: 'studio'). */
  lighting?: 'studio' | 'neutral' | 'soft';
  /** Tone-mapping exposure; higher is brighter (default: 1). */
  exposure?: number;
  /** Casts a soft shadow onto a ground plane under the model (default: false). */
  shadow?: boolean;
  /** Messages shown when WebGL is unavailable or the model fails to load (default: English text for each). */
  messages?: { webglUnavailable?: string; loadFailed?: string };
  /** CSS height of the viewer (default: '400px'). */
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
  >
> &
  Pick<ModelViewerProps, 'cameraPosition' | 'cameraTarget' | 'selections' | 'cameraPresets'>;

export type ModelViewerErrorReason = 'webgl' | 'load';
