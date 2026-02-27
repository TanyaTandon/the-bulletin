/**
 * Types and helpers for the printable calendar and continuation page.
 * UserEvent = events keyed by date string (YYYY-MM-DD) → CalendarNote[].
 * Each "user" also has a label and colorClass for rendering.
 */

export interface CalendarNote {
  note: string;
  date?: Date;
}

/** One user's events: date string (YYYY-MM-DD) → notes for that day */
export type UserEvent = Record<string, CalendarNote[]>;

export interface UserEventInput {
  /** Events by date string (YYYY-MM-DD) */
  events: UserEvent;
  /** Display label e.g. "TT. Tanya Tandon" */
  label: string;
  /** CSS class for chip color e.g. "evt-tt" */
  colorClass: string;
}

export interface CellEvent {
  label: string;
  note: string;
  colorClass: string;
}

export interface CellInfo {
  /** Day of month (1-31) or null for empty cell */
  dateNum: number | null;
  /** Events to show in the cell (capped by maxEventsPerCell) */
  events: CellEvent[];
  /** Number of additional events that overflow to continuation */
  overflowCount: number;
}

export interface OverflowEvent {
  label: string;
  note: string;
  colorClass: string;
}

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Build calendar grid and overflow for a given month.
 * Grid is 7 columns × 5 rows (Sun–Sat, 5 weeks); first/last cells may be empty.
 */
export function getCalendarGrid(
  month: Date,
  userEvents: UserEventInput[],
  maxEventsPerCell: number = 5
): { cells: CellInfo[]; overflowByDate: Record<string, OverflowEvent[]> } {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayOfWeek = first.getDay(); // 0 = Sunday

  const overflowByDate: Record<string, OverflowEvent[]> = {};

  // Build flat list of (dateNum, dayOfMonth) for 35 cells (5 rows × 7 cols)
  const cells: CellInfo[] = [];
  let cellIndex = 0;
  const leadingBlanks = firstDayOfWeek;
  const totalCells = 7 * 5;

  for (let i = 0; i < totalCells; i++) {
    const dateNum = i - leadingBlanks + 1;
    const isInMonth = dateNum >= 1 && dateNum <= daysInMonth;

    if (!isInMonth) {
      cells.push({ dateNum: null, events: [], overflowCount: 0 });
      continue;
    }

    const date = new Date(year, monthIndex, dateNum);
    const dateKey = toDateKey(date);

    const allEvents: CellEvent[] = [];
    for (const u of userEvents) {
      const notes = u.events[dateKey] ?? [];
      for (const n of notes) {
        allEvents.push({
          label: u.label,
          note: n.note,
          colorClass: u.colorClass,
        });
      }
    }

    const visible = allEvents.slice(0, maxEventsPerCell);
    const overflow = allEvents.slice(maxEventsPerCell);
    if (overflow.length > 0) {
      overflowByDate[dateKey] = overflow.map((e) => ({
        label: e.label,
        note: e.note,
        colorClass: e.colorClass,
      }));
    }

    cells.push({
      dateNum,
      events: visible,
      overflowCount: overflow.length,
    });
  }

  return { cells, overflowByDate };
}

/**
 * Format a date key (YYYY-MM-DD) as MM/DD for continuation page headers.
 */
export function formatDateKeyForContinuation(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  return `${m}/${d}`;
}

/** Payload to inject into calendar-template.html: replace __CALENDAR_PAYLOAD__ with JSON.stringify(result) */
export interface CalendarPayload {
  dayNames: string[];
  cells: CellInfo[];
}

/**
 * Build the payload for the calendar HTML template.
 * Fetch calendar-template.html, replace __CALENDAR_PAYLOAD__ with JSON.stringify(buildCalendarPayload(...)), then serve or print.
 */
export function buildCalendarPayload(
  month: Date,
  userEvents: UserEventInput[],
  maxEventsPerCell?: number
): CalendarPayload {
  const { cells } = getCalendarGrid(month, userEvents, maxEventsPerCell);
  return {
    dayNames: [...DAY_NAMES],
    cells,
  };
}

/** Payload to inject into calendar-continuation-template.html: replace __CONTINUATION_PAYLOAD__ with JSON.stringify(result) */
export interface ContinuationPayload {
  monthName: string;
  users: { label: string; colorClass: string }[];
  overflowByDate: Record<string, OverflowEvent[]>;
}

/**
 * Build the payload for the continuation HTML template.
 * Use the same month and userEvents as the calendar; overflowByDate comes from getCalendarGrid(month, userEvents).overflowByDate.
 */
export function buildContinuationPayload(
  month: Date,
  userEvents: UserEventInput[],
  overflowByDate: Record<string, OverflowEvent[]>
): ContinuationPayload {
  const monthName = month.toLocaleString("default", { month: "long" });
  return {
    monthName,
    users: userEvents.map((u) => ({ label: u.label, colorClass: u.colorClass })),
    overflowByDate,
  };
}

export { DAY_NAMES };
