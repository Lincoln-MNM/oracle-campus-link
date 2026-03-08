import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { Mark } from "@/hooks/useMarks";

const GRADE_CONFIG = [
  { label: "A+ (90–100)", min: 90, color: "hsl(152, 60%, 42%)" },
  { label: "A (80–89)", min: 80, color: "hsl(224, 76%, 48%)" },
  { label: "B (70–79)", min: 70, color: "hsl(199, 70%, 50%)" },
  { label: "C (60–69)", min: 60, color: "hsl(43, 90%, 55%)" },
  { label: "D (50–59)", min: 50, color: "hsl(25, 90%, 55%)" },
  { label: "F (<50)", min: 0, color: "hsl(0, 84%, 60%)" },
];

function getGrade(marks: number) {
  for (const g of GRADE_CONFIG) {
    if (marks >= g.min) return g.label;
  }
  return "F (<50)";
}

interface Props {
  marks: Mark[];
}

const GradeDistChart = ({ marks }: Props) => {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    GRADE_CONFIG.forEach((g) => map.set(g.label, 0));
    marks.forEach((m) => {
      const g = getGrade(m.marks);
      map.set(g, (map.get(g) || 0) + 1);
    });
    return GRADE_CONFIG.map((g) => ({ name: g.label, value: map.get(g.label) || 0, color: g.color })).filter((d) => d.value > 0);
  }, [marks]);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <h3 className="mb-4 text-base font-semibold font-display">Grade Distribution</h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No marks data</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3} strokeWidth={0}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(220,13%,91%)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GradeDistChart;
