## Weather Dashboard Plan

Build a single-page weather dashboard at `/` (replacing the placeholder index) that uses Open-Meteo's public APIs. No backend, no API keys — direct browser `fetch` to the public endpoints, cached via TanStack Query.

### User flow
1. User types in a search input → debounced 300ms → call `https://geocoding-api.open-meteo.com/v1/search?name={q}&count=5`.
2. Results render in a dropdown showing `name, admin1, country` (with a small flag/country code).
3. Clicking a result stores the selected location in URL search params (`?lat=&lon=&name=`) so the view is shareable/refresh-safe, then triggers the forecast query.
4. Dashboard renders 4 widgets from the `current` payload.

### Widgets (metric units)
1. **Conditions hero** — big temperature_2m (°C), "Feels like" apparent_temperature, weather_code mapped to label + Lucide icon, day/night variant via `is_day`. Acts as the visual centerpiece.
2. **Wind** — wind_speed_10m (km/h) with a rotating compass arrow driven by wind_direction_10m (° with cardinal label N/NE/E/...).
3. **Sky & precipitation** — cloud_cover % (progress bar) + rain mm.
4. **Pressure & local time** — surface_pressure hPa + formatted `current.time` in the response's `timezone`.

### UX details
- Empty state before any selection: friendly prompt + a few suggested cities (one-click).
- Loading: skeletons on the widgets; spinner in the search dropdown.
- Errors: inline alert with retry; network failures don't blank the dashboard.
- Last-updated timestamp + manual refresh button (invalidates the forecast query).
- Mobile-first responsive: 1 column on mobile, 2 columns sm+, hero spans full width.

### Technical details
- Stack: existing TanStack Start + React + Tailwind v4 + shadcn/ui + TanStack Query (already wired in root).
- Files to add:
  - `src/lib/openMeteo.ts` — `searchCities(q)`, `fetchCurrentWeather(lat, lon)`, types, `weatherCodeToInfo(code, isDay)` mapping (WMO codes → label + Lucide icon name).
  - `src/components/weather/CitySearch.tsx` — input + debounced query (`useQuery` keyed on `["geo", q]`, `enabled: q.length >= 2`), Popover/Command dropdown, calls `onSelect`.
  - `src/components/weather/widgets/ConditionsCard.tsx`, `WindCard.tsx`, `SkyCard.tsx`, `PressureTimeCard.tsx` — each takes typed props, no fetching.
  - `src/components/weather/WeatherDashboard.tsx` — composes widgets, owns the forecast `useQuery` keyed on `["weather", lat, lon]`.
- `src/routes/index.tsx`:
  - Add `validateSearch` for `{ lat?: number; lon?: number; name?: string }`.
  - Replace placeholder with `<main>` containing header, `<CitySearch>`, and `<WeatherDashboard>` (or empty state when no lat/lon).
  - Update `head()` with proper title + description for SEO.
- Debounce via a small `useDebouncedValue` hook (no new dependency).
- No new packages required; Lucide icons and shadcn `Card`, `Input`, `Command`, `Popover`, `Skeleton`, `Alert`, `Button` are already available.

### Out of scope
- Multi-day forecast, hourly charts, favorites/recent cities persistence, unit toggle, geolocation auto-detect. Easy to add later if you want.
