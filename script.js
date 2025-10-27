const form = document.getElementById("reviewForm");
const container = document.getElementById("reviewsContainer");
const totalReviewsCard = document.getElementById("totalReviews");
const topPerformerCard = document.getElementById("topPerformer");
const avgScoreCard = document.getElementById("avgScore");

let editingId = null;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    employeeName: document.getElementById("employeeName").value,
    reviewer: document.getElementById("reviewer").value,
    metrics: {
      productivity: parseInt(document.getElementById("productivity").value),
      punctuality: parseInt(document.getElementById("punctuality").value),
      teamwork: parseInt(document.getElementById("teamwork").value),
      innovation: parseInt(document.getElementById("innovation").value)
    },
    comments: document.getElementById("comments").value
  };

  if (editingId) {
    await fetch(`/reviews/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    editingId = null;
  } else {
    await fetch("/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  }

  form.reset();
  loadReviews();
  renderChart();
});

async function loadReviews() {
  const res = await fetch("/reviews");
  const reviews = await res.json();

  container.innerHTML = reviews.map(r => `
    <div class="review-card">
      <h3>${r.employeeName}</h3>
      <p><strong>Reviewer:</strong> ${r.reviewer}</p>
      <p><strong>Productivity:</strong> ${r.metrics.productivity}</p>
      <p><strong>Punctuality:</strong> ${r.metrics.punctuality}</p>
      <p><strong>Teamwork:</strong> ${r.metrics.teamwork}</p>
      <p><strong>Innovation:</strong> ${r.metrics.innovation}</p>
      <p><strong>Comments:</strong> ${r.comments}</p>
      <button onclick="editReview(${r.id})">Edit</button>
      <button onclick="deleteReview(${r.id})">Delete</button>
    </div>
  `).join("");

  updateSummaryCards(reviews);
}

async function editReview(id) {
  const res = await fetch(`/reviews/${id}`);
  const r = await res.json();

  document.getElementById("employeeName").value = r.employeeName;
  document.getElementById("reviewer").value = r.reviewer;
  document.getElementById("productivity").value = r.metrics.productivity;
  document.getElementById("punctuality").value = r.metrics.punctuality;
  document.getElementById("teamwork").value = r.metrics.teamwork;
  document.getElementById("innovation").value = r.metrics.innovation;
  document.getElementById("comments").value = r.comments;

  editingId = r.id;
}

async function deleteReview(id) {
  await fetch(`/reviews/${id}`, { method: "DELETE" });
  loadReviews();
  renderChart();
}

function updateSummaryCards(reviews) {
  totalReviewsCard.textContent = `Total Reviews: ${reviews.length}`;

  let topScore = -1;
  let topName = "—";
  let total = 0;

  reviews.forEach(r => {
    const score = Object.values(r.metrics).reduce((a, b) => a + b, 0);
    total += score;
    if (score > topScore) {
      topScore = score;
      topName = r.employeeName;
    }
  });

  const avg = reviews.length ? (total / (reviews.length * 4)).toFixed(2) : "—";
  topPerformerCard.textContent = `Top Performer: ${topName}`;
  avgScoreCard.textContent = `Avg Score: ${avg}`;
}

async function renderChart() {
  const res = await fetch("/reviews");
  const reviews = await res.json();

  const totals = {
    productivity: 0,
    punctuality: 0,
    teamwork: 0,
    innovation: 0
  };

  reviews.forEach(r => {
    totals.productivity += r.metrics.productivity;
    totals.punctuality += r.metrics.punctuality;
    totals.teamwork += r.metrics.teamwork;
    totals.innovation += r.metrics.innovation;
  });

  const count = reviews.length || 1;
  const averages = {
    productivity: totals.productivity / count,
    punctuality: totals.punctuality / count,
    teamwork: totals.teamwork / count,
    innovation: totals.innovation / count
  };

  const ctx = document.getElementById("metricsChart").getContext("2d");
  if (window.metricsChart) window.metricsChart.destroy(); // Avoid duplicate charts

  window.metricsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Productivity", "Punctuality", "Teamwork", "Innovation"],
      datasets: [{
        label: "Average Score",
        data: [
          averages.productivity,
          averages.punctuality,
          averages.teamwork,
          averages.innovation
        ],
        backgroundColor: ["#0043ce", "#0f62fe", "#4589ff", "#a6c8ff"]
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 10
        }
      }
    }
  });
}

loadReviews();
renderChart();