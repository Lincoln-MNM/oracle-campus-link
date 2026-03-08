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

/** Standalone logger callable from anywhere (not just React components) */
export function logActivity(entry: Omit<ActivityLog, "id" | "timestamp">) {
  const logs = loadLogs();
  const log: ActivityLog = {
    ...entry,
    id: nextId++,
    timestamp: new Date().toISOString(),
  };
  const next = [...logs, log];
  saveLogs(next);
  // Dispatch a storage event so the ActivityLogPage can pick it up
  window.dispatchEvent(new Event("activity-log-updated"));
}

export function useActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>(loadLogs);

  // Listen for updates from other hooks
  const refresh = useCallback(() => {
    setLogs(loadLogs());
  }, []);

  // Subscribe to custom event
  useState(() => {
    window.addEventListener("activity-log-updated", refresh);
    return () => window.removeEventListener("activity-log-updated", refresh);
  });

  const addLog = useCallback((entry: Omit<ActivityLog, "id" | "timestamp">) => {
    logActivity(entry);
    setLogs(loadLogs());
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { logs, addLog, clearLogs };
}
