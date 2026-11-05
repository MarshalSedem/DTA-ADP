import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Notice } from '@/components/notice';
import { Screen } from '@/components/screen';
import { ScreenIntro, SectionTitle } from '@/components/screen-intro';
import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ToggleRow } from '@/components/ui/toggle-row';
import { useToast } from '@/components/ui/toast';
import { Space, type Palette } from '@/constants/theme';
import { errorMessage } from '@/services/api-client';
import { saveJsonFile } from '@/services/save-json-file';
import { useFarmer } from '@/state/farmer-store';
import { useStyles } from '@/theme';
import type { ConsentPurpose, Consents } from '@/types/farmer';

const PURPOSES: { purpose: ConsentPurpose; title: string; description: string }[] = [
  {
    purpose: 'extensionOfficerSharing',
    title: 'Extension officer sharing',
    description: 'Share selected cases for human review.',
  },
  {
    purpose: 'modelImprovement',
    title: 'Model improvement',
    description: 'Use anonymised images and feedback to improve AI.',
  },
  {
    purpose: 'districtAnalytics',
    title: 'Aggregated district analytics',
    description: 'Use de-identified data for planning reports.',
  },
  {
    purpose: 'marketing',
    title: 'Marketing messages',
    description: 'Receive product or service promotions.',
  },
];

export default function PrivacyScreen() {
  const {
    consents,
    saveConsents,
    dataInventory,
    accountDeletion,
    requestAccountDeletion,
    buildDataExport,
  } = useFarmer();
  const toast = useToast();
  const styles = useStyles(createStyles);

  const [draft, setDraft] = useState<Consents>(consents);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteSheet, setDeleteSheet] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dirty = PURPOSES.some(({ purpose }) => draft[purpose] !== consents[purpose]);

  const save = async () => {
    setSaving(true);
    try {
      await saveConsents(draft);
      toast('Consent preferences saved');
    } catch (error) {
      toast(errorMessage(error, 'Could not save your preferences. Please try again.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const download = async () => {
    setExporting(true);
    try {
      const data = await buildDataExport();
      const shared = await saveJsonFile('my-agritrust-data.json', data);
      if (!shared) toast("Sharing isn't available on this device.", 'error');
    } catch (error) {
      toast(errorMessage(error, 'Could not prepare your data. Please try again.'), 'error');
    } finally {
      setExporting(false);
    }
  };

  const confirmDeletion = async () => {
    setDeleting(true);
    try {
      await requestAccountDeletion();
      toast('Account deletion request submitted');
      setDeleteSheet(false);
    } catch (error) {
      toast(errorMessage(error, 'Could not submit the request. Please try again.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Screen variant="stack">
      <ScreenIntro
        eyebrow="Privacy and data governance"
        title="My Data & Privacy"
        description="Control each purpose separately. Essential processing is limited to delivering the service you request."
      />

      <View style={styles.section}>
        <SectionTitle>How your data is used</SectionTitle>
        <Card>
          <ToggleRow
            title="Core service data"
            description="Use farm information to provide requested recommendations."
            value
            locked
          />
          {PURPOSES.map(({ purpose, title, description }) => (
            <View key={purpose}>
              <View style={styles.divider} />
              <ToggleRow
                title={title}
                description={description}
                value={draft[purpose]}
                onValueChange={(v) => setDraft((prev) => ({ ...prev, [purpose]: v }))}
              />
            </View>
          ))}
        </Card>
        <Button
          label="Save preferences"
          variant="accent"
          fullWidth
          disabled={!dirty}
          loading={saving}
          onPress={save}
        />
        {dirty && (
          <AppText variant="caption" color="textSecondary" style={styles.center}>
            You have unsaved changes.
          </AppText>
        )}
      </View>

      <View style={styles.section}>
        <SectionTitle>Your data</SectionTitle>
        <Card style={styles.cardBody}>
          <AppText variant="body" color="textSecondary">
            Get a copy of the personal data AgriTrust holds about you, as a JSON file.
          </AppText>
          <Button
            label="Download my data"
            variant="secondary"
            leadingIcon="download"
            fullWidth
            loading={exporting}
            onPress={download}
          />
        </Card>
        {accountDeletion === 'pending' ? (
          <Notice title="Account deletion requested" icon="clock" tone="blue">
            Your request is being processed. You can keep using the app until it is complete.
          </Notice>
        ) : (
          <Card style={styles.cardBody}>
            <AppText variant="body" color="textSecondary">
              Ask AgriTrust to delete your account and personal data.
            </AppText>
            <Button
              label="Request account deletion"
              variant="secondary"
              leadingIcon="personRemove"
              fullWidth
              onPress={() => setDeleteSheet(true)}
            />
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <SectionTitle>Data inventory visible to you</SectionTitle>
        {dataInventory.map((item) => (
          <Card key={item.data} style={styles.cardBody}>
            <AppText variant="cardHeading">{item.data}</AppText>
            <Field label="Purpose" value={item.purpose} />
            <Field label="Shared with" value={item.sharedWith} />
            <Field label="Retention" value={item.retention} />
          </Card>
        ))}
      </View>

      <BottomSheet
        visible={deleteSheet}
        onClose={() => setDeleteSheet(false)}
        title="Request account deletion?"
        description="This asks AgriTrust to delete your account and personal data. Some records, such as AI interaction logs kept for safety and complaints, may be retained for their stated period before deletion."
        confirmLabel="Request deletion"
        confirmLoading={deleting}
        onConfirm={confirmDeletion}
      />
    </Screen>
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
    section: {
      gap: Space.md,
    },
    cardBody: {
      gap: Space.md,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
    },
    center: {
      textAlign: 'center',
    },
    field: {
      gap: 2,
    },
  });
