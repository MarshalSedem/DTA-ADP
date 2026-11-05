import { Pressable, StyleSheet, View } from 'react-native';

import { Layout, Radius, Space, type Palette } from '@/constants/theme';
import { useStyles } from '@/theme';

import { AppText } from './app-text';
import { Icon } from './icon';

type ChipGroupProps<T extends string> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

/** Single-select pill chips (style guide §6 "Selection Chips"). */
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: ChipGroupProps<T>) {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.group}>
      <AppText variant="label">{label}</AppText>
      <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option}
              onPress={() => onChange(option)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.selected,
                pressed && styles.pressed,
              ]}>
              {selected && <Icon name="check" size={14} color="ink" />}
              <AppText variant="button" color={selected ? 'ink' : 'textPrimary'}>
                {option}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    group: {
      gap: Space.sm,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Space.sm,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Space.xs,
      minHeight: Layout.minTouch,
      paddingHorizontal: Space.base,
      borderRadius: Radius.full,
      backgroundColor: c.backgroundSecondary,
    },
    selected: {
      backgroundColor: c.primary,
    },
    pressed: {
      opacity: 0.8,
    },
  });
