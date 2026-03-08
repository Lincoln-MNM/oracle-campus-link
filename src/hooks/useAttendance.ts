import { useState, useCallback } from "react";

export type AttendanceStatus = "P" | "A" | "L";

export interface AttendanceRecord {
  id: string;
  student_id: number;
  date: string; // YYYY-MM-DD
  period: number; // 1-6
  subject_id: number;
  status: AttendanceStatus;
}

export interface TimetableSlot {
  period: number;
  subject_id: number;
  subject_name: string;
}

const STORAGE_KEY = "sms_attendance";
const TIMETABLE_KEY = "sms_timetable";

// Default timetable (Mon-Sat, 6 periods each)
const defaultTimetable: Record<string, TimetableSlot[]> = {
  Monday: [
    { period: 1, subject_id: 13, subject_name: "Database Management Systems" },
    { period: 2, subject_id: 14, subject_name: "Operating Systems" },
    { period: 3, subject_id: 15, subject_name: "Computer Organization" },
    { period: 4, subject_id: 16, subject_name: "Design & Analysis of Algorithms" },
    { period: 5, subject_id: 13, subject_name: "Database Management Systems" },
    { period: 6, subject_id: 14, subject_name: "Operating Systems" },
  ],
  Tuesday: [
    { period: 1, subject_id: 15, subject_name: "Computer Organization" },
    { period: 2, subject_id: 16, subject_name: "Design & Analysis of Algorithms" },
    { period: 3, subject_id: 13, subject_name: "Database Management Systems" },
    { period: 4, subject_id: 14, subject_name: "Operating Systems" },
    { period: 5, subject_id: 15, subject_name: "Computer Organization" },
    { period: 6, subject_id: 16, subject_name: "Design & Analysis of Algorithms" },
  ],
  Wednesday: [
    { period: 1, subject_id: 13, subject_name: "Database Management Systems" },
    { period: 2, subject_id: 14, subject_name: "Operating Systems" },
    { period: 3, subject_id: 16, subject_name: "Design & Analysis of Algorithms" },
    { period: 4, subject_id: 15, subject_name: "Computer Organization" },
    { period: 5, subject_id: 13, subject_name: "Database Management Systems" },
    { period: 6, subject_id: 14, subject_name: "Operating Systems" },
  ],
  Thursday: [
    { period: 1, subject_id: 16, subject_name: "Design & Analysis of Algorithms" },
    { period: 2, subject_id: 13, subject_name: "Database Management Systems" },
    { period: 3, subject_id: 14, subject_name: "Operating Systems" },
    { period: 4, subject_id: 15, subject_name: "Computer Organization" },
    { period: 5, subject_id: 16, subject_name: "Design & Analysis of Algorithms" },
    { period: 6, subject_id: 13, subject_name: "Database Management Systems" },
  ],
  Friday: [
    { period: 1, subject_id: 14, subject_name: "Operating Systems" },
    { period: 2, subject_id: 15, subject_name: "Computer Organization" },
    { period: 3, subject_id: 13, subject_name: "Database Management Systems" },
    { period: 4, subject_id: 16, subject_name: "Design & Analysis of Algorithms" },
    { period: 5, subject_id: 14, subject_name: "Operating Systems" },
    { period: 6, subject_id: 15, subject_name: "Computer Organization" },
  ],
  Saturday: [
    { period: 1, subject_id: 13, subject_name: "Database Management Systems" },
    { period: 2, subject_id: 16, subject_name: "Design & Analysis of Algorithms" },
    { period: 3, subject_id: 15, subject_name: "Computer Organization" },
    { period: 4, subject_id: 14, subject_name: "Operating Systems" },
    { period: 5, subject_id: 13, subject_name: "Database Management Systems" },
    { period: 6, subject_id: 16, subject_name: "Design & Analysis of Algorithms" },
  ],
};

function generateSampleAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  for (let d = 7; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dayName = days[date.getDay()];
    if (dayName === "Sunday") continue;

    const dateStr = date.toISOString().split("T")[0];
    const slots = defaultTimetable[dayName];
    if (!slots) continue;

    for (let studentId = 1; studentId <= 10; studentId++) {
      for (const slot of slots) {
        const rand = Math.random();
        const status: AttendanceStatus = rand > 0.15 ? "P" : rand > 0.05 ? "A" : "L";
        records.push({
          id: `${dateStr}-${studentId}-${slot.period}`,
          student_id: studentId,
          date: dateStr,
          period: slot.period,
          subject_id: slot.subject_id,
          status,
        });
      }
    }
  }
  return records;
}

function loadAttendance(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  const data = generateSampleAttendance();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

function loadTimetable(): Record<string, TimetableSlot[]> {
  try {
    const raw = localStorage.getItem(TIMETABLE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  localStorage.setItem(TIMETABLE_KEY, JSON.stringify(defaultTimetable));
  return defaultTimetable;
}

function saveAttendance(list: AttendanceRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function saveTimetable(tt: Record<string, TimetableSlot[]>) {
  localStorage.setItem(TIMETABLE_KEY, JSON.stringify(tt));
}

export function useAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>(loadAttendance);
  const [timetable, setTimetable] = useState<Record<string, TimetableSlot[]>>(loadTimetable);

  const markAttendance = useCallback((record: AttendanceRecord) => {
    setRecords((prev) => {
      const exists = prev.findIndex((r) => r.id === record.id);
      const next = exists >= 0 ? prev.map((r, i) => (i === exists ? record : r)) : [...prev, record];
      saveAttendance(next);
      return next;
    });
  }, []);

  const bulkMark = useCallback((newRecords: AttendanceRecord[]) => {
    setRecords((prev) => {
      const map = new Map(prev.map((r) => [r.id, r]));
      newRecords.forEach((r) => map.set(r.id, r));
      const next = Array.from(map.values());
      saveAttendance(next);
      return next;
    });
  }, []);

  const updateTimetableSlot = useCallback((day: string, period: number, subjectId: number, subjectName: string) => {
    setTimetable((prev) => {
      const next = { ...prev };
      if (next[day]) {
        next[day] = next[day].map((s) =>
          s.period === period ? { ...s, subject_id: subjectId, subject_name: subjectName } : s
        );
      }
      saveTimetable(next);
      return next;
    });
  }, []);

  return { records, timetable, markAttendance, bulkMark, updateTimetableSlot };
}
