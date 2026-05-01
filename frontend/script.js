// SECTION SWITCH
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}

// SETTINGS
function saveSettings() {
  let url = document.getElementById("apiUrl").value;
  localStorage.setItem("apiUrl", url);
  alert("Saved!");
}

function getApiUrl() {
  return localStorage.getItem("apiUrl") || "https://medical-project-c3re.onrender.com";
}

// DASHBOARD COUNT
let patientCount = 0;

function updateDashboard() {
  patientCount++;
  document.getElementById("totalPatients").innerText = patientCount;
}

// PREDICT SINGLE
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

  fetch(getApiUrl() + "/predict", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(d => {

    result.innerText = d.result;

    updateDashboard();

    // Add to patients table
    let table = document.getElementById("patientsTable");
    let row = table.insertRow();
    row.insertCell(0).innerText = data.Age;
    row.insertCell(1).innerText = d.result;
  });
}

// UPLOAD REPORT
function uploadReport() {

  let file = reportFile.files[0];
  let formData = new FormData();
  formData.append("file", file);

  fetch(getApiUrl() + "/upload-report", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {

    let history = document.getElementById("reportHistory");

    let block = "<h4>New Report</h4>";

    data.forEach((item, index) => {
      block += `<p>Patient ${index+1}: ${item.result}</p>`;
    });

    history.innerHTML += block;
  });
}