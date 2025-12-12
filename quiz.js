// quiz.js - AI-Powered Quiz System using Gemini API

// ⚠️ ضع API key الخاص بك هنا من: https://makersuite.google.com/app/apikey
const GEMINI_API_KEY = 'AIzaSyAimlyYQIGH1wFVBGU6VC1LbLcXlrbtco4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Quiz state
let currentQuiz = {
    questions: [],
    currentIndex: 0,
    userAnswers: [],
    score: 0,
    materialTitle: ''
};

// Start quiz for a specific material
window.startQuiz = async (materialId) => {
    const subject = window.getSubjectById ? window.getSubjectById(materialId) : null;

    if (!subject) {
        alert('عذراً، لم يتم العثور على المادة.');
        return;
    }

    // Check if API key is set
    if (GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
        alert('⚠️ يرجى إضافة Gemini API Key في ملف quiz.js أولاً!\n\nاحصل على المفتاح من:\nhttps://makersuite.google.com/app/apikey');
        return;
    }

    currentQuiz.materialTitle = subject.title;

    // Show quiz modal with loading state
    showQuizModal(true);

    try {
        // Generate questions using AI
        const questions = await generateQuestionsWithAI(subject);

        if (questions && questions.length > 0) {
            currentQuiz.questions = questions;
            currentQuiz.currentIndex = 0;
            currentQuiz.userAnswers = new Array(questions.length).fill(null);
            currentQuiz.score = 0;

            displayQuestion();
        } else {
            throw new Error('لم يتم توليد أسئلة');
        }
    } catch (error) {
        console.error('Error generating quiz:', error);
        alert('عذراً، حدث خطأ أثناء إنشاء الاختبار. يرجى المحاولة مرة أخرى.');
        closeQuizModal();
    }
};

// Generate questions using Gemini AI with content analysis
async function generateQuestionsWithAI(subject) {
    // Step 1: Try to fetch content from the material link
    let contentAnalysis = '';

    if (subject.externalLink) {
        try {
            // Update loading message
            const modalBody = document.getElementById('quizModalBody');
            modalBody.innerHTML = `
                <div class="quiz-loading">
                    <div class="loading-spinner"></div>
                    <h3>جاري تحليل محتوى المادة...</h3>
                    <p>يتم الآن تحميل وتحليل الملف من الرابط 📥</p>
                </div>
            `;

            // Fetch the content
            contentAnalysis = await fetchContentFromLink(subject.externalLink);

            // Update loading message
            modalBody.innerHTML = `
                <div class="quiz-loading">
                    <div class="loading-spinner"></div>
                    <h3>جاري إنشاء أسئلة ذكية من المحتوى...</h3>
                    <p>الذكاء الاصطناعي يحلل المحتوى الآن 🧠</p>
                </div>
            `;
        } catch (error) {
            console.warn('Could not fetch content from link:', error);
            // Continue without content analysis
        }
    }

    // Step 2: Build enhanced prompt with content
    const prompt = `أنت مساعد تعليمي ذكي متخصص. قم بإنشاء اختبار من 10 أسئلة للطلاب الجامعيين.

معلومات المادة:
- العنوان: ${subject.title}
- القسم: ${subject.department || 'غير محدد'}
- الوصف: ${subject.description || 'غير متوفر'}
- الدكتور: ${subject.doctors || 'غير محدد'}

${contentAnalysis ? `محتوى المادة المستخرج من الملف:
========================================
${contentAnalysis}
========================================

⚠️ مهم جداً: يجب أن تكون الأسئلة مبنية على المحتوى الفعلي أعلاه، وليس على معلومات عامة عن المادة.
` : ''}

متطلبات الأسئلة:
1. اصنع 5 أسئلة صح/خطأ
2. اصنع 5 أسئلة اختيار من متعدد (4 خيارات لكل سؤال)
${contentAnalysis ?
            `3. يجب أن تكون الأسئلة مستخرجة مباشرة من المحتوى المرفق أعلاه
4. ركّز على المفاهيم والمعلومات المذكورة في المحتوى
5. اجعل الخيارات الخاطئة منطقية ولكن واضحة الخطأ للطالب الذي درس المحتوى` :
            `3. الأسئلة يجب أن تكون متنوعة وتغطي جوانب مختلفة من المادة
4. الأسئلة يجب أن تكون واضحة ومفهومة
5. اجعل الأسئلة مناسبة لطلاب الجامعة`}

أرجع النتيجة بصيغة JSON فقط، بدون أي نص إضافي:
{
  "questions": [
    {
      "type": "true_false",
      "question": "نص السؤال هنا",
      "correctAnswer": true,
      "explanation": "شرح الإجابة الصحيحة"
    },
    {
      "type": "multiple_choice",
      "question": "نص السؤال هنا",
      "options": ["الخيار 1", "الخيار 2", "الخيار 3", "الخيار 4"],
      "correctAnswer": 0,
      "explanation": "شرح الإجابة الصحيحة"
    }
  ]
}`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        // Extract JSON from response (handle markdown code blocks)
        let jsonText = aiResponse.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '');
        }

        const parsedData = JSON.parse(jsonText);
        return parsedData.questions || [];
    } catch (error) {
        console.error('Error calling Gemini API:', error);

        // Fallback to demo questions if API fails
        return generateDemoQuestions(subject.title);
    }
}

// Fetch content from file.io or limewire links
async function fetchContentFromLink(url) {
    try {
        // For now, we'll use a CORS proxy for file.io/limewire links
        // Note: Direct access might be blocked by CORS

        // Try to fetch the page
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch content');
        }

        // Get the content as text
        const content = await response.text();

        // Extract meaningful text (remove HTML tags, scripts, etc.)
        const textContent = extractTextFromHTML(content);

        // Limit to first 3000 characters to avoid token limits
        return textContent.substring(0, 3000);

    } catch (error) {
        console.error('Error fetching content:', error);
        // If we can't fetch the content, return empty string
        // The AI will generate questions based on metadata only
        return '';
    }
}

// Extract text content from HTML
function extractTextFromHTML(html) {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove script and style elements
    const scripts = tempDiv.getElementsByTagName('script');
    const styles = tempDiv.getElementsByTagName('style');

    for (let i = scripts.length - 1; i >= 0; i--) {
        scripts[i].remove();
    }

    for (let i = styles.length - 1; i >= 0; i--) {
        styles[i].remove();
    }

    // Get text content
    let text = tempDiv.textContent || tempDiv.innerText || '';

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
}

// Fallback demo questions
function generateDemoQuestions(materialTitle) {
    return [
        {
            type: "true_false",
            question: `مادة ${materialTitle} تعتبر من المواد الأساسية في التخصص`,
            correctAnswer: true,
            explanation: "معظم المواد الأساسية تكون جزءاً أساسياً من المنهج الدراسي"
        },
        {
            type: "multiple_choice",
            question: `ما هي أفضل طريقة لمذاكرة ${materialTitle}؟`,
            options: [
                "الحفظ دون فهم",
                "الفهم ثم التطبيق",
                "تجاهل المادة",
                "الاعتماد على الغش"
            ],
            correctAnswer: 1,
            explanation: "الفهم ثم التطبيق هو المنهج الأمثل للمذاكرة الفعالة"
        },
        {
            type: "true_false",
            question: "المراجعة المستمرة تساعد على التذكر بشكل أفضل",
            correctAnswer: true,
            explanation: "المراجعة المستمرة تثبت المعلومات في الذاكرة طويلة المدى"
        },
        {
            type: "multiple_choice",
            question: "كم ساعة يجب تخصيصها يومياً للمذاكرة؟",
            options: ["ساعة واحدة", "2-3 ساعات", "8 ساعات", "لا حاجة للمذاكرة"],
            correctAnswer: 1,
            explanation: "2-3 ساعات يومياً تعتبر مناسبة للطالب الجامعي"
        },
        {
            type: "true_false",
            question: "يمكن الاستعانة بزملاء الدراسة للتعلم التعاوني",
            correctAnswer: true,
            explanation: "التعلم التعاوني يساعد على فهم أفضل وتبادل المعرفة"
        }
    ];
}

// Show quiz modal
function showQuizModal(loading = false) {
    const modal = document.getElementById('quizModalOverlay');
    const modalBody = document.getElementById('quizModalBody');

    if (loading) {
        modalBody.innerHTML = `
            <div class="quiz-loading">
                <div class="loading-spinner"></div>
                <h3>جاري إنشاء الاختبار بالذكاء الاصطناعي...</h3>
                <p>الرجاء الانتظار بضع ثوانٍ ⏳</p>
            </div>
        `;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close quiz modal
function closeQuizModal() {
    const modal = document.getElementById('quizModalOverlay');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Reset quiz state
    currentQuiz = {
        questions: [],
        currentIndex: 0,
        userAnswers: [],
        score: 0,
        materialTitle: ''
    };
}

// Display current question
function displayQuestion() {
    const question = currentQuiz.questions[currentQuiz.currentIndex];
    const totalQuestions = currentQuiz.questions.length;
    const progress = ((currentQuiz.currentIndex + 1) / totalQuestions) * 100;

    const modalBody = document.getElementById('quizModalBody');

    let optionsHTML = '';
    if (question.type === 'true_false') {
        optionsHTML = `
            <div class="quiz-options">
                <button class="quiz-option" onclick="selectAnswer(true)">
                    ✅ صح
                </button>
                <button class="quiz-option" onclick="selectAnswer(false)">
                    ❌ خطأ
                </button>
            </div>
        `;
    } else {
        optionsHTML = '<div class="quiz-options">';
        question.options.forEach((option, index) => {
            optionsHTML += `
                <button class="quiz-option" onclick="selectAnswer(${index})">
                    ${String.fromCharCode(65 + index)}. ${option}
                </button>
            `;
        });
        optionsHTML += '</div>';
    }

    modalBody.innerHTML = `
        <div class="quiz-header">
            <h2>🧠 اختبر نفسك: ${currentQuiz.materialTitle}</h2>
            <button class="quiz-close" onclick="closeQuizModal()">×</button>
        </div>
        
        <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" style="width: ${progress}%"></div>
        </div>
        
        <div class="quiz-question-info">
            <span>السؤال ${currentQuiz.currentIndex + 1} من ${totalQuestions}</span>
            <span class="question-type-badge">${question.type === 'true_false' ? 'صح/خطأ' : 'اختيار متعدد'}</span>
        </div>
        
        <div class="quiz-question-card">
            <h3 class="quiz-question-text">${question.question}</h3>
            ${optionsHTML}
        </div>
        
        <div class="quiz-navigation">
            ${currentQuiz.currentIndex > 0 ?
            '<button class="btn-secondary" onclick="previousQuestion()">← السابق</button>' :
            '<div></div>'}
            ${currentQuiz.currentIndex < totalQuestions - 1 ?
            '<button class="btn-primary" onclick="nextQuestion()">التالي →</button>' :
            '<button class="btn-primary" style="background-color: #10b981;" onclick="finishQuiz()">إنهاء الاختبار ✓</button>'}
        </div>
    `;

    // Highlight previously selected answer
    const userAnswer = currentQuiz.userAnswers[currentQuiz.currentIndex];
    if (userAnswer !== null) {
        highlightSelectedAnswer(userAnswer);
    }
}

// Select answer
window.selectAnswer = function (answer) {
    currentQuiz.userAnswers[currentQuiz.currentIndex] = answer;
    highlightSelectedAnswer(answer);
};

// Highlight selected answer
function highlightSelectedAnswer(answer) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((option, index) => {
        option.classList.remove('selected');

        const question = currentQuiz.questions[currentQuiz.currentIndex];
        if (question.type === 'true_false') {
            if ((index === 0 && answer === true) || (index === 1 && answer === false)) {
                option.classList.add('selected');
            }
        } else {
            if (index === answer) {
                option.classList.add('selected');
            }
        }
    });
}

// Next question
window.nextQuestion = function () {
    if (currentQuiz.currentIndex < currentQuiz.questions.length - 1) {
        currentQuiz.currentIndex++;
        displayQuestion();
    }
};

// Previous question
window.previousQuestion = function () {
    if (currentQuiz.currentIndex > 0) {
        currentQuiz.currentIndex--;
        displayQuestion();
    }
};

// Finish quiz and show results
window.finishQuiz = function () {
    // Check if all questions are answered
    const unanswered = currentQuiz.userAnswers.filter(a => a === null).length;
    if (unanswered > 0) {
        if (!confirm(`لديك ${unanswered} أسئلة لم تجب عليها. هل تريد إنهاء الاختبار؟`)) {
            return;
        }
    }

    // Calculate score
    currentQuiz.score = 0;
    currentQuiz.questions.forEach((question, index) => {
        const userAnswer = currentQuiz.userAnswers[index];
        if (userAnswer === question.correctAnswer) {
            currentQuiz.score++;
        }
    });

    displayResults();
};

// Display results
function displayResults() {
    const totalQuestions = currentQuiz.questions.length;
    const percentage = Math.round((currentQuiz.score / totalQuestions) * 100);
    const passed = percentage >= 50;

    let resultsHTML = `
        <div class="quiz-results">
            <div class="results-header">
                <h2>نتيجة الاختبار 📊</h2>
                <button class="quiz-close" onclick="closeQuizModal()">×</button>
            </div>
            
            <div class="results-score ${passed ? 'passed' : 'failed'}">
                <div class="score-circle">
                    <span class="score-number">${percentage}%</span>
                    <span class="score-label">${currentQuiz.score} من ${totalQuestions}</span>
                </div>
                <h3>${passed ? '🎉 أحسنت!' : '📚 حاول مرة أخرى'}</h3>
                <p>${passed ? 'نجحت في الاختبار!' : 'يمكنك تحسين نتيجتك'}</p>
            </div>
            
            <div class="results-details">
                <h3>تفاصيل الإجابات:</h3>
    `;

    currentQuiz.questions.forEach((question, index) => {
        const userAnswer = currentQuiz.userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;

        let answerText = '';
        let correctAnswerText = '';

        if (question.type === 'true_false') {
            answerText = userAnswer === true ? 'صح' : userAnswer === false ? 'خطأ' : 'لم تجب';
            correctAnswerText = question.correctAnswer ? 'صح' : 'خطأ';
        } else {
            answerText = userAnswer !== null ? question.options[userAnswer] : 'لم تجب';
            correctAnswerText = question.options[question.correctAnswer];
        }

        resultsHTML += `
            <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="result-question">
                    <span class="result-number">${index + 1}.</span>
                    <span>${question.question}</span>
                    <span class="result-icon">${isCorrect ? '✓' : '✗'}</span>
                </div>
                ${!isCorrect ? `
                    <div class="result-answers">
                        <div class="user-answer">إجابتك: ${answerText}</div>
                        <div class="correct-answer">الإجابة الصحيحة: ${correctAnswerText}</div>
                        ${question.explanation ? `<div class="answer-explanation">💡 ${question.explanation}</div>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    });

    resultsHTML += `
            </div>
            
            <div class="results-actions">
                <button class="btn-primary" onclick="window.startQuiz('${getCurrentMaterialId()}')">
                    🔄 إعادة الاختبار
                </button>
                <button class="btn-secondary" onclick="closeQuizModal()">
                    إغلاق
                </button>
            </div>
        </div>
    `;

    document.getElementById('quizModalBody').innerHTML = resultsHTML;
}

// Helper function to get current material ID
function getCurrentMaterialId() {
    // This will be set when quiz is started
    return currentQuiz.materialId || '';
}

// Export functions for global access
window.closeQuizModal = closeQuizModal;
