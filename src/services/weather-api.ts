/**
 * 7-day weather forecast from Open-Meteo (https://open-meteo.com) — called directly from the app.
 *
 * Privacy: only the farmer's DISTRICT CENTRE (rounded to ~1 km) is sent — never their name,
 * phone or exact farm location — and only after they agree (see `weather-store.ts`).
 *
 * Licence: data is CC BY 4.0 — show "Weather data by Open-Meteo.com" wherever it appears.
 * The free API is for non-commercial use (< 10,000 calls/day); a commercial release needs
 * an Open-Meteo API plan.
 */
import type { District } from '@/types/farmer';

/** District capitals (Wikipedia/GeoNames), rounded to 2 decimals. */
export const DISTRICT_COORDINATES: Record<District, { latitude: number; longitude: number }> = {
  'Ho West': { latitude: 6.79, longitude: 0.44 }, // Dzolokpuita
  Kpando: { latitude: 7.0, longitude: 0.29 }, // Kpando
  Hohoe: { latitude: 7.15, longitude: 0.47 }, // Hohoe
  'Afadzato South': { latitude: 6.99, longitude: 0.43 }, // Ve Golokwati
};

export type WeatherKind =
  | 'clear'
  | 'mainlyClear'
  | 'partlyCloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavyRain'
  | 'showers'
  | 'thunderstorm'
  | 'other';

export type ForecastDay = {
  /** Local date, YYYY-MM-DD. */
  date: string;
  kind: WeatherKind;
  maxC: number;
  minC: number;
  rainMm: number;
  /** 0–100, or null when the model doesn't provide it. */
  rainChance: number | null;
};

export type Forecast = {
  district: District;
  fetchedAt: string;
  current: { temperatureC: number; kind: WeatherKind } | null;
  days: ForecastDay[];
};

/** WMO weather interpretation codes → the conditions the app shows. */
export function weatherKind(code: number): WeatherKind {
  if (code === 0) return 'clear';
  if (code === 1) return 'mainlyClear';
  if (code === 2) return 'partlyCloudy';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if (code === 61 || code === 63 || code === 66) return 'rain';
  if (code === 65 || code === 67 || code === 82) return 'heavyRain';
  if (code === 80 || code === 81) return 'showers';
  if (code >= 95 && code <= 99) return 'thunderstorm';
  return 'other';
}

type OpenMeteoResponse = {
  current?: { temperature_2m?: number; weather_code?: number };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
    precipitation_probability_max?: (number | null)[];
  };
};

const TIMEOUT_MS = 12_000;

export async function fetchForecast(district: District): Promise<Forecast> {
  const { latitude, longitude } = DISTRICT_COORDINATES[district];
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,weather_code',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
    timezone: 'Africa/Accra',
    forecast_days: '7',
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let body: OpenMeteoResponse;
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Open-Meteo responded ${res.status}`);
    body = (await res.json()) as OpenMeteoResponse;
  } finally {
    clearTimeout(timer);
  }

  const d = body.daily;
  if (!d?.time?.length) throw new Error('Open-Meteo returned no daily forecast');

  const days: ForecastDay[] = d.time.map((date, i) => ({
    date,
    kind: weatherKind(d.weather_code?.[i] ?? -1),
    maxC: Math.round(d.temperature_2m_max?.[i] ?? 0),
    minC: Math.round(d.temperature_2m_min?.[i] ?? 0),
    rainMm: Math.round((d.precipitation_sum?.[i] ?? 0) * 10) / 10,
    rainChance: d.precipitation_probability_max?.[i] ?? null,
  }));

  const c = body.current;
  return {
    district,
    fetchedAt: new Date().toISOString(),
    current:
      c?.temperature_2m !== undefined && c.weather_code !== undefined
        ? { temperatureC: Math.round(c.temperature_2m), kind: weatherKind(c.weather_code) }
        : null,
    days,
  };
}
