import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { AttendanceRecord } from "@/hooks/useAttendance";
import type { Student } from "@/hooks/useStudents";

interface Props {
  records: AttendanceRecord[];
  students: Student[];
  threshold?: number;
}

const LowAttendanceStudents = ({ records, students, threshold = 75 }: Props) => {
  const lowStudents = useMemo(() => {
    const studentMap = new Map(students.map((s) => [s.student_id, s]));
    const totals = new Map<number, { present: number; total: number }>();

    records.forEach((r) => {
      const entry = totals.get(r.student_id) || { present: 0, total: 0 };
      entry.total++;
      if (r.status === "P") entry.present++;
      totals.set(r.student_id, entry);
    });

    return Array.from(totals.entries())
      .map(([id, { present, total }]) => ({
        student: studentMap.get(id),
        pct: Math.round((present / total) * 100),
        present,
        total,
      }))
      .filter((s) => s.student && s.pct < threshold)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 8);
  }, [records, students, threshold]);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h3 className="text-base font-semibold font-display">Low Attendance (&lt;{threshold}%)</h3>
      </div>
      {lowStudents.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">All students above {threshold}% attendance 🎉</p>
      ) : (
        <div className="space-y-3">
          {lowStudents.map(({ student, pct }) => (
            <div key={student!.student_id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium truncate">{student!.name}</p>
                  <span className={`text-xs font-semibold ${pct < 50 ? "text-destructive" : "text-amber-600"}`}>
                    {pct}%
                  </span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LowAttendanceStudents;
