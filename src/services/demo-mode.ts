/**
 * Offline demo mode — no sign-in and no backend; farmer screens use built-in sample data.
 *
 * DEVELOPMENT BUILDS ONLY: `__DEV__` is false in release builds, so they always require
 * sign-in. In development it is on by default; to test against the real backend and sign-in,
 * set `EXPO_PUBLIC_DISABLE_LOGIN=false` (e.g. in .env.local) and restart Expo.
 */
export const DEMO_MODE = __DEV__ && process.env.EXPO_PUBLIC_DISABLE_LOGIN !== 'false';
