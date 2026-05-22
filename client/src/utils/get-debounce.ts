export type DebounceContext = {
  lastInputAt?: number;
  lastValueLength?: number;
};

export function getSearchDebounceTime(
  currentValue: string,
  ctx: DebounceContext,
): number {
  const now = performance.now();
  const lastTime = ctx.lastInputAt ?? now;
  const delta = now - lastTime;

  const lastLen = ctx.lastValueLength ?? 0;
  const currentLen = currentValue.length;

  const lenDiff = currentLen - lastLen;

  // Update context
  ctx.lastInputAt = now;
  ctx.lastValueLength = currentLen;

  /**
   * DELETION HANDLING
   * If user is deleting, we want the search to react quickly
   */
  if (lenDiff < 0) {
    // If user is deleting fast (holding backspace), don't spam calls
    if (delta < 80) return 120;

    // Normal deletion should trigger quickly
    return 80;
  }

  /* BARCODE DETECTION
   * Fast multiple characters within very short time
   */
  if (lenDiff >= 4 && delta < 40) {
    return 30; // Low debounce
  }

  /* FAST TYPING */
  if (delta < 80) {
    return 350;
  }

  /* NORMAL TYPING */
  if (delta < 150) {
    return 300;
  }

  /* SLOW / DELIBERATE INPUT */
  return 200;
}

export function getTableSearchDebounceTime(
  currentValue: string,
  ctx: DebounceContext,
): number {
  const now = performance.now();
  const lastTime = ctx.lastInputAt ?? now;
  const delta = now - lastTime;

  const lastLen = ctx.lastValueLength ?? 0;
  const currentLen = currentValue.length;

  const lenDiff = currentLen - lastLen;

  // Update context
  ctx.lastInputAt = now;
  ctx.lastValueLength = currentLen;

  /**
   * DELETION HANDLING
   */
  if (lenDiff < 0) {
    if (delta < 80) return 300;
    return 200;
  }

  /* BARCODE DETECTION */
  if (lenDiff >= 4 && delta < 40) {
    return 50;
  }

  /* FAST TYPING */
  if (delta < 80) {
    return 700;
  }

  /* NORMAL TYPING */
  if (delta < 150) {
    return 500;
  }

  /* SLOW / DELIBERATE INPUT */
  return 400;
}
