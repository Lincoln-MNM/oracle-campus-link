import { useState, useCallback } from "react";

export interface Student {
  student_id: number;
  name: string;
  department: string;
  semester: number;
  email: string;
  phone?: string;
  password?: string;
}

const STORAGE_KEY = "sms_students";

const sampleStudents: Student[] = [
  { student_id: 1001, name: "Aarav Sharma", department: "Computer Science", semester: 4, email: "aarav@university.edu", phone: "9876543210" },
  { student_id: 1002, name: "Priya Patel", department: "Information Technology", semester: 3, email: "priya@university.edu", phone: "9876543211" },
  { student_id: 1003, name: "Rahul Verma", department: "Electronics", semester: 6, email: "rahul@university.edu", phone: "9876543212" },
  { student_id: 1004, name: "Sneha Gupta", department: "Computer Science", semester: 2, email: "sneha@university.edu" },
  { student_id: 1005, name: "Vikram Singh", department: "Mechanical", semester: 5, email: "vikram@university.edu" },
];

function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleStudents));
  return sampleStudents;
}

function saveStudents(list: Student[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>(loadStudents);

  const persist = useCallback((next: Student[]) => {
    setStudents(next);
    saveStudents(next);
  }, []);

  const addStudent = useCallback((data: Omit<Student, "student_id">) => {
    setStudents((prev) => {
      const maxId = prev.reduce((m, s) => Math.max(m, s.student_id), 1000);
      const next = [...prev, { ...data, student_id: maxId + 1 }];
      saveStudents(next);
      return next;
    });
  }, []);

  const updateStudent = useCallback((updated: Student) => {
    setStudents((prev) => {
      const next = prev.map((s) => (s.student_id === updated.student_id ? updated : s));
      saveStudents(next);
      return next;
    });
  }, []);

  const removeStudent = useCallback((id: number) => {
    setStudents((prev) => {
      const next = prev.filter((s) => s.student_id !== id);
      saveStudents(next);
      return next;
    });
  }, []);

  return { students, addStudent, updateStudent, removeStudent, persist };
}
