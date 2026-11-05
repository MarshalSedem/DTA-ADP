/**
 * AgriTrust design tokens — derived from `style-guide.md`, with the mint primary and dark
 * theme used by the web dashboard. Use these instead of hard-coded values in components.
 */
import '@/global.css';

import { Platform, type TextStyle } from 'react-native';

/**
 * Colour palettes. Components never import a palette directly — they read the active one
 * with `useTheme()` / `useStyles()` from `@/theme`, so light and dark stay in sync.
 *
 * Primary is mint #83F5CC (the guide's Mint Green). `primaryLight` keeps the guide's
 * primary→light ratio (cyan #49CBEB → #98E2F4); `navActive` is the guide's Light Mint.
 * Mint is only 1.3:1 on white, so lines that must be seen on light surfaces (focus borders,
 * bullet dots, progress fills) use `primaryStrong`. Text on any pastel fill uses `ink`.
 * Values match the web dashboard (DTA-ADP-DASHBOARD/frontend/src/styles/tokens.css).
 */
export const LightColors = {
  // Primary
  primary: '#83F5CC',
  primaryLight: '#BAF9E2',
  primaryStrong: '#178A62',
  navActive: '#DDFFF1',

  // Secondary / pastel
  mint: '#83F5CC',
  pink: '#FDB0E3',
  mintLight: '#DDFFF1',
  pinkLight: '#FFE7F6',
  showcase: '#CDE5EA',
  /** Soft blue stays the informational accent so "info" never looks like "success". */
  blue: '#98E2F4',
  blueFaint: '#CDEFF6',
  featuredPastel: '#98E2F4',

  // Backgrounds & surfaces
  background: '#FAFAFA',
  backgroundSecondary: '#F3F5F7',
  surface: '#FFFFFF',
  surfaceDark: '#1C1C1C',
  surfaceDarkSecondary: '#323232',
  backdrop: 'rgba(28, 28, 28, 0.45)',

  // Text
  textPrimary: '#1C1C1C',
  /** #6B6B6B instead of the guide's #888888, which is below WCAG AA on white. */
  textSecondary: '#6B6B6B',
  textMuted: '#A5A5A5',
  textInverse: '#FFFFFF',
  /** Secondary text on dark surfaces (keeps AA contrast on #1C1C1C). */
  textInverseSecondary: '#C9C9C9',

  /** Text and icons on pastel fills — the same in both themes. */
  ink: '#1C1C1C',
  white: '#FFFFFF',

  // Borders
  border: '#EAEAEA',
};

export type Palette = Record<keyof typeof LightColors, string>;
export type ColorToken = keyof Palette;

/** Dark theme (guide §13): charcoal surfaces, near-white text, pastel accents as fills. */
export const DarkColors: Palette = {
  primary: '#83F5CC',
  primaryLight: '#BAF9E2',
  primaryStrong: '#83F5CC',
  navActive: '#163128',

  mint: '#83F5CC',
  pink: '#FDB0E3',
  mintLight: '#163128',
  pinkLight: '#331F2B',
  showcase: '#1E2A2D',
  blue: '#98E2F4',
  blueFaint: '#13303A',
  featuredPastel: '#173A45',

  background: '#121212',
  backgroundSecondary: '#262626',
  surface: '#1C1C1C',
  /** Sits above cards so featured dark cards still stand out. */
  surfaceDark: '#2A2A2A',
  surfaceDarkSecondary: '#383838',
  backdrop: 'rgba(0, 0, 0, 0.65)',

  textPrimary: '#F2F2F2',
  textSecondary: '#BDBDBD',
  textMuted: '#8A8A8A',
  textInverse: '#FFFFFF',
  textInverseSecondary: '#C9C9C9',

  ink: '#1C1C1C',
  white: '#FFFFFF',

  border: '#2E2E2E',
};

export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const Radius = {
  xs: 8,
  sm: 12, // badges
  md: 16, // navigation selection
  lg: 20, // small cards
  xl: 24, // standard cards
  '2xl': 28,
  '3xl': 32,
  full: 999,
} as const;

export const Layout = {
  screenPadding: 20,
  buttonHeight: 52,
  inputHeight: 56,
  navigationHeight: 72,
  minTouch: 44,
  maxContentWidth: 640,
} as const;

/**
 * Zona Pro is the brand typeface. It is not bundled yet (licensed font) — once the
 * font files are added, load them with the expo-font config plugin and set the
 * family name here. Until then, web falls back via CSS and native uses the system font.
 */
const fontFamily = Platform.select({ web: 'var(--font-primary)', default: undefined });

const type = (
  fontSize: number,
  lineHeight: number,
  fontWeight: TextStyle['fontWeight'],
): TextStyle => ({
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
});

export const Typography = {
  display: type(34, 40, '700'),
  h1: type(30, 38, '700'),
  h2: type(26, 34, '700'),
  h3: type(22, 30, '600'),
  h4: type(20, 28, '600'),
  cardHeading: type(18, 24, '600'),
  bodyLarge: type(16, 24, '400'),
  body: type(14, 22, '400'),
  button: type(14, 20, '500'),
  label: type(13, 18, '500'),
  caption: type(12, 16, '400'),
  smallCaption: type(11, 16, '400'),
} as const;

export type TypographyVariant = keyof typeof Typography;

/**
 * No shadows anywhere in the app (product decision). Separate surfaces with
 * background contrast, or a 1px `border` line on white surfaces.
 */

export const Duration = {
  press: 120,
  fast: 150,
  normal: 250,
  slow: 350,
} as const;
