/** Web: SecureStore isn't available, so use localStorage (cleared on sign-out). */
function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback; // private mode or storage disabled
  }
}

export const storage = {
  get: async (key: string) => safe(() => localStorage.getItem(key), null),
  set: async (key: string, value: string) =>
    safe(() => localStorage.setItem(key, value), undefined),
  remove: async (key: string) => safe(() => localStorage.removeItem(key), undefined),
};
