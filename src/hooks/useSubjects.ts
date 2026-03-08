import { useState, useCallback } from "react";

export interface Subject {
  subject_id: number;
  subject_name: string;
  semester: number;
  department: string;
}

const STORAGE_KEY = "sms_subjects";

const sampleSubjects: Subject[] = [
  // Semester 1
  { subject_id: 1, subject_name: "Engineering Mathematics I", semester: 1, department: "Computer Science" },
  { subject_id: 2, subject_name: "Engineering Physics", semester: 1, department: "Computer Science" },
  { subject_id: 3, subject_name: "Basic Civil & Mechanical", semester: 1, department: "Computer Science" },
  { subject_id: 4, subject_name: "Programming in C", semester: 1, department: "Computer Science" },
  // Semester 2
  { subject_id: 5, subject_name: "Engineering Mathematics II", semester: 2, department: "Computer Science" },
  { subject_id: 6, subject_name: "Engineering Chemistry", semester: 2, department: "Computer Science" },
  { subject_id: 7, subject_name: "Engineering Graphics", semester: 2, department: "Computer Science" },
  { subject_id: 8, subject_name: "Professional Communication", semester: 2, department: "Computer Science" },
  // Semester 3
  { subject_id: 9, subject_name: "Data Structures", semester: 3, department: "Computer Science" },
  { subject_id: 10, subject_name: "Discrete Mathematics", semester: 3, department: "Computer Science" },
  { subject_id: 11, subject_name: "Object Oriented Programming", semester: 3, department: "Computer Science" },
  { subject_id: 12, subject_name: "Digital Logic Design", semester: 3, department: "Computer Science" },
  // Semester 4
  { subject_id: 13, subject_name: "Database Management Systems", semester: 4, department: "Computer Science" },
  { subject_id: 14, subject_name: "Operating Systems", semester: 4, department: "Computer Science" },
  { subject_id: 15, subject_name: "Computer Organization", semester: 4, department: "Computer Science" },
  { subject_id: 16, subject_name: "Design & Analysis of Algorithms", semester: 4, department: "Computer Science" },
  // Semester 5
  { subject_id: 17, subject_name: "Computer Networks", semester: 5, department: "Computer Science" },
  { subject_id: 18, subject_name: "Software Engineering", semester: 5, department: "Computer Science" },
  { subject_id: 19, subject_name: "Theory of Computation", semester: 5, department: "Computer Science" },
  { subject_id: 20, subject_name: "Web Technologies", semester: 5, department: "Computer Science" },
  // Semester 6
  { subject_id: 21, subject_name: "Compiler Design", semester: 6, department: "Computer Science" },
  { subject_id: 22, subject_name: "Artificial Intelligence", semester: 6, department: "Computer Science" },
  { subject_id: 23, subject_name: "Cryptography", semester: 6, department: "Computer Science" },
  { subject_id: 24, subject_name: "Cloud Computing", semester: 6, department: "Computer Science" },
  // Semester 7
  { subject_id: 25, subject_name: "Machine Learning", semester: 7, department: "Computer Science" },
  { subject_id: 26, subject_name: "Distributed Systems", semester: 7, department: "Computer Science" },
  { subject_id: 27, subject_name: "Elective I", semester: 7, department: "Computer Science" },
  { subject_id: 28, subject_name: "Project Phase I", semester: 7, department: "Computer Science" },
  // Semester 8
  { subject_id: 29, subject_name: "Deep Learning", semester: 8, department: "Computer Science" },
  { subject_id: 30, subject_name: "Elective II", semester: 8, department: "Computer Science" },
  { subject_id: 31, subject_name: "Project Phase II", semester: 8, department: "Computer Science" },
  { subject_id: 32, subject_name: "Comprehensive Viva", semester: 8, department: "Computer Science" },
];

function load(): Subject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.length >= 20) return parsed;
    }
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
