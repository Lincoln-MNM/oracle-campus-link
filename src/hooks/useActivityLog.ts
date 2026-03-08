import { useState, useCallback } from "react";

export interface ActivityLog {
  id: number;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  user: string;
  role: string;
  timestamp: string;
}

const STORAGE_KEY = "sms_activity_log";
let nextId = 1;

function loadLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const logs = JSON.parse(raw) as ActivityLog[];
      nextId = logs.reduce((m, l) => Math.max(m, l.id), 0) + 1;
      return logs;
    }
  } catch { /* ignore */ }
  return [];
}

function saveLogs(logs: ActivityLog[]) {
  // Keep only the latest 200 entries
  const trimmed = logs.slice(-200);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function useActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>(loadLogs);

  const addLog = useCallback((entry: Omit<ActivityLog, "id" | "timestamp">) => {
    setLogs((prev) => {
      const log: ActivityLog = {
        ...entry,
        id: nextId++,
        timestamp: new Date().toISOString(),
      };
      const next = [...prev, log];
      saveLogs(next);
      return next;
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { logs, addLog, clearLogs };
}
