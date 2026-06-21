import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { CloudSun } from "lucide-react";
import { CitySearch } from "@/components/weather/CitySearch";
import { WeatherDashboard } from "@/components/weather/WeatherDashboard";
import { Button } from "@/components/ui/button";
import type { GeoResult } from "@/lib/openMeteo";

const searchSchema = z.object({
  lat: fallback(z.number().optional(), undefined),
  lon: fallback(z.number().optional(), undefined),
  name: fallback(z.string().optional(), undefined),
});

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Weather Dashboard — Current Conditions Worldwide" },
      {
        name: "description",
        content:
          "Search any city and see live current weather: temperature, wind, cloud cover, rain, and pressure. Powered by Open-Meteo.",
      },
      { property: "og:title", content: "Weather Dashboard — Current Conditions Worldwide" },
      {
        property: "og:description",
        content:
          "Search any city and see live current weather: temperature, wind, cloud cover, rain, and pressure.",
      },
    ],
  }),
  component: Index,
});

const SUGGESTIONS: Array<Pick<GeoResult, "name" | "country" | "latitude" | "longitude">> = [
  { name: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278 },
  { name: "New York", country: "United States", latitude: 40.7128, longitude: -74.006 },
  { name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 },
  { name: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093 },
];

function Index() {
  const { lat, lon, name } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });

  const handleSelect = (city: { latitude: number; longitude: number; name: string; country?: string }) => {
    navigate({
      search: {
        lat: city.latitude,
        lon: city.longitude,
        name: city.country ? `${city.name}, ${city.country}` : city.name,
      },
    });
  };

  const hasLocation = typeof lat === "number" && typeof lon === "number" && !!name;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <header className="mb-8 flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-primary">
            <CloudSun className="size-6" />
            <span className="text-sm font-medium uppercase tracking-wider">Weather</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Current conditions, anywhere.
          </h1>
          <p className="text-muted-foreground">
            Search a city to see live temperature, wind, cloud cover and pressure.
          </p>
        </header>

        <div className="mb-8">
          <CitySearch onSelect={handleSelect} />
        </div>

        {hasLocation ? (
          <WeatherDashboard latitude={lat!} longitude={lon!} name={name!} />
        ) : (
          <div className="rounded-xl border border-dashed bg-card p-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">Try one of these:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <Button
                  key={s.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelect(s)}
                >
                  {s.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Data by{" "}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-foreground"
          >
            Open-Meteo
          </a>
        </footer>
      </main>
    </div>
  );
}
