import { useCallback, useMemo, useState } from "react";
import { CalendarIcon, ChevronRight } from "lucide-react";
import { format, subDays } from "date-fns";
import { router } from "@inertiajs/react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateRangeConfig {
  route: string;
  from: string | null;
  to: string | null;
  presets: { label: string; days: number }[];
}

interface DashboardHeaderProps {
  title: string;
  description?: string;
  dateRange?: DateRangeConfig;
}

export function DashboardHeader({
  title,
  description,
  dateRange,
}: DashboardHeaderProps) {
  const initialFrom = dateRange?.from ? new Date(dateRange.from) : undefined;
  const initialTo = dateRange?.to ? new Date(dateRange.to) : undefined;

  const [range, setRange] = useState<{ from?: Date; to?: Date }>({
    from: initialFrom,
    to: initialTo,
  });
  const [open, setOpen] = useState(false);

  /** Navigate to the dashboard route with from/to query params */
  const applyRange = useCallback(
    (from: Date, to: Date) => {
      if (!dateRange?.route) return;
      router.get(
        dateRange.route,
        {
          from: format(from, "yyyy-MM-dd"),
          to: format(to, "yyyy-MM-dd"),
        },
        { preserveState: true, preserveScroll: true },
      );
      setOpen(false);
    },
    [dateRange?.route],
  );

  /** Quick-select a preset (e.g. last 7 days) */
  const applyPreset = useCallback(
    (days: number) => {
      const to = new Date();
      const from = subDays(to, days);
      setRange({ from, to });
      applyRange(from, to);
    },
    [applyRange],
  );

  /** Label shown on the badge below the title */
  const dateRangeLabel = useMemo(() => {
    if (!range.from || !range.to) return null;
    return `${format(range.from, "MMM dd, yyyy")} – ${format(range.to, "MMM dd, yyyy")}`;
  }, [range.from, range.to]);

  return (
    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        {/* Title + date badge */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {dateRangeLabel ? (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>Showing results for</span>
              <Badge variant="secondary" className="font-normal">
                {dateRangeLabel}
              </Badge>
            </p>
          ) : (
            description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )
          )}
        </div>

        {/* Date Range Selector */}
        {dateRange && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "min-w-70 justify-start text-left font-normal",
                  !range.from && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {range.from && range.to ? (
                  <>
                    {format(range.from, "MMM dd, yyyy")}
                    <ChevronRight className="text-muted-foreground mx-1 h-4 w-4" />
                    {format(range.to, "MMM dd, yyyy")}
                  </>
                ) : (
                  "Select date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={range.from}
                selected={{ from: range.from, to: range.to }}
                onSelect={(selected) => {
                  if (selected) {
                    setRange({ from: selected.from, to: selected.to });
                    // Auto-apply when both dates are selected
                    if (selected.from && selected.to) {
                      applyRange(selected.from, selected.to);
                    }
                  }
                }}
                numberOfMonths={2}
              />
              {dateRange.presets.length > 0 && (
                <div className="bg-muted/50 border-t p-3">
                  <div className="flex gap-2">
                    {dateRange.presets.map((preset) => (
                      <Button
                        key={preset.days}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => applyPreset(preset.days)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
