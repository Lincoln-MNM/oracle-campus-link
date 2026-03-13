import { useState } from "react";
import { useClassrooms, Exam } from "@/hooks/useSeatingPlan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, LayoutGrid } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SeatingLayoutPage from "./SeatingLayoutPage";

interface Props {
  exam: Exam;
  onBack: () => void;
}

const SeatingClassroomPage = ({ exam, onBack }: Props) => {
  const { classrooms, addClassroom, deleteClassroom } = useClassrooms(exam.id);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", roomNumber: "" });
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!form.name.trim()) {
      toast({ title: "Error", description: "Classroom name is required.", variant: "destructive" });
      return;
    }
    addClassroom({ examId: exam.id, name: form.name, roomNumber: form.roomNumber, capacity: 70 });
    toast({ title: "Created", description: "Classroom added." });
    setDialogOpen(false);
    setForm({ name: "", roomNumber: "" });
  };

  if (selectedClassroomId) {
    const classroom = classrooms.find((c) => c.id === selectedClassroomId);
    if (!classroom) { setSelectedClassroomId(null); return null; }
    return <SeatingLayoutPage exam={exam} classroom={classroom} onBack={() => setSelectedClassroomId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{exam.name}</h1>
          <p className="text-sm text-muted-foreground">{exam.date} · {exam.session} Session — Manage Classrooms</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Classroom</Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Classroom</TableHead>
              <TableHead>Room No.</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classrooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  No classrooms added. Click "Add Classroom" to begin.
                </TableCell>
              </TableRow>
            ) : (
              classrooms.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.roomNumber || "—"}</TableCell>
                  <TableCell>70</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedClassroomId(c.id)}>
                        <LayoutGrid className="mr-1 h-3 w-3" /> Open Layout
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteClassroom(c.id)}>
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
          <DialogHeader><DialogTitle>Add Classroom</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Classroom Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Room A101" />
            </div>
            <div>
              <Label>Room Number (optional)</Label>
              <Input value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} placeholder="e.g. A101" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeatingClassroomPage;
