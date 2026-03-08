import Navbar from "@/components/Navbar/Navbar";
import StatCard from "@/components/Cards/StatCard";
import DataTable from "@/components/Tables/DataTable";
import { BookOpen, Award, User } from "lucide-react";

const StudentDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar title="Student Portal" />
      <main className="mx-auto max-w-5xl p-6">
        <h2 className="text-2xl font-bold font-display">My Dashboard</h2>
        <p className="mt-1 text-muted-foreground">Placeholder — Student data coming in future phases</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard title="My Subjects" value="—" icon={BookOpen} />
          <StatCard title="Average Marks" value="—" icon={Award} />
          <StatCard title="Semester" value="—" icon={User} />
        </div>

        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold font-display">My Marks</h3>
          <DataTable
            columns={[
              { key: "subject", label: "Subject" },
              { key: "marks", label: "Marks" },
            ]}
            data={[]}
            emptyMessage="No marks yet — connect Oracle DB in Phase 2"
          />
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
