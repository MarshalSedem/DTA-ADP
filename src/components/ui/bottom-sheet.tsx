import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Layout, Radius, Space, type Palette } from '@/constants/theme';
import { useStyles } from '@/theme';

import { AppText } from './app-text';
import { Button } from './button';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  confirmLoading?: boolean;
  cancelLabel?: string;
};

/**
 * Bottom sheet used to confirm important or destructive actions
 * (style guide: bottom sheets use a 32px radius).
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  description,
  children,
  confirmLabel,
  onConfirm,
  confirmLoading,
  cancelLabel = 'Cancel',
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles(createStyles);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior="padding" style={styles.root}>
        <Pressable
          style={styles.backdrop}
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
        />
        <View
          style={[styles.sheet, { paddingBottom: insets.bottom + Space.xl }]}
          accessibilityViewIsModal>
          <View style={styles.handle} />
          <AppText variant="h4" accessibilityRole="header">
            {title}
          </AppText>
          {description && (
            <AppText variant="body" color="textSecondary">
              {description}
            </AppText>
          )}
          {children}
          <View style={styles.actions}>
            <Button
              label={confirmLabel}
              variant="accent"
              fullWidth
              loading={confirmLoading}
              onPress={onConfirm}
            />
            <Button
              label={cancelLabel}
              variant="secondary"
              fullWidth
              disabled={confirmLoading}
              onPress={onClose}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: c.backdrop,
    },
    sheet: {
      backgroundColor: c.surface,
      borderTopLeftRadius: Radius['3xl'],
      borderTopRightRadius: Radius['3xl'],
      paddingHorizontal: Layout.screenPadding,
      paddingTop: Space.md,
      gap: Space.md,
      width: '100%',
      maxWidth: Layout.maxContentWidth,
      alignSelf: 'center',
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      marginBottom: Space.sm,
    },
    actions: {
      gap: Space.md,
      marginTop: Space.sm,
    },
  });
