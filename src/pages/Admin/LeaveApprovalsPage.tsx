import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useLeaveRequests, LeaveStatus } from "@/hooks/useLeaveRequests";
import { useAttendance } from "@/hooks/useAttendance";

const statusConfig: Record<LeaveStatus, { color: string; icon: typeof CheckCircle }> = {
  Pending: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
  Approved: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle },
  Rejected: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

const LeaveApprovalsPage = () => {
  const { toast } = useToast();
  const { requests, updateStatus } = useLeaveRequests();
  const { bulkMark } = useAttendance();

  const handleApprove = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    updateStatus(id, "Approved");

    // Auto-update attendance to Leave for all periods
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date(req.date);
    const dayName = days[d.getDay()];
    if (dayName !== "Sunday") {
      const periods = req.leave_type === "Full Day" ? [1, 2, 3, 4, 5, 6] : [1, 2, 3];
      const leaveRecords = periods.map((period) => ({
        id: `${req.date}-${req.student_id}-${period}`,
        student_id: req.student_id,
        date: req.date,
        period,
        subject_id: 13,
        status: "L" as const,
      }));
      bulkMark(leaveRecords);
    }

    toast({ title: "✅ Leave Approved", description: `${req.student_name}'s leave for ${req.date} approved.` });
  };

  const handleReject = (id: string) => {
    updateStatus(id, "Rejected");
    toast({ title: "❌ Leave Rejected", variant: "destructive" });
  };

  const pending = requests.filter((r) => r.status === "Pending");
  const processed = requests.filter((r) => r.status !== "Pending");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display">Leave Approvals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pending.length} pending request{pending.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border bg-card shadow-card">
          <div className="flex items-center gap-2 border-b p-4">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold font-display">Pending Requests</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.student_name}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.day}</TableCell>
                  <TableCell><Badge variant="secondary">{r.leave_type}</Badge></TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">{r.reason}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => handleApprove(r.id)}
                        className="bg-emerald-600 text-white hover:bg-emerald-700">
                        <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(r.id)}>
                        <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}

      {/* Processed */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl border bg-card shadow-card">
        <div className="flex items-center gap-2 border-b p-4">
          <CheckCircle className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold font-display">Processed Requests</h2>
        </div>
        {processed.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No processed requests yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processed.map((r) => {
                const cfg = statusConfig[r.status];
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.student_name}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell><Badge variant="secondary">{r.leave_type}</Badge></TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">{r.reason}</TableCell>
                    <TableCell>
                      <Badge className={cfg.color}>
                        <cfg.icon className="mr-1 h-3 w-3" /> {r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  );
};

export default LeaveApprovalsPage;
