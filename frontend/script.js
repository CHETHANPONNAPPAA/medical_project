function predict() {

  let data = {
  Age: parseInt(Age.value),
  Gender: Gender.value === "Male" ? 1 : 0,
  Total_Bilirubin: parseFloat(Total_Bilirubin.value),
  Direct_Bilirubin: parseFloat(Direct_Bilirubin.value),
  Alkaline_Phosphotase: parseFloat(Alkaline_Phosphotase.value),
  Alamine_Aminotransferase: parseFloat(Alamine_Aminotransferase.value),
  Aspartate_Aminotransferase: parseFloat(Aspartate_Aminotransferase.value),
  Total_Proteins: parseFloat(Total_Proteins.value),
  Albumin: parseFloat(Albumin.value),
  Albumin_and_Globulin_Ratio: parseFloat(Albumin_and_Globulin_Ratio.value)
  };

  fetch("https://medical-project-c3re.onrender.com/predict", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(d => result.innerText = d.result);
}