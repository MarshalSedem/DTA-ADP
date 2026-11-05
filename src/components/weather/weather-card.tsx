import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useIsOffline } from '@/components/marketplace/offline-banner';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { Radius, Space, type Palette } from '@/constants/theme';
import { useT } from '@/i18n';
import type { ForecastDay, WeatherKind } from '@/services/weather-api';
import { useFarmer } from '@/state/farmer-store';
import { enableWeather, refreshWeather, useWeather, type WeatherState } from '@/state/weather-store';
import { useStyles, useTheme } from '@/theme';
import type { District } from '@/types/farmer';
import { formatDateTime } from '@/utils/format';

export const WEATHER_ICON: Record<WeatherKind, IconName> = {
  clear: 'sun',
  mainlyClear: 'partlyCloudy',
  partlyCloudy: 'partlyCloudy',
  cloudy: 'cloud',
  fog: 'fog',
  drizzle: 'drizzle',
  rain: 'rain',
  heavyRain: 'heavyRain',
  showers: 'rain',
  thunderstorm: 'thunderstorm',
  other: 'cloud',
};

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

/** "Today", "Tomorrow", then the weekday name (from the forecast's local date). */
export function useDayLabel() {
  const t = useT();
  return (day: ForecastDay, index: number) => {
    if (index === 0) return t('weather.today');
    if (index === 1) return t('weather.tomorrow');
    const [y, m, d] = day.date.split('-').map(Number);
    return t(`weather.weekdays.${WEEKDAYS[new Date(y, m - 1, d).getDay()]}`);
  };
}

/** Time only if the forecast is from today, otherwise date and time. */
export function formatFetchedAt(iso: string) {
  const fetched = new Date(iso);
  return fetched.toDateString() === new Date().toDateString()
    ? fetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : formatDateTime(iso);
}

/** Offline / failed-update note shown under a saved forecast. */
export function useForecastNote(weather: WeatherState) {
  const t = useT();
  const offline = useIsOffline();
  if (!weather.forecast) return null;
  const time = formatFetchedAt(weather.forecast.fetchedAt);
  if (offline) return t('weather.offlineCached', { time });
  if (weather.status === 'error') return t('weather.staleCached', { time });
  return t('weather.updated', { time });
}

/** Explains exactly what is shared, and asks before anything is sent. */
export function WeatherConsentCard({ district }: { district: District }) {
  const t = useT();
  const styles = useStyles(createStyles);
  return (
    <Card tone="blue" style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Icon name="partlyCloudy" size={24} />
        </View>
        <AppText variant="cardHeading" style={styles.flex}>
          {t('weather.consentTitle')}
        </AppText>
      </View>
      <AppText variant="body">{t('weather.consentBody', { district })}</AppText>
      <Button
        label={t('weather.consentAccept')}
        variant="primary"
        leadingIcon="partlyCloudy"
        fullWidth
        onPress={() => void enableWeather(district)}
      />
    </Card>
  );
}

/** Home: today's weather and the next three days. */
export function WeatherCard() {
  const t = useT();
  const { profile } = useFarmer();
  const weather = useWeather();
  const note = useForecastNote(weather);
  const dayLabel = useDayLabel();
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  const district = profile.district;

  useEffect(() => {
    void refreshWeather(district);
  }, [district]);

  if (!weather.consent) return <WeatherConsentCard district={district} />;

  const forecast = weather.forecast?.district === district ? weather.forecast : null;

  if (!forecast) {
    return (
      <Card tone="blue" style={styles.card}>
        <AppText variant="label">{t('weather.forDistrict', { district })}</AppText>
        {weather.status === 'error' ? (
          <>
            <AppText variant="cardHeading">{t('weather.errorTitle')}</AppText>
            <AppText variant="body">{t('weather.errorBody')}</AppText>
            <Button
              label={t('weather.retry')}
              variant="primary"
              leadingIcon="arrowRight"
              fullWidth
              onPress={() => void refreshWeather(district, { force: true })}
            />
          </>
        ) : (
          <View style={styles.row} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.textPrimary} />
            <AppText variant="body">{t('weather.loading')}</AppText>
          </View>
        )}
      </Card>
    );
  }

  const today = forecast.days[0];
  const kind = forecast.current?.kind ?? today.kind;
  const temp = forecast.current?.temperatureC ?? today.maxC;

  return (
    <Card tone="blue" style={styles.card}>
      <AppText variant="label">{t('weather.forDistrict', { district })}</AppText>

      <View style={styles.row}>
        <View style={styles.iconCircleLarge}>
          <Icon name={WEATHER_ICON[kind]} size={36} />
        </View>
        <View style={styles.flex}>
          <AppText variant="display">{t('weather.nowTemp', { temp })}</AppText>
          <AppText variant="bodyLarge">{t(`weather.conditions.${kind}`)}</AppText>
        </View>
      </View>

      <View style={styles.row}>
        <Icon name="raindrop" size={18} />
        <AppText variant="body" style={styles.flex}>
          {t('weather.todaySummary', {
            range: t('weather.tempRange', { max: today.maxC, min: today.minC }),
            rain:
              today.rainChance !== null
                ? t('weather.rainChance', { percent: today.rainChance })
                : t('weather.rainAmount', { mm: today.rainMm }),
          })}
        </AppText>
      </View>

      <View style={styles.days}>
        {forecast.days.slice(1, 4).map((day, i) => (
          <View
            key={day.date}
            style={styles.day}
            accessible
            accessibilityLabel={`${dayLabel(day, i + 1)}: ${t(`weather.conditions.${day.kind}`)}, ${t('weather.tempRange', { max: day.maxC, min: day.minC })}`}>
            <AppText variant="label">{dayLabel(day, i + 1)}</AppText>
            <Icon name={WEATHER_ICON[day.kind]} size={24} />
            <AppText variant="caption">
              {t('weather.tempRange', { max: day.maxC, min: day.minC })}
            </AppText>
            {day.rainChance !== null && (
              <AppText variant="caption">
                {t('weather.chanceShort', { percent: day.rainChance })}
              </AppText>
            )}
          </View>
        ))}
      </View>

      {note && (
        <AppText variant="caption" color="textSecondary">
          {note}
        </AppText>
      )}

      <Button
        label={t('weather.viewForecast')}
        variant="primary"
        trailingIcon="arrowRight"
        fullWidth
        onPress={() => router.push('/weather')}
      />
      <AppText variant="caption" color="textSecondary">
        {t('weather.attribution')}
      </AppText>
    </Card>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      gap: Space.md,
    },
    flex: {
      flex: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Space.md,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCircleLarge: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    days: {
      flexDirection: 'row',
      gap: Space.sm,
    },
    day: {
      flex: 1,
      alignItems: 'center',
      gap: Space.xs,
      paddingVertical: Space.sm,
      borderRadius: Radius.md,
      backgroundColor: c.surface,
    },
  });
