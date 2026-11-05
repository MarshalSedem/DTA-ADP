import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChoiceChips } from '@/components/marketplace/choice-chips';
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
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Radius, Space, type Palette } from '@/constants/theme';
import { useT } from '@/i18n';
import { cropsWithBuyers, listRankedBuyerOffers } from '@/services/marketplace-api';
import { useStyles } from '@/theme';
import type { CropType } from '@/types/farmer';
import type { RankedBuyerOffer } from '@/types/marketplace';
import { formatMoney } from '@/utils/format';

export default function BuyerMatchingScreen() {
  const t = useT();
  const headerOptions = useMarketplaceHeader();
  const styles = useStyles(createStyles);
  const crops = cropsWithBuyers();
  const [crop, setCrop] = useState<CropType>(crops[0] ?? 'Maize');
  const offers = listRankedBuyerOffers(crop);

  // Flag the highest headline offer when it isn't the best deal — the point of ranking by net.
  const topHeadline = Math.max(...offers.map((o) => o.offerPer100kg));
  const highestHeadlineId = offers.find((o) => o.offerPer100kg === topHeadline && o.rank !== 1)?.id;

  return (
    <Screen variant="stack">
      <Stack.Screen options={{ ...headerOptions, title: t('marketplace.buyers.headerTitle') }} />
      <PrototypeNotice kind="sampleData" />
      <OfflineBanner />

      <ScreenIntro
        eyebrow={t('marketplace.buyers.eyebrow')}
        title={t('marketplace.buyers.title', { crop: t(`crops.${crop}`) })}
        description={t('marketplace.buyers.description')}
      />

      {crops.length > 1 && (
        <ChoiceChips
          label={t('marketplace.buyers.cropLabel')}
          options={crops.map((c) => ({ value: c, label: t(`crops.${c}`) }))}
          value={crop}
          onChange={setCrop}
        />
      )}

      <Notice title={t('marketplace.buyers.howTitle')} icon="info" tone="blue">
        {t('marketplace.buyers.howBody')}
      </Notice>

      {offers.length === 0 ? (
        <Notice title={t('marketplace.buyers.emptyTitle')} icon="info" tone="gray">
          {t('marketplace.buyers.emptyBody')}
        </Notice>
      ) : (
        <View style={styles.list}>
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} highestHeadline={offer.id === highestHeadlineId} />
          ))}
        </View>
      )}

      <View style={styles.footnote}>
        <Icon name="info" size={16} color="textSecondary" />
        <AppText variant="caption" color="textSecondary" style={styles.flex}>
          {t('marketplace.buyers.footnote')}
        </AppText>
      </View>

      <Button
        label={t('marketplace.buyers.compareMarkets')}
        variant="secondary"
        leadingIcon="market"
        fullWidth
        onPress={() => router.push('/market')}
      />
    </Screen>
  );
}

function OfferCard({ offer, highestHeadline }: { offer: RankedBuyerOffer; highestHeadline: boolean }) {
  const t = useT();
  const styles = useStyles(createStyles);
  const money = (amount: number) => formatMoney('GHS', amount);
  const best = offer.rank === 1;

  return (
    <Card style={[styles.offerCard, best && styles.bestCard]}>
      <View style={styles.badges}>
        <Badge
          label={t(best ? 'marketplace.buyers.rankBest' : 'marketplace.buyers.rank', {
            rank: offer.rank,
          })}
          tone={best ? 'mint' : 'gray'}
          icon={best ? 'sparkles' : 'market'}
        />
        {highestHeadline && (
          <Badge label={t('marketplace.buyers.highestHeadline')} tone="gray" icon="info" />
        )}
      </View>

      <View style={styles.titleRow}>
        <AppText variant="cardHeading" style={styles.flex}>
          {offer.buyerName}
        </AppText>
        <VerifiedBadge />
      </View>
      <InfoRow
        icon="market"
        text={t('marketplace.buyers.buyerMeta', {
          type: t(`marketplace.buyers.types.${offer.buyerType}`),
          market: offer.market,
          district: offer.district,
        })}
      />

      {/* Transparent breakdown: headline offer − transport = what the farmer keeps */}
      <View style={styles.breakdown}>
        <Line label={t('marketplace.buyers.offer')} amount={money(offer.offerPer100kg)} />
        <Line label={t('marketplace.buyers.transport')} amount={`− ${money(offer.transportPer100kg)}`} />
        <View style={styles.divider} />
        <Line label={t('marketplace.buyers.net')} amount={money(offer.netPer100kg)} emphasis />
      </View>

      <InfoRow icon="leaf" text={t('marketplace.buyers.minBags', { count: offer.minBags })} />
    </Card>
  );
}

function Line({ label, amount, emphasis }: { label: string; amount: string; emphasis?: boolean }) {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.line} accessible accessibilityLabel={`${label}: ${amount}`}>
      <AppText variant={emphasis ? 'cardHeading' : 'body'} style={styles.flex}>
        {label}
      </AppText>
      <AppText variant={emphasis ? 'cardHeading' : 'button'}>{amount}</AppText>
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    list: {
      gap: Space.md,
    },
    offerCard: {
      gap: Space.md,
    },
    bestCard: {
      borderWidth: 2,
      borderColor: c.primaryStrong,
    },
    badges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Space.sm,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Space.md,
    },
    breakdown: {
      gap: Space.sm,
      padding: Space.base,
      borderRadius: Radius.md,
      backgroundColor: c.backgroundSecondary,
    },
    line: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Space.md,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
    },
    footnote: {
      flexDirection: 'row',
      gap: Space.sm,
      alignItems: 'flex-start',
    },
  });
