import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BarChart3, Download, FileSpreadsheet, FileText, Printer, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useStudents } from "@/hooks/useStudents";
import { useSubjects } from "@/hooks/useSubjects";
import { useMarks } from "@/hooks/useMarks";
import { exportStudentsExcel, exportStudentsCsv, exportMarksReport } from "@/lib/pdfExport";
import StatCard from "@/components/Cards/StatCard";

const COLORS = ["hsl(224,76%,48%)", "hsl(230,80%,60%)", "hsl(152,60%,42%)", "hsl(43,90%,55%)", "hsl(0,84%,60%)", "hsl(200,65%,50%)"];

function getGrade(m: number) {
  if (m >= 90) return "A+";
  if (m >= 80) return "A";
  if (m >= 70) return "B";
  if (m >= 60) return "C";
  if (m >= 50) return "D";
  return "F";
}

const ReportsPage = () => {
  const { students } = useStudents();
  const { subjects } = useSubjects();
  const { marks } = useMarks();

  const studentMap = useMemo(() => new Map(students.map((s) => [s.student_id, s])), [students]);
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.subject_id, s])), [subjects]);

  const joinedMarks = useMemo(() =>
    marks.map((m) => ({
      ...m,
      student_name: studentMap.get(m.student_id)?.name || "Unknown",
      subject_name: subjectMap.get(m.subject_id)?.subject_name || "Unknown",
      department: studentMap.get(m.student_id)?.department || "",
      semester: subjectMap.get(m.subject_id)?.semester || 0,
    })), [marks, studentMap, subjectMap]);

  const deptAvg = useMemo(() => {
    const map = new Map<string, { sum: number; count: number }>();
    joinedMarks.forEach((m) => {
      const e = map.get(m.department) || { sum: 0, count: 0 };
      e.sum += m.marks;
      e.count += 1;
      map.set(m.department, e);
    });
    return Array.from(map, ([name, { sum, count }]) => ({ name, avg: Math.round(sum / count) })).sort((a, b) => b.avg - a.avg);
  }, [joinedMarks]);

  const passRate = marks.length > 0 ? Math.round((marks.filter((m) => m.marks >= 50).length / marks.length) * 100) : 0;
  const avgAll = marks.length > 0 ? Math.round(marks.reduce((s, m) => s + m.marks, 0) / marks.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Export data and view academic analytics.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => exportStudentsExcel(students)}>
            <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportStudentsCsv(students)}>
            <FileText className="mr-1.5 h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportMarksReport(joinedMarks)}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Marks PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <StatCard title="Overall Average" value={`${avgAll}%`} icon={BarChart3} description={`Grade: ${getGrade(avgAll)}`} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard title="Pass Rate" value={`${passRate}%`} icon={ClipboardList} description={`${marks.filter((m) => m.marks >= 50).length} of ${marks.length} passed`} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard title="Total Records" value={marks.length} icon={FileText} description="Mark entries" />
        </motion.div>
      </div>

      {/* Dept avg chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-xl border bg-card p-6 shadow-card">
        <h3 className="mb-4 text-base font-semibold font-display">Average Marks by Department</h3>
        {deptAvg.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No data</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptAvg} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(220,13%,91%)" }} />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {deptAvg.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Printable student list */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-xl border bg-card shadow-card print:shadow-none print:border-0">
        <div className="border-b p-5">
          <h3 className="text-base font-semibold font-display">Student Directory</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s) => (
              <TableRow key={s.student_id} className="transition-colors hover:bg-muted/50">
                <TableCell className="font-mono text-sm">{s.student_id}</TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell><Badge variant="secondary" className="font-normal">{s.department}</Badge></TableCell>
                <TableCell>{s.semester}</TableCell>
                <TableCell className="text-muted-foreground">{s.email}</TableCell>
                <TableCell className="text-muted-foreground">{s.phone || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
};

export default ReportsPage;
