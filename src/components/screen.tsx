import { useHeaderHeight } from 'expo-router/react-navigation';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Layout, Space, type Palette } from '@/constants/theme';
import { useStyles } from '@/theme';

type ScreenProps = Omit<ScrollViewProps, 'children'> & {
  children: ReactNode;
  /**
   * `tab`: top-level tab screen with no header — pads for the status bar.
   * `stack`: detail page under a navigation header.
   */
  variant: 'tab' | 'stack';
};

/** Standard scrolling screen: near-white background, 20px margins, keyboard-aware. */
export function Screen({ children, variant, contentContainerStyle, ...rest }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const styles = useStyles(createStyles);
  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={variant === 'stack' ? headerHeight : 0}
      style={styles.flex}>
      <ScrollView
        style={styles.screen}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: variant === 'tab' ? insets.top + Space.base : Space.base,
            paddingBottom: (variant === 'stack' ? insets.bottom : 0) + Space['2xl'],
          },
          contentContainerStyle,
        ]}
        {...rest}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    screen: {
      flex: 1,
      backgroundColor: c.background,
    },
    content: {
      paddingHorizontal: Layout.screenPadding,
      gap: Space.xl,
      width: '100%',
      maxWidth: Layout.maxContentWidth,
      alignSelf: 'center',
    },
  });
