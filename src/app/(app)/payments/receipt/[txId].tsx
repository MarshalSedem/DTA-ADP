import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';

import { useMarketplaceHeader } from '@/components/marketplace/header-options';
import { PriceBreakdownCard } from '@/components/marketplace/price-breakdown';
import { PrototypeNotice } from '@/components/marketplace/prototype-notice';
import { SyncBanner, SyncStatusBadge } from '@/components/marketplace/sync-status';
import { Notice } from '@/components/notice';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Space, type Palette } from '@/constants/theme';
import { useT } from '@/i18n';
import { useTransactions } from '@/state/marketplace-store';
import { useStyles } from '@/theme';
import { formatDateTime } from '@/utils/format';

/** Receipt — one action: Done (or Back, when opened from the ledger). */
export default function ReceiptScreen() {
  const t = useT();
  const headerOptions = useMarketplaceHeader();
  const styles = useStyles(createStyles);
  const { txId, from } = useLocalSearchParams<{ txId: string; from?: string }>();
  const tx = useTransactions().find((x) => x.id === txId);
  const afterPayment = from === 'payment';

  // After paying, return to the Payments tab (navigate unwinds the stack back to the tabs),
  // where the new transaction and its sync status are listed.
  const done = () => (afterPayment ? router.navigate('/payments') : router.back());

  // Straight after paying, "back" must not reopen the payment screens.
  useEffect(() => {
    if (!afterPayment) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      router.navigate('/payments');
      return true;
    });
    return () => sub.remove();
  }, [afterPayment]);

  return (
    <Screen variant="stack">
      <Stack.Screen
        options={{
          ...headerOptions,
          title: t('payments.receipt.headerTitle'),
          headerBackVisible: !afterPayment,
          gestureEnabled: !afterPayment,
        }}
      />
      <PrototypeNotice kind="noRealMoney" />

      {!tx ? (
        <Notice title={t('payments.receipt.notFoundTitle')} icon="warning" tone="gray">
          {t('payments.receipt.notFoundBody')}
        </Notice>
      ) : (
        <>
          <View style={styles.success}>
            <View style={styles.check}>
              <Icon name="check" size={32} color="ink" />
            </View>
            <AppText variant="h2" accessibilityRole="header" style={styles.center}>
              {t('payments.receipt.title')}
            </AppText>
            <AppText variant="bodyLarge" color="textSecondary" style={styles.center}>
              {t('payments.receipt.subtitle')}
            </AppText>
          </View>

          <SyncBanner />

          <Card style={styles.cardBody}>
            <Field label={t('payments.receipt.receiptNumber')} value={tx.receiptNumber} />
            <Field label={t('payments.receipt.date')} value={formatDateTime(tx.createdAt)} />
            <Field label={t('payments.receipt.dealer')} value={tx.dealerName} />
            <Field
              label={t('payments.receipt.item')}
              value={t('payments.receipt.itemValue', { product: tx.productName, unit: tx.productUnit })}
            />
            <Field label={t('payments.receipt.method')} value={t(`payments.methods.${tx.method}`)} />
            <View style={styles.field}>
              <AppText variant="caption" color="textSecondary">
                {t('payments.receipt.status')}
              </AppText>
              <SyncStatusBadge status={tx.syncStatus} />
            </View>
          </Card>

          <PriceBreakdownCard breakdown={tx.breakdown} />
        </>
      )}

      <Button
        label={afterPayment ? t('payments.receipt.done') : t('payments.receipt.back')}
        variant="accent"
        leadingIcon={afterPayment ? 'check' : undefined}
        trailingIcon={afterPayment ? undefined : 'arrowRight'}
        fullWidth
        onPress={done}
      />
    </Screen>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.field}>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="body">{value}</AppText>
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    success: {
      alignItems: 'center',
      gap: Space.sm,
    },
    check: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.mint,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Space.sm,
    },
    center: {
      textAlign: 'center',
    },
    cardBody: {
      gap: Space.md,
    },
    field: {
      gap: Space.xs,
    },
  });
