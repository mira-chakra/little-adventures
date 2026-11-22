// Fixed upstream host: clients can never request arbitrary URLs through this service.

const cache = new Map();

export const todayBeirut = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Beirut',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

export function validForecastDate(date) {
  const difference =
    (Date.parse(date) - Date.parse(todayBeirut())) / 86400000;

  return Number.isInteger(difference)
    && difference >= 0
    && difference < 7;
}

export function weatherLabel(code) {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy / cloudy';
  if (code <= 48) return 'Fog';
  if (code <= 67) return 'Rain / drizzle';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  return 'Thunderstorms';
}

export function weatherConcern(w) {
  return w?.available && (
    (w.rainChance ?? 0) >= 60 ||
    (w.wind ?? 0) >= 35 ||
    [95, 96, 99].includes(w.code)
  );
}

// Convert Visual Crossing icons to the existing weather codes.
function iconToCode(icon = '') {
  if (icon.includes('thunder')) return 95;
  if (icon.includes('snow-showers')) return 85;
  if (icon.includes('snow')) return 71;
  if (icon.includes('showers')) return 80;
  if (icon.includes('rain')) return 61;
  if (icon.includes('fog')) return 45;
  if (icon.includes('cloudy')) return 3;
  if (icon.includes('wind')) return 3;
  return 0;
}

export async function forecasts(items, date = todayBeirut(), fetcher = fetch) {
  const result = new Map();

  if (!validForecastDate(date)) return result;

  const apiKey = process.env.VISUAL_CROSSING_KEY;

  if (!apiKey) {
    console.error('Missing VISUAL_CROSSING_KEY');
    return result;
  }

  const missing = new Map();

  for (const item of items) {
    if (!Number.isFinite(item.latitude) ||
        !Number.isFinite(item.longitude)) continue;

    const key = `${item.latitude.toFixed(4)},${item.longitude.toFixed(4)}:${date}`;
    const hit = cache.get(key);

    if (hit && hit.expires > Date.now()) {
      result.set(String(item._id), hit.value);
    } else {
      const entry = missing.get(key) || {
        key,
        latitude: item.latitude,
        longitude: item.longitude,
        ids: []
      };

      entry.ids.push(String(item._id));
      missing.set(key, entry);
    }
  }

  const locations = [...missing.values()];

  // Limit concurrent requests to four.
  for (let i = 0; i < locations.length; i += 4) {
    await Promise.all(locations.slice(i, i + 4).map(async place => {
      try {
        const location = `${place.latitude},${place.longitude}`;

        const url = new URL(
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${date}`
        );

        url.search = new URLSearchParams({
          key: apiKey,
          unitGroup: 'metric',
          include: 'days',
          elements: 'datetime,tempmax,tempmin,precipprob,windspeed,conditions,icon',
          contentType: 'json'
        }).toString();

        const response = await fetcher(url.toString(), {
          signal: AbortSignal.timeout(12000)
        });

        if (!response.ok) {
          const details = await response.text();
          throw new Error(
            `Visual Crossing HTTP ${response.status}: ${details.slice(0, 200)}`
          );
        }

        const data = await response.json();
        const day = data.days?.find(d => d.datetime === date);

        if (!day) throw new Error('Forecast date not found');

        const code = iconToCode(day.icon || '');

        const value = {
          available: true,
          date,
          low: day.tempmin ?? null,
          high: day.tempmax ?? null,
          rainChance: day.precipprob ?? null,
          wind: day.windspeed ?? null,
          code,
          label: day.conditions || weatherLabel(code),
          checkedAt: new Date().toISOString()
        };

        if (cache.size >= 500) {
          cache.delete(cache.keys().next().value);
        }

        cache.set(place.key, {
          value,
          expires: Date.now() + 3 * 60 * 60 * 1000
        });

        for (const id of place.ids) {
          result.set(id, value);
        }

      } catch (error) {
        console.error('Weather API error:', error.message);
      }
    }));
  }

  return result;
}
