import { Text, type TextProps } from 'react-native';

import { Typography, type ColorToken, type TypographyVariant } from '@/constants/theme';
import { useTheme } from '@/theme';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorToken;
};

export function AppText({ variant = 'body', color = 'textPrimary', style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  return <Text style={[Typography[variant], { color: colors[color] }, style]} {...rest} />;
}
