import type { LeafletPin } from "@/components/leaflet-map";

export type LayoutPin = LeafletPin & { members?: LeafletPin[] };
type Bounds = { south: number; north: number; west: number; east: number };
const CELL = 84;

/** World-pixel buckets stay stable while panning; recompute only after a gesture ends. */
export function mapMarkerLayout(pins: LeafletPin[], zoom: number, bounds: Bounds): LayoutPin[] {
  const size = 256 * 2 ** zoom;
  const buckets = new Map<string, LeafletPin[]>();
  const layout: LayoutPin[] = [];
  for (const pin of pins) {
    if (pin.lat < bounds.south || pin.lat > bounds.north || pin.lng < bounds.west || pin.lng > bounds.east) continue;
    if (pin.active) { layout.push(pin); continue; }
    const latitude = Math.max(-85.0511, Math.min(85.0511, pin.lat)) * Math.PI / 180;
    const x = (pin.lng + 180) / 360 * size;
    const y = (1 - Math.log(Math.tan(latitude) + 1 / Math.cos(latitude)) / Math.PI) / 2 * size;
    const key = `${Math.floor(x / CELL)}:${Math.floor(y / CELL)}`;
    const group = buckets.get(key);
    if (group) group.push(pin); else buckets.set(key, [pin]);
  }
  for (const [key, group] of buckets) {
    if (group.length === 1) layout.push(group[0]);
    else layout.push({
      id: `@cluster:${key}`, lat: group.reduce((sum, pin) => sum + pin.lat, 0) / group.length,
      lng: group.reduce((sum, pin) => sum + pin.lng, 0) / group.length,
      title: "Nearby property locations — click to zoom in", members: group,
    });
  }
  return layout;
}
