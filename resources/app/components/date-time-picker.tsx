import * as React from "react";
import { format } from "date-fns";
import { localDateTimeToUtc, parseDate } from "@/lib/date-time";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DateTimePickerProps = {
  value?: string | Date;
  onChange: (value: string) => void;
  disabled?: boolean;
  disablePast?: boolean;
  disableFuture?: boolean;
};

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  disablePast = false,
  disableFuture = false,
}: DateTimePickerProps) {
  const initialDate = parseDate(value);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    initialDate ?? undefined,
  );
  const [timeValue, setTimeValue] = React.useState(
    initialDate ? format(initialDate, "HH:mm") : "12:00",
  );
  const [timeError, setTimeError] = React.useState("");

  React.useEffect(() => {
    const date = parseDate(value);
    setSelectedDate(date ?? undefined);
    setTimeValue(date ? format(date, "HH:mm") : "12:00");
    setTimeError("");
  }, [value]);

  const commit = (date: Date, time: string) => {
    const utc = localDateTimeToUtc(date, time);
    if (!utc) {
      setTimeError(
        "Choose a valid local time. This time may be skipped by daylight saving.",
      );
      return;
    }
    setTimeError("");
    setSelectedDate(new Date(utc));
    onChange(utc);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) commit(date, timeValue);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = event.target.value;
    setTimeValue(time);
    if (selectedDate) commit(selectedDate, time);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            <span>{format(selectedDate, "PPP 'at' HH:mm")}</span>
          ) : (
            <span>Pick a date and time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) =>
            (disablePast && date < new Date(new Date().setHours(0, 0, 0, 0))) ||
            (disableFuture &&
              date > new Date(new Date().setHours(23, 59, 59, 999)))
          }
        />
        <div className="p-3 border-t">
          <Label className="text-xs mb-2 block">Time</Label>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="flex-1"
            />
          </div>
          {timeError && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {timeError}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
