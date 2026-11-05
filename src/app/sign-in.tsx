import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Notice } from '@/components/notice';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { Layout, Space, type Palette } from '@/constants/theme';
import { errorMessage } from '@/services/api-client';
import { useSession } from '@/state/session';
import { useStyles } from '@/theme';

/** Farmers sign in with the phone number registered to their account. */
export default function SignInScreen() {
  const { signIn } = useSession();
  const insets = useSafeAreaInsets();
  const styles = useStyles(createStyles);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = phone.trim().length > 0 && password.length > 0 && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await signIn(phone, password);
    } catch (e) {
      setError(errorMessage(e, 'Sign-in failed. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.flex}>
      <ScrollView
        style={styles.screen}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Space.xl, paddingBottom: insets.bottom + Space['2xl'] },
        ]}>
        <Card tone="dark" style={styles.hero}>
          <View style={styles.brandMark}>
            <Icon name="leaf" size={28} color="ink" />
          </View>
          <AppText variant="h2" color="textInverse" accessibilityRole="header">
            Welcome to AgriTrust
          </AppText>
          <AppText variant="body" color="textInverseSecondary">
            Preliminary, explainable AI advice for your farm — with an extension officer one tap
            away.
          </AppText>
        </Card>

        <Card style={styles.form}>
          <TextField
            label="Phone number"
            value={phone}
            onChangeText={setPhone}
            placeholder="0244000000"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            returnKeyType="next"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            autoComplete="current-password"
            returnKeyType="go"
            onSubmitEditing={submit}
          />
          {error && (
            <Notice title="Couldn't sign in" icon="warning" tone="pink">
              {error}
            </Notice>
          )}
          <Button
            label="Sign in"
            variant="accent"
            leadingIcon="lock"
            fullWidth
            disabled={!canSubmit}
            loading={busy}
            onPress={submit}
          />
        </Card>

        {__DEV__ && (
          <Notice title="Demo account" icon="info" tone="blue">
            Phone 0244000001 (Ama K.) or 0244000002 (Kojo A.), password agritrust123.
          </Notice>
        )}

        <View style={styles.footnote}>
          <Icon name="info" size={16} color="textSecondary" />
          <AppText variant="caption" color="textSecondary" style={styles.flex}>
            AI results are preliminary and do not replace an agronomist or extension officer.
          </AppText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    screen: {
      flex: 1,
      backgroundColor: c.background,
    },
    content: {
      paddingHorizontal: Layout.screenPadding,
      gap: Space.xl,
      width: '100%',
      maxWidth: Layout.maxContentWidth,
      alignSelf: 'center',
    },
    hero: {
      gap: Space.md,
      padding: Space.xl,
    },
    brandMark: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.mint,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Space.xs,
    },
    form: {
      gap: Space.lg,
    },
    footnote: {
      flexDirection: 'row',
      gap: Space.sm,
      alignItems: 'flex-start',
    },
  });
