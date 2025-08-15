// Google Apps Script URL (replace with your own)
const scriptUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// Global variables
let currentUser = null;
let serialNumber = 1; // In a real app, this would come from the server
let examsMetadata = {
    "quiz1": {
        "id": "quiz1",
        "title": "Seerat-e-Mustafa Quiz",
        "description": "Basic knowledge about the life of Prophet Muhammad (PBUH)",
        "duration": 30, // minutes
        "questions": [
            {
                "question": "In which city was Prophet Muhammad (PBUH) born?",
                "options": ["Mecca", "Medina", "Taif", "Jerusalem"],
                "answer": 0
            },
            {
                "question": "At what age did Prophet Muhammad (PBUH) receive the first revelation?",
                "options": ["25", "40", "45", "50"],
                "answer": 1
            },
            {
                "question": "Which companion was the first to accept Islam?",
                "options": ["Abu Bakr", "Khadija", "Ali", "Zaid"],
                "answer": 1
            }
        ]
    },
    "quiz2": {
        "id": "quiz2",
        "title": "Islamic History Quiz",
        "description": "Test your knowledge of Islamic history",
        "duration": 20,
        "questions": [
            {
                "question": "Which battle is known as the turning point in Islamic history?",
                "options": ["Badr", "Uhud", "Khandaq", "Hunayn"],
                "answer": 0
            },
            {
                "question": "How many years did the Prophet (PBUH) preach in Mecca?",
                "options": ["10", "13", "15", "20"],
                "answer": 1
            }
        ]
    }
};

// DOM elements
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');
const examContainer = document.getElementById('exam-container');
const examList = document.getElementById('exam-list');
const resultSection = document.getElementById('result-section');
const resultDetails = document.getElementById('result-details');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in (from sessionStorage)
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }

    // Load exam metadata (in a real app, this would be fetched from the server)
    loadExams();
});

showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const rollno = document.getElementById('login-rollno').value;
    
    loginUser(username, rollno);
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;
    const dob = document.getElementById('dob').value;
    
    registerUser(name, username, dob);
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    registerSection.style.display = 'none';
    loginForm.reset();
    registerForm.reset();
});

document.getElementById('download-admit').addEventListener('click', generateAdmitCard);
document.getElementById('download-certificate').addEventListener('click', generateCertificate);

// Functions
function loginUser(username, rollno) {
    // In a real app, this would verify with the server
    // For demo, we'll check if the user exists in localStorage
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.rollno === rollno);
    
    if (user) {
        currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        showDashboard();
    } else {
        alert('Invalid username or roll number. Please try again or register.');
    }
}

function registerUser(name, username, dob) {
    // Check if username already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const usernameExists = users.some(u => u.username === username);
    
    if (usernameExists) {
        alert('Username already exists. Please choose a different one.');
        return;
    }
    
    // Generate roll number (dob year + present day + serial number)
    const dobYear = new Date(dob).getFullYear();
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const serial = String(serialNumber).padStart(3, '0');
    const rollno = `${dobYear}${month}${day}${serial}`;
    
    // Create user object
    const user = {
        name,
        username,
        dob,
        rollno,
        registeredAt: new Date().toISOString(),
        attempts: {}
    };
    
    // Save user (in a real app, this would be saved to Google Sheets via Apps Script)
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    serialNumber++;
    
    // Set as current user
    currentUser = user;
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Show dashboard
    showDashboard();
}

function showDashboard() {
    loginSection.style.display = 'none';
    registerSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    
    // Update user info
    document.getElementById('welcome-name').textContent = currentUser.name;
    document.getElementById('display-username').textContent = currentUser.username;
    document.getElementById('display-rollno').textContent = currentUser.rollno;
    document.getElementById('display-dob').textContent = new Date(currentUser.dob).toLocaleDateString();
    
    // Check if user has any results
    if (currentUser.attempts && Object.keys(currentUser.attempts).length > 0) {
        showResults();
    } else {
        resultSection.style.display = 'none';
    }
}

function loadExams() {
    examList.innerHTML = '';
    
    for (const examId in examsMetadata) {
        const exam = examsMetadata[examId];
        
        const examItem = document.createElement('div');
        examItem.className = 'exam-item';
        examItem.innerHTML = `
            <h4>${exam.title}</h4>
            <p>${exam.description}</p>
            <p><strong>Duration:</strong> ${exam.duration} minutes</p>
            <button class="take-exam" data-exam-id="${examId}">Take Exam</button>
        `;
        
        examList.appendChild(examItem);
    }
    
    // Add event listeners to exam buttons
    document.querySelectorAll('.take-exam').forEach(button => {
        button.addEventListener('click', (e) => {
            const examId = e.target.getAttribute('data-exam-id');
            startExam(examId);
        });
    });
}

function startExam(examId) {
    const exam = examsMetadata[examId];
    
    // Check if user has already attempted this exam
    if (currentUser.attempts && currentUser.attempts[examId]) {
        alert('You have already attempted this exam. You cannot attempt it again.');
        return;
    }
    
    // Hide dashboard and show exam container
    dashboardSection.style.display = 'none';
    examContainer.style.display = 'block';
    
    // Set exam title
    document.getElementById('exam-title').textContent = exam.title;
    
    // Initialize timer
    let timeLeft = exam.duration * 60; // Convert to seconds
    updateTimerDisplay(timeLeft);
    const timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            submitExam(examId);
        }
    }, 1000);
    
    // Load questions
    const questionsContainer = document.getElementById('exam-questions');
    questionsContainer.innerHTML = '';
    
    exam.questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.innerHTML = `
            <div class="question-text">${index + 1}. ${q.question}</div>
            <div class="options">
                ${q.options.map((opt, optIndex) => `
                    <div class="option">
                        <input type="radio" name="q${index}" id="q${index}o${optIndex}" value="${optIndex}">
                        <label for="q${index}o${optIndex}">${opt}</label>
                    </div>
                `).join('')}
            </div>
        `;
        questionsContainer.appendChild(questionDiv);
    });
    
    // Set up submit button
    const submitBtn = document.getElementById('submit-exam');
    submitBtn.onclick = () => {
        clearInterval(timer);
        submitExam(examId);
    };
    
    // Set up cancel button
    document.getElementById('cancel-exam').onclick = () => {
        clearInterval(timer);
        if (confirm('Are you sure you want to cancel the exam? Your progress will not be saved.')) {
            examContainer.style.display = 'none';
            dashboardSection.style.display = 'block';
        }
    };
}

function updateTimerDisplay(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('time').textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function submitExam(examId) {
    const exam = examsMetadata[examId];
    const questions = exam.questions;
    let score = 0;
    const answers = [];
    
    // Check each question
    questions.forEach((q, index) => {
        const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
        const userAnswer = selectedOption ? parseInt(selectedOption.value) : null;
        
        answers.push({
            question: q.question,
            userAnswer: userAnswer !== null ? q.options[userAnswer] : 'Not answered',
            correctAnswer: q.options[q.answer],
            isCorrect: userAnswer === q.answer
        });
        
        if (userAnswer === q.answer) {
            score++;
        }
    });
    
    // Calculate percentage
    const percentage = Math.round((score / questions.length) * 100);
    
    // Create result object
    const result = {
        examId,
        examTitle: exam.title,
        date: new Date().toISOString(),
        score,
        totalQuestions: questions.length,
        percentage,
        answers
    };
    
    // Save result to user (in a real app, this would be saved to Google Sheets)
    if (!currentUser.attempts) {
        currentUser.attempts = {};
    }
    currentUser.attempts[examId] = result;
    
    // Update users in localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.rollno === currentUser.rollno);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    // Save to Google Sheets (simulated)
    saveToGoogleSheets(currentUser, result);
    
    // Show results
    examContainer.style.display = 'none';
    showDashboard();
    showResults();
}

function saveToGoogleSheets(user, result) {
    // In a real app, this would use Google Apps Script to save to Google Sheets
    console.log('Saving to Google Sheets:', { user, result });
    
    // Simulate API call to Google Apps Script
    const data = {
        action: 'save_result',
        user: user,
        result: result
    };
    
    // This is a simulation - in a real app, you would uncomment the fetch code
    /*
    fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
    */
}

function showResults() {
    resultSection.style.display = 'block';
    resultDetails.innerHTML = '';
    
    for (const examId in currentUser.attempts) {
        const attempt = currentUser.attempts[examId];
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-item';
        resultDiv.innerHTML = `
            <h4>${attempt.examTitle}</h4>
            <p><strong>Date:</strong> ${new Date(attempt.date).toLocaleString()}</p>
            <p><strong>Score:</strong> ${attempt.score} out of ${attempt.totalQuestions}</p>
            <p><strong>Percentage:</strong> ${attempt.percentage}%</p>
            <button class="view-details" data-exam-id="${examId}">View Details</button>
            <div class="details" id="details-${examId}" style="display:none; margin-top:10px;">
                ${attempt.answers.map((ans, idx) => `
                    <div class="answer ${ans.isCorrect ? 'correct' : 'incorrect'}">
                        <p><strong>Question ${idx + 1}:</strong> ${ans.question}</p>
                        <p><strong>Your answer:</strong> ${ans.userAnswer}</p>
                        <p><strong>Correct answer:</strong> ${ans.correctAnswer}</p>
                    </div>
                `).join('')}
            </div>
        `;
        
        resultDetails.appendChild(resultDiv);
    }
    
    // Add event listeners to view details buttons
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', (e) => {
            const examId = e.target.getAttribute('data-exam-id');
            const detailsDiv = document.getElementById(`details-${examId}`);
            
            if (detailsDiv.style.display === 'none') {
                detailsDiv.style.display = 'block';
                e.target.textContent = 'Hide Details';
            } else {
                detailsDiv.style.display = 'none';
                e.target.textContent = 'View Details';
            }
        });
    });
}

function generateAdmitCard() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Create admit card content
    const admitCard = document.getElementById('admit-card');
    admitCard.innerHTML = `
        <div class="admit-card-content">
            <div class="header" style="text-align: center; margin-bottom: 20px;">
                <h2>Exam Admit Card</h2>
                <p>Online Examination System</p>
            </div>
            <div class="user-info" style="margin-bottom: 20px;">
                <p><strong>Name:</strong> ${currentUser.name}</p>
                <p><strong>Username:</strong> ${currentUser.username}</p>
                <p><strong>Roll Number:</strong> ${currentUser.rollno}</p>
                <p><strong>Date of Birth:</strong> ${new Date(currentUser.dob).toLocaleDateString()}</p>
            </div>
            <div class="exam-info" style="margin-bottom: 20px;">
                <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Exam Details</h3>
                <p><strong>Exam Date:</strong> To be announced</p>
                <p><strong>Exam Time:</strong> To be announced</p>
                <p><strong>Instructions:</strong></p>
                <ul style="margin-top: 5px; padding-left: 20px;">
                    <li>Bring this admit card to the exam center</li>
                    <li>Carry a valid photo ID</li>
                    <li>Arrive at least 30 minutes before the exam</li>
                    <li>No electronic devices allowed</li>
                </ul>
            </div>
            <div class="signature" style="margin-top: 30px; display: flex; justify-content: space-between;">
                <div>
                    <p>_________________________</p>
                    <p>Candidate Signature</p>
                </div>
                <div>
                    <p>_________________________</p>
                    <p>Exam Authority Signature</p>
                </div>
            </div>
        </div>
    `;
    
    // Generate PDF
    html2canvas(admitCard).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 10, 10, 190, 0);
        doc.save(`AdmitCard_${currentUser.rollno}.pdf`);
    });
}

function generateCertificate() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    
    // Create certificate content
    const certificate = document.getElementById('certificate');
    certificate.innerHTML = `
        <div class="certificate-content" style="border: 2px solid #000; padding: 20px; height: 100%;">
            <div class="certificate-header" style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #2c3e50; margin-bottom: 5px;">CERTIFICATE OF ACHIEVEMENT</h2>
                <p style="font-size: 18px; color: #7f8c8d;">This is to certify that</p>
            </div>
            
            <div class="certificate-body" style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3498db; margin-bottom: 20px;">${currentUser.name}</h1>
                <p style="font-size: 16px;">has successfully completed the examination with the following results:</p>
            </div>
            
            ${Object.values(currentUser.attempts).map(attempt => `
                <div class="exam-result" style="margin-bottom: 15px; background-color: #f9f9f9; padding: 10px; border-radius: 5px;">
                    <h3 style="margin-top: 0; color: #2c3e50;">${attempt.examTitle}</h3>
                    <p><strong>Score:</strong> ${attempt.score} out of ${attempt.totalQuestions}</p>
                    <p><strong>Percentage:</strong> ${attempt.percentage}%</p>
                    <p><strong>Date:</strong> ${new Date(attempt.date).toLocaleDateString()}</p>
                </div>
            `).join('')}
            
            <div class="certificate-footer" style="margin-top: 40px; display: flex; justify-content: space-between;">
                <div style="text-align: left;">
                    <p>_________________________</p>
                    <p>Exam Coordinator</p>
                </div>
                <div style="text-align: right;">
                    <p>_________________________</p>
                    <p>Director</p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; font-style: italic; color: #7f8c8d;">
                <p>Certificate ID: ${currentUser.rollno}-${new Date().getTime()}</p>
            </div>
        </div>
    `;
    
    // Generate PDF
    html2canvas(certificate).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 10, 10, 277, 0);
        doc.save(`Certificate_${currentUser.rollno}.pdf`);
    });
}
