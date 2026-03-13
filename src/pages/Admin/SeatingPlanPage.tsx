import { useState } from "react";
import { useExams, Exam } from "@/hooks/useSeatingPlan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import SeatingClassroomPage from "./SeatingClassroomPage";

const SeatingPlanPage = () => {
  const { exams, addExam, updateExam, deleteExam } = useExams();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", date: "", session: "Morning" as Exam["session"], description: "" });

  const openCreate = () => {
    setEditingExam(null);
    setForm({ name: "", date: "", session: "Morning", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (exam: Exam) => {
    setEditingExam(exam);
    setForm({ name: exam.name, date: exam.date, session: exam.session, description: exam.description || "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.date) {
      toast({ title: "Error", description: "Exam name and date are required.", variant: "destructive" });
      return;
    }
    if (editingExam) {
      updateExam(editingExam.id, form);
      toast({ title: "Updated", description: "Exam updated successfully." });
    } else {
      addExam(form);
      toast({ title: "Created", description: "Exam created successfully." });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteExam(id);
    toast({ title: "Deleted", description: "Exam deleted." });
  };

  if (selectedExamId) {
    const exam = exams.find((e) => e.id === selectedExamId);
    if (!exam) { setSelectedExamId(null); return null; }
    return <SeatingClassroomPage exam={exam} onBack={() => setSelectedExamId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Seating Plan Management</h1>
          <p className="text-sm text-muted-foreground">Create exams and manage seating arrangements</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Create Exam</Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No exams created yet. Click "Create Exam" to get started.
                </TableCell>
              </TableRow>
            ) : (
              exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.name}</TableCell>
                  <TableCell>{format(new Date(exam.date), "dd MMM yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{exam.session}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">{exam.description || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedExamId(exam.id)}>
                        <FolderOpen className="mr-1 h-3 w-3" /> Open
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(exam)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(exam.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExam ? "Edit Exam" : "Create Exam"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Exam Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Semester Exam" />
            </div>
            <div>
              <Label>Exam Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <Label>Session Type</Label>
              <Select value={form.session} onValueChange={(v) => setForm({ ...form, session: v as Exam["session"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning">Morning</SelectItem>
                  <SelectItem value="Afternoon">Afternoon</SelectItem>
                  <SelectItem value="Evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingExam ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeatingPlanPage;
