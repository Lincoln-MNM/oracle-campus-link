import jsPDF from "jspdf";
import "jspdf-autotable";
import type { Student } from "@/hooks/useStudents";
import type { AttendanceRecord } from "@/hooks/useAttendance";

interface MarkRow {
  mark_id: number;
  subject_name: string;
  semester: number;
  marks: number;
}

function getGrade(m: number) {
  if (m >= 90) return "A+";
  if (m >= 80) return "A";
  if (m >= 70) return "B";
  if (m >= 60) return "C";
  if (m >= 50) return "D";
  return "F";
}

function getRemarks(avg: number): string {
  if (avg >= 90) return "Outstanding performance. Keep up the excellent work!";
  if (avg >= 80) return "Very good performance. Shows strong academic ability.";
  if (avg >= 70) return "Good performance. Consistent effort observed.";
  if (avg >= 60) return "Satisfactory performance. Can improve with more focus.";
  if (avg >= 50) return "Needs improvement. Must dedicate more time to studies.";
  return "Poor performance. Immediate attention and remedial action required.";
}

function getAttendanceRemark(pct: number): string {
  if (pct >= 90) return "Excellent attendance record.";
  if (pct >= 75) return "Satisfactory attendance.";
  if (pct >= 60) return "Attendance below expectation. Needs improvement.";
  return "Critical: Attendance shortage. Risk of detention.";
}

export function generateSemesterReportCard(
  student: Student,
  allMarks: MarkRow[],
  semester: number,
  attendanceRecords: AttendanceRecord[],
  allSubjects: { subject_id: number; subject_name: string; semester: number }[]
) {
  const doc = new jsPDF();
  const semMarks = allMarks.filter((m) => m.semester === semester);
  const semSubjects = allSubjects.filter((s) => s.semester === semester);

  // ── Header ──
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 44, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("SEMESTER REPORT CARD", 105, 16, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("BTech AI & Data Science — Student Management System", 105, 26, { align: "center" });
  doc.setFontSize(9);
  doc.text(`Academic Year 2024-25  |  Semester ${semester}`, 105, 34, { align: "center" });
  doc.text(`Date of Issue: ${new Date().toLocaleDateString("en-IN")}`, 105, 40, { align: "center" });

  // ── Student Details ──
  let y = 56;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Student Details", 14, y);
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.6);
  doc.line(14, y + 3, 75, y + 3);
  y += 11;

  doc.setFontSize(10);
  const details = [
    ["Name", student.name],
    ["UID", student.uid || `UID${String(student.student_id).padStart(3, "0")}`],
    ["Roll Number", student.rollNo || String(student.student_id)],
    ["Department", student.department],
    ["Course", student.course || "BTech AI & Data Science"],
    ["Semester", String(semester)],
    ["Email", student.email],
    ["Phone", student.phone || "N/A"],
  ];
  details.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(val, 58, y);
    y += 7;
  });

  // ── Attendance Summary ──
  y += 6;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Attendance Summary", 14, y);
  doc.setDrawColor(37, 99, 235);
  doc.line(14, y + 3, 75, y + 3);
  y += 10;

  const studentRecords = attendanceRecords.filter((r) => r.student_id === student.student_id);
  const total = studentRecords.length;
  const present = studentRecords.filter((r) => r.status === "P").length;
  const absent = studentRecords.filter((r) => r.status === "A").length;
  const leave = studentRecords.filter((r) => r.status === "L").length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  (doc as any).autoTable({
    startY: y,
    head: [["Total Classes", "Present", "Absent", "Leave", "Attendance %", "Remark"]],
    body: [[String(total), String(present), String(absent), String(leave), `${pct}%`, getAttendanceRemark(pct)]],
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], fontSize: 9 },
    styles: { fontSize: 8, halign: "center" },
    columnStyles: { 5: { halign: "left", cellWidth: 45 } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable?.finalY + 10 || y + 22;

  // ── Marks Table ──
  if (y > 210) { doc.addPage(); y = 20; }
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`Semester ${semester} — Academic Results`, 14, y);
  doc.setDrawColor(37, 99, 235);
  doc.line(14, y + 3, 100, y + 3);
  y += 8;

  if (semMarks.length > 0) {
    const semTotal = semMarks.reduce((s, m) => s + m.marks, 0);
    const semAvg = Math.round(semTotal / semMarks.length);

    (doc as any).autoTable({
      startY: y,
      head: [["#", "Subject", "Max Marks", "Marks Obtained", "Grade", "Status"]],
      body: [
        ...semMarks.map((m, i) => [
          String(i + 1),
          m.subject_name,
          "100",
          String(m.marks),
          getGrade(m.marks),
          m.marks >= 50 ? "Pass" : "Fail",
        ]),
        [
          { content: "", colSpan: 2 },
          { content: "Total", styles: { fontStyle: "bold" } },
          { content: String(semMarks.length * 100), styles: { fontStyle: "bold" } },
          { content: String(semTotal), styles: { fontStyle: "bold" } },
          { content: getGrade(semAvg), styles: { fontStyle: "bold" } },
          { content: semAvg >= 50 ? "Pass" : "Fail", styles: { fontStyle: "bold" } },
        ],
      ],
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235], fontSize: 9 },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable?.finalY + 10 || y + 50;

    // ── Summary Box ──
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFillColor(240, 245, 255);
    doc.roundedRect(14, y, 182, 32, 3, 3, "F");
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, y, 182, 32, 3, 3, "S");

    doc.setTextColor(37, 99, 235);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Result Summary", 105, y + 8, { align: "center" });
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.text(
      `Total: ${semTotal}/${semMarks.length * 100}  |  Average: ${semAvg}%  |  Grade: ${getGrade(semAvg)}  |  ${semAvg >= 50 ? "PASSED" : "FAILED"}`,
      105, y + 17, { align: "center" }
    );
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(`SGPA (indicative): ${(semAvg / 10).toFixed(2)}`, 105, y + 25, { align: "center" });
    y += 40;

    // ── Teacher Remarks ──
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Teacher's Remarks", 14, y);
    doc.setDrawColor(37, 99, 235);
    doc.line(14, y + 3, 75, y + 3);
    y += 10;

    doc.setFillColor(255, 252, 240);
    doc.roundedRect(14, y, 182, 22, 2, 2, "F");
    doc.setDrawColor(200, 180, 100);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, y, 182, 22, 2, 2, "S");

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(getRemarks(semAvg), 20, y + 9);
    doc.text(getAttendanceRemark(pct), 20, y + 17);
    y += 30;

    // ── Signature line ──
    if (y > 260) { doc.addPage(); y = 20; }
    y += 10;
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.line(14, y, 70, y);
    doc.line(140, y, 196, y);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Class Teacher", 42, y + 5, { align: "center" });
    doc.text("Head of Department", 168, y + 5, { align: "center" });

  } else {
    // No marks for this semester — show enrolled subjects
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("No marks recorded for this semester.", 14, y);
    y += 8;
    if (semSubjects.length > 0) {
      doc.text("Enrolled subjects:", 14, y);
      y += 6;
      semSubjects.forEach((s, i) => {
        doc.text(`${i + 1}. ${s.subject_name}`, 20, y);
        y += 6;
      });
    }
  }

  // ── Footer on every page ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.height;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("This is a system-generated report card from the Student Management System — BTech AI & Data Science", 105, pageH - 8, { align: "center" });
    doc.text(`Page ${i} of ${pageCount}`, 200, pageH - 8, { align: "right" });
  }

  doc.save(`Report_Card_Sem${semester}_${student.rollNo || student.student_id}_${student.name.replace(/\s+/g, "_")}.pdf`);
}
