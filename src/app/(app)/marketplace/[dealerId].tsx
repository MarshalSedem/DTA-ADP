import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MIN_TAP } from '@/components/marketplace/constants';
import { useMarketplaceHeader } from '@/components/marketplace/header-options';
import { InfoRow } from '@/components/marketplace/info-row';
import { OfflineBanner } from '@/components/marketplace/offline-banner';
import { PriceBreakdownCard } from '@/components/marketplace/price-breakdown';
import { PrototypeNotice } from '@/components/marketplace/prototype-notice';
import { VerifiedBadge } from '@/components/marketplace/verified-badge';
import { Notice } from '@/components/notice';
import { Screen } from '@/components/screen';
import { SectionTitle } from '@/components/screen-intro';
import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, PressableCard } from '@/components/ui/card';
import { Space, type Palette } from '@/constants/theme';
import { useT } from '@/i18n';
import { buildPriceBreakdown, getDealer, isDiseaseId } from '@/services/marketplace-api';
import { useStyles } from '@/theme';
import type { DealerProduct, DiseaseId } from '@/types/marketplace';
import { formatDate, formatMoney } from '@/utils/format';

export default function DealerDetailScreen() {
  const t = useT();
  const headerOptions = useMarketplaceHeader();
  const styles = useStyles(createStyles);
  const params = useLocalSearchParams<{ dealerId: string; disease?: string }>();
  const dealer = getDealer(params.dealerId);
  const disease = isDiseaseId(params.disease) ? params.disease : undefined;

  // Coming from a diagnosis: pre-select the first in-stock product that matches it.
  const [selectedId, setSelectedId] = useState<string | null>(
    () =>
      (disease && dealer?.products.find((p) => p.inStock && p.forDiseases.includes(disease))?.id) ||
      null,
  );

  const header = <Stack.Screen options={{ ...headerOptions, title: t('marketplace.detail.headerTitle') }} />;

  if (!dealer) {
    return (
      <Screen variant="stack">
        {header}
        <PrototypeNotice kind="sampleData" />
        <Notice title={t('marketplace.detail.notFoundTitle')} icon="warning" tone="gray">
          {t('marketplace.detail.notFoundBody')}
        </Notice>
      </Screen>
    );
  }

  const verified = dealer.verification.status === 'verified';
  const matches = (p: DealerProduct) => !!disease && p.forDiseases.includes(disease);
  // Products for the diagnosed problem first.
  const products = [...dealer.products].sort((a, b) => Number(matches(b)) - Number(matches(a)));
  const selected = dealer.products.find((p) => p.id === selectedId);

  return (
    <Screen variant="stack">
      {header}
      <PrototypeNotice kind="sampleData" />
      <OfflineBanner />

      {/* Dealer */}
      <View style={styles.intro}>
        {verified ? (
          <VerifiedBadge />
        ) : (
          <Badge label={t('marketplace.detail.notVerifiedBadge')} tone="gray" icon="clock" />
        )}
        <AppText variant="h2" accessibilityRole="header">
          {dealer.name}
        </AppText>
        <InfoRow
          icon="market"
          text={t('marketplace.list.location', {
            town: dealer.town,
            district: dealer.district,
            km: dealer.distanceKm,
          })}
        />
      </View>

      {!verified && (
        <Notice title={t('marketplace.detail.notVerifiedTitle')} icon="warning" tone="pink">
          {t('marketplace.detail.notVerifiedBody')}
        </Notice>
      )}

      {/* Verification — what the badge is based on */}
      {verified && (
        <View style={styles.section}>
          <SectionTitle>{t('marketplace.detail.verificationTitle')}</SectionTitle>
          <Card style={styles.cardBody}>
            <Field label={t('marketplace.detail.verifiedBy')} value={dealer.verification.verifiedBy} />
            {dealer.verification.verifiedOn && (
              <Field
                label={t('marketplace.detail.verifiedOn')}
                value={formatDate(dealer.verification.verifiedOn)}
              />
            )}
            <Field label={t('marketplace.detail.reference')} value={dealer.verification.reference} />
          </Card>
        </View>
      )}

      {/* Delivery */}
      <View style={styles.section}>
        <SectionTitle>{t('marketplace.detail.deliveryTitle')}</SectionTitle>
        <Card style={styles.cardBody}>
          <Field
            label={t('marketplace.detail.deliveryFee')}
            value={formatMoney('GHS', dealer.deliveryFee)}
          />
          <Field
            label={t('marketplace.detail.deliveryTime')}
            value={t('marketplace.detail.deliveryDays', { count: dealer.deliveryDays })}
          />
        </Card>
      </View>

      {/* Products — select one to see its price breakdown */}
      <View style={styles.section}>
        <SectionTitle>{t('marketplace.detail.productsTitle')}</SectionTitle>
        {verified && (
          <AppText variant="body" color="textSecondary">
            {t('marketplace.detail.productsHint')}
          </AppText>
        )}
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            disease={disease}
            selected={product.id === selectedId}
            selectable={verified && product.inStock}
            onSelect={() => setSelectedId(product.id)}
          />
        ))}
      </View>

      {verified && selected && (
        <>
          <PriceBreakdownCard breakdown={buildPriceBreakdown(dealer, selected)} />
          <Button
            label={t('marketplace.detail.continue')}
            variant="accent"
            trailingIcon="arrowRight"
            fullWidth
            onPress={() =>
              router.push({
                pathname: '/payments/review',
                params: { dealerId: dealer.id, productId: selected.id },
              })
            }
          />
        </>
      )}
    </Screen>
  );
}

function ProductCard({
  product,
  disease,
  selected,
  selectable,
  onSelect,
}: {
  product: DealerProduct;
  disease?: DiseaseId;
  selected: boolean;
  selectable: boolean;
  onSelect: () => void;
}) {
  const t = useT();
  const styles = useStyles(createStyles);
  const price = t('marketplace.detail.unitPrice', {
    price: formatMoney('GHS', product.unitPrice),
    unit: product.unit,
  });
  const stock = product.inStock ? t('marketplace.detail.inStock') : t('marketplace.detail.outOfStock');
  const matchesDiagnosis = !!disease && product.forDiseases.includes(disease);

  return (
    <PressableCard
      accessibilityRole="radio"
      accessibilityLabel={`${product.name}, ${price}, ${stock}`}
      accessibilityState={{ selected, disabled: !selectable }}
      disabled={!selectable}
      onPress={onSelect}
      style={[styles.productCard, selected && styles.productSelected, !selectable && styles.productDisabled]}>
      <View style={styles.titleRow}>
        <AppText variant="cardHeading" style={styles.flex}>
          {product.name}
        </AppText>
        {selected && <Badge label={t('marketplace.detail.selected')} tone="blue" icon="check" />}
      </View>
      <AppText variant="button">{price}</AppText>

      <View style={styles.badges}>
        {matchesDiagnosis && (
          <Badge label={t('marketplace.detail.matchesDiagnosis')} tone="mint" icon="sparkles" />
        )}
        {product.forDiseases.map((d) => (
          <Badge
            key={d}
            label={t('marketplace.detail.forDisease', { disease: t(`diseases.${d}`) })}
            tone="gray"
            icon="leaf"
          />
        ))}
        <Badge label={t(`marketplace.detail.categories.${product.category}`)} tone="gray" icon="market" />
        <Badge
          label={stock}
          tone={product.inStock ? 'mint' : 'gray'}
          icon={product.inStock ? 'check' : 'close'}
        />
      </View>
    </PressableCard>
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
    flex: {
      flex: 1,
    },
    intro: {
      gap: Space.sm,
    },
    section: {
      gap: Space.md,
    },
    cardBody: {
      gap: Space.md,
    },
    field: {
      gap: 2,
    },
    productCard: {
      gap: Space.sm,
      minHeight: MIN_TAP,
    },
    productSelected: {
      borderWidth: 2,
      borderColor: c.primaryStrong,
    },
    productDisabled: {
      opacity: 0.6,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Space.md,
    },
    badges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Space.sm,
    },
  });
