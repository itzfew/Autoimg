let currentUser = null;

// Show Registration
function showRegister() {
    document.getElementById("registerBox").classList.remove("hidden");
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("examBox").classList.add("hidden");
    document.getElementById("resultBox").classList.add("hidden");
}

// Show Login
function showLogin() {
    document.getElementById("loginBox").classList.remove("hidden");
    document.getElementById("registerBox").classList.add("hidden");
    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("examBox").classList.add("hidden");
    document.getElementById("resultBox").classList.add("hidden");
}

// Show Dashboard
function showDashboard() {
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("registerBox").classList.add("hidden");
    document.getElementById("examBox").classList.add("hidden");
    document.getElementById("resultBox").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    
    if (currentUser) {
        document.getElementById("welcomeName").textContent = currentUser.name;
        updateNavLinks();
    }
}

// Update navigation links based on user status
function updateNavLinks() {
    const navLinks = document.getElementById("navLinks");
    const profileContainer = document.getElementById("profileContainer");
    
    if (currentUser) {
        document.querySelectorAll('.nav-links a').forEach(link => link.classList.add('hidden'));
        document.getElementById("homeLink").classList.remove("hidden");
        document.getElementById("resultsLink").classList.remove("hidden");
        document.getElementById("myResultsLink").classList.remove("hidden");
        
        // Check if user has attempted the exam
        fetch(https://script.google.com/macros/s/AKfycbwysUniRPzoa8Y4SFKzw_ihh_Rx4y8fQL5hjxRjAAQmovO_SR1xxZwtimKYvw-89DRHvA/exec, {
            method: "POST",
            body: JSON.stringify({ 
                action: "checkAttempt", 
                rollNumber: currentUser.rollNumber, 
                quizId: QUIZ_ID 
            })
        }).then(r => r.json()).then(res => {
            if (res.status === "success") {
                if (res.attempted) {
                    document.getElementById("paperLink").classList.remove("hidden");
                    document.getElementById("certificateLink").classList.remove("hidden");
                    document.getElementById("attemptExamLink").classList.add("hidden");
                    
                    // Update dashboard cards
                    document.getElementById("attemptCard").classList.add("hidden");
                } else {
                    document.getElementById("attemptExamLink").classList.remove("hidden");
                    document.getElementById("paperLink").classList.add("hidden");
                    document.getElementById("certificateLink").classList.add("hidden");
                    
                    // Update dashboard cards
                    document.getElementById("resultCard").classList.add("hidden");
                    document.getElementById("certificateCard").classList.add("hidden");
                }
            }
        });
        
        profileContainer.classList.remove("hidden");
    } else {
        profileContainer.classList.add("hidden");
        document.querySelectorAll('.nav-links a').forEach(link => link.classList.add('hidden'));
    }
}

// Update profile icon with user's first letter
function updateProfileIcon() {
    if (currentUser) {
        const profileIcon = document.getElementById("profileIcon");
        profileIcon.textContent = currentUser.name.charAt(0).toUpperCase();
        
        // Update profile dropdown info
        document.getElementById("profileName").textContent = currentUser.name;
        document.getElementById("profileRoll").textContent = `Roll: ${currentUser.rollNumber}`;
    }
}

// Toggle profile dropdown
function toggleProfileDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    dropdown.classList.toggle("hidden");
}

// Register User
function registerUser() {
    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();
    const dob = document.getElementById("dob").value;
    
    if (!name || !username || !dob) {
        alert("All fields are required");
        return;
    }
    
    if (/\s/.test(username)) {
        alert("Username must not contain spaces");
        return;
    }
    
    const rollNumber = generateRollNumber();
    
    fetch(https://script.google.com/macros/s/AKfycbwysUniRPzoa8Y4SFKzw_ihh_Rx4y8fQL5hjxRjAAQmovO_SR1xxZwtimKYvw-89DRHvA/exec, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            action: "register", 
            name, 
            username, 
            dob,
            rollNumber
        })
    }).then(r => r.json()).then(res => {
        if (res.status === "exists") {
            alert("Username already exists!");
        } else if (res.status === "success") {
            currentUser = {
                name,
                username,
                rollNumber,
                dob
            };
            
            // Save user to localStorage
            localStorage.setItem('examUser', JSON.stringify(currentUser));
            
            alert(`Account created! Your Roll Number: ${rollNumber}`);
            generateAdmitCard(name, username, rollNumber, dob);
            showDashboard();
            updateProfileIcon();
        } else {
            alert("Error: " + (res.message || "Unknown error"));
        }
    }).catch(err => {
        console.error("Registration error:", err);
        alert("Network error. Please try again.");
    });
}

// Login User
function loginUser() {
    const username = document.getElementById("loginUsername").value.trim();
    const rollNumber = document.getElementById("loginRoll").value.trim();
    
    if (!username || !rollNumber) {
        alert("Username and Roll Number are required");
        return;
    }
    
    fetch(https://script.google.com/macros/s/AKfycbwysUniRPzoa8Y4SFKzw_ihh_Rx4y8fQL5hjxRjAAQmovO_SR1xxZwtimKYvw-89DRHvA/exec, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            action: "login", 
            username, 
            rollNumber 
        })
    }).then(r => r.json()).then(res => {
        if (res.status === "success") {
            currentUser = res.user;
            
            // Save user to localStorage
            localStorage.setItem('examUser', JSON.stringify(currentUser));
            
            showDashboard();
            updateProfileIcon();
            
            // Check if exam page was requested
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('id')) {
                const examId = urlParams.get('id');
                if (examId === QUIZ_ID) {
                    checkAttempt();
                }
            }
        } else {
            alert("Invalid credentials or user not found");
        }
    }).catch(err => {
        console.error("Login error:", err);
        alert("Network error. Please try again.");
    });
}

// Logout User
function logoutUser() {
    currentUser = null;
    localStorage.removeItem('examUser');
    showLogin();
    toggleProfileDropdown();
}

// Generate Admit Card PDF
function generateAdmitCard(name, username, rollNumber, dob) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add background
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Add border
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277);
    
    // Add header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 150);
    doc.text("EXAM ADMIT CARD", 105, 25, { align: "center" });
    
    // Add logo placeholder
    doc.setFillColor(200, 200, 255);
    doc.roundedRect(80, 35, 50, 50, 5, 5, 'F');
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("LOGO", 105, 60, { align: "center" });
    
    // Add user details
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Candidate Details:", 20, 100);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${name}`, 20, 115);
    doc.text(`Username: ${username}`, 20, 125);
    doc.text(`Roll Number: ${rollNumber}`, 20, 135);
    doc.text(`Date of Birth: ${new Date(dob).toLocaleDateString()}`, 20, 145);
    
    // Add exam details
    doc.setFont("helvetica", "bold");
    doc.text("Exam Details:", 20, 165);
    
    doc.setFont("helvetica", "normal");
    doc.text("Exam Name: Seerat-e-Mustafa", 20, 180);
    doc.text("Duration: 30 Minutes", 20, 190);
    doc.text("Total Questions: 20", 20, 200);
    
    // Add instructions
    doc.setFont("helvetica", "bold");
    doc.text("Instructions:", 20, 220);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const instructions = [
        "1. Bring this admit card to the exam center.",
        "2. Carry a valid ID proof along with this admit card.",
        "3. Report to the exam center 30 minutes before the exam time.",
        "4. No electronic devices are allowed in the exam hall.",
        "5. Follow all instructions given by the invigilator."
    ];
    
    instructions.forEach((instruction, i) => {
        doc.text(instruction, 25, 230 + (i * 5));
    });
    
    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("This is a computer generated document. No signature required.", 105, 285, { align: "center" });
    
    doc.save(`AdmitCard_${rollNumber}.pdf`);
}
