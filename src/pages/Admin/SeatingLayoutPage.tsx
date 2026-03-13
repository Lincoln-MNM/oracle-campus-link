import { useState, useCallback, useRef, useMemo } from "react";
import { Exam, Classroom, SeatAssignment, useSeatingLayout } from "@/hooks/useSeatingPlan";
import { useStudents } from "@/hooks/useStudents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Wand2, Trash2, Save, Download, Upload, X, GripVertical, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props {
  exam: Exam;
  classroom: Classroom;
  onBack: () => void;
}

interface DragStudent {
  name: string;
  studentClass: string;
  subject: string;
  uid: string;
}

const ROWS = 5;
const BENCHES_PER_ROW = 7;
const SEATS_PER_BENCH = 2;

function getSeatInfo(seatNumber: number) {
  const row = Math.ceil(seatNumber / (BENCHES_PER_ROW * SEATS_PER_BENCH));
  const posInRow = seatNumber - (row - 1) * BENCHES_PER_ROW * SEATS_PER_BENCH;
  const bench = Math.ceil(posInRow / SEATS_PER_BENCH);
  const side = posInRow % SEATS_PER_BENCH === 1 ? "Left" : "Right";
  return { row, bench, side };
}

function getBenchMate(seats: SeatAssignment[], seatNumber: number): SeatAssignment | undefined {
  const isOdd = seatNumber % 2 === 1;
  const mateNum = isOdd ? seatNumber + 1 : seatNumber - 1;
  return seats.find((s) => s.seatNumber === mateNum);
}

function detectConflicts(seats: SeatAssignment[], seatNumber: number): string[] {
  const seat = seats.find((s) => s.seatNumber === seatNumber);
  if (!seat?.studentName) return [];
  const warnings: string[] = [];
  const mate = getBenchMate(seats, seatNumber);
  if (mate?.studentName) {
    if (mate.subject && seat.subject && mate.subject === seat.subject) {
      warnings.push("Same subject on bench");
    }
    if (mate.studentClass && seat.studentClass && mate.studentClass === seat.studentClass) {
      warnings.push("Same class on bench");
    }
  }
  // Check duplicate UID
  if (seat.uid) {
    const dups = seats.filter((s) => s.uid === seat.uid && s.seatNumber !== seatNumber);
    if (dups.length > 0) warnings.push("Duplicate student");
  }
  return warnings;
}

const SeatingLayoutPage = ({ exam, classroom, onBack }: Props) => {
  const { seats: initialSeats, saveLayout, clearLayout } = useSeatingLayout(exam.id, classroom.id);
  const [seats, setSeats] = useState<SeatAssignment[]>(initialSeats);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [seatForm, setSeatForm] = useState({ studentName: "", studentClass: "", subject: "", uid: "" });
  const { students } = useStudents();
  const { toast } = useToast();
  const [dragStudent, setDragStudent] = useState<DragStudent | null>(null);
  const [studentFilter, setStudentFilter] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Student panel data
  const [importedStudents, setImportedStudents] = useState<DragStudent[]>([]);
  const studentList: DragStudent[] = useMemo(() => {
    const fromDb = students.map((s) => ({
      name: s.name,
      studentClass: `${s.department} S${s.semester}`,
      subject: "",
      uid: s.uid,
    }));
    return [...importedStudents, ...fromDb];
  }, [students, importedStudents]);

  const filteredStudents = useMemo(() => {
    const q = studentFilter.toLowerCase();
    return studentList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.uid.toLowerCase().includes(q) ||
        s.studentClass.toLowerCase().includes(q)
    );
  }, [studentList, studentFilter]);

  const openSeatModal = (seatNum: number) => {
    const seat = seats.find((s) => s.seatNumber === seatNum);
    setSeatForm({
      studentName: seat?.studentName || "",
      studentClass: seat?.studentClass || "",
      subject: seat?.subject || "",
      uid: seat?.uid || "",
    });
    setSelectedSeat(seatNum);
  };

  const saveSeatAssignment = () => {
    if (selectedSeat === null) return;
    setSeats((prev) =>
      prev.map((s) =>
        s.seatNumber === selectedSeat
          ? { ...s, studentName: seatForm.studentName, studentClass: seatForm.studentClass, subject: seatForm.subject, uid: seatForm.uid }
          : s
      )
    );
    setSelectedSeat(null);
  };

  const removeSeatAssignment = () => {
    if (selectedSeat === null) return;
    setSeats((prev) =>
      prev.map((s) => (s.seatNumber === selectedSeat ? { seatNumber: s.seatNumber } : s))
    );
    setSelectedSeat(null);
  };

  const handleSaveLayout = () => {
    saveLayout(seats);
    toast({ title: "Saved", description: "Seating layout saved successfully." });
  };

  const handleClear = () => {
    const empty = Array.from({ length: 70 }, (_, i) => ({ seatNumber: i + 1 } as SeatAssignment));
    setSeats(empty);
    clearLayout();
    toast({ title: "Cleared", description: "All seats cleared." });
  };

  // Drag and drop
  const handleDragStart = (student: DragStudent) => setDragStudent(student);
  const handleDrop = (seatNum: number) => {
    if (!dragStudent) return;
    setSeats((prev) =>
      prev.map((s) =>
        s.seatNumber === seatNum
          ? { ...s, studentName: dragStudent.name, studentClass: dragStudent.studentClass, subject: dragStudent.subject, uid: dragStudent.uid }
          : s
      )
    );
    setDragStudent(null);
  };

  // Auto generate
  const autoGenerate = () => {
    const available = [...studentList].sort(() => Math.random() - 0.5);
    const newSeats: SeatAssignment[] = Array.from({ length: 70 }, (_, i) => {
      const student = available[i];
      return {
        seatNumber: i + 1,
        studentName: student?.name,
        studentClass: student?.studentClass,
        subject: student?.subject,
        uid: student?.uid,
      };
    });
    // Try to avoid same subject on same bench
    for (let i = 0; i < newSeats.length - 1; i += 2) {
      if (newSeats[i].subject && newSeats[i + 1]?.subject && newSeats[i].subject === newSeats[i + 1].subject) {
        // swap with next bench if possible
        const swapIdx = i + 2;
        if (swapIdx < newSeats.length && newSeats[swapIdx].subject !== newSeats[i].subject) {
          const temp = newSeats[i + 1];
          newSeats[i + 1] = { ...newSeats[swapIdx], seatNumber: i + 2 };
          newSeats[swapIdx] = { ...temp, seatNumber: swapIdx + 1 };
        }
      }
    }
    setSeats(newSeats);
    toast({ title: "Auto Generated", description: "Students have been automatically assigned." });
  };

  // CSV Import
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      const header = lines[0].toLowerCase();
      const hasHeader = header.includes("name") || header.includes("uid");
      const dataLines = hasHeader ? lines.slice(1) : lines;
      const imported: DragStudent[] = dataLines.map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        return { name: cols[0] || "", studentClass: cols[1] || "", subject: cols[2] || "", uid: cols[3] || "" };
      }).filter((s) => s.name);
      setImportedStudents((prev) => [...prev, ...imported]);
      toast({ title: "Imported", description: `${imported.length} students imported from CSV.` });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${exam.name} - ${classroom.name}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Date: ${exam.date} | Session: ${exam.session}`, 14, 28);

    const tableData = seats
      .filter((s) => s.studentName)
      .map((s) => {
        const info = getSeatInfo(s.seatNumber);
        return [String(s.seatNumber), s.studentName!, s.uid || "", s.studentClass || "", s.subject || "", `R${info.row} B${info.bench}`];
      });

    autoTable(doc, {
      head: [["Seat", "Student", "UID", "Class", "Subject", "Position"]],
      body: tableData,
      startY: 34,
    });
    doc.save(`${exam.name}_${classroom.name}_seating.pdf`);
  };

  // Get seat color
  const getSeatColor = (seatNum: number) => {
    const seat = seats.find((s) => s.seatNumber === seatNum);
    if (!seat?.studentName) return "bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/30";
    const conflicts = detectConflicts(seats, seatNum);
    if (conflicts.some((c) => c.includes("Duplicate"))) return "bg-red-500/20 border-red-500/50 hover:bg-red-500/30";
    if (conflicts.length > 0) return "bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30";
    return "bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/30";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{classroom.name}</h1>
          <p className="text-sm text-muted-foreground">{exam.name} · {exam.date} · {exam.session}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-1 h-3 w-3" /> Import CSV
        </Button>
        <Button variant="outline" size="sm" onClick={autoGenerate}>
          <Wand2 className="mr-1 h-3 w-3" /> Auto Generate
        </Button>
        <Button variant="outline" size="sm" onClick={handleClear}>
          <Trash2 className="mr-1 h-3 w-3" /> Clear
        </Button>
        <Button variant="outline" size="sm" onClick={handleSaveLayout}>
          <Save className="mr-1 h-3 w-3" /> Save Layout
        </Button>
        <Button size="sm" onClick={exportPDF}>
          <Download className="mr-1 h-3 w-3" /> Export PDF
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-emerald-500/40" /> Empty</div>
        <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-blue-500/40" /> Assigned</div>
        <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-yellow-500/40" /> Warning</div>
        <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-red-500/40" /> Conflict</div>
      </div>

      {/* Two panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* Student List Panel */}
        <div className="rounded-xl border bg-card p-4 space-y-3 max-h-[600px] overflow-y-auto">
          <h3 className="text-sm font-semibold text-foreground">Student List</h3>
          <Input placeholder="Search students..." value={studentFilter} onChange={(e) => setStudentFilter(e.target.value)} className="h-8 text-xs" />
          <div className="space-y-1">
            {filteredStudents.slice(0, 50).map((s, i) => (
              <div
                key={`${s.uid}-${i}`}
                draggable
                onDragStart={() => handleDragStart(s)}
                className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs cursor-grab hover:bg-muted/60 transition-colors"
              >
                <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-muted-foreground truncate">{s.uid} · {s.studentClass}</p>
                </div>
              </div>
            ))}
            {filteredStudents.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No students found</p>}
          </div>
        </div>

        {/* Seating Grid */}
        <div className="rounded-xl border bg-card p-4 overflow-x-auto">
          {/* Teacher desk */}
          <div className="mx-auto mb-6 w-48 rounded-lg border-2 border-dashed border-muted-foreground/30 py-2 text-center text-xs font-medium text-muted-foreground">
            Teacher Desk / Board
          </div>

          {/* Grid */}
          <div className="space-y-3 min-w-[700px]">
            {Array.from({ length: ROWS }, (_, rowIdx) => (
              <div key={rowIdx} className="flex items-center gap-1">
                <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">Row {rowIdx + 1}</span>
                <div className="flex gap-3 flex-1">
                  {Array.from({ length: BENCHES_PER_ROW }, (_, benchIdx) => {
                    const seatBase = rowIdx * BENCHES_PER_ROW * SEATS_PER_BENCH + benchIdx * SEATS_PER_BENCH + 1;
                    return (
                      <div key={benchIdx} className="flex gap-0.5 rounded-lg border border-border/50 p-0.5 bg-muted/20">
                        {Array.from({ length: SEATS_PER_BENCH }, (_, seatIdx) => {
                          const seatNum = seatBase + seatIdx;
                          const seat = seats.find((s) => s.seatNumber === seatNum);
                          const conflicts = seat?.studentName ? detectConflicts(seats, seatNum) : [];
                          return (
                            <button
                              key={seatNum}
                              onClick={() => openSeatModal(seatNum)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => handleDrop(seatNum)}
                              title={seat?.studentName ? `${seat.studentName}\n${conflicts.join(", ")}` : `Seat ${seatNum}`}
                              className={`relative w-[72px] h-[52px] rounded-md border text-[10px] flex flex-col items-center justify-center transition-all ${getSeatColor(seatNum)}`}
                            >
                              <span className="font-bold">{seatNum}</span>
                              {seat?.studentName && (
                                <span className="truncate max-w-[64px] text-[9px] text-foreground/70">{seat.studentName.split(" ")[0]}</span>
                              )}
                              {conflicts.length > 0 && (
                                <AlertTriangle className="absolute top-0.5 right-0.5 h-2.5 w-2.5 text-yellow-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seat Assignment Modal */}
      <Dialog open={selectedSeat !== null} onOpenChange={(open) => !open && setSelectedSeat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seat #{selectedSeat}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student Name</Label>
              <Input value={seatForm.studentName} onChange={(e) => setSeatForm({ ...seatForm, studentName: e.target.value })} />
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={seatForm.subject} onChange={(e) => setSeatForm({ ...seatForm, subject: e.target.value })} />
            </div>
            <div>
              <Label>Class</Label>
              <Input value={seatForm.studentClass} onChange={(e) => setSeatForm({ ...seatForm, studentClass: e.target.value })} />
            </div>
            <div>
              <Label>UID</Label>
              <Input value={seatForm.uid} onChange={(e) => setSeatForm({ ...seatForm, uid: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={removeSeatAssignment}>Remove Student</Button>
            <Button variant="outline" onClick={() => setSelectedSeat(null)}>Cancel</Button>
            <Button onClick={saveSeatAssignment}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeatingLayoutPage;
