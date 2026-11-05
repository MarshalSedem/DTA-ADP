import { Stack, type NativeStackNavigationOptions } from 'expo-router';

import { LoadingGate } from '@/components/loading-gate';
import { FarmerProvider } from '@/state/farmer-store';
import { useTheme } from '@/theme';

/** Signed-in area: loads the farmer's data once, then shows the tabs and detail pages. */
export default function AppLayout() {
  const { colors } = useTheme();

  /** Header used by detail pages pushed on top of the tabs. */
  const detailHeader: NativeStackNavigationOptions = {
    headerShown: true,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: { fontWeight: '600' },
    headerBackButtonDisplayMode: 'minimal',
  };

  return (
    <FarmerProvider renderGate={(gate) => <LoadingGate {...gate} />}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="adviser" options={{ ...detailHeader, title: 'Ask AI Adviser' }} />
        <Stack.Screen
          name="diagnosis/[id]"
          options={{ ...detailHeader, title: 'Diagnosis result' }}
        />
        <Stack.Screen name="market" options={{ ...detailHeader, title: 'Market Prices' }} />
        <Stack.Screen name="reviews/index" options={{ ...detailHeader, title: 'Human Review' }} />
        <Stack.Screen name="reviews/[id]" options={{ ...detailHeader, title: 'Review case' }} />
        <Stack.Screen name="privacy" options={{ ...detailHeader, title: 'My Data & Privacy' }} />
      </Stack>
    </FarmerProvider>
  );
}
