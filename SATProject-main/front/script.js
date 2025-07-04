// Global utility functions and shared functionality

// Authentication functions
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const username = localStorage.getItem('username');
    
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (username) {
        const usernameElements = document.querySelectorAll('#username, #welcomeUsername');
        usernameElements.forEach(el => {
            if (el) el.textContent = username;
        });
    }
    
    return true;
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('quizResults');
        localStorage.removeItem('resultsProcessed');
        window.location.href = 'index.html';
    }
}

// Navigation update functions
function updateNavigation() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const username = localStorage.getItem('username') || 'User';
    const navButtons = document.getElementById('navButtons');
    
    if (!navButtons) return;
    
    if (isLoggedIn) {
        navButtons.innerHTML = `
            <a href="dashboard.html" class="btn btn-secondary">Dashboard</a>
            <div class="user-profile">
                <div class="user-icon">👤</div>
                <span>${username}</span>
            </div>
            <button onclick="logout()" class="btn btn-logout">Logout</button>
        `;
    } else {
        navButtons.innerHTML = `
            <a href="login.html" class="btn btn-secondary">Login</a>
            <a href="register.html" class="btn btn-primary">Get Started</a>
        `;
    }
}

// Homepage content update
function updatePageContent() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const username = localStorage.getItem('username') || 'User';
    
    const navButtons = document.getElementById('navButtons');
    const heroButtons = document.getElementById('heroButtons');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const aiSectionButton = document.getElementById('aiSectionButton');
    const ctaButton = document.getElementById('ctaButton');
    const ctaSection = document.getElementById('ctaSection');
    
    if (isLoggedIn) {
        // Update navigation for logged in users
        if (navButtons) {
            navButtons.innerHTML = `
                <a href="dashboard.html" class="btn btn-secondary">Dashboard</a>
                <div class="user-profile">
                    <div class="user-icon">👤</div>
                    <span>${username}</span>
                </div>
                <button onclick="logout()" class="btn btn-logout">Logout</button>
            `;
        }
        
        // Show welcome message
        if (welcomeMessage) {
            welcomeMessage.classList.add('show');
        }
        
        // Update hero buttons for logged in users
        if (heroButtons) {
            heroButtons.innerHTML = `
                <a href="quiz.html" class="btn btn-primary btn-large">Start New Quiz →</a>
                <a href="dashboard.html" class="btn btn-secondary btn-large">Go to Dashboard</a>
            `;
        }
        
        // Update AI section button
        if (aiSectionButton) {
            aiSectionButton.innerHTML = `
                <a href="quiz.html" class="btn btn-primary btn-large">Start Learning Now</a>
            `;
        }
        
        // Update CTA section for logged in users
        if (ctaSection) {
            ctaSection.innerHTML = `
                <div class="container">
                    <h2>Continue Your SAT Journey</h2>
                    <p>Keep practicing and track your improvement with our comprehensive tools.</p>
                    <a href="dashboard.html" class="btn btn-primary btn-large">View Your Progress</a>
                </div>
            `;
        }
        
    } else {
        // Update navigation for non-logged in users
        if (navButtons) {
            navButtons.innerHTML = `
                <a href="login.html" class="btn btn-secondary">Login</a>
                <a href="register.html" class="btn btn-primary">Get Started</a>
            `;
        }
        
        // Update hero buttons for non-logged in users
        if (heroButtons) {
            heroButtons.innerHTML = `
                <a href="register.html" class="btn btn-primary btn-large">Start Free Practice →</a>
                <a href="login.html" class="btn btn-secondary btn-large">Login to Continue</a>
            `;
        }
        
        // Update AI section button
        if (aiSectionButton) {
            aiSectionButton.innerHTML = `
                <a href="register.html" class="btn btn-primary btn-large">Experience AI Learning</a>
            `;
        }
        
        // Update CTA button
        if (ctaButton) {
            ctaButton.innerHTML = `
                <a href="register.html" class="btn btn-primary btn-large">Start Your Free Practice Today</a>
            `;
        }
    }
}

// Form validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.nextElementSibling;
    
    if (field.type === 'password') {
        field.type = 'text';
        button.textContent = '🙈';
    } else {
        field.type = 'password';
        button.textContent = '👁';
    }
}

// Quiz data and functions
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

// AI explanations for quiz questions
const aiExplanations = {
    0: "To solve 3x + 7 = 22, first subtract 7 from both sides: 3x = 15. Then divide both sides by 3: x = 5. This is a basic linear equation that tests your ability to isolate variables using inverse operations.",
    1: "This question tests reading comprehension and theme identification. The correct answer focuses on environmental conservation, which would be the main theme discussed throughout the passage. Look for recurring ideas and the author's primary message.",
    2: "In this sentence, 'neither...nor' requires subject-verb agreement with the closer subject. Since 'teacher' is singular, the verb should be 'was' not 'were'. This tests your understanding of correlative conjunctions and agreement rules.",
    3: "To find the slope between two points (x₁,y₁) and (x₂,y₂), use the formula: slope = (y₂-y₁)/(x₂-x₁). With points (2,3) and (6,11): slope = (11-3)/(6-2) = 8/4 = 2. This tests your knowledge of coordinate geometry.",
    4: "'Ubiquitous' means present everywhere or found everywhere. Context clues in the passage would suggest something that is widespread or commonly found, making 'present everywhere' the correct definition."
};

// Quiz history management
function getQuizHistory() {
    const history = localStorage.getItem('quizHistory');
    return history ? JSON.parse(history) : [];
}

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

// Dashboard functions
function startNewQuiz() {
    localStorage.removeItem('quizResults');
    window.location.href = 'quiz.html';
}

function startTimedPractice() {
    localStorage.removeItem('quizResults');
    window.location.href = 'quiz.html';
}

function viewResults(quizId) {
    const quizHistory = getQuizHistory();
    const quiz = quizHistory.find(q => q.id === quizId);
    
    if (quiz) {
        const mockResults = {
            score: quiz.score,
            correctAnswers: quiz.correctAnswers,
            totalQuestions: quiz.totalQuestions,
            timeSpent: quiz.timeSpent,
            userAnswers: generateMockAnswers(quiz),
            quizData: generateMockQuizData(quiz),
            completedAt: quiz.date
        };
        
        localStorage.setItem('quizResults', JSON.stringify(mockResults));
        window.location.href = 'results.html';
    } else {
        alert('Quiz results not found.');
    }
}

function retakeQuiz(subject) {
    localStorage.removeItem('quizResults');
    window.location.href = 'quiz.html';
}

function generateMockAnswers(quiz) {
    const answers = [];
    for (let i = 0; i < quiz.totalQuestions; i++) {
        if (i < quiz.correctAnswers) {
            answers.push(Math.floor(Math.random() * 4));
        } else {
            answers.push(Math.floor(Math.random() * 4));
        }
    }
    return answers;
}

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

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Header scroll effect
function initializeHeaderScrollEffect() {
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 100) {
                header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            } else {
                header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }
        }
    });
}

// Initialize common functionality
function initializeCommonFeatures() {
    initializeSmoothScrolling();
    initializeHeaderScrollEffect();
}

// Page-specific initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeCommonFeatures();
    
    // Check which page we're on and initialize accordingly
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    switch(page) {
        case 'index.html':
        case '':
            updatePageContent();
            break;
        case 'about.html':
        case 'contact.html':
            updateNavigation();
            break;
        case 'dashboard.html':
            if (checkAuth()) {
                // initializeDashboard(); // Placeholder for actual function
            }
            break;
        case 'quiz.html':
            if (checkAuth()) {
                // initializeQuiz(); // Placeholder for actual function
            }
            break;
        case 'results.html':
            if (checkAuth()) {
                // initializeResults(); // Placeholder for actual function
            }
            break;
        case 'login.html':
            // initializeLogin(); // Placeholder for actual function
            break;
        case 'register.html':
            // initializeRegister(); // Placeholder for actual function
            break;
    }
});

// Export functions for global access
window.logout = logout;
window.startNewQuiz = startNewQuiz;
window.startTimedPractice = startTimedPractice;
window.viewResults = viewResults;
window.retakeQuiz = retakeQuiz;
window.togglePassword = togglePassword;