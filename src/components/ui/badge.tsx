import { StyleSheet, View } from 'react-native';

import { Radius, Space, type ColorToken, type Palette } from '@/constants/theme';
import { useTheme } from '@/theme';

import { AppText } from './app-text';
import { Icon, type IconName } from './icon';

export type BadgeTone = 'mint' | 'blue' | 'pink' | 'gray' | 'dark';

/** Pastel fills keep dark ink text in both themes; neutral tones follow the theme. */
const tones = (c: Palette): Record<BadgeTone, { bg: string; fg: ColorToken }> => ({
  mint: { bg: c.mint, fg: 'ink' },
  blue: { bg: c.blue, fg: 'ink' },
  pink: { bg: c.pink, fg: 'ink' },
  gray: { bg: c.backgroundSecondary, fg: 'textPrimary' },
  dark: { bg: c.surfaceDarkSecondary, fg: 'textInverse' },
});

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
};

/** Small pill label. Always carries text so state never relies on colour alone. */
export function Badge({ label, tone = 'gray', icon }: BadgeProps) {
  const { colors } = useTheme();
  const { bg, fg } = tones(colors)[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon && <Icon name={icon} size={12} color={fg} />}
      <AppText variant="label" color={fg}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Space.xs,
    paddingHorizontal: Space.md,
    paddingVertical: Space.xs,
    borderRadius: Radius.sm,
  },
});
