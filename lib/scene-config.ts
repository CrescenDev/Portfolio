export const PROJECT_HEIGHT_VH = 180;
export const ROOM_SPACING = 22;
export const ROOM_X = [1, -1.3, 0.7, -0.8, 1];
export function roomPosition(index: number): [number, number, number] {
  return [ROOM_X[index] ?? 0, 0, -index * ROOM_SPACING - 22];
}
export function smoothstep(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}
// Arrival occupies the first quarter; the middle half is a reading hold.
export function chapterTravel(progress: number) {
  return smoothstep(progress / 0.25);
}
