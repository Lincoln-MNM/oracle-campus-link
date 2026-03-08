"""
Input validation schemas using a simple validator.
In production, use a library like marshmallow, cerberus, or pydantic.
"""

import re

class ValidationError(Exception):
    def __init__(self, errors: dict):
        self.errors = errors
        super().__init__(str(errors))


def validate_student(data: dict) -> dict:
    """Validate student input data."""
    errors = {}

    name = data.get("name", "").strip()
    if not name:
        errors["name"] = "Name is required"
    elif len(name) > 100:
        errors["name"] = "Name must be under 100 characters"

    email = data.get("email", "").strip()
    if not email:
        errors["email"] = "Email is required"
    elif not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email):
        errors["email"] = "Invalid email format"

    phone = data.get("phone", "").strip()
    if phone and not re.match(r"^[\d\-\+\s()]{7,20}$", phone):
        errors["phone"] = "Invalid phone number"

    department = data.get("department", "").strip()
    if not department:
        errors["department"] = "Department is required"

    semester = data.get("semester")
    try:
        sem = int(semester)
        if sem < 1 or sem > 8:
            errors["semester"] = "Semester must be between 1 and 8"
    except (TypeError, ValueError):
        errors["semester"] = "Valid semester is required"

    if errors:
        raise ValidationError(errors)

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "department": department,
        "semester": int(semester),
    }


def validate_subject(data: dict) -> dict:
    """Validate subject input data."""
    errors = {}

    subject_name = data.get("subject_name", "").strip()
    if not subject_name:
        errors["subject_name"] = "Subject name is required"

    department = data.get("department", "").strip()
    if not department:
        errors["department"] = "Department is required"

    semester = data.get("semester")
    try:
        sem = int(semester)
        if sem < 1 or sem > 8:
            errors["semester"] = "Semester must be between 1 and 8"
    except (TypeError, ValueError):
        errors["semester"] = "Valid semester is required"

    if errors:
        raise ValidationError(errors)

    return {"subject_name": subject_name, "department": department, "semester": int(semester)}


def validate_marks(data: dict) -> dict:
    """Validate marks input data."""
    errors = {}

    student_id = data.get("student_id")
    if not student_id:
        errors["student_id"] = "Student ID is required"

    subject_id = data.get("subject_id")
    if not subject_id:
        errors["subject_id"] = "Subject ID is required"

    marks = data.get("marks")
    try:
        m = float(marks)
        if m < 0 or m > 100:
            errors["marks"] = "Marks must be between 0 and 100"
    except (TypeError, ValueError):
        errors["marks"] = "Valid marks are required"

    if errors:
        raise ValidationError(errors)

    return {"student_id": int(student_id), "subject_id": int(subject_id), "marks": float(marks)}
