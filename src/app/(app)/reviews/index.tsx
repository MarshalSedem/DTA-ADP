import { router } from 'expo-router';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { Notice } from '@/components/notice';
import { REVIEW_STATUS, ReviewStatusBadge } from '@/components/review-status-badge';
import { Screen } from '@/components/screen';
import { ScreenIntro } from '@/components/screen-intro';
import { AppText } from '@/components/ui/app-text';
import { PressableCard } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Space } from '@/constants/theme';
import { useFarmer } from '@/state/farmer-store';
import { useTheme } from '@/theme';
import { formatDate } from '@/utils/format';

export default function ReviewsScreen() {
  const { reviewCases, refresh, refreshing } = useFarmer();
  const { colors } = useTheme();

  // Cases that need the farmer's input first, then newest first.
  const cases = [...reviewCases].sort((a, b) => {
    const urgent =
      Number(b.status === 'needsMoreEvidence') - Number(a.status === 'needsMoreEvidence');
    return urgent || b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <Screen
      variant="stack"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void refresh().catch(() => {})}
          tintColor={colors.primaryStrong}
          colors={[colors.primaryStrong]}
        />
      }>
      <ScreenIntro
        eyebrow="Human-in-the-loop review"
        title="Your review cases"
        description="An extension officer checks the AI results you choose to share. Their advice appears here."
      />

      {cases.length === 0 ? (
        <Notice title="No review cases yet" icon="people" tone="blue">
          After an AI diagnosis or answer, tap “Ask an extension officer” to start one.
        </Notice>
      ) : (
        <View style={styles.list}>
          {cases.map((c) => (
            <PressableCard
              key={c.id}
              style={styles.caseCard}
              accessibilityLabel={`${c.id}, ${c.summary}, ${REVIEW_STATUS[c.status].label}`}
              onPress={() => router.push({ pathname: '/reviews/[id]', params: { id: c.id } })}>
              <View style={styles.caseTop}>
                <AppText variant="label" color="textSecondary" style={styles.flex}>
                  {c.id}
                </AppText>
                <ReviewStatusBadge status={c.status} />
              </View>
              <View style={styles.caseBottom}>
                <View style={styles.flex}>
                  <AppText variant="cardHeading">{c.summary}</AppText>
                  <AppText variant="caption" color="textSecondary">
                    Requested {formatDate(c.createdAt)}
                  </AppText>
                </View>
                <Icon name="chevronRight" size={18} />
              </View>
            </PressableCard>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  list: {
    gap: Space.md,
  },
  caseCard: {
    gap: Space.md,
  },
  caseTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  caseBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
});
