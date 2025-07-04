// Quiz data
const quizData = [
    {
        subject: "Math",
        question: "If 3x + 7 = 22, what is the value of x?",
        options: ["3", "5", "7", "15"],
        correct: 1
    },
    {
        subject: "Reading",
        question: "Which of the following best describes the main theme of the passage?",
        options: ["The challenges of modern technology", "The importance of environmental conservation", "The role of education in society", "The impact of globalization"],
        correct: 1
    },
    {
        subject: "Writing",
        question: "Choose the sentence that is grammatically correct:",
        options: [
            "Neither the students nor the teacher were prepared for the exam.",
            "Neither the students nor the teacher was prepared for the exam.",
            "Neither the students or the teacher were prepared for the exam.",
            "Neither the students or the teacher was prepared for the exam."
        ],
        correct: 1
    },
    {
        subject: "Math",
        question: "What is the slope of the line passing through points (2, 3) and (6, 11)?",
        options: ["2", "3", "4", "8"],
        correct: 0
    },
    {
        subject: "Reading",
        question: "Based on the context, what does the word 'ubiquitous' most likely mean?",
        options: ["Rare and valuable", "Present everywhere", "Difficult to understand", "Recently discovered"],
        correct: 1
    }
];

// Quiz state
let currentQuestion = 0;
let userAnswers = new Array(quizData.length).fill(null);
let timeRemaining = 25 * 60; // 25 minutes in seconds
let timerInterval;

// Initialize quiz
function initializeQuiz() {
    // Check authentication
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    startTimer();
    displayQuestion();
    updateProgress();
}

// Timer functions
function startTimer() {
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Question display
function displayQuestion() {
    const question = quizData[currentQuestion];
    
    document.getElementById('subjectBadge').textContent = question.subject;
    document.getElementById('questionText').textContent = question.question;
    
    const optionsList = document.getElementById('optionsList');
    optionsList.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        if (userAnswers[currentQuestion] === index) {
            optionElement.classList.add('selected');
        }
        optionElement.onclick = () => selectOption(index);
        
        optionElement.innerHTML = `
            <div class="option-letter">${String.fromCharCode(65 + index)}</div>
            <div class="option-text">${option}</div>
        `;
        
        optionsList.appendChild(optionElement);
    });
    
    updateNavigation();
}

// Option selection
function selectOption(index) {
    userAnswers[currentQuestion] = index;
    
    // Update visual selection
    const options = document.querySelectorAll('.option');
    options.forEach((option, i) => {
        option.classList.toggle('selected', i === index);
    });
    
    updateProgress();
    updateQuestionNumbers();
}

// Navigation
function nextQuestion() {
    if (currentQuestion < quizData.length - 1) {
        currentQuestion++;
        displayQuestion();
        updateProgress();
        updateQuestionNumbers();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
        updateProgress();
        updateQuestionNumbers();
    }
}

function goToQuestion(index) {
    currentQuestion = index;
    displayQuestion();
    updateProgress();
    updateQuestionNumbers();
}

function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentQuestion === 0;
    
    if (currentQuestion === quizData.length - 1) {
        nextBtn.textContent = 'Submit Quiz';
        nextBtn.onclick = submitQuiz;
    } else {
        nextBtn.textContent = 'Next →';
        nextBtn.onclick = nextQuestion;
    }
}

// Progress tracking
function updateProgress() {
    const answeredCount = userAnswers.filter(answer => answer !== null).length;
    const progressPercentage = ((currentQuestion + 1) / quizData.length) * 100;
    
    document.getElementById('questionInfo').textContent = `Question ${currentQuestion + 1} of ${quizData.length}`;
    document.getElementById('answeredInfo').textContent = `${answeredCount} answered`;
    document.getElementById('progressFill').style.width = `${progressPercentage}%`;
}

function updateQuestionNumbers() {
    const questionNumbers = document.querySelectorAll('.question-number');
    questionNumbers.forEach((number, index) => {
        number.classList.remove('current', 'answered');
        
        if (index === currentQuestion) {
            number.classList.add('current');
        } else if (userAnswers[index] !== null) {
            number.classList.add('answered');
        }
    });
}

// Quiz submission
function submitQuiz() {
    if (confirm('Are you sure you want to submit your quiz?')) {
        clearInterval(timerInterval);
        
        // Calculate results
        const totalTime = 25 * 60 - timeRemaining;
        let correctAnswers = 0;
        
        userAnswers.forEach((answer, index) => {
            if (answer === quizData[index].correct) {
                correctAnswers++;
            }
        });
        
        const score = Math.round((correctAnswers / quizData.length) * 100);
        
        // Store results
        const results = {
            score: score,
            correctAnswers: correctAnswers,
            totalQuestions: quizData.length,
            timeSpent: totalTime,
            userAnswers: userAnswers,
            quizData: quizData,
            completedAt: new Date().toISOString()
        };
        
        localStorage.setItem('quizResults', JSON.stringify(results));
        
        // Redirect to results page
        window.location.href = 'results.html';
    }
}

// Initialize when page loads
window.addEventListener('load', initializeQuiz);

// Prevent accidental page refresh
window.addEventListener('beforeunload', function(e) {
    if (timeRemaining > 0) {
        e.preventDefault();
        e.returnValue = '';
    }
});