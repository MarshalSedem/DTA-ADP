import type { NativeStackNavigationOptions } from 'expo-router';

import { useTheme } from '@/theme';

/**
 * Same header as the app's other detail pages (mirrors `detailHeader` in
 * src/app/(app)/_layout.tsx). Marketplace and payment screens apply it themselves with
 * <Stack.Screen options={...} />, so the layout doesn't need editing and
 * titles can come from i18n.
 */
export function useMarketplaceHeader(): NativeStackNavigationOptions {
  const { colors } = useTheme();
  return {
    headerShown: true,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: { fontWeight: '600' },
    headerBackButtonDisplayMode: 'minimal',
  };
}
