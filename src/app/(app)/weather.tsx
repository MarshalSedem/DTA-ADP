import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';

import { useMarketplaceHeader } from '@/components/marketplace/header-options';
import { Notice } from '@/components/notice';
import { Screen } from '@/components/screen';
import { ScreenIntro } from '@/components/screen-intro';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import {
  WEATHER_ICON,
  WeatherConsentCard,
  useDayLabel,
  useForecastNote,
} from '@/components/weather/weather-card';
import { Space } from '@/constants/theme';
import { useT } from '@/i18n';
import { useFarmer } from '@/state/farmer-store';
import { disableWeather, refreshWeather, useWeather } from '@/state/weather-store';
import { useTheme } from '@/theme';

/** 7-day forecast for the farmer's district (Open-Meteo). */
export default function WeatherScreen() {
  const t = useT();
  const headerOptions = useMarketplaceHeader();
  const { profile } = useFarmer();
  const weather = useWeather();
  const note = useForecastNote(weather);
  const dayLabel = useDayLabel();
  const { colors } = useTheme();
  const district = profile.district;
  const forecast = weather.forecast?.district === district ? weather.forecast : null;

  useEffect(() => {
    void refreshWeather(district);
  }, [district]);

  return (
    <Screen
      variant="stack"
      refreshControl={
        weather.consent ? (
          <RefreshControl
            refreshing={weather.status === 'loading' && !!forecast}
            onRefresh={() => void refreshWeather(district, { force: true })}
            tintColor={colors.primaryStrong}
            colors={[colors.primaryStrong]}
          />
        ) : undefined
      }>
      <Stack.Screen options={{ ...headerOptions, title: t('weather.pageHeader') }} />

      {!weather.consent ? (
        <WeatherConsentCard district={district} />
      ) : (
        <>
          <ScreenIntro
            eyebrow={t('weather.pageEyebrow')}
            title={t('weather.pageTitle')}
            description={t('weather.pageDescription', { district })}
          />

          {note && (
            <AppText variant="caption" color="textSecondary">
              {note}
            </AppText>
          )}

          {!forecast ? (
            weather.status === 'error' ? (
              <Notice title={t('weather.errorTitle')} icon="warning" tone="pink">
                <View style={styles.errorBody}>
                  <AppText variant="body">{t('weather.errorBody')}</AppText>
                  <Button
                    label={t('weather.retry')}
                    variant="primary"
                    leadingIcon="arrowRight"
                    onPress={() => void refreshWeather(district, { force: true })}
                  />
                </View>
              </Notice>
            ) : (
              <View style={styles.row} accessibilityLiveRegion="polite">
                <ActivityIndicator color={colors.textPrimary} />
                <AppText variant="body">{t('weather.loading')}</AppText>
              </View>
            )
          ) : (
            <View style={styles.list}>
              {forecast.days.map((day, i) => (
                <Card key={day.date} style={styles.dayCard}>
                  <View style={styles.row}>
                    <Icon name={WEATHER_ICON[day.kind]} size={32} />
                    <View style={styles.flex}>
                      <AppText variant="cardHeading">{dayLabel(day, i)}</AppText>
                      <AppText variant="body" color="textSecondary">
                        {t(`weather.conditions.${day.kind}`)}
                      </AppText>
                    </View>
                    <AppText variant="cardHeading">
                      {t('weather.tempRange', { max: day.maxC, min: day.minC })}
                    </AppText>
                  </View>
                  <View style={styles.row}>
                    <Icon name="raindrop" size={18} color="textSecondary" />
                    <AppText variant="body" color="textSecondary" style={styles.flex}>
                      {day.rainChance !== null
                        ? t('weather.rainBoth', { percent: day.rainChance, mm: day.rainMm })
                        : t('weather.rainAmount', { mm: day.rainMm })}
                    </AppText>
                  </View>
                </Card>
              ))}
            </View>
          )}

          <View style={styles.privacy}>
            <Icon name="lock" size={16} color="textSecondary" />
            <AppText variant="caption" color="textSecondary" style={styles.flex}>
              {t('weather.privacyNote')}
            </AppText>
          </View>

          <Button
            label={t('weather.turnOff')}
            variant="secondary"
            leadingIcon="close"
            fullWidth
            onPress={() => {
              disableWeather();
              router.back();
            }}
          />

          <AppText variant="caption" color="textSecondary">
            {t('weather.attribution')}
          </AppText>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  list: {
    gap: Space.md,
  },
  dayCard: {
    gap: Space.sm,
  },
  errorBody: {
    gap: Space.md,
    alignItems: 'flex-start',
  },
  privacy: {
    flexDirection: 'row',
    gap: Space.sm,
    alignItems: 'flex-start',
  },
});
