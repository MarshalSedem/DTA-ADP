import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Notice } from '@/components/notice';
import { PhotoPicker } from '@/components/photo-picker';
import { Screen } from '@/components/screen';
import { ScreenIntro, SectionTitle } from '@/components/screen-intro';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card, PressableCard } from '@/components/ui/card';
import { ChipGroup } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { ToggleRow } from '@/components/ui/toggle-row';
import { useToast } from '@/components/ui/toast';
import { CROP_TYPES, DISTRICTS } from '@/constants/farm';
import { Space, type Palette } from '@/constants/theme';
import { errorMessage } from '@/services/api-client';
import { useFarmer } from '@/state/farmer-store';
import { useStyles } from '@/theme';
import type { CropType, District } from '@/types/farmer';
import { formatDate } from '@/utils/format';

export default function DiagnoseScreen() {
  const { profile, modelInfo, diagnoses, submitDiagnosis } = useFarmer();
  const toast = useToast();
  const styles = useStyles(createStyles);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [cropType, setCropType] = useState<CropType>('Maize');
  const [district, setDistrict] = useState<District>(profile.district);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosisConsent, setDiagnosisConsent] = useState(true);
  const [trainingConsent, setTrainingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [missingPhoto, setMissingPhoto] = useState(false);

  const cropSupported = modelInfo.supportedCrops.includes(cropType);

  const analyse = async () => {
    if (!cropSupported) return;
    if (!diagnosisConsent) {
      toast('Consent is required to analyse the image.', 'error');
      return;
    }
    if (!imageUri) {
      setMissingPhoto(true);
      return;
    }
    setSubmitting(true);
    try {
      const id = await submitDiagnosis({
        cropType,
        district,
        symptoms: symptoms.trim(),
        imageUri,
        diagnosisConsent: true,
        trainingConsent,
      });
      toast('Secure analysis completed');
      setImageUri(null);
      setSymptoms('');
      setTrainingConsent(false);
      router.push({ pathname: '/diagnosis/[id]', params: { id } });
    } catch (error) {
      // Keep the photo and answers so the farmer can simply try again.
      toast(errorMessage(error, 'Analysis failed. Please try again.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen variant="tab">
      <ScreenIntro
        eyebrow="AI crop diagnosis"
        title="Upload a crop photograph"
        description="Only the photograph, crop type, district and symptoms are needed for this service."
      />

      <PhotoPicker
        uri={imageUri}
        onChange={(uri) => {
          setImageUri(uri);
          if (uri) setMissingPhoto(false);
        }}
        error={missingPhoto ? 'Add a crop photo to continue.' : undefined}
      />

      <Card style={styles.form}>
        <ChipGroup label="Crop type" options={CROP_TYPES} value={cropType} onChange={setCropType} />
        {!cropSupported && (
          <Notice
            title={`${modelInfo.name} can't check ${cropType.toLowerCase()} yet`}
            icon="warning"
            tone="pink">
            {`${modelInfo.name} ${modelInfo.version} is only evaluated for ${modelInfo.supportedCrops
              .join(', ')
              .toLowerCase()}, so it won't analyse ${cropType.toLowerCase()} photos. Ask an extension officer for help with this crop.`}
          </Notice>
        )}
        <ChipGroup label="District" options={DISTRICTS} value={district} onChange={setDistrict} />
        <TextField
          label="Observed symptoms"
          placeholder="Example: holes in leaves and damaged maize whorl"
          value={symptoms}
          onChangeText={setSymptoms}
          multiline
        />
      </Card>

      <Card>
        <AppText variant="cardHeading">Purpose-specific consent</AppText>
        <ToggleRow
          title="Use this image to provide a diagnosis"
          description={
            diagnosisConsent
              ? 'Required for this service.'
              : 'Required — turn on to analyse the image.'
          }
          value={diagnosisConsent}
          onValueChange={setDiagnosisConsent}
        />
        <View style={styles.divider} />
        <ToggleRow
          title="Use an anonymised copy to improve the model"
          description="Optional. Your diagnosis works the same either way."
          value={trainingConsent}
          onValueChange={setTrainingConsent}
        />
      </Card>

      <Button
        label="Analyse securely"
        variant="accent"
        leadingIcon="lock"
        fullWidth
        disabled={!cropSupported}
        loading={submitting}
        onPress={analyse}
      />

      {diagnoses.length > 0 && (
        <View style={styles.section}>
          <SectionTitle>Recent diagnoses</SectionTitle>
          {diagnoses.map((d) => (
            <PressableCard
              key={d.id}
              style={styles.historyRow}
              accessibilityLabel={`${d.result.label}, ${d.cropType}, ${formatDate(d.createdAt)}`}
              onPress={() => router.push({ pathname: '/diagnosis/[id]', params: { id: d.id } })}>
              <View style={styles.historyIcon}>
                <Icon name="leaf" size={20} />
              </View>
              <View style={styles.flex}>
                <AppText variant="cardHeading" style={styles.historyTitle}>
                  {d.result.label}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {d.cropType} · {d.district} · {formatDate(d.createdAt)}
                </AppText>
              </View>
              <Icon name="chevronRight" size={18} />
            </PressableCard>
          ))}
        </View>
      )}
    </Screen>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    form: {
      gap: Space.xl,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
    },
    section: {
      gap: Space.md,
    },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Space.md,
      padding: Space.base,
    },
    historyIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.mintLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    historyTitle: {
      fontSize: 16,
    },
  });
