import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Mark } from "@/hooks/useMarks";
import type { Student } from "@/hooks/useStudents";
import type { Subject } from "@/hooks/useSubjects";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mark: Mark | null;
  students: Student[];
  subjects: Subject[];
  onSave: (data: Omit<Mark, "mark_id"> & { mark_id?: number }) => void;
}

const MarksFormDialog = ({ open, onOpenChange, mark, students, subjects, onSave }: Props) => {
  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [marks, setMarks] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mark) {
      setStudentId(String(mark.student_id));
      setSubjectId(String(mark.subject_id));
      setMarks(String(mark.marks));
    } else {
      setStudentId("");
      setSubjectId("");
      setMarks("");
    }
    setErrors({});
  }, [mark, open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!studentId) e.studentId = "Select a student";
    if (!subjectId) e.subjectId = "Select a subject";
    const m = Number(marks);
    if (!marks || isNaN(m)) e.marks = "Marks are required";
    else if (m < 0 || m > 100) e.marks = "Marks must be 0–100";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    onSave({
      student_id: Number(studentId),
      subject_id: Number(subjectId),
      marks: Number(marks),
    });
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{mark ? "Edit Marks" : "Assign Marks"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label>Student</Label>
            <Select value={studentId} onValueChange={(v) => { setStudentId(v); setErrors((p) => ({ ...p, studentId: "" })); }}>
              <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.student_id} value={String(s.student_id)}>
                    {s.student_id} — {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.studentId && <p className="text-xs text-destructive">{errors.studentId}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); setErrors((p) => ({ ...p, subjectId: "" })); }}>
              <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.subject_id} value={String(s.subject_id)}>
                    {s.subject_name} (Sem {s.semester})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subjectId && <p className="text-xs text-destructive">{errors.subjectId}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="marks">Marks (0–100)</Label>
            <Input
              id="marks"
              type="number"
              min={0}
              max={100}
              value={marks}
              onChange={(e) => { setMarks(e.target.value); setErrors((p) => ({ ...p, marks: "" })); }}
              placeholder="Enter marks"
            />
            {errors.marks && <p className="text-xs text-destructive">{errors.marks}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="gradient-primary text-primary-foreground" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mark ? "Update Marks" : "Assign Marks"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MarksFormDialog;
