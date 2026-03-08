"""
Student Management System - Flask Backend
Production-ready with JWT auth, RBAC, bcrypt, validation, and error handling.

To run:
  pip install flask flask-cors cx_Oracle python-dotenv pyjwt bcrypt
  python app.py
"""

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Register error handlers
from middleware.error_handler import register_error_handlers
register_error_handlers(app)

# Register blueprints
from routes.auth import auth_bp
from routes.students import students_bp
from routes.subjects import subjects_bp
from routes.marks import marks_bp
app.register_blueprint(auth_bp)
app.register_blueprint(students_bp)
app.register_blueprint(subjects_bp)
app.register_blueprint(marks_bp)


@app.route("/api/status", methods=["GET"])
def status():
    return jsonify({"status": "server running", "version": "1.0.0"})


if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    port = int(os.getenv("PORT", 5000))
    app.run(debug=debug, port=port)
