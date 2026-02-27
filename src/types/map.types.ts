export type MapLayer = 'mapnik' | 'humanitarian' | 'topo';

export interface MapProps {
  lat: number;
  lon: number;
  zoom?: number;
  layer?: MapLayer;
  showMarker?: boolean;
  markerTitle?: string;
  height?: string;
  width?: string;
  title?: string;
  class?: string;
}
