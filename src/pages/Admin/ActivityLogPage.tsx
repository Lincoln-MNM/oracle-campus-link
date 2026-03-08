import { useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, Clock, Trash2, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useActivityLog } from "@/hooks/useActivityLog";

const actionColors: Record<string, string> = {
  created: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  updated: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  deleted: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  login: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const ActivityLogPage = () => {
  const { logs, clearLogs } = useActivityLog();

  const sorted = useMemo(() => [...logs].reverse(), [logs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Activity Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">{logs.length} actions recorded</p>
        </div>
        <Button variant="outline" size="sm" onClick={clearLogs} disabled={logs.length === 0}>
          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear Logs
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card shadow-card">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Activity className="mb-3 h-10 w-10 opacity-40" />
            <p className="font-medium">No activity logged yet</p>
            <p className="mt-1 text-sm">Actions will appear here as they happen.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Time</TableHead>
                <TableHead className="w-20">Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-28">User</TableHead>
                <TableHead className="w-20">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.slice(0, 50).map((log) => (
                <TableRow key={log.id} className="transition-colors hover:bg-muted/50">
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={actionColors[log.action] || "bg-secondary text-secondary-foreground"}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.entity} #{log.entityId}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                  <TableCell className="text-sm">{log.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{log.role}</Badge>
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

export default ActivityLogPage;
