const STEP = 1024;

/** Fractional index between two neighbours (either may be missing). */
export function positionBetween(before?: number, after?: number) {
  if (before === undefined && after === undefined) return STEP;
  if (before === undefined) return after! / 2;
  if (after === undefined) return before + STEP;
  return (before + after) / 2;
}
