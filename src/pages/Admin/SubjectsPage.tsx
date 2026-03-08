import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useSubjects, Subject } from "@/hooks/useSubjects";
import SubjectFormDialog from "@/components/Admin/SubjectFormDialog";

const SubjectsPage = () => {
  const { toast } = useToast();
  const { subjects, addSubject, updateSubject, removeSubject } = useSubjects();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const filtered = subjects.filter(
    (s) =>
      s.subject_name.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data: Omit<Subject, "subject_id"> & { subject_id?: number }) => {
    if (editing) {
      updateSubject({ ...editing, ...data });
      toast({ title: "Subject updated" });
    } else {
      addSubject(data as Omit<Subject, "subject_id">);
      toast({ title: "Subject added" });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      removeSubject(deleteTarget.subject_id);
      toast({ title: "Subject deleted", variant: "destructive" });
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Subject Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subjects.length} subjects registered</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gradient-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Add Subject
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or department…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card shadow-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <BookOpen className="mb-3 h-10 w-10 opacity-40" />
            <p className="font-medium">No subjects found</p>
            <p className="mt-1 text-sm">Add a subject or adjust your search.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="w-28">Semester</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((subject) => (
                <TableRow key={subject.subject_id} className="transition-colors hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">{subject.subject_id}</TableCell>
                  <TableCell className="font-medium">{subject.subject_name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">{subject.department}</Badge>
                  </TableCell>
                  <TableCell>{subject.semester}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(subject); setFormOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(subject)}>
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

      <SubjectFormDialog open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(null); }} subject={editing} onSave={handleSave} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.subject_name}</strong>? This will also affect related marks records.
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

export default SubjectsPage;
