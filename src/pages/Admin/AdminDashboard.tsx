import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/Sidebar/Sidebar";
import StatCard from "@/components/Cards/StatCard";
import DataTable from "@/components/Tables/DataTable";
import { LayoutDashboard, Users, BookOpen, ClipboardList } from "lucide-react";

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin", active: true },
  { label: "Students", icon: Users, href: "/admin/students" },
  { label: "Subjects", icon: BookOpen, href: "/admin/subjects" },
  { label: "Marks", icon: ClipboardList, href: "/admin/marks" },
];

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar title="Admin Dashboard" />
      <div className="flex">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold font-display">Dashboard Overview</h2>
          <p className="mt-1 text-muted-foreground">Placeholder — Data will be connected in future phases</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Students" value="—" icon={Users} />
            <StatCard title="Subjects" value="—" icon={BookOpen} />
            <StatCard title="Exams Recorded" value="—" icon={ClipboardList} />
            <StatCard title="Departments" value="—" icon={LayoutDashboard} />
          </div>

          <div className="mt-8">
            <h3 className="mb-4 text-lg font-semibold font-display">Recent Students</h3>
            <DataTable
              columns={[
                { key: "id", label: "ID" },
                { key: "name", label: "Name" },
                { key: "department", label: "Department" },
                { key: "semester", label: "Semester" },
              ]}
              data={[]}
              emptyMessage="No students yet — connect Oracle DB in Phase 2"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
