import type { ComponentRef, Ref } from 'react';
import type { TabListProps, TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Layout, Radius, Space, type Palette } from '@/constants/theme';
import { useStyles } from '@/theme';

export const FARMER_TABS = [
  { name: 'index', href: '/', label: 'Home', icon: 'home' },
  { name: 'diagnose', href: '/diagnose', label: 'Diagnose', icon: 'diagnose' },
  { name: 'marketplace', href: '/marketplace', label: 'Market', icon: 'store' },
  { name: 'payments', href: '/payments', label: 'Payments', icon: 'wallet' },
  { name: 'profile', href: '/profile', label: 'Profile', icon: 'profile' },
] as const satisfies readonly { name: string; href: string; label: string; icon: IconName }[];

/*
 * Note: Expo Router finds the tabs by scanning the direct children of <Tabs>
 * for <TabList> and its <TabTrigger>s. So <TabList>/<TabTrigger> must be
 * written out in the layout itself — only the styled pieces live here.
 */

/** Fixed bottom navigation bar (style guide §9). Use as `<TabList asChild>`'s child. */
export function TabBarContainer(props: TabListProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles(createStyles);
  return (
    <View
      {...props}
      accessibilityRole="tablist"
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, Space.md) }]}
    />
  );
}

type TabButtonProps = TabTriggerSlotProps & { icon: IconName; label: string };

/** A tab with its icon and name. Use as `<TabTrigger asChild>`'s child. */
export function TabButton({ icon, label, isFocused, ref, ...props }: TabButtonProps) {
  const styles = useStyles(createStyles);
  return (
    <Pressable
      {...props}
      // expo-router/ui types the slot ref as Ref<View>, which doesn't match RN 0.88's
      // element ref type; the runtime value is the Pressable's host element.
      ref={ref as unknown as Ref<ComponentRef<typeof Pressable>>}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
      <View style={[styles.indicator, isFocused && styles.indicatorActive]}>
        <Icon name={icon} size={24} />
      </View>
      <AppText variant="caption" style={isFocused ? styles.labelActive : styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      paddingTop: Space.sm,
      paddingHorizontal: Space.sm,
      minHeight: Layout.navigationHeight,
      borderTopLeftRadius: Radius.xl,
      borderTopRightRadius: Radius.xl,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: c.border,
    },
    tab: {
      flex: 1,
      minHeight: Layout.minTouch,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Space.xs,
    },
    indicator: {
      width: 56,
      height: 32,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    indicatorActive: {
      backgroundColor: c.navActive,
    },
    label: {
      fontWeight: '500',
    },
    labelActive: {
      fontWeight: '700',
    },
    pressed: {
      opacity: 0.7,
    },
  });
