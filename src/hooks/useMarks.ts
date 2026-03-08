import { useState, useCallback } from "react";

export interface Mark {
  mark_id: number;
  student_id: number;
  subject_id: number;
  marks: number;
}

export interface MarkJoined extends Mark {
  student_name: string;
  subject_name: string;
  department: string;
  semester: number;
}

const STORAGE_KEY = "sms_marks";

const sampleMarks: Mark[] = [
  { mark_id: 1, student_id: 1001, subject_id: 1, marks: 85 },
  { mark_id: 2, student_id: 1001, subject_id: 2, marks: 92 },
  { mark_id: 3, student_id: 1002, subject_id: 6, marks: 78 },
  { mark_id: 4, student_id: 1003, subject_id: 5, marks: 65 },
  { mark_id: 5, student_id: 1004, subject_id: 1, marks: 88 },
  { mark_id: 6, student_id: 1005, subject_id: 7, marks: 72 },
  { mark_id: 7, student_id: 1001, subject_id: 3, marks: 90 },
  { mark_id: 8, student_id: 1002, subject_id: 4, marks: 81 },
];

function load(): Mark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleMarks));
  return sampleMarks;
}

function save(list: Mark[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function useMarks() {
  const [marks, setMarks] = useState<Mark[]>(load);

  const addMark = useCallback((data: Omit<Mark, "mark_id">) => {
    setMarks((prev) => {
      const maxId = prev.reduce((m, r) => Math.max(m, r.mark_id), 0);
      const next = [...prev, { ...data, mark_id: maxId + 1 }];
      save(next);
      return next;
    });
  }, []);

  const updateMark = useCallback((updated: Mark) => {
    setMarks((prev) => {
      const next = prev.map((m) => (m.mark_id === updated.mark_id ? updated : m));
      save(next);
      return next;
    });
  }, []);

  const removeMark = useCallback((id: number) => {
    setMarks((prev) => {
      const next = prev.filter((m) => m.mark_id !== id);
      save(next);
      return next;
    });
  }, []);

  return { marks, addMark, updateMark, removeMark };
}
