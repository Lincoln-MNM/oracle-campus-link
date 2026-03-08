import { useState, useCallback } from "react";

export interface Student {
  student_id: number;
  uid: string;
  name: string;
  department: string;
  semester: number;
  email: string;
  phone?: string;
  password?: string;
  photo_url?: string;
  registered?: boolean;
}

const STORAGE_KEY = "sms_students";

const firstNames = [
  "Gouri Nandhana", "Aardra Jee", "Aavani U", "Abraham Chirayath Martin", "Adithya Sreepad BS",
  "Akash Kumar", "Ananya Nair", "Arjun Menon", "Bhavya Raj", "Chaitra S",
  "Deepak Mohan", "Divya Lakshmi", "Eshan Varma", "Fathima Zahra", "Ganesh Pillai",
  "Harini Devi", "Ishaan Bhat", "Jaya Krishnan", "Kavya Suresh", "Lakshmi Priya",
  "Manoj Thomas", "Neha George", "Om Prakash", "Pooja Menon", "Rahul Das",
  "Sanjana Nair", "Tejas Kumar", "Uma Maheshwari", "Varun Krishnan", "Wafa Siddiqui",
  "Xavier Joseph", "Yamini Reddy", "Zaid Ahmed", "Aditya Raj", "Bhoomika Shetty",
  "Chirag Patel", "Diya Sharma", "Eshwar Nair", "Faisal Khan", "Gayathri Menon",
  "Hari Prasad", "Isha Gupta", "Jayesh Pillai", "Krithika Rajan", "Lekha Suresh",
  "Meera Krishnan", "Nithin Thomas", "Oviya Raj", "Pranav Mohan", "Riya Nair",
];

const sampleStudents: Student[] = firstNames.map((name, i) => ({
  student_id: i + 1,
  uid: `U2408${String(i + 1).padStart(3, "0")}`,
  name,
  department: "Computer Science",
  semester: 4,
  email: `${name.split(" ")[0].toLowerCase()}@rajagiri.edu`,
  phone: `98765${String(43210 + i).slice(-5)}`,
  password: "demo123",
  registered: i < 10, // First 10 students are pre-registered
}));

function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migration: if old data without uid, replace with new
      if (parsed.length > 0 && !parsed[0].uid) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleStudents));
        return sampleStudents;
      }
      return parsed;
    }
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
      const maxId = prev.reduce((m, s) => Math.max(m, s.student_id), 0);
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
