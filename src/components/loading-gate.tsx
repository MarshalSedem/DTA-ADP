import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Notice } from '@/components/notice';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Layout, Space, type Palette } from '@/constants/theme';
import { useSession } from '@/state/session';
import { useStyles, useTheme } from '@/theme';

/** Shown while the farmer's data loads after sign-in, or with a retry if loading failed. */
export function LoadingGate({ error, retry }: { error: string | null; retry: () => void }) {
  const { colors } = useTheme();
  const { signOut } = useSession();
  const insets = useSafeAreaInsets();
  const styles = useStyles(createStyles);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {error ? (
        <View style={styles.content}>
          <Notice title="Couldn't load your farm data" icon="warning" tone="pink">
            {error}
          </Notice>
          <Button label="Try again" variant="accent" fullWidth onPress={retry} />
          <Button label="Sign out" variant="secondary" fullWidth onPress={() => void signOut()} />
        </View>
      ) : (
        <View style={styles.loading} accessibilityLiveRegion="polite">
          <ActivityIndicator size="large" color={colors.primaryStrong} />
          <AppText variant="body" color="textSecondary">
            Loading your farm…
          </AppText>
        </View>
      )}
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: c.background,
      paddingHorizontal: Layout.screenPadding,
    },
    content: {
      gap: Space.md,
      width: '100%',
      maxWidth: Layout.maxContentWidth,
      alignSelf: 'center',
    },
    loading: {
      alignItems: 'center',
      gap: Space.md,
    },
  });
