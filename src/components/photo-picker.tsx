import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { useToast } from '@/components/ui/toast';
import { Radius, Space, type Palette } from '@/constants/theme';
import { imageSource } from '@/services/api-client';
import { useStyles } from '@/theme';

type PhotoPickerProps = {
  uri: string | null;
  onChange: (uri: string | null) => void;
  error?: string;
};

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.8,
};

/** Take or choose a crop photo, with a preview. */
export function PhotoPicker({ uri, onChange, error }: PhotoPickerProps) {
  const toast = useToast();
  const styles = useStyles(createStyles);

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      toast(
        'Camera access is needed to take a photo. You can choose one from your gallery.',
        'error',
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    if (!result.canceled) onChange(result.assets[0].uri);
  };

  const chooseFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (!result.canceled) onChange(result.assets[0].uri);
  };

  if (uri) {
    return (
      <View style={styles.previewWrap}>
        <Image
          source={imageSource(uri)}
          style={styles.preview}
          contentFit="cover"
          accessibilityLabel="Selected crop photo"
        />
        <View style={styles.removeButton}>
          <IconButton
            icon="close"
            accessibilityLabel="Remove photo"
            size={40}
            onPress={() => onChange(null)}
          />
        </View>
      </View>
    );
  }

  return (
    <Card tone="mint" style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name="diagnose" size={28} color="ink" />
      </View>
      <AppText variant="cardHeading">Add a crop photo</AppText>
      <AppText variant="body" color="textSecondary" style={styles.center}>
        Use good light and get close to the damaged leaves.
      </AppText>
      <View style={styles.buttons}>
        <Button
          label="Take photo"
          variant="accent"
          leadingIcon="camera"
          fullWidth
          onPress={takePhoto}
        />
        <Button
          label="Choose from gallery"
          variant="primary"
          leadingIcon="gallery"
          fullWidth
          onPress={chooseFromGallery}
        />
      </View>
      {error && (
        <View style={styles.error} accessibilityRole="alert">
          <Icon name="warning" size={16} color="ink" />
          <AppText variant="label" color="ink">
            {error}
          </AppText>
        </View>
      )}
    </Card>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    previewWrap: {
      borderRadius: Radius.xl,
      overflow: 'hidden',
    },
    preview: {
      width: '100%',
      aspectRatio: 4 / 3,
      backgroundColor: c.backgroundSecondary,
    },
    removeButton: {
      position: 'absolute',
      top: Space.md,
      right: Space.md,
    },
    empty: {
      alignItems: 'center',
      gap: Space.sm,
      paddingVertical: Space.xl,
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.mint,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Space.xs,
    },
    center: {
      textAlign: 'center',
    },
    buttons: {
      alignSelf: 'stretch',
      gap: Space.md,
      marginTop: Space.sm,
    },
    error: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Space.xs,
      marginTop: Space.xs,
      paddingHorizontal: Space.md,
      paddingVertical: Space.xs,
      borderRadius: Radius.sm,
      backgroundColor: c.pink,
    },
  });
