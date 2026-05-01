from flask import Flask, request, jsonify
from flask_cors import CORS
from model import predict

app = Flask(__name__)
CORS(app)

patients = []

@app.route('/')
def home():
    return "Medical API Running ✅"

@app.route('/predict', methods=['POST'])
def detect():
    try:
        data = request.get_json(force=True)

        result = predict(data)

        # Save patient history
        patients.append({
            "input": data,
            "result": result
        })

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/patients', methods=['GET'])
def get_patients():
    return jsonify(patients)


import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)