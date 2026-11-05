import { StyleSheet, View } from 'react-native';

import { Notice } from '@/components/notice';
import { Screen } from '@/components/screen';
import { ScreenIntro, SectionTitle } from '@/components/screen-intro';
import { AppText } from '@/components/ui/app-text';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Space, type Palette } from '@/constants/theme';
import { useFarmer } from '@/state/farmer-store';
import { useStyles } from '@/theme';
import type { DemandLevel } from '@/types/farmer';
import { formatDateTime, formatMoney } from '@/utils/format';

const DEMAND_TONE: Record<DemandLevel, BadgeTone> = { High: 'mint', Medium: 'blue', Low: 'gray' };

export default function MarketScreen() {
  const { marketComparison: market } = useFarmer();
  const styles = useStyles(createStyles);

  if (!market) {
    return (
      <Screen variant="stack">
        <Notice title="No market prices yet" icon="market" tone="gray">
          Market prices for your crops will appear here.
        </Notice>
      </Screen>
    );
  }

  return (
    <Screen variant="stack">
      <ScreenIntro
        eyebrow="Transparent market recommendation"
        title={`Current ${market.crop.toLowerCase()} market comparison`}
        description={`Prices per 100 kg · updated ${formatDateTime(market.updatedAt)}`}
      />

      <Card tone="dark" style={styles.suggestion}>
        <Badge label="AI suggestion" tone="blue" icon="sparkles" />
        <AppText variant="h3" color="textInverse">
          {market.recommendedMarket}
        </AppText>
        <AppText variant="body" color="textInverseSecondary">
          {market.reason}
        </AppText>
      </Card>

      <View style={styles.section}>
        <SectionTitle>All markets</SectionTitle>
        {market.prices.map((p) => {
          const net = p.pricePer100kg - p.transportCost;
          const suggested = p.market === market.recommendedMarket;
          return (
            <Card key={p.market} style={styles.marketCard}>
              <View style={styles.marketHeader}>
                <AppText variant="cardHeading" style={styles.flex}>
                  {p.market}
                </AppText>
                {suggested && <Badge label="Suggested" tone="mint" icon="check" />}
              </View>

              <View style={styles.stats}>
                <Stat
                  label="Price / 100 kg"
                  value={formatMoney(market.currency, p.pricePer100kg)}
                />
                <Stat
                  label="Est. transport"
                  value={formatMoney(market.currency, p.transportCost)}
                />
              </View>
              <View style={styles.stats}>
                <Stat
                  label="Est. after transport"
                  value={formatMoney(market.currency, net)}
                  emphasis
                />
                <View style={styles.stat}>
                  <AppText variant="caption" color="textSecondary">
                    Verified demand
                  </AppText>
                  <Badge label={p.verifiedDemand} tone={DEMAND_TONE[p.verifiedDemand]} />
                </View>
              </View>
            </Card>
          );
        })}
      </View>

      <View style={styles.footnote}>
        <Icon name="info" size={16} color="textSecondary" />
        <AppText variant="caption" color="textSecondary" style={styles.flex}>
          “Est. after transport” is the price minus the estimated transport cost.{' '}
          {market.disclaimer}
        </AppText>
      </View>
    </Screen>
  );
}

function Stat({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.stat}>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <AppText variant={emphasis ? 'cardHeading' : 'bodyLarge'}>{value}</AppText>
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    suggestion: {
      gap: Space.md,
      padding: Space.xl,
    },
    section: {
      gap: Space.md,
    },
    marketCard: {
      gap: Space.base,
    },
    marketHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Space.md,
    },
    stats: {
      flexDirection: 'row',
      gap: Space.base,
      paddingTop: Space.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    stat: {
      flex: 1,
      gap: Space.xs,
    },
    footnote: {
      flexDirection: 'row',
      gap: Space.sm,
      alignItems: 'flex-start',
    },
  });
