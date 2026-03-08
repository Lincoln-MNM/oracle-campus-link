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

// Generate sample marks for first 10 students across semesters 1-4
function generateSampleMarks(): Mark[] {
  const marks: Mark[] = [];
  let id = 1;
  for (let studentId = 1; studentId <= 10; studentId++) {
    // Semester 1 subjects (1-4)
    for (let subjectId = 1; subjectId <= 4; subjectId++) {
      marks.push({ mark_id: id++, student_id: studentId, subject_id: subjectId, marks: Math.floor(55 + Math.random() * 40) });
    }
    // Semester 2 subjects (5-8)
    for (let subjectId = 5; subjectId <= 8; subjectId++) {
      marks.push({ mark_id: id++, student_id: studentId, subject_id: subjectId, marks: Math.floor(58 + Math.random() * 38) });
    }
    // Semester 3 subjects (9-12)
    for (let subjectId = 9; subjectId <= 12; subjectId++) {
      marks.push({ mark_id: id++, student_id: studentId, subject_id: subjectId, marks: Math.floor(60 + Math.random() * 35) });
    }
    // Semester 4 subjects (13-16)
    for (let subjectId = 13; subjectId <= 16; subjectId++) {
      marks.push({ mark_id: id++, student_id: studentId, subject_id: subjectId, marks: Math.floor(62 + Math.random() * 35) });
    }
  }
  return marks;
}

const sampleMarks = generateSampleMarks();

function load(): Mark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.length >= 50) return parsed;
    }
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
