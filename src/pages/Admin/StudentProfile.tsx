import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, Building2, Hash, GraduationCap, Download, Pencil, Printer, CreditCard, User, MapPin, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStudents } from "@/hooks/useStudents";
import { useMarks } from "@/hooks/useMarks";
import { useSubjects } from "@/hooks/useSubjects";
import { useAttendance } from "@/hooks/useAttendance";
import { generateStudentReport, generateIdCard } from "@/lib/pdfExport";

function getGradeLabel(m: number) {
  if (m >= 90) return "A+";
  if (m >= 80) return "A";
  if (m >= 70) return "B";
  if (m >= 60) return "C";
  if (m >= 50) return "D";
  return "F";
}

function getGradeColor(m: number) {
  if (m >= 90) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (m >= 80) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (m >= 70) return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400";
  if (m >= 60) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  if (m >= 50) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
}

const StudentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { students } = useStudents();
  const { marks } = useMarks();
  const { subjects } = useSubjects();
  const { records: attendanceRecords } = useAttendance();

  const student = students.find((s) => s.student_id === Number(id));

  const myMarks = useMemo(() => {
    if (!student) return [];
    const subMap = new Map(subjects.map((s) => [s.subject_id, s]));
    return marks
      .filter((m) => m.student_id === student.student_id)
      .map((m) => {
        const sub = subMap.get(m.subject_id);
        return { ...m, subject_name: sub?.subject_name || "Unknown", semester: sub?.semester || 0 };
      });
  }, [student, marks, subjects]);

  const avg = myMarks.length > 0 ? Math.round(myMarks.reduce((s, m) => s + m.marks, 0) / myMarks.length) : 0;

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">Student not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/admin/students")}>Back to Students</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/admin/students")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </button>

      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Photo */}
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-secondary text-4xl font-bold font-display text-secondary-foreground overflow-hidden">
            {student.photo_url ? (
              <img src={student.photo_url} alt={student.name} className="h-full w-full object-cover" />
            ) : (
              student.name.charAt(0)
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl font-bold font-display">{student.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{student.department}</Badge>
                <Badge variant="outline">Semester {student.semester}</Badge>
              </div>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-muted-foreground"><Hash className="h-4 w-4" /> UID: {student.uid}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Hash className="h-4 w-4" /> Roll No: {student.rollNo}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {student.email}</div>
              {student.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {student.phone}</div>}
              <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-4 w-4" /> {student.department}</div>
              {student.father_name && <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> Father: {student.father_name}</div>}
              {student.mother_name && <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> Mother: {student.mother_name}</div>}
              {student.place && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {student.place}</div>}
              {student.blood_group && <div className="flex items-center gap-2 text-muted-foreground"><Droplets className="h-4 w-4" /> Blood Group: {student.blood_group}</div>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/students`)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => generateStudentReport(student, myMarks, avg, attendanceRecords, subjects)}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Report PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => generateIdCard(student)}>
              <CreditCard className="mr-1.5 h-3.5 w-3.5" /> ID Card
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Academic summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Subjects", value: myMarks.length },
          { label: "Average Marks", value: `${avg}%` },
          { label: "Overall Grade", value: getGradeLabel(avg) },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}
            className="rounded-xl border bg-card p-5 shadow-card text-center">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-bold font-display">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Marks table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-xl border bg-card shadow-card">
        <div className="border-b p-5">
          <h2 className="text-base font-semibold font-display">Academic Results</h2>
        </div>
        {myMarks.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No marks recorded for this student.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead className="w-24">Semester</TableHead>
                <TableHead className="w-20">Marks</TableHead>
                <TableHead className="w-20">Grade</TableHead>
                <TableHead className="w-20">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myMarks.map((m) => (
                <TableRow key={m.mark_id} className="transition-colors hover:bg-muted/50">
                  <TableCell className="font-medium">{m.subject_name}</TableCell>
                  <TableCell>{m.semester}</TableCell>
                  <TableCell className="font-semibold">{m.marks}</TableCell>
                  <TableCell><Badge className={getGradeColor(m.marks)}>{getGradeLabel(m.marks)}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={m.marks >= 50 ? "secondary" : "destructive"}>{m.marks >= 50 ? "Pass" : "Fail"}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  );
};

export default StudentProfile;
