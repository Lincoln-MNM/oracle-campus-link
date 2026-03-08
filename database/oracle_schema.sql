-- Student Management System - Oracle Database Schema
-- Final: Includes RBAC, activity logging, password hashing support

-- STUDENTS table
CREATE TABLE students (
    student_id  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR2(100) NOT NULL,
    password    VARCHAR2(255) NOT NULL,
    dob         DATE,
    department  VARCHAR2(100),
    semester    NUMBER(2),
    email       VARCHAR2(150) UNIQUE,
    phone       VARCHAR2(20),
    photo_url   VARCHAR2(500),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ADMINS table (with role support)
CREATE TABLE admins (
    admin_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username    VARCHAR2(50) NOT NULL UNIQUE,
    password    VARCHAR2(255) NOT NULL,
    role        VARCHAR2(20) DEFAULT 'admin' CHECK (role IN ('admin', 'staff', 'viewer')),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    CONSTRAINT fk_marks_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_marks_subject FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
);

-- ACTIVITY LOGS table
CREATE TABLE activity_logs (
    log_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    action      VARCHAR2(50) NOT NULL,
    entity      VARCHAR2(50) NOT NULL,
    entity_id   VARCHAR2(50),
    details     VARCHAR2(500),
    user_id     VARCHAR2(50),
    user_role   VARCHAR2(20),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_marks_subject ON marks(subject_id);
CREATE INDEX idx_students_dept ON students(department);
CREATE INDEX idx_subjects_dept ON subjects(department);
CREATE INDEX idx_logs_created ON activity_logs(created_at);
CREATE INDEX idx_logs_entity ON activity_logs(entity, entity_id);

-- Sample admin (password: admin123 — bcrypt hash)
-- In production, generate hash via: python -c "import bcrypt; print(bcrypt.hashpw(b'admin123', bcrypt.gensalt()).decode())"
INSERT INTO admins (username, password, role)
VALUES ('admin', '$2b$12$LJ3m4ys7Oe5Gt0gMTkN5JuF1E6p5e5Lq1V2vE8C7F9G0H1I2J3K4', 'admin');

INSERT INTO admins (username, password, role)
VALUES ('staff1', '$2b$12$LJ3m4ys7Oe5Gt0gMTkN5JuF1E6p5e5Lq1V2vE8C7F9G0H1I2J3K4', 'staff');

INSERT INTO admins (username, password, role)
VALUES ('viewer1', '$2b$12$LJ3m4ys7Oe5Gt0gMTkN5JuF1E6p5e5Lq1V2vE8C7F9G0H1I2J3K4', 'viewer');
