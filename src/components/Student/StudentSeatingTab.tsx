import { useMemo } from "react";
import { useSeatingLayout, useExams, useClassrooms } from "@/hooks/useSeatingPlan";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Armchair } from "lucide-react";
import jsPDF from "jspdf";

function getSeatInfo(seatNumber: number) {
  const row = Math.ceil(seatNumber / 14);
  const posInRow = seatNumber - (row - 1) * 14;
  const bench = Math.ceil(posInRow / 2);
  return { row, bench };
}

interface Props {
  studentUid?: string;
}

const StudentSeatingTab = ({ studentUid }: Props) => {
  const { exams } = useExams();
  const { allClassrooms } = useClassrooms();
  const { getStudentSeating } = useSeatingLayout();

  const mySeats = useMemo(() => {
    if (!studentUid) return [];
    return getStudentSeating(studentUid).map((entry) => {
      const exam = exams.find((e) => e.id === entry.examId);
      const classroom = allClassrooms.find((c) => c.id === entry.classroomId);
      const info = getSeatInfo(entry.seat.seatNumber);
      return { ...entry, exam, classroom, ...info };
    });
  }, [studentUid, getStudentSeating, exams, allClassrooms]);

  const downloadSlip = (seat: typeof mySeats[0]) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Seating Slip", 80, 20);
    doc.setFontSize(12);
    let y = 40;
    const lines = [
      `Student Name: ${seat.seat.studentName || ""}`,
      `UID: ${seat.seat.uid || ""}`,
      `Exam: ${seat.exam?.name || ""}`,
      `Date: ${seat.exam?.date || ""}`,
      `Session: ${seat.exam?.session || ""}`,
      `Classroom: ${seat.classroom?.name || ""}`,
      `Seat Number: ${seat.seat.seatNumber}`,
      `Row: ${seat.row}`,
      `Bench: ${seat.bench}`,
    ];
    lines.forEach((l) => { doc.text(l, 20, y); y += 10; });
    doc.save(`seating_slip_${seat.seat.seatNumber}.pdf`);
  };

  if (!studentUid) {
    return <p className="text-center text-muted-foreground py-8">No student data available.</p>;
  }

  if (mySeats.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <Armchair className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground">No seating plans assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mySeats.map((seat, i) => (
        <div key={i} className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{seat.exam?.name || "Exam"}</h3>
            <Badge variant="outline">{seat.exam?.session}</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{seat.exam?.date}</span></div>
            <div><span className="text-muted-foreground">Room:</span> <span className="font-medium">{seat.classroom?.name}</span></div>
            <div><span className="text-muted-foreground">Seat:</span> <span className="font-medium">{seat.seat.seatNumber}</span></div>
            <div><span className="text-muted-foreground">Row:</span> <span className="font-medium">{seat.row}</span></div>
            <div><span className="text-muted-foreground">Bench:</span> <span className="font-medium">{seat.bench}</span></div>
          </div>
          <Button size="sm" variant="outline" onClick={() => downloadSlip(seat)}>
            <Download className="mr-1 h-3 w-3" /> Download Slip
          </Button>
        </div>
      ))}
    </div>
  );
};

export default StudentSeatingTab;
