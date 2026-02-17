import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerProps = {
  value?: string | Date;
  onChange: (value: string) => void;
  disabled?: boolean;
  disablePast?: boolean;
  disableFuture?: boolean;
};

export function DatePicker({
  value,
  onChange,
  disabled = false,
  disablePast = true,
  disableFuture = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date"
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          {date ? date.toLocaleDateString() : "Select date"}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          disabled={(date) =>
            (disablePast && date < new Date(new Date().setHours(0, 0, 0, 0))) ||
            (disableFuture &&
              date > new Date(new Date().setHours(23, 59, 59, 999)))
          }
          onSelect={(date) => {
            setDate(date);
            if (date) {
              onChange(format(date, "yyyy-MM-dd"));
            }
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
