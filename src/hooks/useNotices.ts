import { useState, useCallback } from "react";

export interface Notice {
  id: string;
  title: string;
  description: string;
  date: string;
  created_at: string;
}

const STORAGE_KEY = "sms_notices";

const sampleNotices: Notice[] = [
  {
    id: "n-1", title: "Mid-Semester Exam Schedule Released",
    description: "The mid-semester examination schedule for Semester 4 has been published. Please check the notice board for your slot timings. Exams begin from March 15, 2026.",
    date: "2026-03-01", created_at: "2026-03-01T10:00:00Z",
  },
  {
    id: "n-2", title: "DBMS Lab Submission Deadline",
    description: "All DBMS lab assignments must be submitted by March 10, 2026. Late submissions will incur a penalty of 10% per day.",
    date: "2026-03-03", created_at: "2026-03-03T09:00:00Z",
  },
  {
    id: "n-3", title: "Workshop on Cloud Computing",
    description: "A 2-day workshop on AWS Cloud Services will be conducted on March 20-21. Interested students should register through the department portal.",
    date: "2026-03-05", created_at: "2026-03-05T14:00:00Z",
  },
  {
    id: "n-4", title: "Sports Day Announcement",
    description: "Annual Sports Day will be held on March 25, 2026. All students are encouraged to participate. Registration open till March 18.",
    date: "2026-03-07", created_at: "2026-03-07T08:30:00Z",
  },
];

function load(): Notice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleNotices));
  return sampleNotices;
}

function save(list: Notice[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function useNotices() {
  const [notices, setNotices] = useState<Notice[]>(load);

  const addNotice = useCallback((data: Omit<Notice, "id" | "created_at">) => {
    setNotices((prev) => {
      const next = [...prev, { ...data, id: `n-${Date.now()}`, created_at: new Date().toISOString() }];
      save(next);
      return next;
    });
  }, []);

  const removeNotice = useCallback((id: string) => {
    setNotices((prev) => {
      const next = prev.filter((n) => n.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { notices, addNotice, removeNotice };
}
