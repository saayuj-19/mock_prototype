from flask import Flask, render_template, request, redirect, url_for, session
from flask_session import Session
from func import generate_user_id, validEmail
from cs50 import SQL
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

db = SQL("sqlite:///data.db")

@app.route("/")
def index():
    userId = session.get("userId")
    
    if not userId:
        return render_template("index.html", username=None)
    elif userId:
        try:
            username = db.execute("SELECT username FROM users WHERE id = ?", userId)
        except Exception as e:
            return "Exception"
        
        return render_template("index.html", username=username[0]["username"])

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        return render_template("register.html")
    
    return render_template("register.html", active="active")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        user = request.form.get("usr")
        password = request.form.get("pwd")
        
        if not user or not password:
            return "failure"
        elif len(password) < 8:
            return "failure"
        
        userId = generate_user_id(user)
        
        try:
            hashedPass = db.execute("SELECT password_hash FROM users WHERE id = ?", userId)
        except Exception as e:
            return "Exception"
        
        if hashedPass and check_password_hash(hashedPass[0]["password_hash"], password):
            session["userId"] = userId
            return redirect("/")
        else:
            return "Log In Failed" 
            
    
    return redirect("/")

@app.route("/signup", methods=["GET","POST"])
def signup():
    if request.method == "POST":
        user = request.form.get("usr")
        email = request.form.get("email")
        password = request.form.get("pwd")
        
        if not user or not email or not password:
            return "failure"
        elif len(password) < 8:
            return "failure"
        elif not validEmail(email):
            return "email failure"
        
        userId = generate_user_id(user)
        passwordHash = generate_password_hash(password)
        
        try:
            db.execute("""INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)""",userId, user, email, passwordHash)
            session["userId"] = userId
        except Exception as e:
            return f"Exception: {str(e)}"
        
        return redirect("/")
    
    return redirect("/")

@app.route("/quiz")
def quiz():
    try:
        db.execute("")
    except Exception as e:
        return "Failed to fetch questions."

    return render_template("quiz.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

@app.route("/questions")
def questions():
    return render_template("questions.html")

@app.route("/qregister", methods=["POST"])
def questionRegister():
    if request.method == "POST":
        subject = request.form.get("subject")
        category = request.form.get("category")
        difficulty = request.form.get("difficulty")
        questionType = request.form.get("QType")
        questionText = request.form.get("QText")
        optionA = request.form.get("A")
        optionB = request.form.get("B")
        optionC = request.form.get("C")
        optionD = request.form.get("D")
        correctOption = request.form.get("correctAns")
        explanation = request.form.get("explanation")

        options = {
            "A": optionA,
            "B": optionB,
            "C": optionC,
            "D": optionD
        }

        id = generate_user_id(questionText)

        # === Handle Difficulty to Marks ===
        if difficulty == "Easy":
            marks = 1
        elif difficulty == "Medium":
            marks = 1.5
        elif difficulty == "Hard":
            marks = 2
        else:
            marks = 1  # Default fallback

        # === Handle Image Upload ===
        image_file = request.files.get("image")
        hasImage = 0  # Default

        if image_file and image_file.filename != "":
            filename = secure_filename(f"{id}.jpg")
            upload_path = os.path.join("static", "uploads", filename)

            # Save the image
            try:
                os.makedirs(os.path.dirname(upload_path), exist_ok=True)
                image_file.save(upload_path)
                hasImage = 1
            except Exception as e:
                return f"Image save failed: {str(e)}", 500

        # === Insert into questions ===
        try:
            db.execute("""INSERT INTO questions 
                (id, subject, questionText, explanation, marks, difficulty, category, questionType, hasImage)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                id, subject, questionText, explanation, marks, difficulty, category, questionType, hasImage)
        except Exception as e:
            return "failure: inserting into questions failed", 500

        # === Insert into answers ===
        for key, value in options.items():
            try:
                isCorrect = 1 if key == correctOption else 0
                db.execute("""INSERT INTO answers 
                    (questionId, optionLabel, optionText, isCorrect)
                    VALUES (?, ?, ?, ?)""",
                    id, key, value, isCorrect)
            except Exception as e:
                return "failure: inserting answers failed", 500
        
        if hasImage == 1:
            try:
                image_url = url_for('static', filename=f'uploads/{id}.jpg')
                db.execute("""INSERT INTO questionImages (id, questionId, imagePath, altText)
                            VALUES (?, ?, ?, ?)""", id, id, image_url, id)
            except Exception as e:
                return f"Image DB insert failed: {e}", 500

        return "success"