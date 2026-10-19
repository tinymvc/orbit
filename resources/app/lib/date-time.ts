/** UTC timestamps are instants; YYYY-MM-DD values are local calendar dates. */
export type DateInput = Date | string | number | null | undefined;

const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
const utcWithoutZone =
  /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/;

export function parseDate(input: DateInput): Date | null {
  if (input == null || input === "") return null;

  let date: Date;
  if (typeof input === "string") {
    const value = input.trim();
    if (dateOnly.test(value)) {
      date = new Date(`${value}T00:00:00`);
      if (toDateInput(date) !== value) return null;
    } else {
      if (
        !/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/i.test(
          value,
        )
      )
        return null;
      const calendar = new Date(`${value.slice(0, 10)}T12:00:00`);
      if (toDateInput(calendar) !== value.slice(0, 10)) return null;
      date = new Date(
        utcWithoutZone.test(value) ? `${value.replace(" ", "T")}Z` : value,
      );
    }
  } else {
    date = new Date(input);
  }

  return Number.isNaN(date.getTime()) ? null : date;
}

/** A calendar date has no UTC offset and must never shift across days. */
export function toDateInput(date: Date): string {
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDate(input: DateInput, includeTime = false): string {
  const date = parseDate(input);
  if (!date) return "—";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(includeTime && !(typeof input === "string" && dateOnly.test(input))
      ? ({ hour: "numeric", minute: "2-digit" } as const)
      : {}),
  }).format(date);
}

/** Interpret a calendar selection and clock time in the browser timezone. */
export function localDateTimeToUtc(date: Date, time: string): string | null {
  if (Number.isNaN(date.getTime()) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [hours = NaN, minutes = NaN] = time.split(":").map(Number);
  if (hours > 23 || minutes > 59) return null;

  const local = new Date(date);
  local.setHours(hours, minutes, 0, 0);
  // DST gaps do not represent a real local clock time.
  if (local.getHours() !== hours || local.getMinutes() !== minutes) return null;
  return local.toISOString();
}
