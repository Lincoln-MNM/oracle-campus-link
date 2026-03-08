import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Megaphone, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNotices } from "@/hooks/useNotices";

const NoticesPage = () => {
  const { toast } = useToast();
  const { notices, addNotice, removeNotice } = useNotices();
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleAdd = () => {
    if (!title.trim() || !description.trim()) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    addNotice({ title, description, date });
    setFormOpen(false);
    setTitle("");
    setDescription("");
    toast({ title: "📢 Notice Published" });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Notice Board</h1>
          <p className="mt-1 text-sm text-muted-foreground">{notices.length} notices published</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gradient-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Create Notice
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {notices.sort((a, b) => b.created_at.localeCompare(a.created_at)).map((notice, i) => (
          <motion.div key={notice.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border bg-card p-5 shadow-card hover-lift">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                <h3 className="font-semibold font-display">{notice.title}</h3>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => {
                removeNotice(notice.id);
                toast({ title: "Notice removed", variant: "destructive" });
              }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{notice.description}</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {notice.date}
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Create Notice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notice title" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notice details…" rows={4} />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} className="gradient-primary text-primary-foreground">Publish</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoticesPage;
