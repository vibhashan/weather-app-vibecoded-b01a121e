import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { searchCities, type GeoResult } from "@/lib/openMeteo";

type Props = { onSelect: (city: GeoResult) => void };

export function CitySearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(query, 300);

  const { data, isFetching } = useQuery({
    queryKey: ["geo", debounced],
    queryFn: ({ signal }) => searchCities(debounced, signal),
    enabled: debounced.trim().length >= 2,
    staleTime: 60_000,
  });

  const results = data ?? [];

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search for a city..."
          className="pl-9 pr-9 h-12 text-base"
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && debounced.trim().length >= 2 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
          {results.length === 0 && !isFetching ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">No matches</div>
          ) : (
            <ul className="max-h-80 overflow-auto">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSelect(r);
                      setQuery(`${r.name}${r.country ? `, ${r.country}` : ""}`);
                      setOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-start gap-2 px-4 py-2.5 text-left text-sm hover:bg-primary hover:text-primary-foreground"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1">
                      <span className="font-medium">{r.name}</span>
                      {r.admin1 && <span className="text-muted-foreground">, {r.admin1}</span>}
                      {r.country && <span className="text-muted-foreground"> · {r.country}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
