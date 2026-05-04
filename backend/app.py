from flask import Flask, request, jsonify
from flask_cors import CORS
from model import predict
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DB_NAME = "database.db"


# =========================
# DB CONNECTION (FIXED)
# =========================
def get_db():
    conn = sqlite3.connect(DB_NAME, timeout=10, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL;")  # 🔥 fix locking
    return conn


# =========================
# INIT DATABASE
# =========================
def init_db():
    conn = get_db()
    c = conn.cursor()

    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT,
            level TEXT,
            score REAL
        )
    ''')

    conn.commit()
    conn.close()


init_db()


# =========================
# REGISTER
# =========================
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    try:
        conn = get_db()
        c = conn.cursor()

        c.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (username, password)
        )

        conn.commit()
        conn.close()

        return jsonify({"message": "User registered successfully"})

    except:
        return jsonify({"error": "User already exists"}), 400


# =========================
# LOGIN
# =========================
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    conn = get_db()
    c = conn.cursor()

    c.execute(
        "SELECT * FROM users WHERE username=? AND password=?",
        (username, password)
    )

    user = c.fetchone()
    conn.close()

    if user:
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"error": "Invalid credentials"}), 401


# =========================
# PREDICT + SAVE
# =========================
import time

@app.route('/predict', methods=['POST'])
def detect():
    try:
        data = request.get_json(force=True)
        result = predict(data)

        for _ in range(3):  # retry 3 times
            try:
                conn = get_db()
                c = conn.cursor()

                c.execute(
                    "INSERT INTO patients (data, level, score) VALUES (?, ?, ?)",
                    (str(data), result['level'], result['score'])
                )

                conn.commit()
                conn.close()
                break
            except sqlite3.OperationalError:
                time.sleep(1)

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# GET PATIENTS
# =========================
@app.route('/patients', methods=['GET'])
def get_patients():
    conn = get_db()
    c = conn.cursor()

    c.execute("SELECT id, level, score FROM patients")
    rows = c.fetchall()

    conn.close()

    patients = [
        {"id": r[0], "result": {"level": r[1], "score": r[2]}}
        for r in rows
    ]

    return jsonify(patients)


# =========================
# RUN
# =========================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, threaded=False)