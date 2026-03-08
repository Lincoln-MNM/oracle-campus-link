"""
Marks CRUD Routes - Flask Blueprint

Endpoints:
  GET    /api/marks         — returns joined data (student name, subject name, marks)
  POST   /api/marks
  PUT    /api/marks/<id>
  DELETE /api/marks/<id>
"""

from flask import Blueprint, request, jsonify

marks_bp = Blueprint("marks", __name__, url_prefix="/api/marks")


def _get_connection():
    from database.oracle_connection import get_connection
    return get_connection()


@marks_bp.route("", methods=["GET"])
def get_marks():
    try:
        conn = _get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT m.mark_id, m.student_id, s.name AS student_name,
                   m.subject_id, sub.subject_name, sub.semester,
                   s.department, m.marks
            FROM marks m
            JOIN students s ON m.student_id = s.student_id
            JOIN subjects sub ON m.subject_id = sub.subject_id
            ORDER BY m.mark_id
        """)
        rows = cursor.fetchall()
        cols = ["mark_id", "student_id", "student_name", "subject_id",
                "subject_name", "semester", "department", "marks"]
        result = [dict(zip(cols, row)) for row in rows]
        cursor.close()
        conn.close()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@marks_bp.route("", methods=["POST"])
def add_mark():
    data = request.get_json()
    try:
        conn = _get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO marks (student_id, subject_id, marks)
               VALUES (:sid, :subid, :marks)""",
            {"sid": data["student_id"], "subid": data["subject_id"], "marks": data["marks"]},
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "message": "Marks added"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@marks_bp.route("/<int:mark_id>", methods=["PUT"])
def update_mark(mark_id):
    data = request.get_json()
    try:
        conn = _get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE marks SET student_id = :sid, subject_id = :subid, marks = :marks
               WHERE mark_id = :mid""",
            {"sid": data["student_id"], "subid": data["subject_id"],
             "marks": data["marks"], "mid": mark_id},
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "message": "Marks updated"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@marks_bp.route("/<int:mark_id>", methods=["DELETE"])
def delete_mark(mark_id):
    try:
        conn = _get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM marks WHERE mark_id = :mid", {"mid": mark_id})
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "message": "Marks deleted"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
