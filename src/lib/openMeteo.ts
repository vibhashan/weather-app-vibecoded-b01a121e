export type GeoResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  admin2?: string;
  timezone?: string;
};

export type CurrentWeather = {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: Record<string, string>;
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    cloud_cover: number;
    rain: number;
    is_day: 0 | 1;
    apparent_temperature: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    weather_code: number;
    surface_pressure: number;
  };
};

export async function searchCities(query: string, signal?: AbortSignal): Promise<GeoResult[]> {
  if (!query.trim()) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Failed to search cities");
  const json = (await res.json()) as { results?: GeoResult[] };
  return json.results ?? [];
}

export async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<CurrentWeather> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,cloud_cover,rain,is_day,apparent_temperature,wind_speed_10m,wind_direction_10m,weather_code,surface_pressure",
    timezone: "auto",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, { signal });
  if (!res.ok) throw new Error("Failed to fetch weather");
  return (await res.json()) as CurrentWeather;
}

import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  type LucideIcon,
} from "lucide-react";

export type WeatherInfo = { label: string; Icon: LucideIcon };

export function weatherCodeToInfo(code: number, isDay: 0 | 1): WeatherInfo {
  const day = isDay === 1;
  switch (code) {
    case 0:
      return { label: "Clear sky", Icon: day ? Sun : Moon };
    case 1:
      return { label: "Mainly clear", Icon: day ? CloudSun : CloudMoon };
    case 2:
      return { label: "Partly cloudy", Icon: day ? CloudSun : CloudMoon };
    case 3:
      return { label: "Overcast", Icon: Cloud };
    case 45:
    case 48:
      return { label: "Fog", Icon: CloudFog };
    case 51:
    case 53:
    case 55:
      return { label: "Drizzle", Icon: CloudDrizzle };
    case 56:
    case 57:
      return { label: "Freezing drizzle", Icon: CloudDrizzle };
    case 61:
      return { label: "Light rain", Icon: CloudRain };
    case 63:
      return { label: "Rain", Icon: CloudRain };
    case 65:
      return { label: "Heavy rain", Icon: CloudRain };
    case 66:
    case 67:
      return { label: "Freezing rain", Icon: CloudRain };
    case 71:
      return { label: "Light snow", Icon: CloudSnow };
    case 73:
      return { label: "Snow", Icon: CloudSnow };
    case 75:
      return { label: "Heavy snow", Icon: CloudSnow };
    case 77:
      return { label: "Snow grains", Icon: CloudSnow };
    case 80:
    case 81:
    case 82:
      return { label: "Rain showers", Icon: CloudRain };
    case 85:
    case 86:
      return { label: "Snow showers", Icon: CloudSnow };
    case 95:
      return { label: "Thunderstorm", Icon: CloudLightning };
    case 96:
    case 99:
      return { label: "Thunderstorm w/ hail", Icon: CloudLightning };
    default:
      return { label: "Unknown", Icon: Cloud };
  }
}

export function degreesToCardinal(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(((deg % 360) / 22.5)) % 16];
}
