import pandas as pd
from sklearn.ensemble import IsolationForest
import os

data = pd.read_csv(os.path.join(os.path.dirname(__file__), "indian_liver_patient.csv"))
data = data.dropna()

# Fix column name
data = data.rename(columns={"Total_Protiens": "Total_Proteins"})

data['Gender'] = data['Gender'].map({'Male':1,'Female':0})

X = data.drop(columns=['Dataset'])

model = IsolationForest(contamination=0.1, random_state=42)
model.fit(X)

def predict(data_input):
    df = pd.DataFrame([data_input])
    df = df[X.columns]
    df = df.apply(pd.to_numeric)

    result = model.predict(df)[0]
    return "⚠️ Abnormal (Possible Liver Issue)" if result == -1 else "✅ Normal"