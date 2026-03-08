"""
Global error handler for Flask application.
"""

from flask import jsonify
from middleware.validation import ValidationError


def register_error_handlers(app):
    """Register centralized error handlers."""

    @app.errorhandler(ValidationError)
    def handle_validation_error(e):
        return jsonify({"status": "error", "message": "Validation failed", "errors": e.errors}), 400

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"status": "error", "message": "Bad request"}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"status": "error", "message": "Unauthorized"}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"status": "error", "message": "Forbidden"}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"status": "error", "message": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"status": "error", "message": "Internal server error"}), 500
