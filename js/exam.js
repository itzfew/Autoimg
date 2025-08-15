let quizData = null;
let timerInterval = null;
let timeLeft = 30 * 60; // 30 minutes in seconds

// Check if user has already attempted the exam
function checkAttempt() {
    if (!currentUser) return;
    
    fetch(https://script.google.com/macros/s/AKfycbwysUniRPzoa8Y4SFKzw_ihh_Rx4y8fQL5hjxRjAAQmovO_SR1xxZwtimKYvw-89DRHvA/exec, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            action: "checkAttempt", 
            rollNumber: currentUser.rollNumber, 
            quizId: QUIZ_ID 
        })
    }).then(r => r.json()).then(res => {
        if (res.status === "success") {
            if (res.attempted) {
                alert("You have already attempted this exam.");
                showResults(res.result);
            } else {
                loadExam();
            }
        } else {
            alert("Error checking attempt: " + (res.message || "Unknown error"));
        }
    }).catch(err => {
        console.error("Check attempt error:", err);
        alert("Network error. Please try again.");
    });
}

// Load Exam
function loadExam() {
    fetch(QUIZ_JSON_URL)
    .then(r => r.json())
    .then(data => {
        quizData = data;
        renderExam();
        startTimer();
    }).catch(err => {
        console.error("Load exam error:", err);
        alert("Error loading exam. Please try again.");
    });
}

// Render Exam Questions
function renderExam() {
    const form = document.getElementById("examForm");
    form.innerHTML = "";
    
    document.getElementById("totalQuestions").textContent = quizData.questions.length;
    
    quizData.questions.forEach((q, i) => {
        const questionDiv = document.createElement("div");
        questionDiv.className = "question";
        
        const questionText = document.createElement("p");
        questionText.textContent = `${i + 1}. ${q.question}`;
        questionDiv.appendChild(questionText);
        
        const optionsDiv = document.createElement("div");
        optionsDiv.className = "options";
        
        q.options.forEach((opt, optIndex) => {
            const optionDiv = document.createElement("div");
            optionDiv.className = "option";
            
            const radioId = `q${i}_opt${optIndex}`;
            
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.id = radioId;
            radio.name = `q${i}`;
            radio.value = opt;
            
            const label = document.createElement("label");
            label.htmlFor = radioId;
            label.textContent = opt;
            
            label.prepend(radio);
            optionDiv.appendChild(label);
            optionsDiv.appendChild(optionDiv);
        });
        
        questionDiv.appendChild(optionsDiv);
        form.appendChild(questionDiv);
    });
    
    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("examBox").classList.remove("hidden");
}

// Start Exam Timer
function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Time's up! Your exam will be submitted automatically.");
            submitExam();
        }
    }, 1000);
}

// Update Timer Display
function updateTimerDisplay() {
    const timerElement = document.getElementById("timer");
    timerElement.textContent = `Time Left: ${formatTime(timeLeft)}`;
    
    // Change color when time is running low
    if (timeLeft <= 5 * 60) { // 5 minutes left
        timerElement.style.color = "red";
    } else if (timeLeft <= 10 * 60) { // 10 minutes left
        timerElement.style.color = "orange";
    }
}

// Submit Exam
function submitExam() {
    if (!quizData) return;
    
    clearInterval(timerInterval);
    
    let answers = [];
    let correct = 0;
    
    quizData.questions.forEach((q, i) => {
        const selectedOption = document.querySelector(`input[name="q${i}"]:checked`);
        const userAnswer = selectedOption ? selectedOption.value : null;
        const isCorrect = userAnswer === q.answer;
        
        if (isCorrect) correct++;
        
        answers.push({
            question: q.question,
            yourAnswer: userAnswer || "Not answered",
            correctAnswer: q.answer,
            isCorrect
        });
    });
    
    const total = quizData.questions.length;
    const percentage = (correct / total) * 100;
    
    const result = {
        marks: correct,
        total,
        percentage,
        details: answers
    };
    
    saveResults(result);
}

// Save Exam Results
function saveResults(result) {
    fetch(https://script.google.com/macros/s/AKfycbwysUniRPzoa8Y4SFKzw_ihh_Rx4y8fQL5hjxRjAAQmovO_SR1xxZwtimKYvw-89DRHvA/exec, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: "saveResults",
            quizId: QUIZ_ID,
            rollNumber: currentUser.rollNumber,
            name: currentUser.name,
            username: currentUser.username,
            marks: result.marks,
            total: result.total,
            percentage: result.percentage,
            details: result.details
        })
    }).then(r => r.json()).then(res => {
        if (res.status === "success") {
            showResults(result);
        } else if (res.status === "blocked") {
            alert("You have already attempted this exam.");
            showResults(res.result);
        } else {
            alert("Error saving results: " + (res.message || "Unknown error"));
        }
    }).catch(err => {
        console.error("Save results error:", err);
        alert("Network error while saving results.");
    });
}

// Show Results
function showResults(result) {
    const resultText = document.getElementById("resultText");
    const resultDetails = document.getElementById("resultDetails");
    
    resultText.textContent = `You scored ${result.marks}/${result.total} (${result.percentage.toFixed(2)}%)`;
    
    resultDetails.innerHTML = "";
    result.details.forEach((item, i) => {
        const resultItem = document.createElement("div");
        resultItem.className = `result-item ${item.isCorrect ? 'correct' : 'incorrect'}`;
        
        resultItem.innerHTML = `
            <p><strong>Q${i + 1}:</strong> ${item.question}</p>
            <p>Your Answer: ${item.yourAnswer}</p>
            <p>Correct Answer: ${item.correctAnswer}</p>
        `;
        
        resultDetails.appendChild(resultItem);
    });
    
    document.getElementById("examBox").classList.add("hidden");
    document.getElementById("resultBox").classList.remove("hidden");
    
    // Update nav links to show certificate option
    updateNavLinks();
}
