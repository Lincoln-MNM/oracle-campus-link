import { useState, useCallback } from "react";

export type EventType = "Exam" | "Holiday" | "Workshop" | "Project Submission" | "Other";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: EventType;
  description?: string;
}

const STORAGE_KEY = "sms_calendar_events";

const sampleEvents: CalendarEvent[] = [
  { id: "ev-1", title: "Mid-Semester Exams Begin", date: "2026-03-15", type: "Exam", description: "Semester 4 mid-semester exams" },
  { id: "ev-2", title: "Mid-Semester Exams End", date: "2026-03-22", type: "Exam" },
  { id: "ev-3", title: "Holi Holiday", date: "2026-03-10", type: "Holiday", description: "Festival of Colors" },
  { id: "ev-4", title: "AWS Cloud Workshop", date: "2026-03-20", type: "Workshop", description: "2-day workshop on cloud services" },
  { id: "ev-5", title: "DBMS Project Submission", date: "2026-03-28", type: "Project Submission", description: "Final DBMS project due" },
  { id: "ev-6", title: "Sports Day", date: "2026-03-25", type: "Other", description: "Annual sports day" },
  { id: "ev-7", title: "End Semester Exams", date: "2026-04-15", type: "Exam", description: "Semester 4 final exams" },
  { id: "ev-8", title: "Good Friday", date: "2026-04-03", type: "Holiday" },
  { id: "ev-9", title: "Web Tech Workshop", date: "2026-04-08", type: "Workshop" },
  { id: "ev-10", title: "Algorithm Project Due", date: "2026-03-30", type: "Project Submission" },
];

function load(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleEvents));
  return sampleEvents;
}

function save(list: CalendarEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>(load);

  const addEvent = useCallback((data: Omit<CalendarEvent, "id">) => {
    setEvents((prev) => {
      const next = [...prev, { ...data, id: `ev-${Date.now()}` }];
      save(next);
      return next;
    });
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { events, addEvent, removeEvent };
}
