// Sample quiz history data structure
const sampleQuizHistory = [
    {
        id: 'math_1',
        name: 'Math Practice Test',
        score: 85,
        correctAnswers: 17,
        totalQuestions: 20,
        timeSpent: 2700, // 45 minutes in seconds
        date: '2024-01-15',
        subject: 'Math'
    },
    {
        id: 'reading_1',
        name: 'Reading Practice Test',
        score: 78,
        correctAnswers: 15,
        totalQuestions: 20,
        timeSpent: 2520, // 42 minutes in seconds
        date: '2024-01-12',
        subject: 'Reading'
    },
    {
        id: 'writing_1',
        name: 'Writing Practice Test',
        score: 92,
        correctAnswers: 18,
        totalQuestions: 20,
        timeSpent: 2280, // 38 minutes in seconds
        date: '2024-01-10',
        subject: 'Writing'
    }
];

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const username = localStorage.getItem('username');

    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    if (username) {
        document.getElementById('username').textContent = username;
        document.getElementById('welcomeUsername').textContent = username;
    }
}

// Initialize quiz history if it doesn't exist
function initializeQuizHistory() {
    const existingHistory = localStorage.getItem('quizHistory');
    if (!existingHistory) {
        localStorage.setItem('quizHistory', JSON.stringify(sampleQuizHistory));
    }
}

// Get quiz history from localStorage
function getQuizHistory() {
    const history = localStorage.getItem('quizHistory');
    return history ? JSON.parse(history) : [];
}

// Update dashboard stats
function updateStats() {
    const quizHistory = getQuizHistory();

    if (quizHistory.length === 0) {
        document.getElementById('testsTaken').textContent = '0';
        document.getElementById('averageScore').textContent = '0%';
        document.getElementById('scoreDescription').textContent = 'Take your first quiz!';
        document.getElementById('studyStreak').textContent = '0 days';
        return;
    }

    // Calculate stats
    const testsTaken = quizHistory.length;
    const totalScore = quizHistory.reduce((sum, quiz) => sum + quiz.score, 0);
    const averageScore = Math.round(totalScore / testsTaken);

    // Update DOM
    document.getElementById('testsTaken').textContent = testsTaken.toString();
    document.getElementById('averageScore').textContent = `${averageScore}%`;

    // Update score description
    let scoreDescription = 'Keep practicing!';
    if (averageScore >= 90) {
        scoreDescription = 'Excellent work!';
    } else if (averageScore >= 80) {
        scoreDescription = 'Great progress!';
    } else if (averageScore >= 70) {
        scoreDescription = 'Good improvement!';
    }
    document.getElementById('scoreDescription').textContent = scoreDescription;

    // Calculate study streak (simplified - just based on recent activity)
    const today = new Date();
    const lastQuizDate = new Date(quizHistory[0].date);
    const daysDiff = Math.floor((today - lastQuizDate) / (1000 * 60 * 60 * 24));
    const streak = daysDiff <= 1 ? Math.min(quizHistory.length, 7) : 0;
    document.getElementById('studyStreak').textContent = `${streak} days`;
}

// Display quiz history
function displayQuizHistory() {
    const quizHistory = getQuizHistory();
    const container = document.getElementById('quizHistoryContainer');

    if (quizHistory.length === 0) {
        container.innerHTML = `
            <div class="no-history">
                <div class="no-history-icon">📝</div>
                <p>No quiz history yet. Take your first quiz to see your progress!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    quizHistory.forEach((quiz, index) => {
        const scoreClass = quiz.score >= 80 ? 'score-high' : quiz.score >= 60 ? 'score-medium' : 'score-low';
        const minutes = Math.floor(quiz.timeSpent / 60);
        const formattedDate = new Date(quiz.date).toLocaleDateString();

        const quizItem = document.createElement('div');
        quizItem.className = 'quiz-item';
        quizItem.innerHTML = `
            <div class="quiz-info">
                <div class="quiz-name">
                    ${quiz.name}
                    <span class="quiz-score ${scoreClass}">${quiz.score}%</span>
                </div>
                <div class="quiz-details">
                    <span>📅 ${formattedDate}</span>
                    <span>⏱️ ${minutes} min</span>
                    <span>${quiz.correctAnswers}/${quiz.totalQuestions} correct</span>
                </div>
            </div>
            <div class="quiz-actions">
                <button class="quiz-btn quiz-btn-secondary" onclick="viewResults('${quiz.id}')">View Results</button>
                <button class="quiz-btn quiz-btn-primary" onclick="retakeQuiz('${quiz.subject}')">Retake</button>
            </div>
        `;

        container.appendChild(quizItem);
    });
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('userEmail');
        window.location.href = 'index.html';
    }
}

// Quiz functions
function startNewQuiz() {
    // Clear any existing quiz results to start fresh
    localStorage.removeItem('quizResults');
    window.location.href = 'quiz.html';
}

function startTimedPractice() {
    // For now, redirect to the same quiz page
    localStorage.removeItem('quizResults');
    window.location.href = 'quiz.html';
}

function viewResults(quizId) {
    // Find the quiz in history
    const quizHistory = getQuizHistory();
    const quiz = quizHistory.find(q => q.id === quizId);

    if (quiz) {
        // Create a mock results object that matches the expected format
        const mockResults = {
            score: quiz.score,
            correctAnswers: quiz.correctAnswers,
            totalQuestions: quiz.totalQuestions,
            timeSpent: quiz.timeSpent,
            userAnswers: generateMockAnswers(quiz),
            quizData: generateMockQuizData(quiz),
            completedAt: quiz.date
        };

        // Store the results temporarily
        localStorage.setItem('quizResults', JSON.stringify(mockResults));

        // Redirect to results page
        window.location.href = 'results.html';
    } else {
        alert('Quiz results not found.');
    }
}

function retakeQuiz(subject) {
    // Clear any existing results and start a new quiz
    localStorage.removeItem('quizResults');
    window.location.href = 'quiz.html';
}

// Generate mock answers for historical quizzes
function generateMockAnswers(quiz) {
    const answers = [];
    for (let i = 0; i < quiz.totalQuestions; i++) {
        if (i < quiz.correctAnswers) {
            answers.push(Math.floor(Math.random() * 4)); // Correct answer
        } else {
            answers.push(Math.floor(Math.random() * 4)); // Random answer
        }
    }
    return answers;
}

// Generate mock quiz data for historical quizzes
function generateMockQuizData(quiz) {
    const subjects = {
        'Math': [
            { question: "If 3x + 7 = 22, what is the value of x?", options: ["3", "5", "7", "15"], correct: 1 },
            { question: "What is the slope of the line passing through points (2, 3) and (6, 11)?", options: ["2", "3", "4", "8"], correct: 0 }
        ],
        'Reading': [
            { question: "Based on the context, what does the word 'ubiquitous' most likely mean?", options: ["Rare and valuable", "Present everywhere", "Difficult to understand", "Recently discovered"], correct: 1 },
            { question: "Which of the following best describes the main theme of the passage?", options: ["The challenges of modern technology", "The importance of environmental conservation", "The role of education in society", "The impact of globalization"], correct: 1 }
        ],
        'Writing': [
            { question: "Choose the sentence that is grammatically correct:", options: ["Neither the students nor the teacher were prepared for the exam.", "Neither the students nor the teacher was prepared for the exam.", "Neither the students or the teacher were prepared for the exam.", "Neither the students or the teacher was prepared for the exam."], correct: 1 }
        ]
    };

    const subjectQuestions = subjects[quiz.subject] || subjects['Math'];
    const quizData = [];

    for (let i = 0; i < quiz.totalQuestions; i++) {
        const questionIndex = i % subjectQuestions.length;
        quizData.push({
            subject: quiz.subject,
            ...subjectQuestions[questionIndex]
        });
    }

    return quizData;
}

// Add new quiz result to history
function addQuizToHistory(results) {
    const quizHistory = getQuizHistory();
    const newQuiz = {
        id: `quiz_${Date.now()}`,
        name: `${results.quizData[0]?.subject || 'Mixed'} Practice Test`,
        score: results.score,
        correctAnswers: results.correctAnswers,
        totalQuestions: results.totalQuestions,
        timeSpent: results.timeSpent,
        date: new Date().toISOString().split('T')[0],
        subject: results.quizData[0]?.subject || 'Mixed'
    };

    quizHistory.unshift(newQuiz); // Add to beginning

    // Keep only last 10 quizzes
    if (quizHistory.length > 10) {
        quizHistory.splice(10);
    }

    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
}

// Check if there are new quiz results to add to history
function checkForNewResults() {
    const results = localStorage.getItem('quizResults');
    const resultsProcessed = localStorage.getItem('resultsProcessed');

    if (results && !resultsProcessed) {
        const parsedResults = JSON.parse(results);
        addQuizToHistory(parsedResults);
        localStorage.setItem('resultsProcessed', 'true');
    }
}

// Initialize dashboard
window.addEventListener('load', function () {
    checkAuth();
    initializeQuizHistory();
    checkForNewResults();
    updateStats();
    displayQuizHistory();
});

// Clear the resultsProcessed flag when starting a new quiz
window.addEventListener('beforeunload', function () {
    if (window.location.href.includes('quiz.html')) {
        localStorage.removeItem('resultsProcessed');
    }
});