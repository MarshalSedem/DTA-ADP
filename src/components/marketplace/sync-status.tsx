import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Notice } from '@/components/notice';
import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Space } from '@/constants/theme';
import { useT } from '@/i18n';
import { useSyncing, useTransactions } from '@/state/marketplace-store';
import { useTheme } from '@/theme';
import type { SyncStatus } from '@/types/marketplace';

/** "Saved on this phone" / "Synced" — icon + text, never colour alone. */
export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const t = useT();
  return status === 'synced' ? (
    <Badge label={t('payments.sync.synced')} tone="mint" icon="check" />
  ) : (
    <Badge label={t('payments.sync.savedOnPhone')} tone="blue" icon="clock" />
  );
}

/** Visible syncing state: "Syncing…" while uploading, or how many are still saved on the phone. */
export function SyncBanner() {
  const t = useT();
  const { colors } = useTheme();
  const syncing = useSyncing();
  const pending = useTransactions().filter((tx) => tx.syncStatus === 'savedOnPhone').length;

  if (syncing) {
    return (
      <Notice title={t('payments.sync.syncingTitle')} icon="clock" tone="blue">
        <View style={styles.row}>
          <ActivityIndicator color={colors.textPrimary} />
          <AppText variant="body" style={styles.flex}>
            {t('payments.sync.syncingBody')}
          </AppText>
        </View>
      </Notice>
    );
  }
  if (pending > 0) {
    return (
      <Notice title={t('payments.sync.pendingTitle', { count: pending })} icon="clock" tone="blue">
        {t('payments.sync.pendingBody')}
      </Notice>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  flex: {
    flex: 1,
  },
});
