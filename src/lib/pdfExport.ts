import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
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

/**
 * Generate a single student academic report PDF
 */
export function generateStudentReport(
  student: Student,
  marks: MarkRow[],
  avg: number,
  attendanceRecords?: AttendanceRecord[],
  allSubjects?: { subject_id: number; subject_name: string; semester: number }[]
) {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 42, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Student Academic Report", 105, 16, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Student Management System — BTech AI & Data Science", 105, 26, { align: "center" });
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 34, { align: "center" });

  // Student info
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Student Information", 14, 55);

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(14, 58, 80, 58);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const info = [
    ["Name", student.name],
    ["UID", student.uid || `UID${String(student.student_id).padStart(3, "0")}`],
    ["Roll Number", student.rollNo || String(student.student_id)],
    ["Department", student.department],
    ["Course", student.course || "BTech AI & Data Science"],
    ["Semester", String(student.semester)],
    ["Email", student.email],
    ["Phone", student.phone || "N/A"],
  ];
  let y = 65;
  info.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(val, 58, y);
    y += 7;
  });

  // ── Attendance Summary ──
  y += 5;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Attendance Summary", 14, y);
  doc.setDrawColor(37, 99, 235);
  doc.line(14, y + 3, 80, y + 3);
  y += 10;

  if (attendanceRecords && attendanceRecords.length > 0) {
    const studentRecords = attendanceRecords.filter((r) => r.student_id === student.student_id);
    const total = studentRecords.length;
    const present = studentRecords.filter((r) => r.status === "P").length;
    const absent = studentRecords.filter((r) => r.status === "A").length;
    const leave = studentRecords.filter((r) => r.status === "L").length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;

    autoTable(doc, {
      startY: y,
      head: [["Total Classes", "Present", "Absent", "Leave", "Attendance %"]],
      body: [[String(total), String(present), String(absent), String(leave), `${pct}%`]],
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235], fontSize: 9 },
      styles: { fontSize: 9, halign: "center" },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable?.finalY + 8 || y + 20;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("No attendance records available.", 14, y);
    y += 10;
  }

  // ── Subjects Enrolled ──
  if (allSubjects && allSubjects.length > 0) {
    const enrolledSubjects = allSubjects.filter((s) => s.semester <= student.semester);
    if (enrolledSubjects.length > 0) {
      // Check if we need a new page
      if (y > 230) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Subjects Enrolled", 14, y);
      doc.setDrawColor(37, 99, 235);
      doc.line(14, y + 3, 80, y + 3);

      (doc as any).autoTable({
        startY: y + 8,
        head: [["#", "Subject Name", "Semester"]],
        body: enrolledSubjects.map((s, i) => [String(i + 1), s.subject_name, `Semester ${s.semester}`]),
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235], fontSize: 9 },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable?.finalY + 8 || y + 40;
    }
  }

  // ── Semester-wise Marks ──
  if (marks.length > 0) {
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Academic Results", 14, y);
    doc.setDrawColor(37, 99, 235);
    doc.line(14, y + 3, 80, y + 3);

    // Group by semester
    const semMap = new Map<number, MarkRow[]>();
    marks.forEach((m) => {
      const arr = semMap.get(m.semester) || [];
      arr.push(m);
      semMap.set(m.semester, arr);
    });

    const semesters = Array.from(semMap.keys()).sort((a, b) => a - b);
    let tableY = y + 8;

    for (const sem of semesters) {
      const semMarks = semMap.get(sem)!;
      const semTotal = semMarks.reduce((s, m) => s + m.marks, 0);
      const semAvg = Math.round(semTotal / semMarks.length);

      if (tableY > 240) {
        doc.addPage();
        tableY = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Semester ${sem}`, 14, tableY);
      tableY += 5;

      (doc as any).autoTable({
        startY: tableY,
        head: [["Subject", "Marks (out of 100)", "Grade", "Status"]],
        body: [
          ...semMarks.map((m) => [
            m.subject_name,
            String(m.marks),
            getGrade(m.marks),
            m.marks >= 50 ? "Pass" : "Fail",
          ]),
          ["", "", "", ""],
          [{ content: `Semester Total: ${semTotal}  |  Average: ${semAvg}%  |  Grade: ${getGrade(semAvg)}`, colSpan: 4, styles: { fontStyle: "bold", fillColor: [230, 240, 255] } }],
        ],
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235], fontSize: 9 },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      });
      tableY = (doc as any).lastAutoTable?.finalY + 10 || tableY + 40;
    }

    // Overall summary
    if (tableY > 250) {
      doc.addPage();
      tableY = 20;
    }
    const totalMarks = marks.reduce((s, m) => s + m.marks, 0);
    const maxMarks = marks.length * 100;

    doc.setFillColor(37, 99, 235);
    doc.roundedRect(14, tableY, 182, 24, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Overall Summary", 105, tableY + 8, { align: "center" });
    doc.setFontSize(10);
    doc.text(
      `Total: ${totalMarks}/${maxMarks}  |  Average: ${avg}%  |  Grade: ${getGrade(avg)}  |  ${avg >= 50 ? "PASSED" : "FAILED"}`,
      105,
      tableY + 18,
      { align: "center" }
    );
  }

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(
      "This is a system-generated report from the Student Management System — BTech AI & Data Science",
      105,
      pageHeight - 8,
      { align: "center" }
    );
    doc.text(`Page ${i} of ${pageCount}`, 200, pageHeight - 8, { align: "right" });
  }

  doc.save(`Student_Report_${student.rollNo || student.student_id}_${student.name.replace(/\s+/g, "_")}.pdf`);
}

/**
 * Generate a student ID card PDF
 */
export function generateIdCard(student: Student) {
  const doc = new jsPDF({ format: [86, 54], unit: "mm" });

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 86, 18, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT IDENTITY CARD", 43, 8, { align: "center" });
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text("BTech AI & Data Science", 43, 13, { align: "center" });

  doc.setFillColor(230, 235, 245);
  doc.roundedRect(5, 22, 18, 18, 2, 2, "F");
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(student.name.charAt(0), 14, 34, { align: "center" });

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(student.name, 28, 26);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`UID: ${student.uid || student.student_id}`, 28, 31);
  doc.text(`Roll: ${student.rollNo || student.student_id}`, 28, 36);
  doc.text(`Semester ${student.semester}`, 28, 41);

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 48, 86, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(5);
  doc.text(`Email: ${student.email}`, 43, 52, { align: "center" });

  doc.save(`ID_Card_${student.rollNo || student.student_id}.pdf`);
}

/**
 * Export all students to Excel
 */
export function exportStudentsExcel(students: Student[]) {
  const data = students.map((s) => ({
    "UID": s.uid,
    "Roll Number": s.rollNo,
    "Name": s.name,
    "Department": s.department,
    "Semester": s.semester,
    "Email": s.email,
    "Phone": s.phone || "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  ws["!cols"] = [
    { wch: 10 }, { wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 10 }, { wch: 30 }, { wch: 15 },
  ];

  XLSX.writeFile(wb, `Students_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export all students to CSV
 */
export function exportStudentsCsv(students: Student[]) {
  const headers = ["UID", "Roll Number", "Name", "Department", "Semester", "Email", "Phone"];
  const rows = students.map((s) => [s.uid, s.rollNo, s.name, s.department, s.semester, s.email, s.phone || ""].join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Students_Export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export marks report to PDF
 */
export function exportMarksReport(
  marks: { student_name: string; subject_name: string; marks: number; semester: number }[]
) {
  const doc = new jsPDF();

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Marks Report", 105, 16, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 26, { align: "center" });

  (doc as any).autoTable({
    startY: 42,
    head: [["Student", "Subject", "Semester", "Marks", "Grade", "Status"]],
    body: marks.map((m) => [
      m.student_name,
      m.subject_name,
      String(m.semester),
      String(m.marks),
      getGrade(m.marks),
      m.marks >= 50 ? "Pass" : "Fail",
    ]),
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 8 },
  });

  doc.save(`Marks_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
