from flask import Flask, request, jsonify
from flask_cors import CORS
from model import predict
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Medical API Running ✅"

@app.route('/predict', methods=['POST'])
def detect():
    data = request.json
    result = predict(data)
    return jsonify({"result": result})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)))