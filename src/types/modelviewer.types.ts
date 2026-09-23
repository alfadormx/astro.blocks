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
  cameraPosition?: [number, number, number];
  /** Point the camera looks at and orbits around; the model's centre when omitted. */
  cameraTarget?: [number, number, number];
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
  Pick<ModelViewerProps, 'cameraPosition' | 'cameraTarget'>;

export type ModelViewerErrorReason = 'webgl' | 'load';
