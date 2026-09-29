/**
 * Shared slippy-map engine: Web-Mercator projection + tile URL builders.
 * Supports FRACTIONAL zoom: tiles are fetched at the nearest integer level and
 * scaled by 2^(zoom - level), which gives smooth, animated zooming.
 *
 * Layers (Google Maps raster tiles – the same imagery/labels DHA-style
 * society maps use):
 *  - "hybrid"   (default): satellite imagery WITH road names & place labels
 *  - "satellite": imagery only
 *  - "roadmap":  classic Google road map
 * OpenStreetMap is kept as an automatic fallback if Google tiles fail.
 */

export const TILE_SIZE = 256;
export const MIN_ZOOM = 4;
export const MAX_ZOOM = 20;

export type MapLayer = "hybrid" | "satellite" | "roadmap";

export const LAYER_LABEL: Record<MapLayer, string> = {
  hybrid: "Satellite",
  satellite: "Imagery",
  roadmap: "Map",
};

export function projectX(lng: number, scale: number) {
  return ((lng + 180) / 360) * scale;
}

export function projectY(lat: number, scale: number) {
  const clamped = Math.max(-85, Math.min(85, lat));
  const sin = Math.sin((clamped * Math.PI) / 180);
  return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale;
}

export function unprojectX(x: number, scale: number) {
  return (x / scale) * 360 - 180;
}

export function unprojectY(y: number, scale: number) {
  const n = Math.PI - (2 * Math.PI * y) / scale;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

export function scaleForZoom(zoom: number) {
  return TILE_SIZE * Math.pow(2, zoom);
}

export type MapTile = {
  key: string;
  z: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  size: number;
};

/**
 * Visible tiles for a possibly-fractional zoom. Tiles come from integer level
 * z = round(zoom) and are drawn at 256 * 2^(zoom - z) px, so the map scales
 * continuously while cached tiles stay warm.
 */
export function visibleTiles(
  centerLat: number,
  centerLng: number,
  zoom: number,
  width: number,
  height: number,
): { tiles: MapTile[]; scale: number; left: number; top: number; tileZoom: number } {
  const scale = scaleForZoom(zoom);
  const centerX = projectX(centerLng, scale);
  const centerY = projectY(centerLat, scale);
  const left = centerX - width / 2;
  const top = centerY - height / 2;

  const tileZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(zoom)));
  const ratio = scale / scaleForZoom(tileZoom);
  const renderedTile = TILE_SIZE * ratio;
  const maxIndex = Math.pow(2, tileZoom) - 1;

  const minX = Math.max(0, Math.floor(left / renderedTile) - 1);
  const maxX = Math.min(maxIndex, Math.floor((left + width) / renderedTile) + 1);
  const minY = Math.max(0, Math.floor(top / renderedTile) - 1);
  const maxY = Math.min(maxIndex, Math.floor((top + height) / renderedTile) + 1);

  const tiles: MapTile[] = [];
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      tiles.push({
        key: `${tileZoom}-${x}-${y}`,
        z: tileZoom,
        x,
        y,
        offsetX: x * renderedTile - left,
        offsetY: y * renderedTile - top,
        size: renderedTile,
      });
    }
  }
  return { tiles, scale, left, top, tileZoom };
}

/** Google raster tile (sharded across mt0-mt3 for parallel loading). */
export function baseTileUrl(layer: MapLayer, z: number, x: number, y: number): string {
  const shard = (x + y) % 4;
  const lyrs = layer === "hybrid" ? "y" : layer === "satellite" ? "s" : "m";
  return `https://mt${shard}.google.com/vt/lyrs=${lyrs}&x=${x}&y=${y}&z=${z}&hl=en`;
}

/** Fallback tile source if Google tiles are unreachable. */
export function fallbackTileUrl(layer: MapLayer, z: number, x: number, y: number): string {
  if (layer === "roadmap") return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
}

export function attributionFor(layer: MapLayer): string {
  if (layer === "roadmap") return "Map data © Google";
  return "Imagery © Google, Maxar Technologies · Map data © Google";
}

/** City presets used by the location picker and map recentring. */
export const CITY_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  lahore: { lat: 31.5204, lng: 74.3587, zoom: 12 },
  islamabad: { lat: 33.6844, lng: 73.0479, zoom: 12 },
  karachi: { lat: 24.8607, lng: 67.0011, zoom: 11 },
  rawalpindi: { lat: 33.5651, lng: 73.0169, zoom: 12 },
  faisalabad: { lat: 31.4187, lng: 73.0791, zoom: 12 },
  multan: { lat: 30.1575, lng: 71.5249, zoom: 12 },
  gujranwala: { lat: 32.1877, lng: 74.1945, zoom: 12 },
  peshawar: { lat: 34.0151, lng: 71.5249, zoom: 12 },
};
