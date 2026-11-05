import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChoiceChips } from '@/components/marketplace/choice-chips';
import { useMarketplaceHeader } from '@/components/marketplace/header-options';
import { OfflineBanner } from '@/components/marketplace/offline-banner';
import { PrototypeNotice } from '@/components/marketplace/prototype-notice';
import { Notice } from '@/components/notice';
import { Screen } from '@/components/screen';
import { ScreenIntro } from '@/components/screen-intro';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { Space } from '@/constants/theme';
import { useT } from '@/i18n';
import { buildPriceBreakdown, getPurchasableItem } from '@/services/marketplace-api';
import { recordSimulatedPayment } from '@/state/marketplace-store';
import type { SimulatedPaymentMethod } from '@/types/marketplace';
import { formatMoney } from '@/utils/format';

const METHODS: readonly SimulatedPaymentMethod[] = ['mobileMoney', 'cashOnDelivery'];

/** Payment step 2 of 2 — one action: Confirm simulated payment. */
export default function PaymentConfirmScreen() {
  const t = useT();
  const headerOptions = useMarketplaceHeader();
  const toast = useToast();
  const params = useLocalSearchParams<{ dealerId: string; productId: string; quantity: string }>();
  const item = getPurchasableItem(params.dealerId, params.productId);
  const quantity = Math.min(10, Math.max(1, Number(params.quantity) || 1));

  const [method, setMethod] = useState<SimulatedPaymentMethod>('mobileMoney');
  const [processing, setProcessing] = useState(false);

  const confirm = async () => {
    if (!item) return;
    setProcessing(true);
    try {
      const tx = await recordSimulatedPayment({ ...item, quantity, method });
      // Replace this screen so going back can't repeat the payment.
      router.replace({ pathname: '/payments/receipt/[txId]', params: { txId: tx.id, from: 'payment' } });
    } catch {
      toast(t('payments.confirm.failed'), 'error');
      setProcessing(false);
    }
  };

  const breakdown = item ? buildPriceBreakdown(item.dealer, item.product, quantity) : undefined;

  return (
    <Screen variant="stack">
      <Stack.Screen options={{ ...headerOptions, title: t('payments.confirm.headerTitle') }} />
      <PrototypeNotice kind="noRealMoney" />
      <OfflineBanner />

      {!item || !breakdown ? (
        <Notice title={t('payments.review.unavailableTitle')} icon="warning" tone="gray">
          {t('payments.review.unavailableBody')}
        </Notice>
      ) : (
        <>
          <ScreenIntro eyebrow={t('payments.confirm.eyebrow')} title={t('payments.confirm.title')} />

          <Card tone="dark" style={styles.total}>
            <AppText variant="label" color="textInverseSecondary">
              {t('payments.confirm.youPay')}
            </AppText>
            <AppText variant="display" color="textInverse">
              {formatMoney(breakdown.currency, breakdown.total)}
            </AppText>
            <AppText variant="body" color="textInverseSecondary">
              {t('payments.confirm.toDealer', { dealer: item.dealer.name })}
            </AppText>
            <View style={styles.itemLine}>
              <AppText variant="body" color="textInverse">
                {t('payments.confirm.itemLine', { product: item.product.name, count: quantity })}
              </AppText>
            </View>
          </Card>

          <ChoiceChips
            label={t('payments.confirm.methodLabel')}
            options={METHODS.map((m) => ({ value: m, label: t(`payments.methods.${m}`) }))}
            value={method}
            onChange={setMethod}
          />

          <Button
            label={t('payments.confirm.confirm')}
            variant="accent"
            leadingIcon="lock"
            fullWidth
            loading={processing}
            onPress={confirm}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  total: {
    gap: Space.xs,
    padding: Space.xl,
  },
  itemLine: {
    marginTop: Space.sm,
  },
});
