import os
import uuid
import bcrypt
import logging
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("JWT_SECRET", "super-secret-key-flask")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: MISSING SUPABASE CONFIGURATION! Check your .env file.")

supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Successfully created client:", supabase)

def seed_default_users():
    if not supabase: return
    users = [
        {"email": "admin@quizx.com", "password": "admin123", "display_name": "Admin", "role": "admin"},
        {"email": "student@quizx.com", "password": "student123", "display_name": "Demo Student", "role": "student"},
    ]
    for u in users:
            res = supabase.table("users").select("id").eq("email", u["email"]).execute()
            if not res.data:
                hashed = bcrypt.hashpw(u["password"].encode(), bcrypt.gensalt()).decode()
                supabase.table("users").insert({
                    "id": str(uuid.uuid4()), "email": u["email"],
                    "password": hashed, "display_name": u["display_name"], "role": u["role"]
                }).execute()
                print(f"Seeded {u['email']}")
            pass

seed_default_users()

def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user" not in session:
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user" not in session:
            return redirect(url_for("login"))
        if session["user"]["role"] != "admin":
            return redirect(url_for("dashboard"))
        return f(*args, **kwargs)
    return decorated

@app.route("/")
def index():
    if "user" in session:
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))

@app.route("/auth/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        res = supabase.table("users").select("*").eq("email", email).execute()
        if res.data:
            user = res.data[0]
            if bcrypt.checkpw(password.encode(), user["password"].encode()):
                session["user"] = {"id": user["id"], "email": user["email"], "display_name": user["display_name"], "role": user["role"]}
                return redirect(url_for("dashboard"))
        return render_template("login.html", error="Invalid credentials")
    return render_template("login.html")

@app.route("/auth/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        display_name = request.form.get("display_name")
        res = supabase.table("users").select("id").eq("email", email).execute()
        if res.data:
            return render_template("register.html", error="Email already exists")
        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        new_id = str(uuid.uuid4())
        supabase.table("users").insert({
            "id": new_id, "email": email, "password": hashed,
            "display_name": display_name, "role": "student"
        }).execute()
        session["user"] = {"id": new_id, "email": email, "display_name": display_name, "role": "student"}
        return redirect(url_for("dashboard"))
    return render_template("register.html")

@app.route("/auth/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("login"))

@app.route("/dashboard")
@login_required
def dashboard():
    user = session["user"]
    if user["role"] == "admin":
        quizzes = supabase.table("quizzes").select("*").order("created_at", desc=True).execute().data
        results = supabase.table("results").select("*, quizzes(title), users(display_name)").order("created_at", desc=True).execute().data
        for r in results:
            if "quizzes" in r and r["quizzes"]:
                r["quiz_title"] = r["quizzes"]["title"]
            if "users" in r and r["users"]:
                r["user_name"] = r["users"]["display_name"]
        return render_template("dashboard.html", user=user, quizzes=quizzes, results=results)
    else:
        quizzes = supabase.table("quizzes").select("*").order("created_at", desc=True).execute().data
        results = supabase.table("results").select("*, quizzes(title)").eq("user_id", user["id"]).order("created_at", desc=True).execute().data
        for r in results:
            if "quizzes" in r and r["quizzes"]:
                r["quiz_title"] = r["quizzes"]["title"]
        return render_template("dashboard.html", user=user, quizzes=quizzes, results=results)

@app.route("/api/quizzes", methods=["POST"])
@admin_required
def create_quiz():
    title = request.form.get("title")
    description = request.form.get("description")
    new_id = str(uuid.uuid4())
    supabase.table("quizzes").insert({"id": new_id, "title": title, "description": description}).execute()
    return redirect(url_for("dashboard"))

@app.route("/api/quizzes/<quiz_id>/delete", methods=["POST"])
@admin_required
def delete_quiz(quiz_id):
    supabase.table("quizzes").delete().eq("id", quiz_id).execute()
    return redirect(url_for("dashboard"))

@app.route("/api/quizzes/<quiz_id>/questions", methods=["POST"])
@admin_required
def create_question(quiz_id):
    supabase.table("questions").insert({
        "id": str(uuid.uuid4()),
        "quiz_id": quiz_id,
        "text": request.form.get("text"),
        "option_a": request.form.get("option_a"),
        "option_b": request.form.get("option_b"),
        "option_c": request.form.get("option_c"),
        "option_d": request.form.get("option_d"),
        "correct_option": request.form.get("correct_option")
    }).execute()
    return redirect(url_for("quiz_edit", quiz_id=quiz_id))

@app.route("/api/questions/<question_id>/delete", methods=["POST"])
@admin_required
def delete_question(question_id):
    quiz_id = request.form.get("quiz_id")
    supabase.table("questions").delete().eq("id", question_id).execute()
    return redirect(url_for("quiz_edit", quiz_id=quiz_id))

@app.route("/dashboard/quiz/<quiz_id>/edit")
@admin_required
def quiz_edit(quiz_id):
    quiz = supabase.table("quizzes").select("*").eq("id", quiz_id).execute().data[0]
    questions = supabase.table("questions").select("*").eq("quiz_id", quiz_id).execute().data
    return render_template("quiz_edit.html", user=session["user"], quiz=quiz, questions=questions)

@app.route("/quiz/<quiz_id>")
@login_required
def take_quiz(quiz_id):
    quiz = supabase.table("quizzes").select("*").eq("id", quiz_id).execute().data[0]
    questions = supabase.table("questions").select("*").eq("quiz_id", quiz_id).execute().data
    # hide correct answers
    for q in questions:
        if "correct_option" in q:
            del q["correct_option"]
    return render_template("quiz.html", user=session["user"], quiz=quiz, questions=questions)

@app.route("/api/results", methods=["POST"])
@login_required
def submit_quiz():
    data = request.json
    quiz_id = data.get("quiz_id")
    answers = data.get("answers")
    
    questions = supabase.table("questions").select("id, correct_option").eq("quiz_id", quiz_id).execute().data
    score = sum(1 for q in questions if answers.get(q["id"]) == q["correct_option"])
    
    new_id = str(uuid.uuid4())
    supabase.table("results").insert({
        "id": new_id, "user_id": session["user"]["id"],
        "quiz_id": quiz_id, "score": score, "total": len(questions)
    }).execute()
    return jsonify({"score": score, "total": len(questions)})


if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0")
