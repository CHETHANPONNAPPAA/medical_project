import pandas as pd
from sklearn.ensemble import IsolationForest

# Load dataset
data = pd.read_csv("indian_liver_patient.csv")
data = data.dropna()

# Convert categorical
data['Gender'] = data['Gender'].map({'Male':1,'Female':0})

X = data.drop(columns=['Dataset'])

# Train model
model = IsolationForest(contamination=0.1, random_state=42)
model.fit(X)

def predict(data_input):
    df = pd.DataFrame([data_input])
    result = model.predict(df)[0]
    return "⚠️ Abnormal (Possible Liver Issue)" if result == -1 else "✅ Normal"