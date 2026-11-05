import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { StyleSheet } from 'react-native';

import { FARMER_TABS, TabBarContainer, TabButton } from '@/components/tab-bar';
import { type Palette } from '@/constants/theme';
import { useStyles } from '@/theme';

export default function FarmerTabsLayout() {
  const styles = useStyles(createStyles);
  return (
    <Tabs style={styles.root}>
      <TabSlot style={styles.slot} />
      {/* TabList and TabTrigger must be direct JSX here — Tabs reads them to register routes. */}
      <TabList asChild>
        <TabBarContainer>
          {FARMER_TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton icon={tab.icon} label={tab.label} />
            </TabTrigger>
          ))}
        </TabBarContainer>
      </TabList>
    </Tabs>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.background,
    },
    slot: {
      flex: 1,
    },
  });
