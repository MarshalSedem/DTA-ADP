import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Space, type Palette } from '@/constants/theme';
import { useT } from '@/i18n';
import { useStyles } from '@/theme';
import type { PriceBreakdown } from '@/types/marketplace';
import { formatMoney } from '@/utils/format';

/**
 * Transparent price: every amount that makes up the total, line by line.
 * Reused on the dealer detail, payment review and receipt screens.
 */
export function PriceBreakdownCard({ breakdown }: { breakdown: PriceBreakdown }) {
  const t = useT();
  const styles = useStyles(createStyles);
  const money = (amount: number) => formatMoney(breakdown.currency, amount);

  return (
    <Card style={styles.card}>
      <View style={styles.titleRow}>
        <Icon name="document" size={20} />
        <AppText variant="cardHeading">{t('marketplace.breakdown.title')}</AppText>
      </View>

      <Line
        label={t('marketplace.breakdown.item', {
          price: money(breakdown.unitPrice),
          count: breakdown.quantity,
        })}
        amount={money(breakdown.itemsTotal)}
      />
      <Line label={t('marketplace.breakdown.delivery')} amount={money(breakdown.deliveryFee)} />
      <View style={styles.divider} />
      <Line label={t('marketplace.breakdown.total')} amount={money(breakdown.total)} emphasis />

      <AppText variant="caption" color="textSecondary">
        {t('marketplace.breakdown.note')}
      </AppText>
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
    card: {
      gap: Space.md,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Space.sm,
    },
    line: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Space.md,
    },
    flex: {
      flex: 1,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
    },
  });
