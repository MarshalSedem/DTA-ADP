/**
 * Light / Dark / System theme. The choice is saved on the device; "System" follows the phone's
 * appearance setting live. Components read colours with `useTheme()` or build styles with
 * `useStyles(factory)` — never from a palette constant — so both themes stay complete.
 */
import * as SystemUI from 'expo-system-ui';
import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Appearance, Platform, useColorScheme } from 'react-native';

import { DarkColors, LightColors, type Palette } from '@/constants/theme';
import { storage } from '@/services/storage';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedScheme = 'light' | 'dark';

type ThemeState = {
  colors: Palette;
  scheme: ResolvedScheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeState | null>(null);
const STORAGE_KEY = 'agritrust.theme';

/** Native UI (keyboard, alerts, pickers) follows the same choice as the app. */
function applyToNative(preference: ThemePreference) {
  if (Platform.OS !== 'web')
    Appearance.setColorScheme(preference === 'system' ? 'auto' : preference);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);
  const system = useColorScheme();

  useEffect(() => {
    storage
      .get(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark') {
          applyToNative(saved);
          setPreferenceState(saved);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const scheme: ResolvedScheme =
    preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const colors = scheme === 'dark' ? DarkColors : LightColors;

  useEffect(() => {
    // Root view colour behind screens, so transitions never flash the other theme.
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background]);

  const value = useMemo<ThemeState>(
    () => ({
      colors,
      scheme,
      preference,
      setPreference: (next) => {
        applyToNative(next);
        setPreferenceState(next);
        const saving =
          next === 'system' ? storage.remove(STORAGE_KEY) : storage.set(STORAGE_KEY, next);
        saving.catch(() => {}); // not saved (e.g. storage unavailable): lasts this session
      },
    }),
    [colors, scheme, preference],
  );

  // Wait for the saved choice (a few ms) so the first frame uses the right theme.
  if (!ready) return null;
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  const ctx = use(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

/**
 * Build a StyleSheet from the active palette. Pass a module-level factory:
 *   const createStyles = (c: Palette) => StyleSheet.create({ ... });
 *   const styles = useStyles(createStyles);
 */
export function useStyles<T>(factory: (colors: Palette) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}
