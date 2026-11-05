import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Radius, Space, type Palette } from '@/constants/theme';
import { useStyles } from '@/theme';
import type { ConfidenceBand } from '@/types/farmer';

type ConfidenceMeterProps = {
  confidence: number;
  band: ConfidenceBand;
};

/** "72% confidence · Moderate" with a bar. The band is always written out in text. */
export function ConfidenceMeter({ confidence, band }: ConfidenceMeterProps) {
  const pct = Math.max(0, Math.min(100, confidence));
  const styles = useStyles(createStyles);
  return (
    <View
      style={styles.wrapper}
      accessible
      accessibilityLabel={`AI confidence ${pct} percent, ${band}`}>
      <View style={styles.labels}>
        <AppText variant="label">AI confidence</AppText>
        <AppText variant="button">
          {pct}% · {band}
        </AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    wrapper: {
      gap: Space.sm,
    },
    labels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    track: {
      height: 10,
      borderRadius: Radius.full,
      backgroundColor: c.backgroundSecondary,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: Radius.full,
      backgroundColor: c.primaryStrong,
    },
  });
