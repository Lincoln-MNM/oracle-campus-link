"""
Student Management System - Flask Backend
Phase 1: Server skeleton with basic status route.

NOTE: This file is a reference template. It runs outside Lovable
in a local Python environment with Flask and cx_Oracle installed.

To run:
  pip install flask cx_Oracle python-dotenv
  python app.py
"""

from flask import Flask, jsonify
from flask_cors import CORS  # pip install flask-cors
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/api/status", methods=["GET"])
def status():
    return jsonify({"status": "server running"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
