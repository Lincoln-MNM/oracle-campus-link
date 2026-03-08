import { useState, useCallback } from "react";
import { logActivity } from "./useActivityLog";

export type PaymentType = "Semester Fee" | "Exam Fee" | "Event Fee";
export type PaymentStatus = "Pending" | "Paid";

export interface FeePayment {
  id: string;
  student_id: number;
  title: string;
  payment_type: PaymentType;
  amount: number;
  status: PaymentStatus;
  due_date: string;
  paid_at?: string;
}

const STORAGE_KEY = "sms_fee_payments";

function generateSamplePayments(): FeePayment[] {
  const payments: FeePayment[] = [];
  for (let i = 1; i <= 50; i++) {
    payments.push({
      id: `fp-sem-${i}`, student_id: i, title: "Semester 4 Tuition Fee",
      payment_type: "Semester Fee", amount: 45000, status: i <= 30 ? "Paid" : "Pending",
      due_date: "2026-03-15", paid_at: i <= 30 ? "2026-02-28T10:00:00Z" : undefined,
    });
    payments.push({
      id: `fp-exam-${i}`, student_id: i, title: "Mid-Semester Exam Fee",
      payment_type: "Exam Fee", amount: 1500, status: i <= 20 ? "Paid" : "Pending",
      due_date: "2026-03-10", paid_at: i <= 20 ? "2026-03-01T10:00:00Z" : undefined,
    });
  }
  payments.push({
    id: "fp-event-workshop", student_id: 0, title: "Cloud Computing Workshop Fee",
    payment_type: "Event Fee", amount: 500, status: "Pending", due_date: "2026-03-18",
  });
  return payments;
}

function load(): FeePayment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const data = generateSamplePayments();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

function save(list: FeePayment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function useFeePayments() {
  const [payments, setPayments] = useState<FeePayment[]>(load);

  const addPayment = useCallback((data: Omit<FeePayment, "id">) => {
    setPayments((prev) => {
      const newId = `fp-${Date.now()}`;
      const next = [...prev, { ...data, id: newId }];
      save(next);
      logActivity({ action: "created", entity: "Fee", entityId: newId, details: `Added fee: ${data.title} (₹${data.amount})`, user: "admin", role: "admin" });
      return next;
    });
  }, []);

  const payFee = useCallback((id: string) => {
    setPayments((prev) => {
      const payment = prev.find((p) => p.id === id);
      const next = prev.map((p) =>
        p.id === id ? { ...p, status: "Paid" as PaymentStatus, paid_at: new Date().toISOString() } : p
      );
      save(next);
      logActivity({ action: "updated", entity: "Fee", entityId: id, details: `Marked as paid: ${payment?.title || id}`, user: "admin", role: "admin" });
      return next;
    });
  }, []);

  return { payments, addPayment, payFee };
}
