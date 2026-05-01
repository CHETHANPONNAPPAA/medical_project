import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import os

# Load dataset
data = pd.read_csv(os.path.join(os.path.dirname(__file__), "indian_liver_patient.csv"))
data = data.dropna()

# Fix column
data = data.rename(columns={"Total_Protiens": "Total_Proteins"})

# Encode Gender
data['Gender'] = data['Gender'].map({'Male': 1, 'Female': 0})

# Train only normal patients
normal_data = data[data['Dataset'] == 2]
X = normal_data.drop(columns=['Dataset'])

# Scale
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Model
model = IsolationForest(contamination=0.2, random_state=42)
model.fit(X_scaled)

# Predict
def predict(data_input):
    df = pd.DataFrame([data_input])
    df = df[X.columns]
    df = df.apply(pd.to_numeric)

    df_scaled = scaler.transform(df)

    result = model.predict(df_scaled)[0]
    score = model.decision_function(df_scaled)[0]

    if result == -1:
        if score < -0.2:
            level = "🚨 High Risk"
        else:
            level = "⚠️ Moderate Risk"
    else:
        level = "✅ Low Risk"

    return {
        "level": level,
        "score": round(score, 3)
    }