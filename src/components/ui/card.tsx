import { Pressable, StyleSheet, View, type PressableProps, type ViewProps } from 'react-native';

import { Radius, Space, type Palette } from '@/constants/theme';
import { useStyles, useTheme } from '@/theme';

export type CardTone = 'surface' | 'dark' | 'blue' | 'mint' | 'pink' | 'gray';

const tones = (c: Palette): Record<CardTone, string> => ({
  surface: c.surface,
  dark: c.surfaceDark,
  blue: c.featuredPastel,
  mint: c.mintLight,
  pink: c.pinkLight,
  gray: c.backgroundSecondary,
});

type CardProps = ViewProps & { tone?: CardTone };

export function Card({ tone = 'surface', style, ...rest }: CardProps) {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: tones(colors)[tone] },
        tone === 'surface' && styles.outlined,
        style,
      ]}
      {...rest}
    />
  );
}

type PressableCardProps = Omit<PressableProps, 'style'> & {
  tone?: CardTone;
  style?: ViewProps['style'];
};

/** A card with subtle press feedback. */
export function PressableCard({ tone = 'surface', style, ...rest }: PressableCardProps) {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: tones(colors)[tone] },
        tone === 'surface' && styles.outlined,
        pressed && styles.pressed,
        style,
      ]}
      {...rest}
    />
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      borderRadius: Radius.xl,
      padding: Space.lg,
    },
    /** Surface cards sit on a near-same background, so a subtle line separates them (no shadows). */
    outlined: {
      borderWidth: 1,
      borderColor: c.border,
    },
    pressed: {
      opacity: 0.9,
      transform: [{ scale: 0.99 }],
    },
  });
