import { useMemo } from "react";
import StatCard from "@/components/Cards/StatCard";
import { Users, BookOpen, ClipboardList, CalendarCheck, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useStudents } from "@/hooks/useStudents";
import { useSubjects } from "@/hooks/useSubjects";
import { useMarks } from "@/hooks/useMarks";
import { useAttendance } from "@/hooks/useAttendance";
import AttendanceOverviewChart from "@/components/Charts/AttendanceOverviewChart";
import AvgMarksPerSemesterChart from "@/components/Charts/AvgMarksPerSemesterChart";
import GradeDistChart from "@/components/Charts/GradeDistChart";
import RecentActivity from "@/components/Admin/RecentActivity";
import TopPerformers from "@/components/Admin/TopPerformers";
import LowAttendanceStudents from "@/components/Admin/LowAttendanceStudents";

const AdminDashboard = () => {
  const { students } = useStudents();
  const { subjects } = useSubjects();
  const { marks } = useMarks();
  const { records } = useAttendance();

  const avgMarks = useMemo(() => {
    if (marks.length === 0) return 0;
    return Math.round(marks.reduce((sum, m) => sum + m.marks, 0) / marks.length);
  }, [marks]);

  const attendancePct = useMemo(() => {
    if (records.length === 0) return 0;
    return Math.round((records.filter((r) => r.status === "P").length / records.length) * 100);
  }, [records]);

  const stats = [
    { title: "Total Students", value: students.length, icon: Users, trend: { value: 12, label: "this month" } },
    { title: "Subjects", value: subjects.length, icon: BookOpen, desc: "Across all semesters" },
    { title: "Marks Recorded", value: marks.length, icon: ClipboardList, trend: { value: 8, label: "this week" } },
    { title: "Attendance Rate", value: `${attendancePct}%`, icon: CalendarCheck, desc: "Overall attendance" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome to the admin control panel.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard title={s.title} value={s.value} icon={s.icon} description={s.desc} trend={s.trend} />
          </motion.div>
        ))}
      </div>

      {/* Summary row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Marks</p>
            <p className="text-2xl font-bold font-display">{avgMarks}%</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
            <Award className="h-6 w-6 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pass Rate (≥50%)</p>
            <p className="text-2xl font-bold font-display">
              {marks.length > 0 ? Math.round((marks.filter((m) => m.marks >= 50).length / marks.length) * 100) : 0}%
            </p>
          </div>
        </motion.div>
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <AttendanceOverviewChart records={records} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <AvgMarksPerSemesterChart marks={marks} subjects={subjects} />
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <GradeDistChart marks={marks} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <LowAttendanceStudents records={records} students={students} />
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <TopPerformers marks={marks} students={students} subjects={subjects} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
          <RecentActivity students={students} marks={marks} subjects={subjects} />
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
