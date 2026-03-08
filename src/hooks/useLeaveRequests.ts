import { useState, useCallback } from "react";
import { logActivity } from "./useActivityLog";

export type LeaveType = "Full Day" | "Half Day";
export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface LeaveRequest {
  id: string;
  student_id: number;
  student_name: string;
  date: string;
  day: string;
  reason: string;
  leave_type: LeaveType;
  status: LeaveStatus;
  created_at: string;
}

const STORAGE_KEY = "sms_leave_requests";

const sampleLeaves: LeaveRequest[] = [
  {
    id: "lr-1", student_id: 1, student_name: "Gouri Nandhana",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    day: "Wednesday", reason: "Medical appointment", leave_type: "Full Day",
    status: "Approved", created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "lr-2", student_id: 3, student_name: "Aavani U",
    date: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0],
    day: "Thursday", reason: "Family function", leave_type: "Half Day",
    status: "Pending", created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "lr-3", student_id: 5, student_name: "Adithya Sreepad BS",
    date: new Date().toISOString().split("T")[0],
    day: "Friday", reason: "Personal emergency", leave_type: "Full Day",
    status: "Pending", created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

function load(): LeaveRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleLeaves));
  return sampleLeaves;
}

function save(list: LeaveRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function useLeaveRequests() {
  const [requests, setRequests] = useState<LeaveRequest[]>(load);

  const addRequest = useCallback((data: Omit<LeaveRequest, "id" | "created_at" | "status">) => {
    setRequests((prev) => {
      const newId = `lr-${Date.now()}`;
      const next = [...prev, { ...data, id: newId, status: "Pending" as LeaveStatus, created_at: new Date().toISOString() }];
      save(next);
      logActivity({ action: "created", entity: "Leave", entityId: newId, details: `${data.student_name} requested ${data.leave_type} leave`, user: data.student_name, role: "student" });
      return next;
    });
  }, []);

  const updateStatus = useCallback((id: string, status: LeaveStatus) => {
    setRequests((prev) => {
      const req = prev.find((r) => r.id === id);
      const next = prev.map((r) => (r.id === id ? { ...r, status } : r));
      save(next);
      logActivity({ action: "updated", entity: "Leave", entityId: id, details: `${status} leave for ${req?.student_name || id}`, user: "admin", role: "admin" });
      return next;
    });
  }, []);

  return { requests, addRequest, updateStatus };
}
