import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import os

# =========================
# Load dataset
# =========================
data = pd.read_csv(os.path.join(os.path.dirname(__file__), "indian_liver_patient.csv"))
data = data.dropna()

# Fix column name
data = data.rename(columns={"Total_Protiens": "Total_Proteins"})

# Encode Gender
data['Gender'] = data['Gender'].map({'Male': 1, 'Female': 0})

# =========================
# 👉 TRAIN ONLY ON NORMAL PATIENTS
# =========================
normal_data = data[data['Dataset'] == 2]   # 2 = No disease

X = normal_data.drop(columns=['Dataset'])

# =========================
# 👉 SCALE FEATURES
# =========================
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# =========================
# 👉 TRAIN MODEL
# =========================
model = IsolationForest(
    contamination=0.2,   # Increased for better detection
    random_state=42
)
model.fit(X_scaled)

# =========================
# 👉 PREDICT FUNCTION
# =========================
def predict(data_input):
    df = pd.DataFrame([data_input])
    df = df[X.columns]
    df = df.apply(pd.to_numeric)

    # Scale input
    df_scaled = scaler.transform(df)

    # Predict
    result = model.predict(df_scaled)[0]
    score = model.decision_function(df_scaled)[0]

    if result == -1:
        return f"⚠️ Abnormal (Outlier Detected) | Score: {round(score,3)}"
    else:
        return f"✅ Normal | Score: {round(score,3)}"