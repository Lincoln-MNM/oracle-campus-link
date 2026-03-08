import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap, BookOpen, Award, TrendingUp, ClipboardList, LogOut, Megaphone, CalendarDays, Download,
  DollarSign, ClipboardCheck, FileText, Clock, CheckCircle, XCircle, Send, CalendarIcon, Filter, TableIcon,
  User, MapPin, Droplets, Phone, Mail, Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "@/components/Cards/StatCard";
import PhotoUpload from "@/components/Admin/PhotoUpload";
import { useStudents } from "@/hooks/useStudents";
import { useSubjects } from "@/hooks/useSubjects";
import { useMarks } from "@/hooks/useMarks";
import { useAttendance, AttendanceStatus } from "@/hooks/useAttendance";
import { useLeaveRequests, LeaveType } from "@/hooks/useLeaveRequests";
import { useNotices } from "@/hooks/useNotices";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useFeePayments } from "@/hooks/useFeePayments";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { generateSemesterReportCard } from "@/lib/reportCardPdf";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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

const statusColors: Record<AttendanceStatus, string> = {
  P: "bg-emerald-500 text-white",
  A: "bg-red-500 text-white",
  L: "bg-blue-500 text-white",
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();
  const { students, updateStudent } = useStudents();
  const { subjects } = useSubjects();
  const { marks } = useMarks();
  const { records, timetable } = useAttendance();
  const { requests, addRequest } = useLeaveRequests();
  const { notices } = useNotices();
  const { events } = useCalendarEvents();
  const { payments, payFee } = useFeePayments();

  const studentId = Number(localStorage.getItem("studentId") || "1");
  const student = students.find((s) => s.student_id === studentId) || students[0];

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveType, setLeaveType] = useState<LeaveType>("Full Day");
  const [selectedSemester, setSelectedSemester] = useState("4");
  const [reportSemester, setReportSemester] = useState("4");
  const [attendanceFromDate, setAttendanceFromDate] = useState<Date | undefined>(undefined);
  const [attendanceToDate, setAttendanceToDate] = useState<Date | undefined>(undefined);

  // My marks
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

  const semesterMarks = myMarks.filter((m) => String(m.semester) === selectedSemester);

  // Semester-wise performance chart
  const performanceData = useMemo(() => {
    const semAvg: Record<number, { sum: number; count: number }> = {};
    myMarks.forEach((m) => {
      if (!semAvg[m.semester]) semAvg[m.semester] = { sum: 0, count: 0 };
      semAvg[m.semester].sum += m.marks;
      semAvg[m.semester].count += 1;
    });
    return Object.entries(semAvg)
      .map(([sem, data]) => ({ semester: `Sem ${sem}`, average: Math.round(data.sum / data.count) }))
      .sort((a, b) => a.semester.localeCompare(b.semester));
  }, [myMarks]);

  const avg = myMarks.length > 0 ? Math.round(myMarks.reduce((s, m) => s + m.marks, 0) / myMarks.length) : 0;
  const highest = myMarks.length > 0 ? Math.max(...myMarks.map((m) => m.marks)) : 0;

  // Attendance
  const myAttendance = useMemo(() => {
    if (!student) return { total: 0, present: 0, absent: 0, leave: 0, pct: 0 };
    const recs = records.filter((r) => r.student_id === student.student_id);
    const total = recs.length;
    const present = recs.filter((r) => r.status === "P").length;
    const absent = recs.filter((r) => r.status === "A").length;
    const leave = recs.filter((r) => r.status === "L").length;
    return { total, present, absent, leave, pct: total > 0 ? Math.round((present / total) * 100) : 0 };
  }, [student, records]);

  // Build timetable view — uses date range filter or defaults to last 2 weeks
  const attendanceTimetable = useMemo(() => {
    if (!student) return [];
    const today = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const daysData: { date: string; dayName: string; periods: { period: number; subject: string; status: AttendanceStatus }[] }[] = [];

    // Determine date range
    const fromDate = attendanceFromDate || new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000);
    const toDate = attendanceToDate || today;

    const current = new Date(fromDate);
    current.setHours(0, 0, 0, 0);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

    while (current <= end) {
      const dayName = dayNames[current.getDay()];
      if (dayName !== "Sunday") {
        const dateStr = current.toISOString().split("T")[0];
        const slots = timetable[dayName] || [];
        const periods = slots.map((slot) => {
          const record = records.find(
            (r) => r.student_id === student.student_id && r.date === dateStr && r.period === slot.period
          );
          return { period: slot.period, subject: slot.subject_name, status: record?.status || ("—" as AttendanceStatus) };
        });
        daysData.push({ date: dateStr, dayName, periods });
      }
      current.setDate(current.getDate() + 1);
    }
    return daysData;
  }, [student, records, timetable, attendanceFromDate, attendanceToDate]);

  // My leaves
  const myLeaves = requests.filter((r) => r.student_id === student?.student_id);

  // My payments
  const myPayments = payments.filter((p) => p.student_id === student?.student_id || p.student_id === 0);

  // Calendar events
  const upcomingEvents = events
    .filter((e) => e.date >= new Date().toISOString().split("T")[0])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLeaveSubmit = () => {
    if (!leaveDate || !leaveReason.trim()) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    const d = new Date(leaveDate);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    addRequest({
      student_id: student.student_id,
      student_name: student.name,
      date: leaveDate,
      day: dayNames[d.getDay()],
      reason: leaveReason,
      leave_type: leaveType,
    });
    setLeaveOpen(false);
    setLeaveDate("");
    setLeaveReason("");
    toast({ title: "✅ Leave Request Submitted" });
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
            <Badge variant="secondary" className="text-xs">{student.uid}</Badge>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-display">Welcome, {student.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {student.department} · Semester {student.semester} · {student.uid}
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { title: "My Subjects", value: myMarks.length, icon: BookOpen, desc: "Subjects with marks" },
            { title: "Average Marks", value: `${avg}%`, icon: TrendingUp, desc: `Grade: ${getGradeLabel(avg)}` },
            { title: "Highest Score", value: highest, icon: Award, desc: "Best performance" },
            { title: "Attendance", value: `${myAttendance.pct}%`, icon: ClipboardCheck, desc: `${myAttendance.present}/${myAttendance.total} periods` },
          ].map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}>
              <StatCard title={s.title} value={s.value} icon={s.icon} description={s.desc} />
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="marks" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="marks"><ClipboardList className="mr-1 h-3.5 w-3.5" /> Marks</TabsTrigger>
            <TabsTrigger value="report-card"><Download className="mr-1 h-3.5 w-3.5" /> Report Card</TabsTrigger>
            <TabsTrigger value="timetable"><TableIcon className="mr-1 h-3.5 w-3.5" /> Timetable</TabsTrigger>
            <TabsTrigger value="attendance"><ClipboardCheck className="mr-1 h-3.5 w-3.5" /> Attendance</TabsTrigger>
            <TabsTrigger value="leaves"><FileText className="mr-1 h-3.5 w-3.5" /> Leaves</TabsTrigger>
            <TabsTrigger value="notices"><Megaphone className="mr-1 h-3.5 w-3.5" /> Notices</TabsTrigger>
            <TabsTrigger value="calendar"><CalendarDays className="mr-1 h-3.5 w-3.5" /> Calendar</TabsTrigger>
            <TabsTrigger value="fees"><DollarSign className="mr-1 h-3.5 w-3.5" /> Fees</TabsTrigger>
          </TabsList>

          {/* MARKS TAB */}
          <TabsContent value="marks" className="space-y-4">
            <div className="flex items-center gap-3">
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border bg-card shadow-card">
              {semesterMarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ClipboardList className="mb-3 h-10 w-10 opacity-40" />
                  <p className="font-medium">No marks for Semester {selectedSemester}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead className="w-24">Marks</TableHead>
                      <TableHead className="w-20">Grade</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {semesterMarks.map((m) => (
                      <TableRow key={m.mark_id}>
                        <TableCell className="font-medium">{m.subject_name}</TableCell>
                        <TableCell className="font-semibold">{m.marks}</TableCell>
                        <TableCell><Badge className={getGradeColor(m.marks)}>{getGradeLabel(m.marks)}</Badge></TableCell>
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
            </div>

            {/* Performance chart */}
            {performanceData.length > 1 && (
              <div className="rounded-xl border bg-card p-5 shadow-card">
                <h3 className="font-semibold font-display mb-4">Semester Performance Analysis</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="semester" fontSize={12} />
                    <YAxis domain={[0, 100]} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="average" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>

          {/* REPORT CARD TAB */}
          <TabsContent value="report-card" className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6 shadow-card">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold font-display">Download Semester Report Card</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Generate a comprehensive PDF report card including your marks, attendance summary, enrolled subjects, and teacher remarks for a specific semester.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="space-y-2">
                  <Label>Select Semester</Label>
                  <Select value={reportSemester} onValueChange={setReportSemester}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="gradient-primary text-primary-foreground"
                  onClick={() => {
                    const sem = Number(reportSemester);
                    const subMap = new Map(subjects.map((s) => [s.subject_id, s]));
                    const semMarks = marks
                      .filter((m) => m.student_id === student.student_id)
                      .map((m) => {
                        const sub = subMap.get(m.subject_id);
                        return { ...m, subject_name: sub?.subject_name || "Unknown", semester: sub?.semester || 0 };
                      })
                      .filter((m) => m.semester === sem);

                    generateSemesterReportCard(student, semMarks.length > 0 ? semMarks : myMarks, sem, records, subjects);
                    toast({ title: `✅ Report Card for Semester ${sem} downloaded` });
                  }}
                >
                  <Download className="mr-2 h-4 w-4" /> Download Report Card PDF
                </Button>
              </div>

              {/* Preview info */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border bg-muted/30 p-4 text-center">
                  <GraduationCap className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Includes</p>
                  <p className="text-sm font-semibold">Student Details</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4 text-center">
                  <ClipboardList className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Includes</p>
                  <p className="text-sm font-semibold">Marks & Grades</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4 text-center">
                  <ClipboardCheck className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Includes</p>
                  <p className="text-sm font-semibold">Attendance & Remarks</p>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* TIMETABLE TAB */}
          <TabsContent value="timetable" className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card shadow-card overflow-x-auto">
              <div className="p-4 border-b">
                <h3 className="font-semibold font-display">Weekly Class Timetable</h3>
                <p className="mt-1 text-xs text-muted-foreground">6 periods per day · Monday to Saturday</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Day</TableHead>
                    {[1, 2, 3, 4, 5, 6].map((p) => (
                      <TableHead key={p} className="text-center min-w-[130px]">Period {p}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
                    const slots = timetable[day] || [];
                    return (
                      <TableRow key={day}>
                        <TableCell className="font-semibold">{day}</TableCell>
                        {slots.map((slot) => (
                          <TableCell key={slot.period} className="text-center">
                            <div className="rounded-lg border bg-muted/40 px-2 py-2">
                              <p className="text-xs font-medium leading-tight">{slot.subject_name}</p>
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </motion.div>

            {/* Subject summary */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold font-display mb-3">Weekly Subject Hours</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(() => {
                  const countMap: Record<string, number> = {};
                  ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].forEach((day) => {
                    (timetable[day] || []).forEach((slot) => {
                      countMap[slot.subject_name] = (countMap[slot.subject_name] || 0) + 1;
                    });
                  });
                  return Object.entries(countMap)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, count]) => (
                      <div key={name} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-tight">{name}</p>
                          <p className="text-xs text-muted-foreground">{count} periods/week</p>
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            {/* Date filter */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Filter className="h-4 w-4" /> Filter by date:
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-[160px] justify-start text-left text-sm font-normal", !attendanceFromDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {attendanceFromDate ? format(attendanceFromDate, "dd MMM yyyy") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={attendanceFromDate} onSelect={setAttendanceFromDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-[160px] justify-start text-left text-sm font-normal", !attendanceToDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {attendanceToDate ? format(attendanceToDate, "dd MMM yyyy") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={attendanceToDate} onSelect={setAttendanceToDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                </div>
                {(attendanceFromDate || attendanceToDate) && (
                  <Button variant="ghost" size="sm" onClick={() => { setAttendanceFromDate(undefined); setAttendanceToDate(undefined); }}>
                    Clear filters
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
              <div className="p-4 border-b">
                <h3 className="font-semibold font-display">
                  Attendance Timetable
                  {attendanceFromDate || attendanceToDate ? (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      ({attendanceFromDate ? format(attendanceFromDate, "dd MMM") : "..."} — {attendanceToDate ? format(attendanceToDate, "dd MMM") : "today"})
                    </span>
                  ) : (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">(Last 2 weeks)</span>
                  )}
                </h3>
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Present</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-red-500" /> Absent</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-blue-500" /> Leave</span>
                </div>
              </div>
              {attendanceTimetable.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ClipboardCheck className="mb-3 h-10 w-10 opacity-40" />
                  <p className="font-medium">No attendance records for this date range</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px]">Day</TableHead>
                      {[1, 2, 3, 4, 5, 6].map((p) => (
                        <TableHead key={p} className="text-center">P{p}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceTimetable.map((day) => (
                      <TableRow key={day.date}>
                        <TableCell>
                          <div className="text-sm font-medium">{day.dayName}</div>
                          <div className="text-[10px] text-muted-foreground">{day.date}</div>
                        </TableCell>
                        {day.periods.map((p) => (
                          <TableCell key={p.period} className="text-center">
                            {p.status === ("—" as any) ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              <span className={`inline-flex h-7 w-7 items-center justify-center rounded text-xs font-bold ${statusColors[p.status]}`}>
                                {p.status}
                              </span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border bg-card p-4 text-center shadow-card">
                <CheckCircle className="mx-auto h-6 w-6 text-emerald-500" />
                <p className="mt-2 text-2xl font-bold">{myAttendance.present}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-center shadow-card">
                <XCircle className="mx-auto h-6 w-6 text-red-500" />
                <p className="mt-2 text-2xl font-bold">{myAttendance.absent}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-center shadow-card">
                <Clock className="mx-auto h-6 w-6 text-blue-500" />
                <p className="mt-2 text-2xl font-bold">{myAttendance.leave}</p>
                <p className="text-xs text-muted-foreground">Leave</p>
              </div>
            </div>
          </TabsContent>

          {/* LEAVES TAB */}
          <TabsContent value="leaves" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setLeaveOpen(true)} className="gradient-primary text-primary-foreground">
                <Send className="mr-2 h-4 w-4" /> Request Leave
              </Button>
            </div>

            <div className="rounded-xl border bg-card shadow-card">
              {myLeaves.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No leave requests yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myLeaves.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.day}</TableCell>
                        <TableCell><Badge variant="secondary">{r.leave_type}</Badge></TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">{r.reason}</TableCell>
                        <TableCell>
                          <Badge variant={
                            r.status === "Approved" ? "secondary" :
                            r.status === "Rejected" ? "destructive" : "outline"
                          }>
                            {r.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* NOTICES TAB */}
          <TabsContent value="notices" className="space-y-4">
            {notices.length === 0 ? (
              <div className="rounded-xl border bg-card py-12 text-center text-muted-foreground shadow-card">No notices yet.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {notices.sort((a, b) => b.created_at.localeCompare(a.created_at)).map((n) => (
                  <div key={n.id} className="rounded-xl border bg-card p-5 shadow-card hover-lift">
                    <div className="flex items-center gap-2 mb-2">
                      <Megaphone className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">{n.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{n.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{n.date}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* CALENDAR TAB */}
          <TabsContent value="calendar" className="space-y-4">
            <div className="rounded-xl border bg-card shadow-card">
              {upcomingEvents.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No upcoming events.</div>
              ) : (
                <div className="divide-y">
                  {upcomingEvents.map((e) => (
                    <div key={e.id} className="flex items-center gap-4 p-4">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-secondary text-xs">
                        <span className="font-bold">{new Date(e.date).getDate()}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(e.date).toLocaleString("default", { month: "short" })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{e.title}</p>
                        {e.description && <p className="text-xs text-muted-foreground">{e.description}</p>}
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{e.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* FEES TAB */}
          <TabsContent value="fees" className="space-y-4">
            <div className="rounded-xl border bg-card shadow-card">
              {myPayments.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No payment requests.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myPayments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.title}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-[10px]">{p.payment_type}</Badge></TableCell>
                        <TableCell className="font-semibold">₹{p.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">{p.due_date}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === "Paid" ? "secondary" : "destructive"}>{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {p.status === "Pending" ? (
                            <Button size="sm" onClick={() => {
                              payFee(p.id);
                              toast({ title: "💰 Payment Successful!", description: `Paid ₹${p.amount} for ${p.title}` });
                            }} className="gradient-primary text-primary-foreground text-xs">
                              Pay Now
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Paid {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : ""}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Leave Request Dialog */}
      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Request Leave</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Leave Type</Label>
              <Select value={leaveType} onValueChange={(v) => setLeaveType(v as LeaveType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Day">Full Day</SelectItem>
                  <SelectItem value="Half Day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder="Reason for leave…" rows={3} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setLeaveOpen(false)}>Cancel</Button>
              <Button onClick={handleLeaveSubmit} className="gradient-primary text-primary-foreground">Submit Request</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
