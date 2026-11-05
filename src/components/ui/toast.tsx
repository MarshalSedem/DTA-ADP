import { createContext, use, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Layout, Radius, Space, type Palette } from '@/constants/theme';
import { useStyles } from '@/theme';

import { AppText } from './app-text';
import { Icon } from './icon';

const TOAST_MS = 2200;

type ToastKind = 'success' | 'error';
type ShowToast = (message: string, kind?: ToastKind) => void;

const ToastContext = createContext<ShowToast | null>(null);

/** Short confirmation messages (docs/features/farmer.md §9.1). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const styles = useStyles(createStyles);
  const [toast, setToast] = useState<{ id: number; message: string; kind: ToastKind } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show: ShowToast = (message, kind = 'success') => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message, kind });
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  };

  return (
    <ToastContext value={show}>
      {children}
      <View
        pointerEvents="none"
        style={[styles.host, { bottom: insets.bottom + Layout.navigationHeight + Space.base }]}>
        {toast && (
          <Animated.View
            key={toast.id}
            entering={FadeInDown.duration(200)}
            exiting={FadeOutDown.duration(200)}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={styles.toast}>
            <Icon
              name={toast.kind === 'error' ? 'warning' : 'check'}
              size={18}
              color="textInverse"
            />
            <AppText variant="button" color="textInverse" style={styles.text}>
              {toast.message}
            </AppText>
          </Animated.View>
        )}
      </View>
    </ToastContext>
  );
}

export function useToast() {
  const show = use(ToastContext);
  if (!show) throw new Error('useToast must be used inside <ToastProvider>');
  return show;
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    host: {
      position: 'absolute',
      left: Layout.screenPadding,
      right: Layout.screenPadding,
      alignItems: 'center',
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Space.sm,
      maxWidth: Layout.maxContentWidth,
      paddingHorizontal: Space.lg,
      paddingVertical: Space.md,
      borderRadius: Radius.full,
      backgroundColor: c.surfaceDark,
      borderWidth: 1,
      borderColor: c.surfaceDarkSecondary,
    },
    text: {
      flexShrink: 1,
    },
  });
