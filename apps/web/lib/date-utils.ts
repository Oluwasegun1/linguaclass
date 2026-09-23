/**
 * Timezone and Date utilities for LinguaClass.
 * Handles storage normalization to UTC and multi-timezone client presentation.
 */

export const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris, Madrid, Berlin (CET/CEST)" },
  { value: "Europe/Rome", label: "Rome (CET/CEST)" },
  { value: "America/New_York", label: "New York, Toronto (EST/EDT)" },
  { value: "America/Chicago", label: "Chicago, Dallas (CST/CDT)" },
  { value: "America/Denver", label: "Denver, Phoenix (MST/MDT)" },
  { value: "America/Los_Angeles", label: "Los Angeles, Vancouver (PST/PDT)" },
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "Asia/Singapore", label: "Singapore, Hong Kong, Beijing (SGT/CST)" },
  { value: "Asia/Tokyo", label: "Tokyo, Seoul (JST/KST)" },
  { value: "Australia/Sydney", label: "Sydney, Melbourne (AEST/AEDT)" },
  { value: "Africa/Lagos", label: "Lagos, West Africa (WAT)" },
  { value: "Africa/Cairo", label: "Cairo, Eastern Europe (EET/EEST)" },
  { value: "Africa/Johannesburg", label: "Johannesburg (SAST)" },
];

/**
 * Gets the user's browser timezone or falls back to 'UTC'.
 */
export function getBrowserTimezone(): string {
  if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }
  return "UTC";
}

/**
 * Converts a date and time string (e.g. from an <input type="datetime-local"> like "2026-09-25T14:30")
 * in a specified IANA timezone (e.g. "Europe/Paris") into a true UTC ISO string ("2026-09-25T12:30:00.000Z").
 */
export function localToUtcIso(datetimeLocal: string, targetTimezone: string): string {
  if (!datetimeLocal) return "";
  
  // Create a base Date assuming local parts
  // Format is "YYYY-MM-DDTHH:mm"
  const [datePart, timePart] = datetimeLocal.split("T");
  if (!datePart || !timePart) return new Date(datetimeLocal).toISOString();

  const dateParts = datePart.split("-").map(Number);
  const timeParts = timePart.split(":").map(Number);

  const y = dateParts[0] ?? 2026;
  const m = dateParts[1] ?? 1;
  const d = dateParts[2] ?? 1;
  const hr = timeParts[0] ?? 0;
  const min = timeParts[1] ?? 0;

  // Use Intl to find the offset in milliseconds between targetTimezone and UTC for this moment
  // 1. Construct a date in UTC with those numbers
  const tentativeUtc = new Date(Date.UTC(y, m - 1, d, hr, min, 0));

  // 2. Format tentativeUtc in the target timezone to find how many minutes difference there is
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: targetTimezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(tentativeUtc);
  const partMap: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== "literal") {
      partMap[p.type] = parseInt(p.value, 10);
    }
  }

  // Calculate actual target timezone wall clock timestamp
  const tYear = partMap.year ?? y;
  const tMonth = partMap.month ?? m;
  const tDay = partMap.day ?? d;
  const tHour = (partMap.hour === 24 ? 0 : partMap.hour) ?? hr;
  const tMin = partMap.minute ?? min;
  const tSec = partMap.second ?? 0;

  const targetWallClockAsUtc = Date.UTC(
    tYear,
    tMonth - 1,
    tDay,
    tHour,
    tMin,
    tSec
  );

  const offsetMs = targetWallClockAsUtc - tentativeUtc.getTime();

  // Correct the UTC timestamp: UTC = wallClock - offset
  const correctUtcTimestamp = tentativeUtc.getTime() - offsetMs;
  return new Date(correctUtcTimestamp).toISOString();
}

/**
 * Converts a UTC Date or ISO string into an <input type="datetime-local"> value (YYYY-MM-DDTHH:mm)
 * displayed in a target timezone.
 */
export function utcToDateTimeLocalValue(utcDateInput: string | Date, targetTimezone: string): string {
  const d = typeof utcDateInput === "string" ? new Date(utcDateInput) : utcDateInput;
  if (isNaN(d.getTime())) return "";

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: targetTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") {
      partMap[p.type] = p.value;
    }
  }

  // hour "24" safety
  let hour = partMap.hour;
  if (hour === "24") hour = "00";

  return `${partMap.year}-${partMap.month}-${partMap.day}T${hour}:${partMap.minute}`;
}

/**
 * Formats a stored UTC date into a readable string in a target timezone.
 */
export function formatInTimezone(
  utcDateInput: string | Date,
  targetTimezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof utcDateInput === "string" ? new Date(utcDateInput) : utcDateInput;
  if (isNaN(d.getTime())) return "Invalid Date";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: targetTimezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  };

  return new Intl.DateTimeFormat("en-US", options || defaultOptions).format(d);
}

/**
 * Returns formatted local time and dual indicator if timezone differs from lesson origin or UTC.
 */
export function formatLessonTimes(
  utcDateInput: string | Date,
  lessonTimezone: string = "UTC",
  viewerTimezone: string = getBrowserTimezone()
): {
  viewerTime: string;
  lessonTzTime: string;
  utcTime: string;
  isSameTimezone: boolean;
} {
  const d = typeof utcDateInput === "string" ? new Date(utcDateInput) : utcDateInput;

  const viewerTime = formatInTimezone(d, viewerTimezone, {
    timeZone: viewerTimezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const lessonTzTime = formatInTimezone(d, lessonTimezone, {
    timeZone: lessonTimezone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const utcTime = formatInTimezone(d, "UTC", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return {
    viewerTime,
    lessonTzTime,
    utcTime,
    isSameTimezone: viewerTimezone === lessonTimezone,
  };
}
