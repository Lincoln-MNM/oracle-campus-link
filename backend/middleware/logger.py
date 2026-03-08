"""
Activity logger — records actions to the ACTIVITY_LOGS table.
"""

from datetime import datetime


def log_activity(conn, action: str, entity: str, entity_id: str, details: str, user_id: str, role: str):
    """Insert an activity log entry using parameterized query."""
    try:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO activity_logs (action, entity, entity_id, details, user_id, user_role, created_at)
               VALUES (:action, :entity, :entity_id, :details, :user_id, :role, SYSDATE)""",
            {
                "action": action,
                "entity": entity,
                "entity_id": str(entity_id),
                "details": details,
                "user_id": str(user_id),
                "role": role,
            },
        )
        conn.commit()
        cursor.close()
    except Exception as e:
        print(f"Activity log error: {e}")
