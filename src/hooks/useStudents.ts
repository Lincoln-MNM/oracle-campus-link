import { useState, useCallback } from "react";
import { logActivity } from "./useActivityLog";

export interface Student {
  student_id: number;
  uid: string;
  rollNo: string;
  name: string;
  gender: string;
  department: string;
  course: string;
  semester: number;
  email: string;
  phone?: string;
  password?: string;
  photo_url?: string;
  registered?: boolean;
  father_name?: string;
  mother_name?: string;
  place?: string;
  blood_group?: string;
}

const STORAGE_KEY = "sms_students";

const studentNames: { name: string; gender: string }[] = [
  { name: "Arjun Nair", gender: "Male" },
  { name: "Ananya Das", gender: "Female" },
  { name: "Gouri Nandhana", gender: "Female" },
  { name: "Aardra Jee", gender: "Female" },
  { name: "Aavani U", gender: "Female" },
  { name: "Abraham Chirayath Martin", gender: "Male" },
  { name: "Adithya Sreepad BS", gender: "Male" },
  { name: "Akash Kumar", gender: "Male" },
  { name: "Bhavya Raj", gender: "Female" },
  { name: "Chaitra S", gender: "Female" },
  { name: "Deepak Mohan", gender: "Male" },
  { name: "Divya Lakshmi", gender: "Female" },
  { name: "Eshan Varma", gender: "Male" },
  { name: "Fathima Zahra", gender: "Female" },
  { name: "Ganesh Pillai", gender: "Male" },
  { name: "Harini Devi", gender: "Female" },
  { name: "Ishaan Bhat", gender: "Male" },
  { name: "Jaya Krishnan", gender: "Male" },
  { name: "Kavya Suresh", gender: "Female" },
  { name: "Lakshmi Priya", gender: "Female" },
  { name: "Manoj Thomas", gender: "Male" },
  { name: "Neha George", gender: "Female" },
  { name: "Om Prakash", gender: "Male" },
  { name: "Pooja Menon", gender: "Female" },
  { name: "Rahul Das", gender: "Male" },
  { name: "Sanjana Nair", gender: "Female" },
  { name: "Tejas Kumar", gender: "Male" },
  { name: "Uma Maheshwari", gender: "Female" },
  { name: "Varun Krishnan", gender: "Male" },
  { name: "Wafa Siddiqui", gender: "Female" },
  { name: "Xavier Joseph", gender: "Male" },
  { name: "Yamini Reddy", gender: "Female" },
  { name: "Zaid Ahmed", gender: "Male" },
  { name: "Aditya Raj", gender: "Male" },
  { name: "Bhoomika Shetty", gender: "Female" },
  { name: "Chirag Patel", gender: "Male" },
  { name: "Diya Sharma", gender: "Female" },
  { name: "Eshwar Nair", gender: "Male" },
  { name: "Faisal Khan", gender: "Male" },
  { name: "Gayathri Menon", gender: "Female" },
  { name: "Hari Prasad", gender: "Male" },
  { name: "Isha Gupta", gender: "Female" },
  { name: "Jayesh Pillai", gender: "Male" },
  { name: "Krithika Rajan", gender: "Female" },
  { name: "Lekha Suresh", gender: "Female" },
  { name: "Meera Krishnan", gender: "Female" },
  { name: "Nithin Thomas", gender: "Male" },
  { name: "Oviya Raj", gender: "Female" },
  { name: "Pranav Mohan", gender: "Male" },
  { name: "Riya Nair", gender: "Female" },
];

function makeSemester(i: number): number {
  return (i % 8) + 1;
}

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const places = ["Kochi", "Thrissur", "Thiruvananthapuram", "Kozhikode", "Kottayam", "Palakkad", "Malappuram", "Kannur", "Alappuzha", "Kollam"];

const sampleStudents: Student[] = studentNames.map(({ name, gender }, i) => {
  const idx = i + 1;
  const padded = String(idx).padStart(3, "0");
  const firstName = name.split(" ")[0].toLowerCase();
  const lastName = name.split(" ").slice(-1)[0].toLowerCase();
  return {
    student_id: idx,
    uid: `UID${padded}`,
    rollNo: `U2408${padded}`,
    name,
    gender,
    department: "AI & Data Science",
    course: "BTech AI & Data Science",
    semester: makeSemester(i),
    email: `${firstName}.${lastName}@student.edu`,
    phone: `98765${String(43210 + i).slice(-5)}`,
    password: `studentUID${padded}`,
    registered: true,
    father_name: `Mr. ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`,
    mother_name: `Mrs. ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`,
    place: places[i % places.length],
    blood_group: bloodGroups[i % bloodGroups.length],
  };
});

function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.length > 0 && (!parsed[0].rollNo || !parsed[0].uid?.startsWith("UID"))) {
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
      const newId = maxId + 1;
      const next = [...prev, { ...data, student_id: newId }];
      saveStudents(next);
      logActivity({ action: "created", entity: "Student", entityId: String(newId), details: `Added student ${data.name}`, user: "admin", role: "admin" });
      return next;
    });
  }, []);

  const updateStudent = useCallback((updated: Student) => {
    setStudents((prev) => {
      const next = prev.map((s) => (s.student_id === updated.student_id ? updated : s));
      saveStudents(next);
      logActivity({ action: "updated", entity: "Student", entityId: String(updated.student_id), details: `Updated student ${updated.name}`, user: "admin", role: "admin" });
      return next;
    });
  }, []);

  const removeStudent = useCallback((id: number) => {
    setStudents((prev) => {
      const student = prev.find((s) => s.student_id === id);
      const next = prev.filter((s) => s.student_id !== id);
      saveStudents(next);
      logActivity({ action: "deleted", entity: "Student", entityId: String(id), details: `Removed student ${student?.name || id}`, user: "admin", role: "admin" });
      return next;
    });
  }, []);

  return { students, addStudent, updateStudent, removeStudent, persist };
}
