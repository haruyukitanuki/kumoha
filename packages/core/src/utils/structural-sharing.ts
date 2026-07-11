import { dequal } from 'dequal';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

// Reuse each top-level property reference from `previous` when it is deep-equal to `next`, so section
// selectors (e.g. frame.physics) stay reference-stable across frames that didn't touch that section.
// Returns `previous` untouched when nothing differs, so whole-object selectors bail out too.
export const shareStructure = <T>(previous: T | null, next: T): T => {
  if (!isRecord(previous) || !isRecord(next)) return next;

  let changed = Object.keys(previous).length !== Object.keys(next).length;
  const merged: Record<string, unknown> = { ...next };

  for (const key of Object.keys(next)) {
    if (dequal(previous[key], next[key])) {
      merged[key] = previous[key];
    } else {
      changed = true;
    }
  }

  return (changed ? merged : previous) as T;
};
