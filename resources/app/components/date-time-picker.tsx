import * as React from "react";
import { format } from "date-fns";
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
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [timeValue, setTimeValue] = React.useState(
    value ? format(new Date(value), "HH:mm") : "12:00"
  );

  React.useEffect(() => {
    if (value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
          setTimeValue(format(date, "HH:mm"));
        }
      } catch (error) {
        console.error("Invalid date value:", value);
      }
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const [hours, minutes] = timeValue.split(":");
    const newDate = new Date(date);
    newDate.setHours(
      parseInt(hours || "0", 10),
      parseInt(minutes || "0", 10),
      0,
      0
    );

    setSelectedDate(newDate);

    // Format as Y-m-d H:i:s for backend
    const formattedDate = format(newDate, "yyyy-MM-dd HH:mm:ss");
    onChange(formattedDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (selectedDate) {
      const [hours, minutes] = newTime.split(":");
      const newDate = new Date(selectedDate);
      newDate.setHours(
        parseInt(hours || "0", 10),
        parseInt(minutes || "0", 10),
        0,
        0
      );

      setSelectedDate(newDate);

      // Format as Y-m-d H:i:s for backend
      const formattedDate = format(newDate, "yyyy-MM-dd HH:mm:ss");
      onChange(formattedDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
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
        </div>
      </PopoverContent>
    </Popover>
  );
}
