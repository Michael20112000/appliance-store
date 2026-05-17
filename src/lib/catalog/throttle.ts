export type ThrottledInvoke = {
  (fn: () => void): void;
  flush: () => void;
};

/** Rate-limits `fn` to at most once per `ms`; `flush` runs any pending call immediately. */
export function createThrottle(ms: number): ThrottledInvoke {
  let lastInvoke = 0;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let latestFn: (() => void) | undefined;

  const invoke = () => {
    const fn = latestFn;
    latestFn = undefined;
    timeoutId = undefined;
    lastInvoke = Date.now();
    fn?.();
  };

  const throttled = ((fn: () => void) => {
    latestFn = fn;
    const remaining = ms - (Date.now() - lastInvoke);

    if (remaining <= 0) {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      invoke();
    } else if (timeoutId === undefined) {
      timeoutId = setTimeout(invoke, remaining);
    }
  }) as ThrottledInvoke;

  throttled.flush = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    if (latestFn) invoke();
  };

  return throttled;
}
