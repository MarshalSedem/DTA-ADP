import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MIN_TAP } from '@/components/marketplace/constants';
import { useMarketplaceHeader } from '@/components/marketplace/header-options';
import { InfoRow } from '@/components/marketplace/info-row';
import { OfflineBanner } from '@/components/marketplace/offline-banner';
import { PrototypeNotice } from '@/components/marketplace/prototype-notice';
import { VerifiedBadge } from '@/components/marketplace/verified-badge';
import { Notice } from '@/components/notice';
import { Screen } from '@/components/screen';
import { ScreenIntro } from '@/components/screen-intro';
import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PressableCard } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Space } from '@/constants/theme';
import { useT } from '@/i18n';
import { isDiseaseId, listVerifiedDealers, productsForDisease } from '@/services/marketplace-api';
import { formatMoney } from '@/utils/format';

export default function DealerListScreen() {
  const t = useT();
  const headerOptions = useMarketplaceHeader();
  const params = useLocalSearchParams<{ disease?: string }>();
  const disease = isDiseaseId(params.disease) ? params.disease : undefined;
  const diseaseName = disease ? t(`diseases.${disease}`) : undefined;
  const dealers = listVerifiedDealers({ disease });

  return (
    <Screen variant="stack">
      <Stack.Screen options={{ ...headerOptions, title: t('marketplace.list.headerTitle') }} />

      <PrototypeNotice kind="sampleData" />
      <OfflineBanner />

      <ScreenIntro
        eyebrow={t('marketplace.list.eyebrow')}
        title={t('marketplace.list.title')}
        description={t('marketplace.list.description')}
      />

      {disease && diseaseName && (
        <Notice title={t('marketplace.list.filterTitle', { disease: diseaseName })} icon="leaf" tone="mint">
          <View style={styles.filterBody}>
            <AppText variant="body">
              {t('marketplace.list.filterBody', { disease: diseaseName })}
            </AppText>
            <AppText variant="body">{t('marketplace.list.filterCaution')}</AppText>
            <Button
              label={t('marketplace.list.showAll')}
              variant="primary"
              leadingIcon="close"
              onPress={() => router.setParams({ disease: undefined })}
            />
          </View>
        </Notice>
      )}

      {dealers.length === 0 ? (
        <Notice title={t('marketplace.list.emptyTitle')} icon="info" tone="gray">
          {t('marketplace.list.emptyBody')}
        </Notice>
      ) : (
        <View style={styles.list}>
          {dealers.map((dealer) => {
            const matching = disease ? productsForDisease(dealer, disease).length : 0;
            return (
              <PressableCard
                key={dealer.id}
                style={styles.dealerCard}
                accessibilityLabel={t('marketplace.list.openDealer', { name: dealer.name })}
                onPress={() =>
                  router.push({
                    pathname: '/marketplace/[dealerId]',
                    params: disease ? { dealerId: dealer.id, disease } : { dealerId: dealer.id },
                  })
                }>
                <View style={styles.titleRow}>
                  <AppText variant="cardHeading" style={styles.flex}>
                    {dealer.name}
                  </AppText>
                  <VerifiedBadge />
                  <Icon name="chevronRight" size={18} />
                </View>

                <InfoRow
                  icon="market"
                  text={t('marketplace.list.location', {
                    town: dealer.town,
                    district: dealer.district,
                    km: dealer.distanceKm,
                  })}
                />
                <InfoRow
                  icon="clock"
                  text={t('marketplace.list.delivery', {
                    fee: formatMoney('GHS', dealer.deliveryFee),
                    count: dealer.deliveryDays,
                  })}
                />

                {disease && diseaseName ? (
                  <Badge
                    label={t('marketplace.list.matchingCount', { count: matching, disease: diseaseName })}
                    tone="mint"
                    icon="leaf"
                  />
                ) : (
                  <Badge
                    label={t('marketplace.list.productCount', { count: dealer.products.length })}
                    tone="gray"
                    icon="leaf"
                  />
                )}
              </PressableCard>
            );
          })}
        </View>
      )}

      <PressableCard
        tone="mint"
        style={styles.buyersEntry}
        accessibilityLabel={`${t('marketplace.list.buyersEntryTitle')} ${t('marketplace.list.buyersEntryBody')}`}
        onPress={() => router.push('/marketplace/buyers')}>
        <Icon name="market" size={24} />
        <View style={styles.flex}>
          <AppText variant="cardHeading">{t('marketplace.list.buyersEntryTitle')}</AppText>
          <AppText variant="body">{t('marketplace.list.buyersEntryBody')}</AppText>
        </View>
        <Icon name="chevronRight" size={18} />
      </PressableCard>

      <PressableCard
        tone="gray"
        style={styles.buyersEntry}
        accessibilityLabel={`${t('marketplace.list.ledgerEntryTitle')}. ${t('marketplace.list.ledgerEntryBody')}`}
        onPress={() => router.push('/payments/ledger')}>
        <Icon name="document" size={24} />
        <View style={styles.flex}>
          <AppText variant="cardHeading">{t('marketplace.list.ledgerEntryTitle')}</AppText>
          <AppText variant="body">{t('marketplace.list.ledgerEntryBody')}</AppText>
        </View>
        <Icon name="chevronRight" size={18} />
      </PressableCard>

      <View style={styles.footnote}>
        <Icon name="privacy" size={16} color="textSecondary" />
        <AppText variant="caption" color="textSecondary" style={styles.flex}>
          {t('marketplace.list.verifiedOnlyNote')}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  filterBody: {
    gap: Space.md,
    alignItems: 'flex-start',
  },
  list: {
    gap: Space.md,
  },
  dealerCard: {
    gap: Space.sm,
    minHeight: MIN_TAP,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  buyersEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    minHeight: MIN_TAP,
  },
  footnote: {
    flexDirection: 'row',
    gap: Space.sm,
    alignItems: 'flex-start',
  },
});
