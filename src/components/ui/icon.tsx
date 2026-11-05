import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { type ColorToken } from '@/constants/theme';
import { useTheme } from '@/theme';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

/**
 * Semantic icon names → SF Symbols (iOS) / Material Symbols (Android, web).
 * Outlined variants are used throughout, per the style guide.
 */
const ICONS = {
  home: { ios: 'house', android: 'home', web: 'home' },
  diagnose: { ios: 'camera.viewfinder', android: 'photo_camera', web: 'photo_camera' },
  adviser: { ios: 'bubble.left.and.bubble.right', android: 'forum', web: 'forum' },
  market: { ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' },
  privacy: { ios: 'shield', android: 'shield', web: 'shield' },
  profile: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' },
  bell: { ios: 'bell', android: 'notifications', web: 'notifications' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  arrowRight: { ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' },
  sparkles: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  leaf: { ios: 'leaf', android: 'eco', web: 'eco' },
  people: { ios: 'person.2', android: 'group', web: 'group' },
  lock: { ios: 'lock', android: 'lock', web: 'lock' },
  info: { ios: 'info.circle', android: 'info', web: 'info' },
  camera: { ios: 'camera', android: 'photo_camera', web: 'photo_camera' },
  gallery: { ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' },
  trash: { ios: 'trash', android: 'delete', web: 'delete' },
  flag: { ios: 'flag', android: 'flag', web: 'flag' },
  send: { ios: 'paperplane', android: 'send', web: 'send' },
  download: { ios: 'arrow.down.circle', android: 'download', web: 'download' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  warning: { ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  document: { ios: 'doc.text', android: 'description', web: 'description' },
  personRemove: {
    ios: 'person.crop.circle.badge.xmark',
    android: 'person_remove',
    web: 'person_remove',
  },
} as const satisfies Record<string, SymbolName>;

export type IconName = keyof typeof ICONS;

type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorToken;
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, size = 24, color = 'textPrimary', style }: IconProps) {
  const { colors } = useTheme();
  return (
    <SymbolView
      name={ICONS[name]}
      size={size}
      tintColor={colors[color]}
      style={[{ width: size, height: size }, style]}
    />
  );
}
