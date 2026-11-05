import { router, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MIN_TAP } from '@/components/marketplace/constants';
import { useMarketplaceHeader } from '@/components/marketplace/header-options';
import { OfflineBanner } from '@/components/marketplace/offline-banner';
import { PrototypeNotice } from '@/components/marketplace/prototype-notice';
import { SyncBanner, SyncStatusBadge } from '@/components/marketplace/sync-status';
import { Notice } from '@/components/notice';
import { Screen } from '@/components/screen';
import { ScreenIntro } from '@/components/screen-intro';
import { AppText } from '@/components/ui/app-text';
import { Card, PressableCard } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Space } from '@/constants/theme';
import { useT } from '@/i18n';
import { useTransactions } from '@/state/marketplace-store';
import { formatDateTime, formatMoney } from '@/utils/format';

/** The farmer's ledger of simulated payments — one action: open a receipt. */
export default function LedgerScreen() {
  const t = useT();
  const headerOptions = useMarketplaceHeader();
  const transactions = useTransactions();
  const total = transactions.reduce((sum, tx) => sum + tx.breakdown.total, 0);

  return (
    <Screen variant="stack">
      <Stack.Screen options={{ ...headerOptions, title: t('payments.ledger.headerTitle') }} />
      <PrototypeNotice kind="noRealMoney" />
      <OfflineBanner />
      <SyncBanner />

      <ScreenIntro
        eyebrow={t('payments.ledger.eyebrow')}
        title={t('payments.ledger.title')}
        description={t('payments.ledger.description')}
      />

      {transactions.length === 0 ? (
        <Notice title={t('payments.ledger.emptyTitle')} icon="document" tone="gray">
          {t('payments.ledger.emptyBody')}
        </Notice>
      ) : (
        <>
          <Card tone="blue" style={styles.summary}>
            <Icon name="document" size={22} />
            <AppText variant="cardHeading" style={styles.flex}>
              {t('payments.ledger.summary', {
                count: transactions.length,
                total: formatMoney('GHS', total),
              })}
            </AppText>
          </Card>

          <View style={styles.list}>
            {transactions.map((tx) => (
              <PressableCard
                key={tx.id}
                style={styles.row}
                accessibilityLabel={t('payments.ledger.openReceipt', { number: tx.receiptNumber })}
                onPress={() =>
                  router.push({ pathname: '/payments/receipt/[txId]', params: { txId: tx.id } })
                }>
                <View style={styles.rowTop}>
                  <AppText variant="label" color="textSecondary" style={styles.flex}>
                    {t('payments.ledger.rowMeta', {
                      number: tx.receiptNumber,
                      date: formatDateTime(tx.createdAt),
                    })}
                  </AppText>
                  <SyncStatusBadge status={tx.syncStatus} />
                </View>
                <View style={styles.rowBottom}>
                  <View style={styles.flex}>
                    <AppText variant="cardHeading">{tx.productName}</AppText>
                    <AppText variant="body" color="textSecondary">
                      {tx.dealerName}
                    </AppText>
                  </View>
                  <AppText variant="cardHeading">
                    {formatMoney(tx.breakdown.currency, tx.breakdown.total)}
                  </AppText>
                  <Icon name="chevronRight" size={18} />
                </View>
              </PressableCard>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  list: {
    gap: Space.md,
  },
  row: {
    gap: Space.sm,
    minHeight: MIN_TAP,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
});
