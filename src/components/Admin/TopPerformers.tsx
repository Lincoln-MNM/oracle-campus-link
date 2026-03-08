import { useMemo } from "react";
import { Trophy } from "lucide-react";
import type { Mark } from "@/hooks/useMarks";
import type { Student } from "@/hooks/useStudents";
import type { Subject } from "@/hooks/useSubjects";

interface Props {
  marks: Mark[];
  students: Student[];
  subjects: Subject[];
}

const TopPerformers = ({ marks, students, subjects }: Props) => {
  const top = useMemo(() => {
    const studentMap = new Map(students.map((s) => [s.student_id, s]));
    const subjectMap = new Map(subjects.map((s) => [s.subject_id, s]));

    // Average marks per student
    const avg = new Map<number, { sum: number; count: number }>();
    marks.forEach((m) => {
      const e = avg.get(m.student_id) || { sum: 0, count: 0 };
      e.sum += m.marks;
      e.count += 1;
      avg.set(m.student_id, e);
    });

    return Array.from(avg.entries())
      .map(([id, { sum, count }]) => ({
        student: studentMap.get(id),
        avg: Math.round(sum / count),
        subjects: count,
      }))
      .filter((r) => r.student)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);
  }, [marks, students, subjects]);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h3 className="text-base font-semibold font-display">Top Performers</h3>
      </div>
      {top.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No data yet</p>
      ) : (
        <div className="space-y-3">
          {top.map((r, i) => (
            <div key={r.student!.student_id} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.student!.name}</p>
                <p className="text-xs text-muted-foreground">{r.student!.department} · {r.subjects} subjects</p>
              </div>
              <span className="text-sm font-bold font-display text-primary">{r.avg}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopPerformers;
