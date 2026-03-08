import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useMarks, Mark, MarkJoined } from "@/hooks/useMarks";
import { useStudents } from "@/hooks/useStudents";
import { useSubjects } from "@/hooks/useSubjects";
import MarksFormDialog from "@/components/Admin/MarksFormDialog";

function getGradeBadge(marks: number) {
  if (marks >= 90) return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">A+</Badge>;
  if (marks >= 80) return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">A</Badge>;
  if (marks >= 70) return <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">B</Badge>;
  if (marks >= 60) return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">C</Badge>;
  if (marks >= 50) return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">D</Badge>;
  return <Badge variant="destructive">F</Badge>;
}

const MarksPage = () => {
  const { toast } = useToast();
  const { marks, addMark, updateMark, removeMark } = useMarks();
  const { students } = useStudents();
  const { subjects } = useSubjects();

  const [search, setSearch] = useState("");
  const [semFilter, setSemFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  // JOIN marks with students and subjects
  const joined: MarkJoined[] = useMemo(() => {
    const studentMap = new Map(students.map((s) => [s.student_id, s]));
    const subjectMap = new Map(subjects.map((s) => [s.subject_id, s]));
    return marks
      .map((m) => {
        const student = studentMap.get(m.student_id);
        const subject = subjectMap.get(m.subject_id);
        if (!student || !subject) return null;
        return {
          ...m,
          student_name: student.name,
          subject_name: subject.subject_name,
          department: student.department,
          semester: subject.semester,
        };
      })
      .filter(Boolean) as MarkJoined[];
  }, [marks, students, subjects]);

  // Subjects available for the selected semester
  const availableSubjects = useMemo(() => {
    if (semFilter === "all") return subjects;
    return subjects.filter((s) => s.semester === Number(semFilter));
  }, [subjects, semFilter]);

  // Reset subject filter when semester changes
  const handleSemChange = (val: string) => {
    setSemFilter(val);
    setSubjectFilter("all");
  };

  const filtered = joined.filter((r) => {
    const matchSearch =
      r.student_name.toLowerCase().includes(search.toLowerCase()) ||
      r.subject_name.toLowerCase().includes(search.toLowerCase());
    const matchSem = semFilter === "all" || r.semester === Number(semFilter);
    const matchSubject = subjectFilter === "all" || r.subject_id === Number(subjectFilter);
    return matchSearch && matchSem && matchSubject;
  });

  const handleSave = (data: Omit<Mark, "mark_id"> & { mark_id?: number }) => {
    if (editing) {
      updateMark({ ...editing, ...data });
      toast({ title: "Marks updated" });
    } else {
      addMark(data as Omit<Mark, "mark_id">);
      toast({ title: "Marks assigned" });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      removeMark(deleteTarget.mark_id);
      toast({ title: "Marks record deleted", variant: "destructive" });
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Marks Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">{marks.length} records — showing joined student + subject data</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gradient-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Assign Marks
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by student or subject…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={semFilter} onValueChange={setSemFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Semester" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card shadow-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ClipboardList className="mb-3 h-10 w-10 opacity-40" />
            <p className="font-medium">No marks records found</p>
            <p className="mt-1 text-sm">Assign marks or adjust your filters.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="w-24">Semester</TableHead>
                <TableHead className="w-24">Marks</TableHead>
                <TableHead className="w-20">Grade</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.mark_id} className="transition-colors hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">{r.mark_id}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{r.student_name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">#{r.student_id}</span>
                    </div>
                  </TableCell>
                  <TableCell>{r.subject_name}</TableCell>
                  <TableCell>{r.semester}</TableCell>
                  <TableCell className="font-semibold">{r.marks}</TableCell>
                  <TableCell>{getGradeBadge(r.marks)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setFormOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(r)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      <MarksFormDialog
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(null); }}
        mark={editing}
        students={students}
        subjects={subjects}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Marks Record</AlertDialogTitle>
            <AlertDialogDescription>
              Delete marks for <strong>{deleteTarget?.student_name}</strong> in <strong>{deleteTarget?.subject_name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MarksPage;
