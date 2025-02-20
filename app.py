from flask import Flask, render_template, jsonify, request
import time

app = Flask(__name__)

# Predefined questions and answers
questions_answers = [
    {"question": "What color is the sky?", "answer": "blue"},
    {"question": "What is the expansion of the word CM?", "answer": "chief minister"},
    {"question": "What is the capital of France?", "answer": "paris"},
    {"question": "What fruit is red and round?", "answer": "apple"}
]

# Store results for each question
user_results = []

def check_answer(input_text, correct_answer, response_time):
    if input_text.lower().strip() == correct_answer.lower().strip():
        if response_time <= 4:
            return "Correct answer, seems confident"
        else:
            return "Correct answer, but seems nervous"
    elif input_text.lower().strip() == "":
        return "No answer, seems nervous"
    else:
        return "Wrong answer, seems confused"

@app.route('/')
def index():
    return render_template('index.html', questions=questions_answers)

@app.route('/check_answer', methods=['POST'])
def check_answer_route():
    data = request.json
    question_id = int(data['question_id'])
    user_answer = data['answer']
    response_time = data['response_time']
    correct_answer = questions_answers[question_id]['answer']
    result = check_answer(user_answer, correct_answer, response_time)
    user_results.append(result)
    return jsonify({"result": result})

@app.route('/results')
def results():
    return render_template('results.html', results=user_results, total=len(user_results))

if __name__ == '__main__':
    app.run(debug=True)

