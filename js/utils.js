// Utility functions
const APP_URL = "https://script.google.com/macros/s/AKfycbwysUniRPzoa8Y4SFKzw_ihh_Rx4y8fQL5hjxRjAAQmovO_SR1xxZwtimKYvw-89DRHvA/exec"; // Replace with your deployed Google Apps Script Web App URL
const QUIZ_ID = 'hdjsk299e93uee'; // Hardcoded quiz ID for Seerat-e-Mustafa
const QUIZ_JSON_URL = `quizes/${QUIZ_ID}.json`; // Path to your quiz JSON file

// Check if user is logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('examUser'));
    if (user) {
        currentUser = user;
        showDashboard();
        updateProfileIcon();
    }
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Generate random roll number
function generateRollNumber() {
    return 'R' + Math.floor(100000 + Math.random() * 900000);
}

// Initialize the app
function initApp() {
    checkAuth();
    setupEventListeners();
    
    // Check if exam page was requested
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('id') && currentUser) {
        const examId = urlParams.get('id');
        if (examId === QUIZ_ID) {
            checkAttempt();
        }
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Auth related
    document.getElementById('showLogin').addEventListener('click', showLogin);
    document.getElementById('showRegister').addEventListener('click', showRegister);
    document.getElementById('registerBtn').addEventListener('click', registerUser);
    document.getElementById('loginBtn').addEventListener('click', loginUser);
    
    // Profile related
    document.getElementById('profileIcon').addEventListener('click', toggleProfileDropdown);
    document.getElementById('logoutBtn').addEventListener('click', logoutUser);
    
    // Navigation
    document.getElementById('homeLink').addEventListener('click', showDashboard);
    document.getElementById('resultsLink').addEventListener('click', downloadAllResults);
    document.getElementById('myResultsLink').addEventListener('click', downloadMyResults);
    document.getElementById('paperLink').addEventListener('click', downloadExamPaper);
    document.getElementById('certificateLink').addEventListener('click', downloadCertificate);
    document.getElementById('attemptExamLink').addEventListener('click', () => {
        window.location.href = `index.html?id=${QUIZ_ID}`;
    });
    
    // Dashboard buttons
    if (document.getElementById('attemptExamBtn')) {
        document.getElementById('attemptExamBtn').addEventListener('click', () => {
            window.location.href = `index.html?id=${QUIZ_ID}`;
        });
    }
    if (document.getElementById('viewResultsBtn')) {
        document.getElementById('viewResultsBtn').addEventListener('click', downloadMyResults);
    }
    if (document.getElementById('downloadCertBtn')) {
        document.getElementById('downloadCertBtn').addEventListener('click', downloadCertificate);
    }
    
    // Exam related
    if (document.getElementById('submitExamBtn')) {
        document.getElementById('submitExamBtn').addEventListener('click', submitExam);
    }
    
    // Result related
    if (document.getElementById('backToDashboardBtn')) {
        document.getElementById('backToDashboardBtn').addEventListener('click', showDashboard);
    }
    if (document.getElementById('downloadResultBtn')) {
        document.getElementById('downloadResultBtn').addEventListener('click', downloadMyResults);
    }
    if (document.getElementById('downloadCertBtn2')) {
        document.getElementById('downloadCertBtn2').addEventListener('click', downloadCertificate);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
