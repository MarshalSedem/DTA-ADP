/**
 * Weather forecast state — consent-gated and offline-first.
 *
 * - Nothing is sent to Open-Meteo until the farmer taps "Show the forecast" (consent).
 * - The last forecast is saved on the phone, so it still shows offline (with its time).
 * - Turning the forecast off withdraws consent and deletes the saved forecast.
 *
 * Module-level store (useSyncExternalStore) — no provider needed.
 */
import { useSyncExternalStore } from 'react';

import { fetchForecast, type Forecast } from '@/services/weather-api';
import type { District } from '@/types/farmer';

import { loadJson, saveJson } from './persist';

const CONSENT_KEY = 'weather.consent.v1';
const FORECAST_KEY = 'weather.forecast.v1';
/** Re-fetch when the saved forecast is older than this. */
const FRESH_FOR_MS = 60 * 60 * 1000;

export type WeatherState = {
  consent: boolean;
  forecast: Forecast | null;
  status: 'idle' | 'loading' | 'error';
};

let state: WeatherState = {
  consent: loadJson<boolean>(CONSENT_KEY, false) === true,
  forecast: loadJson<Forecast | null>(FORECAST_KEY, null),
  status: 'idle',
};
const listeners = new Set<() => void>();

function setState(patch: Partial<WeatherState>) {
  state = { ...state, ...patch };
  if ('consent' in patch) saveJson(CONSENT_KEY, state.consent);
  if ('forecast' in patch) saveJson(FORECAST_KEY, state.forecast);
  listeners.forEach((l) => l());
}

export function useWeather(): WeatherState {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => state,
    () => state,
  );
}

let inFlight: Promise<void> | null = null;

/**
 * Fetch a new forecast if consent is given and the saved one is missing, stale or for another
 * district. `force` skips the freshness check (pull to refresh / Try again).
 */
export function refreshWeather(district: District, options?: { force?: boolean }): Promise<void> {
  if (!state.consent) return Promise.resolve();
  const saved = state.forecast;
  const fresh =
    saved?.district === district && Date.now() - Date.parse(saved.fetchedAt) < FRESH_FOR_MS;
  if (fresh && !options?.force) return Promise.resolve();
  if (inFlight) return inFlight;

  setState({ status: 'loading' });
  inFlight = fetchForecast(district)
    .then((forecast) => setState({ forecast, status: 'idle' }))
    // Keep showing the saved forecast if there is one; the UI says it may be out of date.
    .catch(() => setState({ status: 'error' }))
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

/** The farmer agreed to share their district location with Open-Meteo. */
export function enableWeather(district: District) {
  setState({ consent: true });
  return refreshWeather(district, { force: true });
}

/** Withdraw consent and delete the saved forecast. */
export function disableWeather() {
  setState({ consent: false, forecast: null, status: 'idle' });
}
