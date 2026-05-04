if (!localStorage.getItem("loggedIn")) {
  window.location.href = "login.html";
}
// =====================
// CONFIG (CHANGE THIS)
// =====================
const BASE_URL = "https://medical-project-c3re.onrender.com"; // 🔴 CHANGE THIS

let stats = { total: 0, low: 0, moderate: 0, high: 0 };
let barChart, pieChart;


// =====================
// PREDICT FUNCTION
// =====================
function predict() {

  const loader = document.getElementById("loader");
  const resultCard = document.getElementById("resultCard");
  const resultTitle = document.getElementById("resultTitle");
  const resultText = document.getElementById("result");

  const Age = document.getElementById("Age");
  const Gender = document.getElementById("Gender");
  const Total_Bilirubin = document.getElementById("Total_Bilirubin");
  const Direct_Bilirubin = document.getElementById("Direct_Bilirubin");
  const Alkaline_Phosphotase = document.getElementById("Alkaline_Phosphotase");
  const Alamine_Aminotransferase = document.getElementById("Alamine_Aminotransferase");
  const Aspartate_Aminotransferase = document.getElementById("Aspartate_Aminotransferase");
  const Total_Proteins = document.getElementById("Total_Proteins");
  const Albumin = document.getElementById("Albumin");
  const Albumin_and_Globulin_Ratio = document.getElementById("Albumin_and_Globulin_Ratio");

  loader.classList.remove("hidden");

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
      alert("⚠️ Please fill all fields correctly");
      return;
    }
  }

  fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(d => {

    loader.classList.add("hidden");

    if (d.error) {
      alert("❌ " + d.error);
      return;
    }

    resultCard.classList.remove("hidden");
    resultCard.className = "result-box";

    resultTitle.innerText = d.level;
    resultText.innerText = "Score: " + d.score;

    stats.total++;

    if (d.level.includes("High")) {
      resultCard.classList.add("high");
      stats.high++;
    } else if (d.level.includes("Moderate")) {
      resultCard.classList.add("moderate");
      stats.moderate++;
    } else {
      resultCard.classList.add("low");
      stats.low++;
    }

    document.getElementById("totalCount").innerText = stats.total;
    document.getElementById("lowCount").innerText = stats.low;
    document.getElementById("modCount").innerText = stats.moderate;
    document.getElementById("highCount").innerText = stats.high;

    // Update charts if open
    if (barChart && pieChart) {
      barChart.data.datasets[0].data = [
        stats.low,
        stats.moderate,
        stats.high
      ];
      barChart.update();

      pieChart.data.datasets[0].data = [
        stats.low,
        stats.moderate,
        stats.high
      ];
      pieChart.update();
    }

  })
  .catch(err => {
    loader.classList.add("hidden");
    alert("❌ Cannot connect to server");
    console.log(err);
  });
}


// =====================
// PATIENTS TABLE
// =====================
function loadPatients() {

  fetch(`${BASE_URL}/patients`)
    .then(res => res.json())
    .then(data => {

      let html = `<h2>Patients</h2>
      <table class="table">
      <tr><th>ID</th><th>Risk</th><th>Score</th></tr>`;

      data.forEach((p,i)=>{
        let cls = p.result.level.includes("High") ? "high" :
                  p.result.level.includes("Moderate") ? "moderate" : "low";

        html += `<tr>
          <td>${i+1}</td>
          <td><span class="badge ${cls}">${p.result.level}</span></td>
          <td>${p.result.score}</td>
        </tr>`;
      });

      html += "</table>";

      document.getElementById("mainContent").innerHTML = html;
    })
    .catch(err => {
      alert("❌ Failed to load patients");
      console.log(err);
    });
}


// =====================
// ANALYTICS PAGE
// =====================
function showAnalytics() {

  document.getElementById("mainContent").innerHTML = `
    <h2>Analytics Dashboard</h2>

    <div class="analytics">
      <div class="card">
        <h3>Risk Distribution</h3>
        <canvas id="barChart"></canvas>
      </div>

      <div class="card">
        <h3>Risk Percentage</h3>
        <canvas id="pieChart"></canvas>
      </div>
    </div>
  `;

  initCharts();
}


function initCharts() {

  const barCtx = document.getElementById("barChart").getContext("2d");
  const pieCtx = document.getElementById("pieChart").getContext("2d");

  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: ["Low", "Moderate", "High"],
      datasets: [{
        label: "Patients",
        data: [stats.low, stats.moderate, stats.high],
        backgroundColor: ["green", "orange", "red"]
      }]
    }
  });

  pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: ["Low", "Moderate", "High"],
      datasets: [{
        data: [stats.low, stats.moderate, stats.high],
        backgroundColor: ["green", "orange", "red"]
      }]
    }
  });
}


// =====================
// UTIL FUNCTIONS
// =====================
function clearForm(){
  document.querySelectorAll("input").forEach(i => i.value = "");
  document.getElementById("Gender").value = "";
}

function downloadReport(){
  const text = document.getElementById("resultTitle").innerText + "\n" +
               document.getElementById("result").innerText;

  const blob = new Blob([text], {type:"text/plain"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "report.txt";
  a.click();

  showToast();
}

function showToast(){
  const t = document.getElementById("toast");
  t.classList.remove("hidden");
  setTimeout(()=>t.classList.add("hidden"),2000);
}

function showDashboard(){
  location.reload();
}
function logout(){
  localStorage.removeItem("loggedIn");
  window.location.href = "login.html";
}