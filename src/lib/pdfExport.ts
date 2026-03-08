import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import type { Student } from "@/hooks/useStudents";

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
export function generateStudentReport(student: Student, marks: MarkRow[], avg: number) {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Student Academic Report", 105, 18, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Student Management System", 105, 28, { align: "center" });
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 34, { align: "center" });

  // Student info
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Student Information", 14, 55);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const info = [
    ["Student ID", String(student.student_id)],
    ["Name", student.name],
    ["Department", student.department],
    ["Semester", String(student.semester)],
    ["Email", student.email],
    ["Phone", student.phone || "N/A"],
  ];
  let y = 63;
  info.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(val, 55, y);
    y += 7;
  });

  // Marks table
  if (marks.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Academic Results", 14, y + 10);

    (doc as any).autoTable({
      startY: y + 16,
      head: [["Subject", "Semester", "Marks", "Grade", "Status"]],
      body: marks.map((m) => [
        m.subject_name,
        String(m.semester),
        String(m.marks),
        getGrade(m.marks),
        m.marks >= 50 ? "Pass" : "Fail",
      ]),
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9 },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || y + 60;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Average Marks: ${avg}%  |  Grade: ${getGrade(avg)}`, 14, finalY + 10);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("This is a system-generated report from the Student Management System.", 105, pageHeight - 10, { align: "center" });

  doc.save(`Student_Report_${student.student_id}_${student.name.replace(/\s+/g, "_")}.pdf`);
}

/**
 * Generate a student ID card PDF
 */
export function generateIdCard(student: Student) {
  const doc = new jsPDF({ format: [86, 54], unit: "mm" }); // Standard card size

  // Background
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 86, 18, "F");

  // Header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT IDENTITY CARD", 43, 8, { align: "center" });
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text("Student Management System", 43, 13, { align: "center" });

  // Avatar placeholder
  doc.setFillColor(230, 235, 245);
  doc.roundedRect(5, 22, 18, 18, 2, 2, "F");
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(student.name.charAt(0), 14, 34, { align: "center" });

  // Info
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(student.name, 28, 26);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`ID: ${student.student_id}`, 28, 31);
  doc.text(`${student.department}`, 28, 36);
  doc.text(`Semester ${student.semester}`, 28, 41);

  // Footer bar
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 48, 86, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(5);
  doc.text(`Email: ${student.email}`, 43, 52, { align: "center" });

  doc.save(`ID_Card_${student.student_id}.pdf`);
}

/**
 * Export all students to Excel
 */
export function exportStudentsExcel(students: Student[]) {
  const data = students.map((s) => ({
    "Roll Number": s.student_id,
    "Name": s.name,
    "Department": s.department,
    "Semester": s.semester,
    "Email": s.email,
    "Phone": s.phone || "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");

  // Column widths
  ws["!cols"] = [
    { wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 10 }, { wch: 30 }, { wch: 15 },
  ];

  XLSX.writeFile(wb, `Students_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export all students to CSV
 */
export function exportStudentsCsv(students: Student[]) {
  const headers = ["Roll Number", "Name", "Department", "Semester", "Email", "Phone"];
  const rows = students.map((s) => [s.student_id, s.name, s.department, s.semester, s.email, s.phone || ""].join(","));
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
