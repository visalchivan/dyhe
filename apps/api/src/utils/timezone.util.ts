/**
 * Timezone utility for consistent handling of Asia/Phnom_Penh timezone (UTC+07:00)
 * 
 * All dates in the database are stored in UTC, but we need to:
 * 1. Convert user input dates (YYYY-MM-DD in Phnom Penh timezone) to UTC for database queries
 * 2. Format dates from the database (UTC) to Phnom Penh timezone for display
 */

/**
 * System timezone constant
 */
export const SYSTEM_TIMEZONE = 'Asia/Phnom_Penh';

/**
 * Get current date in Phnom Penh timezone as YYYY-MM-DD string
 */
export function getTodayPhnomPenh(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SYSTEM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Get a date N days ago in Phnom Penh timezone as YYYY-MM-DD string
 */
export function getDateDaysAgoPhnomPenh(days: number): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SYSTEM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatter.format(date);
}

/**
 * Convert a YYYY-MM-DD date string (Phnom Penh timezone) to a Date object at start of day
 * This creates a Date object that represents the start of the day in Phnom Penh timezone (00:00:00+07:00)
 * The Date object will be in UTC internally, which Prisma will use correctly for database queries
 */
export function createPhnomPenhDateAtStart(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00+07:00`);
}

/**
 * Convert a YYYY-MM-DD date string (Phnom Penh timezone) to a Date object at end of day
 * This creates a Date object that represents the end of the day in Phnom Penh timezone (23:59:59.999+07:00)
 * The Date object will be in UTC internally, which Prisma will use correctly for database queries
 */
export function createPhnomPenhDateAtEnd(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999+07:00`);
}

/**
 * Create a Date object for a specific date and time in Phnom Penh timezone
 * @param dateStr YYYY-MM-DD date string
 * @param hour Hour (0-23)
 * @param minute Minute (0-59)
 * @param second Second (0-59), default 0
 */
export function createPhnomPenhDateTime(
  dateStr: string,
  hour: number = 0,
  minute: number = 0,
  second: number = 0,
): Date {
  return new Date(
    `${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}+07:00`
  );
}

/**
 * Convert a Date object (UTC from database) to Phnom Penh timezone and format as YYYY-MM-DD
 */
export function formatDatePhnomPenh(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SYSTEM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Format a Date object (UTC from database) to a localized date string in Phnom Penh timezone
 */
export function formatLocalizedDatePhnomPenh(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: SYSTEM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Format a Date object (UTC from database) to a localized time string in Phnom Penh timezone
 */
export function formatLocalizedTimePhnomPenh(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: SYSTEM_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Format a Date object (UTC from database) to a localized date and time string in Phnom Penh timezone
 */
export function formatLocalizedDateTimePhnomPenh(date: Date): string {
  return `${formatLocalizedDatePhnomPenh(date)} ${formatLocalizedTimePhnomPenh(date)}`;
}

/**
 * Get start of today in Phnom Penh timezone as a Date object
 * This can be used for database queries to get "today" packages
 */
export function getStartOfTodayPhnomPenh(): Date {
  const todayStr = getTodayPhnomPenh();
  return createPhnomPenhDateAtStart(todayStr);
}

/**
 * Get end of today in Phnom Penh timezone as a Date object
 * This can be used for database queries to get "today" packages
 */
export function getEndOfTodayPhnomPenh(): Date {
  const todayStr = getTodayPhnomPenh();
  return createPhnomPenhDateAtEnd(todayStr);
}

/**
 * Parse a date string (YYYY-MM-DD) and convert it to a Date range for database queries
 * If the string is invalid or empty, returns undefined
 */
export function parseDateRangeForQuery(
  startDateStr?: string,
  endDateStr?: string,
): { start?: Date; end?: Date } | undefined {
  if (!startDateStr && !endDateStr) {
    return undefined;
  }

  const range: { start?: Date; end?: Date } = {};

  if (startDateStr) {
    range.start = createPhnomPenhDateAtStart(startDateStr);
  }

  if (endDateStr) {
    range.end = createPhnomPenhDateAtEnd(endDateStr);
  }

  return range;
}

