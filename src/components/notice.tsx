import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card, type CardTone } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { Space, type Palette } from '@/constants/theme';
import { useStyles } from '@/theme';

type NoticeProps = {
  title: string;
  children?: ReactNode;
  icon?: IconName;
  tone?: Extract<CardTone, 'mint' | 'blue' | 'pink' | 'gray'>;
};

/** Tinted information card with an icon, title and body. */
export function Notice({ title, children, icon = 'info', tone = 'mint' }: NoticeProps) {
  const styles = useStyles(createStyles);
  return (
    <Card tone={tone} style={styles.notice}>
      <View style={styles.icon}>
        <Icon name={icon} size={18} />
      </View>
      <View style={styles.body}>
        <AppText variant="cardHeading" style={styles.title}>
          {title}
        </AppText>
        {typeof children === 'string' ? <AppText variant="body">{children}</AppText> : children}
      </View>
    </Card>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    notice: {
      flexDirection: 'row',
      gap: Space.md,
      alignItems: 'flex-start',
    },
    icon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      flex: 1,
      gap: Space.xs,
    },
    title: {
      fontSize: 16,
    },
  });
