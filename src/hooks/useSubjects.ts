import { useState, useCallback } from "react";

export interface Subject {
  subject_id: number;
  subject_name: string;
  semester: number;
  department: string;
}

const STORAGE_KEY = "sms_subjects";

const sampleSubjects: Subject[] = [
  { subject_id: 1, subject_name: "Data Structures", semester: 3, department: "Computer Science" },
  { subject_id: 2, subject_name: "Database Management", semester: 4, department: "Computer Science" },
  { subject_id: 3, subject_name: "Operating Systems", semester: 4, department: "Computer Science" },
  { subject_id: 4, subject_name: "Computer Networks", semester: 5, department: "Information Technology" },
  { subject_id: 5, subject_name: "Digital Electronics", semester: 3, department: "Electronics" },
  { subject_id: 6, subject_name: "Web Technologies", semester: 3, department: "Information Technology" },
  { subject_id: 7, subject_name: "Thermodynamics", semester: 4, department: "Mechanical" },
];

function load(): Subject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleSubjects));
  return sampleSubjects;
}

function save(list: Subject[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>(load);

  const addSubject = useCallback((data: Omit<Subject, "subject_id">) => {
    setSubjects((prev) => {
      const maxId = prev.reduce((m, s) => Math.max(m, s.subject_id), 0);
      const next = [...prev, { ...data, subject_id: maxId + 1 }];
      save(next);
      return next;
    });
  }, []);

  const updateSubject = useCallback((updated: Subject) => {
    setSubjects((prev) => {
      const next = prev.map((s) => (s.subject_id === updated.subject_id ? updated : s));
      save(next);
      return next;
    });
  }, []);

  const removeSubject = useCallback((id: number) => {
    setSubjects((prev) => {
      const next = prev.filter((s) => s.subject_id !== id);
      save(next);
      return next;
    });
  }, []);

  return { subjects, addSubject, updateSubject, removeSubject };
}
