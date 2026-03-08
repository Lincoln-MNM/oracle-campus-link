import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, XCircle, Clock, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useStudents } from "@/hooks/useStudents";
import { useAttendance, AttendanceStatus } from "@/hooks/useAttendance";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const statusColors: Record<AttendanceStatus, string> = {
  P: "bg-emerald-500 text-white",
  A: "bg-red-500 text-white",
  L: "bg-blue-500 text-white",
};

const AttendancePage = () => {
  const { toast } = useToast();
  const { students } = useStudents();
  const { records, timetable, bulkMark } = useAttendance();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"mark" | "report">("mark");

  const dayName = useMemo(() => {
    const d = new Date(selectedDate);
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()];
  }, [selectedDate]);

  const slots = timetable[dayName] || [];
  const filteredStudents = students.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.uid?.includes(search)
  );

  // Current attendance for the selected date
  const dateRecords = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    records.filter((r) => r.date === selectedDate).forEach((r) => {
      map.set(`${r.student_id}-${r.period}`, r.status);
    });
    return map;
  }, [records, selectedDate]);

  const [localStatus, setLocalStatus] = useState<Map<string, AttendanceStatus>>(new Map());

  const getStatus = (studentId: number, period: number): AttendanceStatus => {
    const key = `${studentId}-${period}`;
    return localStatus.get(key) || dateRecords.get(key) || "P";
  };

  const toggleStatus = (studentId: number, period: number) => {
    const key = `${studentId}-${period}`;
    const current = getStatus(studentId, period);
    const next: AttendanceStatus = current === "P" ? "A" : current === "A" ? "L" : "P";
    setLocalStatus((prev) => new Map(prev).set(key, next));
  };

  const handleSave = () => {
    if (dayName === "Sunday") {
      toast({ title: "Cannot mark attendance on Sunday", variant: "destructive" });
      return;
    }
    const newRecords = filteredStudents.flatMap((student) =>
      slots.map((slot) => ({
        id: `${selectedDate}-${student.student_id}-${slot.period}`,
        student_id: student.student_id,
        date: selectedDate,
        period: slot.period,
        subject_id: slot.subject_id,
        status: getStatus(student.student_id, slot.period),
      }))
    );
    bulkMark(newRecords);
    setLocalStatus(new Map());
    toast({ title: "✅ Attendance Saved", description: `Saved for ${selectedDate}` });
  };

  // Report: calculate per-student attendance stats
  const reportData = useMemo(() => {
    return students.slice(0, 20).map((s) => {
      const studentRecords = records.filter((r) => r.student_id === s.student_id);
      const total = studentRecords.length;
      const present = studentRecords.filter((r) => r.status === "P").length;
      const absent = studentRecords.filter((r) => r.status === "A").length;
      const leave = studentRecords.filter((r) => r.status === "L").length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      return { ...s, total, present, absent, leave, percentage: pct };
    });
  }, [students, records]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Attendance Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Mark and manage student attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === "mark" ? "default" : "outline"} onClick={() => setView("mark")}>
            <Calendar className="mr-2 h-4 w-4" /> Mark Attendance
          </Button>
          <Button variant={view === "report" ? "default" : "outline"} onClick={() => setView("report")}>
            <Users className="mr-2 h-4 w-4" /> Reports
          </Button>
        </div>
      </div>

      {view === "mark" ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setLocalStatus(new Map()); }}
              className="w-48" />
            <Badge variant="secondary" className="text-sm">{dayName}</Badge>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search student…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button onClick={handleSave} className="gradient-primary text-primary-foreground ml-auto">
              Save Attendance
            </Button>
          </div>

          {dayName === "Sunday" ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground rounded-xl border bg-card">
              <Calendar className="mb-3 h-10 w-10 opacity-40" />
              <p className="font-medium">No classes on Sunday</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border bg-card shadow-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-card z-10 min-w-[140px]">Student</TableHead>
                    {slots.map((s) => (
                      <TableHead key={s.period} className="text-center min-w-[100px]">
                        <div className="text-xs">P{s.period}</div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[90px]">{s.subject_name.split(" ").slice(0, 2).join(" ")}</div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.slice(0, 20).map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell className="sticky left-0 bg-card z-10 font-medium">
                        <div className="text-sm">{student.name}</div>
                        <div className="text-[10px] text-muted-foreground">{student.uid}</div>
                      </TableCell>
                      {slots.map((slot) => {
                        const status = getStatus(student.student_id, slot.period);
                        return (
                          <TableCell key={slot.period} className="text-center">
                            <button
                              onClick={() => toggleStatus(student.student_id, slot.period)}
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all hover:scale-110 ${statusColors[status]}`}
                            >
                              {status}
                            </button>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}

          <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-500" /> Present</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-500" /> Absent</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-blue-500" /> Leave</span>
            <span className="text-xs italic">Click cells to toggle</span>
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-center w-20">Total</TableHead>
                <TableHead className="text-center w-20"><CheckCircle className="inline h-4 w-4 text-emerald-500" /></TableHead>
                <TableHead className="text-center w-20"><XCircle className="inline h-4 w-4 text-red-500" /></TableHead>
                <TableHead className="text-center w-20"><Clock className="inline h-4 w-4 text-blue-500" /></TableHead>
                <TableHead className="text-center w-24">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((s) => (
                <TableRow key={s.student_id}>
                  <TableCell>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.uid}</div>
                  </TableCell>
                  <TableCell className="text-center">{s.total}</TableCell>
                  <TableCell className="text-center text-emerald-600 font-medium">{s.present}</TableCell>
                  <TableCell className="text-center text-red-600 font-medium">{s.absent}</TableCell>
                  <TableCell className="text-center text-blue-600 font-medium">{s.leave}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={s.percentage >= 75 ? "secondary" : "destructive"}>
                      {s.percentage}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  );
};

export default AttendancePage;
