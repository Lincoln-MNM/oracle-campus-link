import StatCard from "@/components/Cards/StatCard";
import { Users, BookOpen, ClipboardList, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useStudents } from "@/hooks/useStudents";
import { useSubjects } from "@/hooks/useSubjects";
import { useMarks } from "@/hooks/useMarks";

const AdminDashboard = () => {
  const { students } = useStudents();
  const { subjects } = useSubjects();
  const { marks } = useMarks();

  const departments = new Set(students.map((s) => s.department)).size;

  const stats = [
    { title: "Total Students", value: students.length, icon: Users, desc: "Registered students" },
    { title: "Subjects", value: subjects.length, icon: BookOpen, desc: "Across all departments" },
    { title: "Marks Recorded", value: marks.length, icon: ClipboardList, desc: "Total mark entries" },
    { title: "Departments", value: departments || "—", icon: Building2, desc: "Active departments" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome to the admin control panel.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <StatCard title={s.title} value={s.value} icon={s.icon} description={s.desc} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
