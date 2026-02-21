const quizData = [
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1
    },
    {
        question: "What is 15 + 27?",
        options: ["42", "41", "43", "40"],
        correct: 0
    },
    {
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correct: 1
    },
    {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correct: 3
    },
    {
        question: "How many continents are there?",
        options: ["5", "6", "7", "8"],
        correct: 2
    },
    {
        question: "What is the chemical symbol for water?",
        options: ["H2O", "CO2", "O2", "NaCl"],
        correct: 0
    },
    {
        question: "In which year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correct: 2
    },
    {
        question: "What is the smallest prime number?",
        options: ["0", "1", "2", "3"],
        correct: 2
    },
    {
        question: "Which programming language is known as the 'language of the web'?",
        options: ["Python", "Java", "JavaScript", "C++"],
        correct: 2
    }
];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;
document.addEventListener('DOMContentLoaded', () => {
    displaySavedScores();
});
function displaySavedScores() {
    const savedScoresDiv = document.getElementById('savedScores');
    const lastScore = localStorage.getItem('lastScore');
    const highestScore = localStorage.getItem('highestScore');
    const lastDate = localStorage.getItem('lastDate');

    if (lastScore || highestScore) {
        let html = '';
        if (lastScore) {
            html += `<p><strong>Last Score:</strong> ${lastScore}/${quizData.length} (${Math.round((lastScore/quizData.length)*100)}%)</p>`;
        }
        if (lastDate) {
            html += `<p><strong>Last Attempt:</strong> ${lastDate}</p>`;
        }
        if (highestScore) {
            html += `<p><strong>Best Score:</strong> ${highestScore}/${quizData.length} (${Math.round((highestScore/quizData.length)*100)}%)</p>`;
        }
        savedScoresDiv.innerHTML = html;
    } else {
        savedScoresDiv.innerHTML = '<p style="color: #999;">No previous attempts</p>';
    }
}
function clearSavedData() {
    if (confirm('Are you sure you want to clear all saved data?')) {
        localStorage.removeItem('lastScore');
        localStorage.removeItem('highestScore');
        localStorage.removeItem('lastDate');
        displaySavedScores();
    }
}
function startQuiz() {
    currentQuestionIndex = 0;
    userAnswers = new Array(quizData.length).fill(null);
    score = 0;
    
    showScreen('quizScreen');
    document.getElementById('totalQuestions').textContent = quizData.length;
    displayQuestion();
}
function displayQuestion() {
    const question = quizData[currentQuestionIndex];
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('questionText').textContent = question.question;
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        if (userAnswers[currentQuestionIndex] === index) {
            optionDiv.classList.add('selected');
        }
        
        optionDiv.innerHTML = `
            <div class="option-radio"></div>
            <div class="option-text">${option}</div>
        `;
        
        optionDiv.onclick = () => selectOption(index);
        optionsContainer.appendChild(optionDiv);
    });
    updateButtons();
}
function selectOption(index) {
    userAnswers[currentQuestionIndex] = index;
    const options = document.querySelectorAll('.option');
    options.forEach((opt, i) => {
        opt.classList.toggle('selected', i === index);
    });
    document.getElementById('nextBtn').disabled = false;
}
function updateButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    prevBtn.disabled = currentQuestionIndex === 0;
    prevBtn.style.visibility = currentQuestionIndex === 0 ? 'hidden' : 'visible';
    if (userAnswers[currentQuestionIndex] !== null) {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = true;
    }
    if (currentQuestionIndex === quizData.length - 1) {
        nextBtn.textContent = 'Submit';
    } else {
        nextBtn.textContent = 'Next';
    }
}
function nextQuestion() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        finishQuiz();
    }
}
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}
function finishQuiz() {
    score = 0;
    
    userAnswers.forEach((answer, index) => {
        if (answer === quizData[index].correct) {
            score++;
        }
    });
    const today = new Date().toLocaleDateString();
    localStorage.setItem('lastScore', score);
    localStorage.setItem('lastDate', today);
    
    const highestScore = localStorage.getItem('highestScore');
    if (!highestScore || score > parseInt(highestScore)) {
        localStorage.setItem('highestScore', score);
    }
    
    displayResults();
}
function displayResults() {
    showScreen('resultScreen');
    
    const percentage = Math.round((score / quizData.length) * 100);
    const incorrect = quizData.length - score;
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('totalScore').textContent = quizData.length;
    document.getElementById('percentage').textContent = percentage + '%';
    document.getElementById('correctCount').textContent = score;
    document.getElementById('incorrectCount').textContent = incorrect;
    const messageDiv = document.getElementById('performanceMessage');
    let message = '';
    let className = '';
    
    if (percentage >= 80) {
        message = 'Excellent! Outstanding performance!';
        className = 'excellent';
    } else if (percentage >= 60) {
        message = 'Good job! Keep practicing!';
        className = 'good';
    } else {
        message = 'Needs Improvement. Try again!';
        className = 'needs-improvement';
    }
    
    messageDiv.textContent = message;
    messageDiv.className = 'performance-message ' + className;
}
function reviewAnswers() {
    showScreen('reviewScreen');
    
    const reviewContainer = document.getElementById('reviewContainer');
    reviewContainer.innerHTML = '';
    
    quizData.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.correct;
        const isCorrect = userAnswer === correctAnswer;
        
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        
        let optionsHTML = '';
        question.options.forEach((option, optIndex) => {
            let optionClass = 'review-option';
            let labelHTML = '';
            
            if (optIndex === userAnswer && optIndex === correctAnswer) {
                optionClass += ' correct-answer';
                labelHTML = '<span class="review-label correct">Your Answer - Correct</span>';
            } else if (optIndex === userAnswer) {
                optionClass += ' wrong-answer';
                labelHTML = '<span class="review-label incorrect">Your Answer</span>';
            } else if (optIndex === correctAnswer) {
                optionClass += ' correct-answer';
                labelHTML = '<span class="review-label correct">Correct Answer</span>';
            }
            
            optionsHTML += `
                <div class="${optionClass}">
                    ${option}
                    ${labelHTML}
                </div>
            `;
        });
        
        reviewItem.innerHTML = `
            <div class="review-question">
                Question ${index + 1}: ${question.question}
            </div>
            ${optionsHTML}
        `;
        
        reviewContainer.appendChild(reviewItem);
    });
}
function backToResults() {
    showScreen('resultScreen');
}
function restartQuiz() {
    showScreen('welcomeScreen');
    displaySavedScores();
}
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}
