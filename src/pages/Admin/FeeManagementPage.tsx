import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, DollarSign, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useStudents } from "@/hooks/useStudents";
import { useFeePayments, PaymentType } from "@/hooks/useFeePayments";

const FeeManagementPage = () => {
  const { toast } = useToast();
  const { students } = useStudents();
  const { payments, addPayment } = useFeePayments();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<PaymentType>("Semester Fee");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Unique payments grouped by title + student
  const studentMap = new Map(students.map((s) => [s.student_id, s]));
  const filtered = payments.filter((p) => {
    if (p.student_id === 0) return true;
    const student = studentMap.get(p.student_id);
    if (!student) return false;
    const matchSearch = student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.uid?.includes(search) || p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  }).slice(0, 50);

  const totalCollected = payments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "Pending").reduce((s, p) => s + p.amount, 0);

  const handleAdd = () => {
    if (!title.trim() || !amount || !dueDate) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    // Create payment for all students
    students.forEach((s) => {
      addPayment({
        student_id: s.student_id,
        title,
        payment_type: type,
        amount: Number(amount),
        status: "Pending",
        due_date: dueDate,
      });
    });
    setFormOpen(false);
    setTitle(""); setAmount(""); setDueDate("");
    toast({ title: "💰 Payment Request Created", description: `Created for ${students.length} students` });
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Fee Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage student fee payments</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gradient-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Create Payment Request
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <DollarSign className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Collected</p>
            <p className="text-2xl font-bold font-display">₹{totalCollected.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
            <DollarSign className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold font-display">₹{totalPending.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search student or fee…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const student = studentMap.get(p.student_id);
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {student ? (
                      <div>
                        <span>{student.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{student.uid}</span>
                      </div>
                    ) : "All Students"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="text-sm">{p.title}</span>
                      <Badge variant="secondary" className="ml-2 text-[10px]">{p.payment_type}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">₹{p.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{p.due_date}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "Paid" ? "secondary" : "destructive"}>
                      {p.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </motion.div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Create Payment Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Payment title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as PaymentType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semester Fee">Semester Fee</SelectItem>
                    <SelectItem value="Exam Fee">Exam Fee</SelectItem>
                    <SelectItem value="Event Fee">Event Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Amount (₹)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} className="gradient-primary text-primary-foreground">Create for All Students</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeeManagementPage;
