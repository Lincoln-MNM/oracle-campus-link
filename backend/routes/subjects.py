"""
Subjects CRUD Routes - Flask Blueprint

Endpoints:
  GET    /api/subjects
  POST   /api/subjects
  PUT    /api/subjects/<id>
  DELETE /api/subjects/<id>
"""

from flask import Blueprint, request, jsonify

subjects_bp = Blueprint("subjects", __name__, url_prefix="/api/subjects")


def _get_connection():
    from database.oracle_connection import get_connection
    return get_connection()


@subjects_bp.route("", methods=["GET"])
def get_subjects():
    try:
        conn = _get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT subject_id, subject_name, semester, department FROM subjects ORDER BY subject_id")
        rows = cursor.fetchall()
        cols = ["subject_id", "subject_name", "semester", "department"]
        result = [dict(zip(cols, row)) for row in rows]
        cursor.close()
        conn.close()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@subjects_bp.route("", methods=["POST"])
def add_subject():
    data = request.get_json()
    try:
        conn = _get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO subjects (subject_name, semester, department)
               VALUES (:name, :sem, :dept)""",
            {"name": data["subject_name"], "sem": data["semester"], "dept": data["department"]},
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "message": "Subject added"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@subjects_bp.route("/<int:subject_id>", methods=["PUT"])
def update_subject(subject_id):
    data = request.get_json()
    try:
        conn = _get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE subjects SET subject_name = :name, semester = :sem, department = :dept
               WHERE subject_id = :sid""",
            {"name": data["subject_name"], "sem": data["semester"], "dept": data["department"], "sid": subject_id},
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "message": "Subject updated"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@subjects_bp.route("/<int:subject_id>", methods=["DELETE"])
def delete_subject(subject_id):
    try:
        conn = _get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM subjects WHERE subject_id = :sid", {"sid": subject_id})
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success", "message": "Subject deleted"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
