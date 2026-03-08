"""
Authentication Routes - Flask Blueprint
Requires: cx_Oracle, Flask

Endpoints:
  POST /api/auth/admin-login
  POST /api/auth/student-login
"""

from flask import Blueprint, request, jsonify

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _get_connection():
    from database.oracle_connection import get_connection
    return get_connection()


@auth_bp.route("/admin-login", methods=["POST"])
def admin_login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"status": "error", "message": "Username and password are required"}), 400

    try:
        conn = _get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT admin_id, username FROM admins WHERE username = :username AND password = :password",
            {"username": username, "password": password},
        )
        row = cursor.fetchone()
        cursor.close()
        conn.close()

        if row:
            return jsonify({"status": "success", "role": "admin", "admin_id": row[0], "username": row[1]})
        else:
            return jsonify({"status": "error", "message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@auth_bp.route("/student-login", methods=["POST"])
def student_login():
    data = request.get_json()
    student_id = data.get("student_id", "").strip()
    password = data.get("password", "").strip()

    if not student_id or not password:
        return jsonify({"status": "error", "message": "Student ID and password are required"}), 400

    try:
        conn = _get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT student_id, name, department, semester FROM students WHERE student_id = :sid AND password = :password",
            {"sid": student_id, "password": password},
        )
        row = cursor.fetchone()
        cursor.close()
        conn.close()

        if row:
            return jsonify({
                "status": "success",
                "role": "student",
                "student_id": row[0],
                "name": row[1],
                "department": row[2],
                "semester": row[3],
            })
        else:
            return jsonify({"status": "error", "message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
