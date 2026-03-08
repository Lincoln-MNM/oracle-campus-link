import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { AttendanceRecord } from "@/hooks/useAttendance";

const COLORS = [
  "hsl(142, 71%, 45%)",  // Present - green
  "hsl(0, 84%, 60%)",    // Absent - red
  "hsl(45, 93%, 47%)",   // Leave - amber
];

interface Props {
  records: AttendanceRecord[];
}

const AttendanceOverviewChart = ({ records }: Props) => {
  const data = useMemo(() => {
    const counts = { P: 0, A: 0, L: 0 };
    records.forEach((r) => { counts[r.status]++; });
    const total = records.length || 1;
    return [
      { name: "Present", value: counts.P, pct: Math.round((counts.P / total) * 100) },
      { name: "Absent", value: counts.A, pct: Math.round((counts.A / total) * 100) },
      { name: "Leave", value: counts.L, pct: Math.round((counts.L / total) * 100) },
    ];
  }, [records]);

  const overallPct = data[0]?.pct ?? 0;

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-base font-semibold font-display">Attendance Overview</h3>
        <span className="text-2xl font-bold font-display text-primary">{overallPct}%</span>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">Overall attendance rate across all students</p>
      {records.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No attendance data</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value} records`, name]}
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "0.8rem",
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value, entry: any) => {
                const item = data.find((d) => d.name === value);
                return `${value} (${item?.pct ?? 0}%)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AttendanceOverviewChart;
