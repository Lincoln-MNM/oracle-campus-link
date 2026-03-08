-- Student Management System - Oracle Database Schema
-- Updated: Phase 5 — added department to subjects, password to students

-- STUDENTS table
CREATE TABLE students (
    student_id  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR2(100) NOT NULL,
    password    VARCHAR2(255) NOT NULL,
    dob         DATE,
    department  VARCHAR2(100),
    semester    NUMBER(2),
    email       VARCHAR2(150) UNIQUE,
    phone       VARCHAR2(20)
);

-- ADMINS table
CREATE TABLE admins (
    admin_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username    VARCHAR2(50) NOT NULL UNIQUE,
    password    VARCHAR2(255) NOT NULL
);

-- SUBJECTS table
CREATE TABLE subjects (
    subject_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subject_name  VARCHAR2(100) NOT NULL,
    semester      NUMBER(2),
    department    VARCHAR2(100)
);

-- MARKS table
CREATE TABLE marks (
    mark_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id  NUMBER NOT NULL,
    subject_id  NUMBER NOT NULL,
    marks       NUMBER(5, 2),
    CONSTRAINT fk_marks_student FOREIGN KEY (student_id) REFERENCES students(student_id),
    CONSTRAINT fk_marks_subject FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
);

-- Indexes for performance
CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_marks_subject ON marks(subject_id);
CREATE INDEX idx_students_dept ON students(department);
CREATE INDEX idx_subjects_dept ON subjects(department);
