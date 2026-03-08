"""
Student CRUD Routes - Flask Blueprint
Requires: cx_Oracle, Flask

Endpoints:
  GET    /api/students
  POST   /api/students
  PUT    /api/students/<id>
  DELETE /api/students/<id>
"""

from flask import Blueprint, request, jsonify

students_bp = Blueprint("students", __name__, url_prefix="/api/students")


def _get_connection():
    from database.oracle_connection import get_connection
    return get_connection()


@students_bp.route("", methods=["GET"])
def get_students():
    try:
        conn = _get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT student_id, name, department, semester, email, phone FROM students ORDER BY student_id")
        rows = cursor.fetchall()
        cols = ["student_id", "name", "department", "semester", "email", "phone"]
        result = [dict(zip(cols, row)) for row in rows]
        cursor.close()
        conn.close()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@students_bp.route("", methods=["POST"])
def add_student():
    data = request.get_json()
    try:
        conn = _get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO students (name, password, department, semester, email, phone)
               VALUES (:name, :password, :dept, :sem, :email, :phone)""",
            {
                "name": data["name"],
                "password": data.get("password", ""),
                "dept": data["department"],
                "sem": data["semester"],
                "email": data["email"],
                "phone": data.get("phone", ""),
            },
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "message": "Student added"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@students_bp.route("/<int:student_id>", methods=["PUT"])
def update_student(student_id):
    data = request.get_json()
    try:
        conn = _get_connection()
        cursor = conn.cursor()
        fields = []
        params = {"sid": student_id}
        for key in ["name", "department", "semester", "email", "phone"]:
            if key in data:
                fields.append(f"{key} = :{key}")
                params[key] = data[key]
        if "password" in data and data["password"]:
            fields.append("password = :password")
            params["password"] = data["password"]
        if not fields:
            return jsonify({"status": "error", "message": "No fields to update"}), 400
        cursor.execute(f"UPDATE students SET {', '.join(fields)} WHERE student_id = :sid", params)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "message": "Student updated"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@students_bp.route("/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):
    try:
        conn = _get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM students WHERE student_id = :sid", {"sid": student_id})
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "message": "Student deleted"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
