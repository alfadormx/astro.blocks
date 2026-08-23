export type MapLayer = 'mapnik' | 'humanitarian' | 'topo';

export interface MapProps {
  /** Latitude of the map's center point, used to position the tile view and marker. */
  lat: number;
  /** Longitude of the map's center point, used to position the tile view and marker. */
  lon: number;
  /** Initial zoom level of the map (default: 13). */
  zoom?: number;
  /** Tile layer style to render, e.g. street, humanitarian, or topographic (default: 'mapnik'). */
  layer?: MapLayer;
  /** Whether to show a marker at the lat/lon coordinates (default: true). */
  showMarker?: boolean;
  /** Popup text shown for the marker; opens automatically when the marker is displayed. */
  markerTitle?: string;
  /** CSS height applied to the map container (default: '400px'). */
  height?: string;
  /** CSS width applied to the map container (default: '100%'). */
  width?: string;
  /** Accessible label for the map, used as the aria-label on the map container (default: 'OpenStreetMap'). */
  title?: string;
  /** Additional CSS class(es) applied to the outer wrapper element. */
  class?: string;
}
