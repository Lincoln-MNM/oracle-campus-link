import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Student } from "@/hooks/useStudents";
import PhotoUpload from "@/components/Admin/PhotoUpload";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSave: (data: Omit<Student, "student_id"> & { student_id?: number }) => void;
}

const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Electrical"];

const emptyForm = { name: "", uid: "", department: "", semester: 1, email: "", phone: "", password: "", photo_url: "" };

const StudentFormDialog = ({ open, onOpenChange, student, onSave }: Props) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name,
        uid: student.uid || "",
        department: student.department,
        semester: student.semester,
        email: student.email,
        phone: student.phone || "",
        password: "",
        photo_url: student.photo_url || "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [student, open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.uid.trim()) e.uid = "UID is required";
    if (!form.department) e.department = "Department is required";
    if (form.semester < 1 || form.semester > 8) e.semester = "Semester must be 1–8";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!student && !form.password.trim()) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    onSave({ ...form, semester: Number(form.semester) });
    setSaving(false);
  };

  const set = (key: string, value: string | number) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined as unknown as string }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{student ? "Edit Student" : "Add New Student"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label>Profile Photo</Label>
            <PhotoUpload
              value={form.photo_url || undefined}
              onChange={(url) => setForm((p) => ({ ...p, photo_url: url || "" }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="John Doe" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="uid">Student UID</Label>
              <Input id="uid" value={form.uid} onChange={(e) => set("uid", e.target.value)} placeholder="U2408001" />
              {errors.uid && <p className="text-xs text-destructive">{errors.uid}</p>}
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="john@example.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{student ? "New Password (leave blank to keep)" : "Password"}</Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder={student ? "••••••••" : "Set password"} />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="gradient-primary text-primary-foreground" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {student ? "Update Student" : "Add Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentFormDialog;
