import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { Mark } from "@/hooks/useMarks";
import type { Subject } from "@/hooks/useSubjects";

const COLORS = [
  "hsl(224, 76%, 48%)",
  "hsl(243, 75%, 59%)",
  "hsl(200, 65%, 50%)",
  "hsl(170, 60%, 45%)",
  "hsl(45, 93%, 47%)",
  "hsl(340, 65%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(15, 75%, 55%)",
];

interface Props {
  marks: Mark[];
  subjects: Subject[];
}

const AvgMarksPerSemesterChart = ({ marks, subjects }: Props) => {
  const data = useMemo(() => {
    const subjectSemMap = new Map(subjects.map((s) => [s.subject_id, s.semester]));
    const semTotals = new Map<number, { sum: number; count: number }>();

    marks.forEach((m) => {
      const sem = subjectSemMap.get(m.subject_id);
      if (sem == null) return;
      const entry = semTotals.get(sem) || { sum: 0, count: 0 };
      entry.sum += m.marks;
      entry.count++;
      semTotals.set(sem, entry);
    });

    return Array.from(semTotals.entries())
      .map(([sem, { sum, count }]) => ({
        name: `Sem ${sem}`,
        avg: Math.round(sum / count),
      }))
      .sort((a, b) => parseInt(a.name.split(" ")[1]) - parseInt(b.name.split(" ")[1]));
  }, [marks, subjects]);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <h3 className="mb-4 text-base font-semibold font-display">Average Marks per Semester</h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value: number) => [`${value}%`, "Average"]}
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AvgMarksPerSemesterChart;
