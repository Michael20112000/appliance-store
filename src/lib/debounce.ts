export type DebouncedInvoke = {
  (fn: () => void): void;
  flush: () => void;
  cancel: () => void;
};

/** Invokes `fn` after `ms` quiet period; each new schedule resets the timer. */
export function createDebounce(ms: number): DebouncedInvoke {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let latestFn: (() => void) | undefined;

  const invoke = () => {
    const fn = latestFn;
    latestFn = undefined;
    timeoutId = undefined;
    fn?.();
  };

  const debounced = ((fn: () => void) => {
    latestFn = fn;
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(invoke, ms);
  }) as DebouncedInvoke;

  debounced.flush = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    if (latestFn) invoke();
  };

  debounced.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    latestFn = undefined;
  };

  return debounced;
}
