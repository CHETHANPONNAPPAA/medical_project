function predict() {

  const resultText = document.getElementById("result");
  const resultCard = document.getElementById("resultCard");
  const loader = document.getElementById("loader");

  // Show loader
  loader.classList.remove("hidden");
  resultCard.classList.add("hidden");

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

  // Validation
  for (let key in data) {
    if (isNaN(data[key])) {
      loader.classList.add("hidden");
      alert("⚠️ Please fill all fields correctly!");
      return;
    }
  }

  fetch("https://medical-project-c3re.onrender.com/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(d => {

    loader.classList.add("hidden");
    resultCard.classList.remove("hidden");

    if (d.result.toLowerCase().includes("disease")) {
      resultCard.classList.add("error");
      resultCard.classList.remove("success");
      resultText.innerHTML = `❌ ${d.result}`;
    } else {
      resultCard.classList.add("success");
      resultCard.classList.remove("error");
      resultText.innerHTML = `✅ ${d.result}`;
    }
  })
  .catch(err => {
    loader.classList.add("hidden");
    resultCard.classList.remove("hidden");
    resultCard.classList.add("error");
    resultText.innerText = "❌ Server error. Try again later.";
    console.error(err);
  });
}