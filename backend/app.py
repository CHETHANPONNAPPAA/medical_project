from flask import Flask, request, jsonify
from flask_cors import CORS
from model import predict
import os
import pandas as pd

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Medical API Running ✅"

# EXISTING PREDICT API
@app.route('/predict', methods=['POST'])
def detect():
    try:
        data = request.get_json(force=True)
        result = predict(data)
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ NEW: UPLOAD REPORT API
@app.route('/upload-report', methods=['POST'])
def upload_report():
    try:
        file = request.files['file']

        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.filename.endswith('.json'):
            df = pd.read_json(file)
        else:
            return jsonify({"error": "Only CSV or JSON allowed"}), 400

        results = []

        for _, row in df.iterrows():
            result = predict(row.to_dict())
            results.append({
                "patient": row.to_dict(),
                "result": result
            })

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))