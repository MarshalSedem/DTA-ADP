import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { Notice } from '@/components/notice';
import { PhotoPicker } from '@/components/photo-picker';
import { ReviewStatusBadge } from '@/components/review-status-badge';
import { Screen } from '@/components/screen';
import { SectionTitle } from '@/components/screen-intro';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { useToast } from '@/components/ui/toast';
import { Space } from '@/constants/theme';
import { errorMessage } from '@/services/api-client';
import { useFarmer } from '@/state/farmer-store';
import { useTheme } from '@/theme';
import { formatDate, formatDateTime } from '@/utils/format';

export default function ReviewCaseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reviewCases, diagnoses, submitEvidence, refresh, refreshing } = useFarmer();
  const toast = useToast();
  const { colors } = useTheme();

  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const reviewCase = reviewCases.find((c) => c.id === id);
  if (!reviewCase) {
    return (
      <Screen variant="stack">
        <Notice title="Case not found" icon="warning" tone="gray">
          This review case may have been closed or removed.
        </Notice>
      </Screen>
    );
  }

  const { source } = reviewCase;
  const diagnosis =
    source.type === 'diagnosis' ? diagnoses.find((d) => d.id === source.diagnosisId) : undefined;
  const canSendEvidence = note.trim().length > 0 || !!photo;

  const sendEvidence = async () => {
    setSending(true);
    try {
      await submitEvidence(reviewCase.id, { note: note.trim(), imageUri: photo });
      toast('Evidence sent to the extension officer');
      setNote('');
      setPhoto(null);
    } catch (error) {
      toast(errorMessage(error, 'Could not send the evidence. Please try again.'), 'error');
    } finally {
      setSending(false);
    }
  };

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
      <Stack.Screen options={{ title: reviewCase.id }} />

      <View style={styles.header}>
        <ReviewStatusBadge status={reviewCase.status} />
        <AppText variant="h2" accessibilityRole="header">
          {reviewCase.summary}
        </AppText>
        <AppText variant="body" color="textSecondary">
          Requested {formatDate(reviewCase.createdAt)}
        </AppText>
      </View>

      {reviewCase.status === 'pending' && (
        <Notice title="Waiting for an extension officer" icon="clock" tone="blue">
          An officer will review your case. Their advice will appear here.
        </Notice>
      )}

      {reviewCase.status === 'confirmed' && reviewCase.officerAdvice && (
        <Card tone="dark" style={styles.advice}>
          <View style={styles.adviceHeader}>
            <Icon name="people" size={20} color="textInverse" />
            <AppText variant="label" color="textInverse">
              Human-reviewed advice
            </AppText>
          </View>
          <AppText variant="bodyLarge" color="textInverse">
            {reviewCase.officerAdvice}
          </AppText>
          <AppText variant="caption" color="textInverseSecondary">
            From your extension officer
          </AppText>
        </Card>
      )}

      {reviewCase.status === 'withdrawn' && (
        <Notice title="This case was withdrawn" icon="close" tone="gray">
          The case closed before an officer finished reviewing it.
        </Notice>
      )}

      {reviewCase.status === 'rejected' && (
        <Notice title="The officer did not agree with the AI result" icon="close" tone="gray">
          {reviewCase.officerAdvice ??
            'Follow the extension officer’s guidance instead of the AI result.'}
        </Notice>
      )}

      {reviewCase.status === 'needsMoreEvidence' && (
        <View style={styles.section}>
          <Notice title="The officer needs more information" icon="warning" tone="pink">
            {reviewCase.officerRequest ?? 'Please add a clearer photo or more details.'}
          </Notice>
          <SectionTitle>Send more evidence</SectionTitle>
          <PhotoPicker uri={photo} onChange={setPhoto} />
          <TextField
            label="Details"
            placeholder="Example: close-up of the whorl, taken this morning"
            value={note}
            onChangeText={setNote}
            multiline
          />
          <Button
            label="Send evidence"
            variant="accent"
            leadingIcon="send"
            fullWidth
            disabled={!canSendEvidence}
            loading={sending}
            onPress={sendEvidence}
          />
        </View>
      )}

      {reviewCase.evidence.length > 0 && (
        <View style={styles.section}>
          <SectionTitle>Evidence you sent</SectionTitle>
          {reviewCase.evidence.map((e) => (
            <Card key={e.id} style={styles.evidence}>
              <AppText variant="caption" color="textSecondary">
                {formatDateTime(e.createdAt)}
                {e.imageUri ? ' · photo attached' : ''}
              </AppText>
              {!!e.note && <AppText variant="body">{e.note}</AppText>}
            </Card>
          ))}
        </View>
      )}

      {diagnosis && (
        <Button
          label="View the AI diagnosis"
          variant="secondary"
          leadingIcon="leaf"
          fullWidth
          onPress={() => router.push({ pathname: '/diagnosis/[id]', params: { id: diagnosis.id } })}
        />
      )}
      {source.type === 'advice' && (
        <Button
          label="View the AI adviser conversation"
          variant="secondary"
          leadingIcon="adviser"
          fullWidth
          onPress={() => router.push('/adviser')}
        />
      )}

      <View style={styles.footnote}>
        <Icon name="lock" size={16} color="textSecondary" />
        <AppText variant="caption" color="textSecondary" style={styles.flex}>
          The officer can see only the data you shared for this case. Their access ends when the
          case is closed.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    gap: Space.sm,
  },
  section: {
    gap: Space.md,
  },
  advice: {
    gap: Space.md,
    padding: Space.xl,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  evidence: {
    gap: Space.xs,
  },
  footnote: {
    flexDirection: 'row',
    gap: Space.sm,
    alignItems: 'flex-start',
  },
});
