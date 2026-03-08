import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCalendarEvents, EventType } from "@/hooks/useCalendarEvents";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const eventTypeColors: Record<EventType, string> = {
  Exam: "#ef4444",
  Holiday: "#22c55e",
  Workshop: "#3b82f6",
  "Project Submission": "#f59e0b",
  Other: "#8b5cf6",
};

const CalendarPage = () => {
  const { toast } = useToast();
  const { events, addEvent, removeEvent } = useCalendarEvents();
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<EventType>("Other");
  const [desc, setDesc] = useState("");

  const calendarEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    backgroundColor: eventTypeColors[e.type],
    borderColor: eventTypeColors[e.type],
    extendedProps: { type: e.type, description: e.description },
  }));

  const handleAdd = () => {
    if (!title.trim() || !date) {
      toast({ title: "Fill required fields", variant: "destructive" });
      return;
    }
    addEvent({ title, date, type, description: desc });
    setFormOpen(false);
    setTitle(""); setDate(""); setDesc("");
    toast({ title: "📅 Event Added" });
  };

  const handleDateClick = (arg: { dateStr: string }) => {
    setDate(arg.dateStr);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Academic Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">{events.length} events scheduled</p>
        </div>
        <Button onClick={() => { setDate(new Date().toISOString().split("T")[0]); setFormOpen(true); }}
          className="gradient-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-xl border bg-card p-4 shadow-card">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            dateClick={handleDateClick}
            height="auto"
            headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="space-y-3">
          <h3 className="font-semibold font-display">Upcoming Events</h3>
          {events
            .filter((e) => e.date >= new Date().toISOString().split("T")[0])
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 8)
            .map((e) => (
              <div key={e.id} className="flex items-start gap-3 rounded-lg border bg-card p-3 shadow-sm">
                <div className="h-3 w-3 mt-1.5 rounded-full shrink-0" style={{ backgroundColor: eventTypeColors[e.type] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.date}</p>
                  <Badge variant="secondary" className="mt-1 text-[10px]">{e.type}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => {
                  removeEvent(e.id);
                  toast({ title: "Event removed", variant: "destructive" });
                }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
        </motion.div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {Object.entries(eventTypeColors).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            {type}
          </span>
        ))}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add Calendar Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as EventType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Exam">Exam</SelectItem>
                    <SelectItem value="Holiday">Holiday</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Project Submission">Project Submission</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Details…" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} className="gradient-primary text-primary-foreground">Add Event</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
