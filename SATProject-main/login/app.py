from flask import Flask, render_template, request, redirect, session, url_for, flash
from flask_mail import Mail, Message
from flask_session import Session
from func import generate_user_id, validEmail
from cs50 import SQL
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import random
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.secret_key = os.getenv('SECRET_KEY')
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')
mail = Mail(app)
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
        
    
        user = request.form.get("usr")
        email = request.form.get("email")
        password = request.form.get("pwd")

        otp = str(random.randint(100000, 999999))
        session['otp'] = otp
        session['email'] = email
        session['user'] = user
        session['password'] = password

        html = render_template('emailTemplate.html', otp=otp, name=user)
        msg = Message('Your OTP Verification Code', recipients=[email], html=html)
        mail.send(msg)

        return redirect("/verify")
    
    if request.method == "GET":
        if session.get("user") and session.get("email") and session.get("password") and session.get("otp"):
            user = session.get("user")
            email = session.get("email")
            password = session.get("password")

            userId = generate_user_id(user)
            passwordHash = generate_password_hash(password)
            
            try:
                db.execute("""INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)""",userId, user, email, passwordHash)
                session.clear()
                session["userId"] = userId
            except Exception as e:
                return f"Exception: {str(e)}"
            
            return redirect("/")


@app.route('/verify', methods=['GET', 'POST'])
def verify():
    if request.method == 'POST':
        entered_otp = request.form.get("otp")
        actual_otp = session.get("otp")

        if entered_otp == actual_otp:
            return redirect("/signup")
        else:
            flash('Invalid OTP. Please try again.', 'danger')
            return render_template('verify.html')

    return render_template('verify.html')

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

@app.route("/startQuiz")
def startQuiz():
    userId = session.get("userId")
    
    if not userId:
        return render_template("startQuiz.html", username=None)
    else:
        try:
            username = db.execute("SELECT username FROM users WHERE id = ?", userId)
        except Exception as e:
            return "Database Exception: " + str(e)
        
        if username:
            return render_template("startQuiz.html", username=username[0]["username"])
        else:
            return render_template("startQuiz.html", username=None)

@app.route("/quiz", methods=["GET", "POST"])
def quiz():
    if request.method == "POST":
        question_count = int(request.form.get("questions", 5))
        subject = request.form.get("subject", "Math")

        questions = db.execute(
            "SELECT * FROM questions WHERE subject = ? ORDER BY RANDOM() LIMIT ?",
            subject, question_count
        )

        for q in questions:
            options = db.execute(
                "SELECT optionLabel, optionText FROM answers WHERE questionId = ? ORDER BY optionLabel",
                q["id"]
            )
            q["options"] = options

        return render_template("quiz.html", questions=questions, subject=subject)
    else:
        return redirect("/startQuiz")

@app.route("/submit-quiz", methods=["POST"])
def submit_quiz():
    submitted_answers = request.form
    total_questions = 0
    correct_answers = 0
    results = []

    for question_id_key in submitted_answers:
        if question_id_key.startswith("answer_"):
            question_id = question_id_key.split("answer_")[1]
            user_answer = submitted_answers[question_id_key]

            # Get correct answer
            correct = db.execute("SELECT optionLabel FROM answers WHERE questionId = ? AND isCorrect = 1", question_id)
            question = db.execute("SELECT * FROM questions WHERE id = ?", question_id)

            if not correct or not question:
                continue

            question_text = question[0]["questionText"]
            explanation = question[0]["explanation"]
            correct_option = correct[0]["optionLabel"]

            is_correct = (user_answer == correct_option)
            if is_correct:
                correct_answers += 1
            total_questions += 1

            results.append({
                "question": question_text,
                "your_answer": user_answer,
                "correct_answer": correct_option,
                "explanation": explanation,
                "is_correct": is_correct
            })

    score = round((correct_answers / total_questions) * 100, 2) if total_questions > 0 else 0
    return render_template("results.html", results=results, score=score, total=total_questions, correct=correct_answers)

if __name__ == "__main__":
    app.run(debug=True)