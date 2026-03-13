import { useState, useCallback } from "react";

export interface Exam {
  id: string;
  name: string;
  date: string;
  session: "Morning" | "Afternoon" | "Evening";
  description?: string;
  createdAt: string;
}

export interface Classroom {
  id: string;
  examId: string;
  name: string;
  roomNumber?: string;
  capacity: number;
}

export interface SeatAssignment {
  seatNumber: number;
  studentName?: string;
  studentClass?: string;
  subject?: string;
  uid?: string;
}

export interface SeatingLayout {
  classroomId: string;
  examId: string;
  seats: SeatAssignment[];
}

const EXAMS_KEY = "sms_seating_exams";
const CLASSROOMS_KEY = "sms_seating_classrooms";
const LAYOUTS_KEY = "sms_seating_layouts";

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useExams() {
  const [exams, setExams] = useState<Exam[]>(() => load<Exam>(EXAMS_KEY, []));

  const addExam = useCallback((exam: Omit<Exam, "id" | "createdAt">) => {
    setExams((prev) => {
      const next = [...prev, { ...exam, id: crypto.randomUUID(), createdAt: new Date().toISOString() }];
      save(EXAMS_KEY, next);
      return next;
    });
  }, []);

  const updateExam = useCallback((id: string, data: Partial<Exam>) => {
    setExams((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...data } : e));
      save(EXAMS_KEY, next);
      return next;
    });
  }, []);

  const deleteExam = useCallback((id: string) => {
    setExams((prev) => {
      const next = prev.filter((e) => e.id !== id);
      save(EXAMS_KEY, next);
      return next;
    });
  }, []);

  return { exams, addExam, updateExam, deleteExam };
}

export function useClassrooms(examId?: string) {
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => load<Classroom>(CLASSROOMS_KEY, []));

  const filtered = examId ? classrooms.filter((c) => c.examId === examId) : classrooms;

  const addClassroom = useCallback((data: Omit<Classroom, "id">) => {
    setClassrooms((prev) => {
      const next = [...prev, { ...data, id: crypto.randomUUID() }];
      save(CLASSROOMS_KEY, next);
      return next;
    });
  }, []);

  const deleteClassroom = useCallback((id: string) => {
    setClassrooms((prev) => {
      const next = prev.filter((c) => c.id !== id);
      save(CLASSROOMS_KEY, next);
      return next;
    });
  }, []);

  return { classrooms: filtered, allClassrooms: classrooms, addClassroom, deleteClassroom };
}

function createEmptySeats(): SeatAssignment[] {
  return Array.from({ length: 70 }, (_, i) => ({ seatNumber: i + 1 }));
}

export function useSeatingLayout(examId?: string, classroomId?: string) {
  const [layouts, setLayouts] = useState<SeatingLayout[]>(() => load<SeatingLayout>(LAYOUTS_KEY, []));

  const layout = layouts.find((l) => l.examId === examId && l.classroomId === classroomId);
  const seats = layout?.seats ?? createEmptySeats();

  const saveLayout = useCallback(
    (newSeats: SeatAssignment[]) => {
      if (!examId || !classroomId) return;
      setLayouts((prev) => {
        const exists = prev.findIndex((l) => l.examId === examId && l.classroomId === classroomId);
        let next: SeatingLayout[];
        if (exists >= 0) {
          next = [...prev];
          next[exists] = { examId, classroomId, seats: newSeats };
        } else {
          next = [...prev, { examId, classroomId, seats: newSeats }];
        }
        save(LAYOUTS_KEY, next);
        return next;
      });
    },
    [examId, classroomId]
  );

  const clearLayout = useCallback(() => {
    saveLayout(createEmptySeats());
  }, [saveLayout]);

  // Get all seating for a specific student UID
  const getStudentSeating = useCallback(
    (uid: string) => {
      return layouts
        .map((l) => {
          const seat = l.seats.find((s) => s.uid === uid);
          if (!seat) return null;
          return { examId: l.examId, classroomId: l.classroomId, seat };
        })
        .filter(Boolean) as { examId: string; classroomId: string; seat: SeatAssignment }[];
    },
    [layouts]
  );

  return { seats, saveLayout, clearLayout, allLayouts: layouts, getStudentSeating };
}
