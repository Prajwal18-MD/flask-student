let recognition;
let isRecording = false;
let currentQuestionIndex = 0;
let timerInterval;
let startTime;

const questions = [
    { question: "What color is the sky?", answer: "blue" },
    { question: "What is the expansion of the word CM?", answer: "chief minister" },
    { question: "What is the capital of France?", answer: "paris" },
    { question: "What fruit is red and round?", answer: "apple" }
];

function startQuiz() {
    currentQuestionIndex = 0;
    document.getElementById("results-container").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";
    startRecognition();
    askNextQuestion();
}

function askNextQuestion() {
    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex].question;
        document.getElementById("question").innerText = question;
        document.getElementById("timer").innerText = "10";
        startTimer();
    } else {
        endQuiz();
    }
}

function startRecognition() {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = function() {
        isRecording = true;
        console.log("Voice recognition started.");
    };

    recognition.onresult = function(event) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        const responseTime = (new Date().getTime() - startTime) / 1000;
        document.getElementById("answer").innerText = transcript;
        checkAnswer(transcript, responseTime);
    };

    recognition.onerror = function(event) {
        console.error("Error occurred in recognition: " + event.error);
    };

    recognition.onend = function() {
        isRecording = false;
        console.log("Voice recognition ended.");
    };

    recognition.start();
}

function stopRecognition() {
    if (isRecording) {
        recognition.stop();
        clearInterval(timerInterval);
    }
}

function startTimer() {
    let timeLeft = 10;
    startTime = new Date().getTime();
    timerInterval = setInterval(() => {
        timeLeft -= 1;
        document.getElementById("timer").innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            recordResult("No answer, seems nervous");
            currentQuestionIndex += 1;
            askNextQuestion();
        }
    }, 1000);
}

function checkAnswer(answer, responseTime) {
    clearInterval(timerInterval);
    const correctAnswer = questions[currentQuestionIndex].answer;

    fetch('/check_answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            question_id: currentQuestionIndex,
            answer: answer,
            response_time: responseTime
        })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("result").innerText = data.result;
        recordResult(data.result);
        currentQuestionIndex += 1;
        askNextQuestion();
    })
    .catch(error => console.error('Error:', error));
}

function recordResult(result) {
    const resultsList = document.getElementById("results-list");
    const listItem = document.createElement("li");
    listItem.innerText = `Question ${currentQuestionIndex + 1}: ${result}`;
    resultsList.appendChild(listItem);
}

function endQuiz() {
    stopRecognition();
    document.getElementById("quiz-container").style.display = "none";
    document.getElementById("results-container").style.display = "block";
    document.getElementById("total-questions").innerText = questions.length;
}
