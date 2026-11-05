import { Pressable, StyleSheet, View } from 'react-native';

import { Space, type Palette } from '@/constants/theme';
import { useStyles, useTheme } from '@/theme';

import { AppText } from './app-text';
import { Icon, type IconName } from './icon';

type IconButtonProps = {
  icon: IconName;
  accessibilityLabel: string;
  onPress?: () => void;
  /** Optional count shown as a small badge (e.g. pending reviews). */
  count?: number;
  size?: 40 | 44 | 48;
  background?: string;
};

/** Circular action button (style guide §6, "Circular Action Button"). */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  count,
  size = 48,
  background,
}: IconButtonProps) {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={size < 44 ? (44 - size) / 2 : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: background ?? colors.surface,
        },
        !background && styles.outlined,
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} size={22} />
      {!!count && count > 0 && (
        <View style={styles.count}>
          <AppText variant="smallCaption" color="ink" style={styles.countText}>
            {count > 9 ? '9+' : count}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    button: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    outlined: {
      borderWidth: 1,
      borderColor: c.border,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.95 }],
    },
    count: {
      position: 'absolute',
      top: 2,
      right: 2,
      minWidth: 18,
      height: 18,
      paddingHorizontal: Space.xs,
      borderRadius: 9,
      backgroundColor: c.pink,
      alignItems: 'center',
      justifyContent: 'center',
    },
    countText: {
      fontWeight: '700',
      lineHeight: 14,
    },
  });
