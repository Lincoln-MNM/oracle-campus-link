import { useMemo } from "react";
import { Activity } from "lucide-react";
import type { Mark } from "@/hooks/useMarks";
import type { Student } from "@/hooks/useStudents";
import type { Subject } from "@/hooks/useSubjects";

interface Props {
  students: Student[];
  marks: Mark[];
  subjects: Subject[];
}

const RecentActivity = ({ students, marks, subjects }: Props) => {
  const items = useMemo(() => {
    const studentMap = new Map(students.map((s) => [s.student_id, s]));
    const subjectMap = new Map(subjects.map((s) => [s.subject_id, s]));

    const activities: { id: string; text: string; sub: string; type: "student" | "mark" }[] = [];

    // Last 3 students
    students.slice(-3).reverse().forEach((s) => {
      activities.push({ id: `s-${s.student_id}`, text: `${s.name} registered`, sub: s.department, type: "student" });
    });

    // Last 3 marks
    marks.slice(-3).reverse().forEach((m) => {
      const st = studentMap.get(m.student_id);
      const sub = subjectMap.get(m.subject_id);
      if (st && sub) {
        activities.push({ id: `m-${m.mark_id}`, text: `${st.name} scored ${m.marks}`, sub: sub.subject_name, type: "mark" });
      }
    });

    return activities.slice(0, 6);
  }, [students, marks, subjects]);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold font-display">Recent Activity</h3>
      </div>
      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
              <div className={`h-2 w-2 shrink-0 rounded-full ${item.type === "student" ? "bg-primary" : "bg-accent"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.text}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
