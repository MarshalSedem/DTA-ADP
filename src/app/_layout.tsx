import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { ToastProvider } from '@/components/ui/toast';
import { SessionProvider, useSession } from '@/state/session';
import { ThemeProvider, useTheme } from '@/theme';

// Keep the splash screen up while the saved session is checked.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <ToastProvider>
          <RootNavigator />
        </ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { status } = useSession();
  const { colors, scheme } = useTheme();
  const signedIn = status === 'signedIn';

  useEffect(() => {
    if (status !== 'loading') SplashScreen.hide();
  }, [status]);

  // Don't mount the navigator until we know whether the farmer is signed in; otherwise the
  // guards briefly treat them as signed out and a deep link (e.g. /reviews/AGR-…) is lost.
  if (status === 'loading') return null;

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        {/* Farmers must sign in; the API enforces the same rule on every request. */}
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
