import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Layout, Radius, Space, Typography, type Palette } from '@/constants/theme';
import { useStyles, useTheme } from '@/theme';

import { AppText } from './app-text';

type TextFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
};

/** Rounded input with no strong border; background and outline change on focus (style guide §8). */
export function TextField({ label, hint, error, multiline, style, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const { colors, scheme } = useTheme();
  const styles = useStyles(createStyles);
  return (
    <View style={styles.wrapper}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor={colors.textMuted}
        keyboardAppearance={scheme}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          styles.input,
          multiline ? styles.multiline : styles.single,
          focused && styles.focused,
          !!error && styles.errored,
          style,
        ]}
        {...rest}
      />
      {(error || hint) && (
        <AppText variant="caption" color={error ? 'textPrimary' : 'textSecondary'}>
          {error ?? hint}
        </AppText>
      )}
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    wrapper: {
      gap: Space.sm,
    },
    input: {
      ...Typography.bodyLarge,
      color: c.textPrimary,
      backgroundColor: c.backgroundSecondary,
      paddingHorizontal: Space.lg,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    single: {
      height: Layout.inputHeight,
      borderRadius: Radius.full,
    },
    multiline: {
      minHeight: 112,
      paddingTop: Space.base,
      paddingBottom: Space.base,
      borderRadius: Radius.lg,
    },
    focused: {
      backgroundColor: c.surface,
      borderColor: c.primaryStrong,
    },
    errored: {
      borderColor: c.pink,
    },
  });
