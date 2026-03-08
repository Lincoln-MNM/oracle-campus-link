"""
Oracle Database Connection Module
Requires: cx_Oracle and Oracle Instant Client

Usage:
    from database.oracle_connection import get_connection
    conn = get_connection()
"""

import cx_Oracle
import os


def get_connection():
    dsn = cx_Oracle.makedsn(
        os.getenv("ORACLE_HOST", "localhost"),
        os.getenv("ORACLE_PORT", "1521"),
        service_name=os.getenv("ORACLE_SERVICE", "XEPDB1"),
    )
    connection = cx_Oracle.connect(
        user=os.getenv("ORACLE_USER", "system"),
        password=os.getenv("ORACLE_PASSWORD", ""),
        dsn=dsn,
    )
    return connection


if __name__ == "__main__":
    try:
        conn = get_connection()
        print("Oracle connection successful!")
        conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")
