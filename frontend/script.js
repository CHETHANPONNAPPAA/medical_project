let stats = { total: 0, low: 0, moderate: 0, high: 0 };
let barChart, pieChart;
function predict() {

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

  fetch("http://127.0.0.1:5000/predict", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(d => {

    loader.classList.add("hidden");

    resultCard.classList.remove("hidden");
    resultCard.className = "result-box";

    resultTitle.innerText = d.level;
    result.innerText = "Score: " + d.score;

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

    totalCount.innerText = stats.total;
    lowCount.innerText = stats.low;
    modCount.innerText = stats.moderate;
    highCount.innerText = stats.high;
  });
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
}

function loadPatients() {
  fetch("http://127.0.0.1:5000/patients")
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

      mainContent.innerHTML = html;
    });
}

function clearForm(){
  document.querySelectorAll("input").forEach(i=>i.value="");
}

function downloadReport(){
  const blob = new Blob([result.innerText], {type:"text/plain"});
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
function showAnalytics() {

  mainContent.innerHTML = `
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