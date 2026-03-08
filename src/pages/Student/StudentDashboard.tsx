import { useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Award, TrendingUp, ClipboardList, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatCard from "@/components/Cards/StatCard";
import { useStudents } from "@/hooks/useStudents";
import { useSubjects } from "@/hooks/useSubjects";
import { useMarks } from "@/hooks/useMarks";

function getGradeLabel(marks: number) {
  if (marks >= 90) return "A+";
  if (marks >= 80) return "A";
  if (marks >= 70) return "B";
  if (marks >= 60) return "C";
  if (marks >= 50) return "D";
  return "F";
}

function getGradeColor(marks: number) {
  if (marks >= 90) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (marks >= 80) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (marks >= 70) return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400";
  if (marks >= 60) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  if (marks >= 50) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { students } = useStudents();
  const { subjects } = useSubjects();
  const { marks } = useMarks();

  const studentId = Number(localStorage.getItem("studentId") || "1001");
  const student = students.find((s) => s.student_id === studentId) || students[0];

  const myMarks = useMemo(() => {
    if (!student) return [];
    const subjectMap = new Map(subjects.map((s) => [s.subject_id, s]));
    return marks
      .filter((m) => m.student_id === student.student_id)
      .map((m) => {
        const sub = subjectMap.get(m.subject_id);
        return { ...m, subject_name: sub?.subject_name || "Unknown", semester: sub?.semester || 0 };
      })
      .sort((a, b) => a.semester - b.semester);
  }, [student, marks, subjects]);

  const avg = myMarks.length > 0 ? Math.round(myMarks.reduce((s, m) => s + m.marks, 0) / myMarks.length) : 0;
  const highest = myMarks.length > 0 ? Math.max(...myMarks.map((m) => m.marks)) : 0;

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("studentId");
    navigate("/");
  };

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg font-medium">Student not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/login/student")}>Back to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold font-display">Student Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{student.name}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
              {student.name.charAt(0)}
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-display">Welcome, {student.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {student.department} · Semester {student.semester} · ID #{student.student_id}
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: "My Subjects", value: myMarks.length, icon: BookOpen, desc: "Subjects with marks" },
            { title: "Average Marks", value: `${avg}%`, icon: TrendingUp, desc: `Grade: ${getGradeLabel(avg)}` },
            { title: "Highest Score", value: highest, icon: Award, desc: "Best performance" },
          ].map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}>
              <StatCard title={s.title} value={s.value} icon={s.icon} description={s.desc} />
            </motion.div>
          ))}
        </div>

        {/* Marks table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-xl border bg-card shadow-card">
          <div className="flex items-center gap-2 border-b p-5">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold font-display">My Academic Results</h2>
          </div>
          {myMarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ClipboardList className="mb-3 h-10 w-10 opacity-40" />
              <p className="font-medium">No marks recorded yet</p>
              <p className="mt-1 text-sm">Your results will appear here once marks are assigned.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-24">Semester</TableHead>
                  <TableHead className="w-24">Marks</TableHead>
                  <TableHead className="w-20">Grade</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myMarks.map((m) => (
                  <TableRow key={m.mark_id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-medium">{m.subject_name}</TableCell>
                    <TableCell>{m.semester}</TableCell>
                    <TableCell className="font-semibold">{m.marks}</TableCell>
                    <TableCell>
                      <Badge className={getGradeColor(m.marks)}>{getGradeLabel(m.marks)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.marks >= 50 ? "secondary" : "destructive"}>
                        {m.marks >= 50 ? "Pass" : "Fail"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {myMarks.length > 0 && (
            <div className="flex items-center justify-between border-t px-5 py-3 text-sm">
              <span className="text-muted-foreground">Total: {myMarks.length} subjects</span>
              <span className="font-semibold">Average: <span className="text-primary">{avg}%</span></span>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default StudentDashboard;
