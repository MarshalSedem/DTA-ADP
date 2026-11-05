import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Space, type Palette } from '@/constants/theme';
import { useT } from '@/i18n';
import { useStyles } from '@/theme';

import { MIN_TAP } from './constants';

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

/** − / + quantity control with 48px round buttons. */
export function QuantityStepper({ value, onChange, min = 1, max = 10 }: QuantityStepperProps) {
  const t = useT();
  const styles = useStyles(createStyles);
  return (
    <View style={styles.wrapper}>
      <AppText variant="label">{t('payments.review.quantity')}</AppText>
      <View style={styles.row} accessibilityRole="adjustable" accessibilityValue={{ min, max, now: value }}>
        <StepButton
          glyph="−"
          label={t('payments.review.decrease')}
          disabled={value <= min}
          onPress={() => onChange(Math.max(min, value - 1))}
        />
        <AppText variant="h3" style={styles.value} accessibilityLiveRegion="polite">
          {value}
        </AppText>
        <StepButton
          glyph="+"
          label={t('payments.review.increase')}
          disabled={value >= max}
          onPress={() => onChange(Math.min(max, value + 1))}
        />
      </View>
    </View>
  );
}

function StepButton({
  glyph,
  label,
  disabled,
  onPress,
}: {
  glyph: string;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const styles = useStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.step, disabled && styles.disabled, pressed && styles.pressed]}>
      <AppText variant="h3" color="ink">
        {glyph}
      </AppText>
    </Pressable>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    wrapper: {
      gap: Space.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Space.base,
    },
    value: {
      minWidth: 40,
      textAlign: 'center',
    },
    step: {
      width: MIN_TAP,
      height: MIN_TAP,
      borderRadius: MIN_TAP / 2,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabled: {
      opacity: 0.4,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.95 }],
    },
  });
