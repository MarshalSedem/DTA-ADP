import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ConfidenceMeter } from '@/components/confidence-meter';
import { Notice } from '@/components/notice';
import { Screen } from '@/components/screen';
import { SectionTitle } from '@/components/screen-intro';
import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { BulletList } from '@/components/ui/bullet-list';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { useToast } from '@/components/ui/toast';
import { Radius, Space, type Palette } from '@/constants/theme';
import { useReviewRequest } from '@/hooks/use-review-request';
import { useT } from '@/i18n';
import { errorMessage, imageSource } from '@/services/api-client';
import { listVerifiedDealers } from '@/services/marketplace-api';
import { useFarmer } from '@/state/farmer-store';
import { useStyles, useTheme } from '@/theme';
import { formatDate } from '@/utils/format';

export default function DiagnosisResultScreen() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { diagnoses, deleteDiagnosisImage, reportIncorrectResult } = useFarmer();
  const toast = useToast();
  const review = useReviewRequest();
  const { colors } = useTheme();
  const styles = useStyles(createStyles);

  const [sheet, setSheet] = useState<'report' | 'delete' | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const diagnosis = diagnoses.find((d) => d.id === id);
  if (!diagnosis) {
    return (
      <Screen variant="stack">
        <Notice title="Diagnosis not found" icon="warning" tone="gray">
          This diagnosis may have been removed.
        </Notice>
      </Screen>
    );
  }

  const { result } = diagnosis;
  // Link to dealers only when a verified dealer sells a product for this problem.
  const dealerDisease =
    result.diseaseId && listVerifiedDealers({ disease: result.diseaseId }).length > 0
      ? result.diseaseId
      : undefined;

  const sendReport = async () => {
    setBusy(true);
    try {
      await reportIncorrectResult(diagnosis.id, comment.trim());
      toast('Feedback recorded for safety review');
      setSheet(null);
      setComment('');
    } catch (error) {
      toast(errorMessage(error, 'Could not send your report. Please try again.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const deleteImage = async () => {
    setBusy(true);
    try {
      await deleteDiagnosisImage(diagnosis.id);
      toast('Image deletion recorded');
      setSheet(null);
    } catch (error) {
      toast(errorMessage(error, 'Could not delete the image. Please try again.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen variant="stack">
      <View style={styles.header}>
        <Badge label="AI-generated preliminary advice" tone="blue" icon="sparkles" />
        <AppText variant="h2" accessibilityRole="header">
          {result.label}
        </AppText>
        <AppText variant="body" color="textSecondary">
          {diagnosis.cropType} · {diagnosis.district} · {formatDate(diagnosis.createdAt)}
        </AppText>
      </View>

      {diagnosis.imageUri && (
        <Image
          source={imageSource(diagnosis.imageUri)}
          style={styles.image}
          contentFit="cover"
          accessibilityLabel="Your crop photo"
        />
      )}
      {diagnosis.imageDeleted && (
        <Notice title="Photo deleted" icon="trash" tone="gray">
          You deleted the photo for this diagnosis. The result below is kept in your history.
        </Notice>
      )}

      <Card style={styles.cardBody}>
        <ConfidenceMeter confidence={result.confidence} band={result.confidenceBand} />
      </Card>

      <View style={styles.section}>
        <SectionTitle>Why this result?</SectionTitle>
        <Card>
          <BulletList items={result.reasons} />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionTitle>Limitations</SectionTitle>
        <Card>
          <BulletList items={result.limitations} dotColor={colors.textMuted} />
        </Card>
      </View>

      <Notice title="Recommended next steps" icon="leaf" tone="mint">
        {result.nextSteps}
      </Notice>

      <View style={styles.actions}>
        {diagnosis.reviewCaseId ? (
          <Button
            label={`View review case ${diagnosis.reviewCaseId}`}
            variant="accent"
            leadingIcon="people"
            fullWidth
            onPress={() =>
              router.push({ pathname: '/reviews/[id]', params: { id: diagnosis.reviewCaseId! } })
            }
          />
        ) : (
          <Button
            label="Ask an extension officer"
            variant="accent"
            leadingIcon="people"
            fullWidth
            loading={review.busy}
            onPress={() =>
              review.request(
                { type: 'diagnosis', diagnosisId: diagnosis.id },
                result.label.replace(/ damage$/, ''),
              )
            }
          />
        )}

        {dealerDisease && (
          <Button
            label={t('marketplace.diagnosisLink', { disease: t(`diseases.${dealerDisease}`) })}
            variant="secondary"
            leadingIcon="market"
            fullWidth
            onPress={() => router.push({ pathname: '/marketplace', params: { disease: dealerDisease } })}
          />
        )}

        {diagnosis.reportedIncorrect ? (
          <View style={styles.doneRow}>
            <Badge label="Reported for safety review" tone="mint" icon="check" />
          </View>
        ) : (
          <Button
            label="Report incorrect result"
            variant="secondary"
            leadingIcon="flag"
            fullWidth
            onPress={() => setSheet('report')}
          />
        )}

        {diagnosis.imageUri && (
          <Button
            label="Delete uploaded image"
            variant="secondary"
            leadingIcon="trash"
            fullWidth
            onPress={() => setSheet('delete')}
          />
        )}
      </View>

      <AppText variant="caption" color="textSecondary">
        Model: {result.modelVersion}. This is not a professional diagnosis — confirm with an
        extension officer before applying treatment.
      </AppText>

      {review.sheet}

      <BottomSheet
        visible={sheet === 'report'}
        onClose={() => setSheet(null)}
        title="Report incorrect result"
        description="Your report goes to the safety review team and helps check the AI's quality."
        confirmLabel="Send report"
        confirmLoading={busy}
        onConfirm={sendReport}>
        <TextField
          label="What looks wrong? (optional)"
          placeholder="Example: the damage is from drought, not insects"
          value={comment}
          onChangeText={setComment}
          multiline
        />
      </BottomSheet>

      <BottomSheet
        visible={sheet === 'delete'}
        onClose={() => setSheet(null)}
        title="Delete this photo?"
        description="The photo will be permanently deleted. If an extension officer is reviewing this case, they will no longer see it. Your diagnosis result stays in your history."
        confirmLabel="Delete photo"
        confirmLoading={busy}
        onConfirm={deleteImage}
      />
    </Screen>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    header: {
      gap: Space.sm,
    },
    image: {
      width: '100%',
      aspectRatio: 4 / 3,
      borderRadius: Radius.xl,
      backgroundColor: c.backgroundSecondary,
    },
    cardBody: {
      gap: Space.md,
    },
    section: {
      gap: Space.md,
    },
    actions: {
      gap: Space.md,
    },
    doneRow: {
      alignItems: 'center',
      paddingVertical: Space.sm,
    },
  });
