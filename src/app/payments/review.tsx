import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useMarketplaceHeader } from '@/components/marketplace/header-options';
import { OfflineBanner } from '@/components/marketplace/offline-banner';
import { PriceBreakdownCard } from '@/components/marketplace/price-breakdown';
import { PrototypeNotice } from '@/components/marketplace/prototype-notice';
import { QuantityStepper } from '@/components/marketplace/quantity-stepper';
import { VerifiedBadge } from '@/components/marketplace/verified-badge';
import { Notice } from '@/components/notice';
import { Screen } from '@/components/screen';
import { ScreenIntro } from '@/components/screen-intro';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Space } from '@/constants/theme';
import { useT } from '@/i18n';
import { buildPriceBreakdown, getPurchasableItem } from '@/services/marketplace-api';
import { formatMoney } from '@/utils/format';

/** Payment step 1 of 2 — one action: Continue. */
export default function PaymentReviewScreen() {
  const t = useT();
  const headerOptions = useMarketplaceHeader();
  const { dealerId, productId } = useLocalSearchParams<{ dealerId: string; productId: string }>();
  const item = getPurchasableItem(dealerId, productId);
  const [quantity, setQuantity] = useState(1);

  return (
    <Screen variant="stack">
      <Stack.Screen options={{ ...headerOptions, title: t('payments.review.headerTitle') }} />
      <PrototypeNotice kind="noRealMoney" />
      <OfflineBanner />

      {!item ? (
        <Notice title={t('payments.review.unavailableTitle')} icon="warning" tone="gray">
          {t('payments.review.unavailableBody')}
        </Notice>
      ) : (
        <>
          <ScreenIntro eyebrow={t('payments.review.eyebrow')} title={t('payments.review.title')} />

          <Card style={styles.cardBody}>
            <AppText variant="cardHeading">{item.product.name}</AppText>
            <AppText variant="button">
              {t('marketplace.detail.unitPrice', {
                price: formatMoney('GHS', item.product.unitPrice),
                unit: item.product.unit,
              })}
            </AppText>
            <View style={styles.dealerRow}>
              <AppText variant="body" color="textSecondary" style={styles.flex}>
                {t('payments.review.fromDealer', { dealer: item.dealer.name })}
              </AppText>
              <VerifiedBadge />
            </View>
            <QuantityStepper value={quantity} onChange={setQuantity} />
          </Card>

          <PriceBreakdownCard breakdown={buildPriceBreakdown(item.dealer, item.product, quantity)} />

          <Button
            label={t('payments.review.continue')}
            variant="accent"
            trailingIcon="arrowRight"
            fullWidth
            onPress={() =>
              router.push({
                pathname: '/payments/confirm',
                params: { dealerId: item.dealer.id, productId: item.product.id, quantity: String(quantity) },
              })
            }
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  cardBody: {
    gap: Space.md,
  },
  dealerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
});
