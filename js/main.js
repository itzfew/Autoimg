// Download All Results (for admin)
function downloadAllResults() {
    if (!currentUser) return;
    
    fetch(APP_URL, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            action: "getAllResults", 
            quizId: QUIZ_ID 
        })
    }).then(r => r.json()).then(res => {
        if (res.status === "success") {
            generateAllResultsPDF(res.results);
        } else {
            alert("Error fetching results: " + (res.message || "Unknown error"));
        }
    }).catch(err => {
        console.error("Download all results error:", err);
        alert("Network error. Please try again.");
    });
}

// Generate PDF for all results
function generateAllResultsPDF(results) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Exam Results - Seerat-e-Mustafa", 105, 20, { align: "center" });
    
    // Add date
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" });
    
    // Add table headers
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Roll Number", 20, 50);
    doc.text("Name", 60, 50);
    doc.text("Marks", 120, 50);
    doc.text("Percentage", 150, 50);
    
    // Add table rows
    doc.setFont("helvetica", "normal");
    let y = 60;
    results.forEach((result, i) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        doc.text(result.rollNumber, 20, y);
        doc.text(result.name, 60, y);
        doc.text(`${result.marks}/${result.total}`, 120, y);
        doc.text(`${result.percentage.toFixed(2)}%`, 150, y);
        
        y += 10;
    });
    
    // Add summary
    doc.setFont("helvetica", "bold");
    doc.text(`Total Students: ${results.length}`, 20, y + 20);
    
    doc.save(`SeeratExam_AllResults.pdf`);
}

// Download My Results
function downloadMyResults() {
    if (!currentUser) return;
    
    fetch(APP_URL, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            action: "getMyResults", 
            rollNumber: currentUser.rollNumber,
            quizId: QUIZ_ID 
        })
    }).then(r => r.json()).then(res => {
        if (res.status === "success") {
            generateMyResultsPDF(res.result);
        } else {
            alert("Error fetching your results: " + (res.message || "Unknown error"));
        }
    }).catch(err => {
        console.error("Download my results error:", err);
        alert("Network error. Please try again.");
    });
}

// Generate PDF for my results
function generateMyResultsPDF(result) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Your Exam Result - Seerat-e-Mustafa", 105, 20, { align: "center" });
    
    // Add student info
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${result.name}`, 20, 40);
    doc.text(`Roll Number: ${result.rollNumber}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
    
    // Add summary
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 20, 80);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Total Questions: ${result.total}`, 20, 90);
    doc.text(`Correct Answers: ${result.marks}`, 20, 100);
    doc.text(`Percentage: ${result.percentage.toFixed(2)}%`, 20, 110);
    
    // Add detailed results
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Results", 20, 130);
    
    let y = 140;
    result.details.forEach((item, i) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`Q${i + 1}: ${item.question}`, 20, y);
        y += 5;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(item.isCorrect ? 0 : 255, 0, 0);
        doc.text(`Your Answer: ${item.yourAnswer}`, 25, y);
        y += 5;
        
        doc.setTextColor(0, 100, 0);
        doc.text(`Correct Answer: ${item.correctAnswer}`, 25, y);
        y += 10;
        
        doc.setTextColor(0, 0, 0);
    });
    
    doc.save(`SeeratExam_${currentUser.rollNumber}_Result.pdf`);
}

// Download Exam Paper
function downloadExamPaper() {
    if (!currentUser) return;
    
    fetch(QUIZ_JSON_URL)
    .then(r => r.json())
    .then(data => {
        generateExamPaperPDF(data);
    }).catch(err => {
        console.error("Download exam paper error:", err);
        alert("Error loading exam paper. Please try again.");
    });
}

// Generate PDF for exam paper
function generateExamPaperPDF(quizData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Exam Paper - Seerat-e-Mustafa", 105, 20, { align: "center" });
    
    // Add instructions
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Time: 30 minutes | Total Questions: " + quizData.questions.length, 105, 30, { align: "center" });
    
    let y = 50;
    quizData.questions.forEach((q, i) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${i + 1}. ${q.question}`, 20, y);
        y += 7;
        
        doc.setFont("helvetica", "normal");
        q.options.forEach((opt, optIndex) => {
            doc.text(`${String.fromCharCode(97 + optIndex)}. ${opt}`, 25, y);
            y += 7;
        });
        
        y += 5;
    });
    
    // Add answer key (on a new page)
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Answer Key", 105, 20, { align: "center" });
    
    y = 30;
    quizData.questions.forEach((q, i) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`${i + 1}. ${q.answer}`, 20, y);
        y += 10;
    });
    
    doc.save("SeeratExam_Paper.pdf");
}

// Download Certificate
function downloadCertificate() {
    if (!currentUser) return;
    
    fetch(APP_URL, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            action: "getMyResults", 
            rollNumber: currentUser.rollNumber,
            quizId: QUIZ_ID 
        })
    }).then(r => r.json()).then(res => {
        if (res.status === "success") {
            generateCertificatePDF(res.result);
        } else {
            alert("You need to attempt the exam first to get a certificate.");
        }
    }).catch(err => {
        console.error("Download certificate error:", err);
        alert("Network error. Please try again.");
    });
}

// Generate Certificate PDF
function generateCertificatePDF(result) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'landscape'
    });
    
    // Add background
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Add decorative border
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(1);
    doc.rect(10, 10, 277, 190);
    
    // Add header
    doc.setFontSize(30);
    doc.setFont("times", "bold");
    doc.setTextColor(50, 50, 150);
    doc.text("CERTIFICATE OF ACHIEVEMENT", 148.5, 30, { align: "center" });
    
    // Add decorative element
    doc.setFillColor(200, 200, 255);
    doc.circle(148.5, 70, 40, 'F');
    doc.setFontSize(40);
    doc.setTextColor(255, 255, 255);
    doc.text("✓", 148.5, 77, { align: "center" });
    
    // Add body text
    doc.setFontSize(16);
    doc.setFont("times", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("This is to certify that", 148.5, 100, { align: "center" });
    
    doc.setFontSize(24);
    doc.setFont("times", "bold");
    doc.text(currentUser.name.toUpperCase(), 148.5, 120, { align: "center" });
    
    doc.setFontSize(16);
    doc.setFont("times", "normal");
    doc.text("has successfully completed the Seerat-e-Mustafa exam", 148.5, 140, { align: "center" });
    
    doc.setFont("times", "bold");
    doc.text(`with a score of ${result.marks}/${result.total} (${result.percentage.toFixed(2)}%)`, 148.5, 155, { align: "center" });
    
    // Add date
    doc.setFont("times", "italic");
    doc.text(`Awarded on: ${new Date().toLocaleDateString()}`, 148.5, 170, { align: "center" });
    
    // Add signatures
    doc.setFont("times", "normal");
    doc.line(50, 180, 100, 180);
    doc.text("Exam Coordinator", 75, 190, { align: "center" });
    
    doc.line(197, 180, 247, 180);
    doc.text("Director", 222, 190, { align: "center" });
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Online Exam System - Certificate ID: " + Math.random().toString(36).substring(2, 10).toUpperCase(), 148.5, 200, { align: "center" });
    
    doc.save(`SeeratExam_Certificate_${currentUser.rollNumber}.pdf`);
}
