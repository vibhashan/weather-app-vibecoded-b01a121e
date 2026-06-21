import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CloudRain,
  Cloud,
  Gauge,
  Clock,
  Navigation,
  RefreshCw,
  Wind,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  degreesToCardinal,
  fetchCurrentWeather,
  weatherCodeToInfo,
} from "@/lib/openMeteo";

type Props = {
  latitude: number;
  longitude: number;
  name: string;
};

export function WeatherDashboard({ latitude, longitude, name }: Props) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["weather", latitude, longitude],
    queryFn: ({ signal }) => fetchCurrentWeather(latitude, longitude, signal),
    staleTime: 60_000,
  });

  if (isLoading) return <DashboardSkeleton name={name} />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Couldn't load weather</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>{(error as Error).message}</span>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  const { current, current_units, timezone, timezone_abbreviation } = data;
  const info = weatherCodeToInfo(current.weather_code, current.is_day);
  const Icon = info.Icon;

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{name}</h2>
          <p className="text-sm text-muted-foreground">
            {timezone} ({timezone_abbreviation})
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Hero conditions */}
        <Card className="sm:col-span-2 overflow-hidden">
          <CardContent className="flex flex-wrap items-center justify-between gap-6 p-6">
            <div className="flex items-center gap-5">
              <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                <Icon className="size-12" strokeWidth={1.5} />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-semibold tabular-nums">
                    {Math.round(current.temperature_2m)}
                  </span>
                  <span className="text-2xl text-muted-foreground">
                    {current_units.temperature_2m}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Feels like {Math.round(current.apparent_temperature)}
                  {current_units.apparent_temperature}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium">{info.label}</p>
              <p className="text-sm text-muted-foreground">
                {current.is_day ? "Daytime" : "Nighttime"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Wind */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wind</CardTitle>
            <Wind className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold tabular-nums">
                  {current.wind_speed_10m.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {current_units.wind_speed_10m}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {degreesToCardinal(current.wind_direction_10m)} ·{" "}
                {Math.round(current.wind_direction_10m)}°
              </p>
            </div>
            <div className="relative flex size-20 items-center justify-center rounded-full border-2 border-border">
              <span className="absolute top-1 text-[10px] font-medium text-muted-foreground">N</span>
              <span className="absolute bottom-1 text-[10px] font-medium text-muted-foreground">S</span>
              <span className="absolute left-1 text-[10px] font-medium text-muted-foreground">W</span>
              <span className="absolute right-1 text-[10px] font-medium text-muted-foreground">E</span>
              <Navigation
                className="size-7 text-primary transition-transform"
                style={{ transform: `rotate(${current.wind_direction_10m}deg)` }}
                fill="currentColor"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sky & precip */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sky & Rain
            </CardTitle>
            <Cloud className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Cloud cover</span>
                <span className="text-lg font-semibold tabular-nums">
                  {current.cloud_cover}
                  {current_units.cloud_cover}
                </span>
              </div>
              <Progress value={current.cloud_cover} />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <CloudRain className="size-4" /> Rain
              </span>
              <span className="text-lg font-semibold tabular-nums">
                {current.rain.toFixed(2)} {current_units.rain}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pressure & time */}
        <Card className="sm:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pressure & Local Time
            </CardTitle>
            <Gauge className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Surface pressure</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold tabular-nums">
                  {current.surface_pressure.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {current_units.surface_pressure}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" /> Local time
              </p>
              <p className="text-2xl font-semibold tabular-nums">
                {formatLocalTime(current.time)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatLocalDate(current.time)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function formatLocalTime(iso: string) {
  // iso is "YYYY-MM-DDTHH:mm" already in the location's local time.
  const t = iso.split("T")[1] ?? "";
  return t.slice(0, 5);
}
function formatLocalDate(iso: string) {
  const d = iso.split("T")[0] ?? "";
  if (!d) return "";
  const date = new Date(`${d}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function DashboardSkeleton({ name }: { name: string }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">{name}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-36 sm:col-span-2" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-32 sm:col-span-2" />
      </div>
    </section>
  );
}
