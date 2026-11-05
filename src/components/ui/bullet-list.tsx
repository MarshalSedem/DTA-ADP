import { StyleSheet, View } from 'react-native';

import { Space } from '@/constants/theme';
import { useTheme } from '@/theme';

import { AppText } from './app-text';

export function BulletList({ items, dotColor }: { items: string[]; dotColor?: string }) {
  const { colors } = useTheme();
  const dot = dotColor ?? colors.primaryStrong;
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: dot }]} />
          <AppText variant="body" style={styles.text}>
            {item}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Space.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Space.md,
    alignItems: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
  },
  text: {
    flex: 1,
  },
});
