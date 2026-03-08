import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Subject } from "@/hooks/useSubjects";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
  onSave: (data: Omit<Subject, "subject_id"> & { subject_id?: number }) => void;
}

const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Electrical"];

const emptyForm = { subject_name: "", semester: 1, department: "" };

const SubjectFormDialog = ({ open, onOpenChange, subject, onSave }: Props) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (subject) {
      setForm({ subject_name: subject.subject_name, semester: subject.semester, department: subject.department });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [subject, open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.subject_name.trim()) e.subject_name = "Subject name is required";
    if (form.semester < 1 || form.semester > 8) e.semester = "Semester must be 1–8";
    if (!form.department) e.department = "Department is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    onSave({ ...form, semester: Number(form.semester) });
    setSaving(false);
  };

  const set = (key: string, value: string | number) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined as unknown as string }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{subject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="subject_name">Subject Name</Label>
            <Input id="subject_name" value={form.subject_name} onChange={(e) => set("subject_name", e.target.value)} placeholder="e.g. Data Structures" />
            {errors.subject_name && <p className="text-xs text-destructive">{errors.subject_name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={form.department} onValueChange={(v) => set("department", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="semester">Semester</Label>
              <Input id="semester" type="number" min={1} max={8} value={form.semester} onChange={(e) => set("semester", Number(e.target.value))} />
              {errors.semester && <p className="text-xs text-destructive">{errors.semester}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="gradient-primary text-primary-foreground" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {subject ? "Update Subject" : "Add Subject"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectFormDialog;
