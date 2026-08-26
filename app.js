const app = document.getElementById("app");

const stops = [
  { stopId: 1, name: "Stop 1" },
  { stopId: 2, name: "Stop 2" },
  { stopId: 3, name: "Stop 3" },
  { stopId: 4, name: "Stop 4" },
  { stopId: 5, name: "Stop 5" },
  { stopId: 6, name: "Stop 6" },
];

const buses = [
  {
    busId: "101",
    capacity: 50,
    currentPassengers: 36,
    arrivalTime: 3,
    predictedOccupancyPercent: 94,
  },
  {
    busId: "102",
    capacity: 50,
    currentPassengers: 24,
    arrivalTime: 7,
    predictedOccupancyPercent: 63,
  },
  {
    busId: "103",
    capacity: 50,
    currentPassengers: 20,
    arrivalTime: 12,
    predictedOccupancyPercent: 52,
  },
];

let selectedFrom = null;
let selectedTo = null;
let selectedPreference = "balanced"; // default

function renderHome() {
  app.innerHTML = `
    <div class="home">
      <h1>🚌 SmartRide AI</h1>
      <p>Don't just track your bus. Choose the better bus.</p>
      <button id="findBusBtn">Find My Bus</button>
    </div>
  `;

  document.getElementById("findBusBtn").addEventListener("click", renderJourneySelection);
}

function renderJourneySelection() {
  const stopOptions = stops.map(s => `<option value="${s.stopId}">${s.name}</option>`).join("");

  app.innerHTML = `
    <div class="journey">
      <h2>Plan Your Journey</h2>

      <label>From</label>
      <select id="fromStop">${stopOptions}</select>

      <label>To</label>
      <select id="toStop">${stopOptions}</select>

      <label>My preference:</label>
      <div class="preferences">
        <button class="pref-btn" data-pref="fastest">⚡ Fastest</button>
        <button class="pref-btn" data-pref="balanced">⚖️ Balanced</button>
        <button class="pref-btn" data-pref="comfort">🪑 Comfort</button>
      </div>

      <button id="findBestBusBtn">Find Best Bus</button>
    </div>
  `;

  document.querySelectorAll(".pref-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedPreference = btn.dataset.pref;
      document.querySelectorAll(".pref-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  document.getElementById("findBestBusBtn").addEventListener("click", () => {
    selectedFrom = document.getElementById("fromStop").value;
    selectedTo = document.getElementById("toStop").value;
    renderBusComparison();
  });
}

function renderBusComparison() {
  const busCards = buses.map(bus => {
    const currentOccupancyPercent = Math.round((bus.currentPassengers / bus.capacity) * 100);
    const isCrowded = bus.predictedOccupancyPercent >= 80;

    return `
      <div class="bus-card">
        <h3>🚌 Bus ${bus.busId}</h3>
        <p>Arrives in: ${bus.arrivalTime} min</p>
        <p>Current occupancy: ${currentOccupancyPercent}%</p>
        <p>Predicted occupancy: ${bus.predictedOccupancyPercent}%</p>
        <p>${isCrowded ? "🔴 Very crowded" : "🟢 Low crowding"}</p>
      </div>
    `;
  }).join("");

  app.innerHTML = `
    <div class="comparison">
      <h2>Available Buses</h2>
      ${busCards}
      <button id="getRecommendationBtn">Get AI Recommendation</button>
    </div>
  `;

  document.getElementById("getRecommendationBtn").addEventListener("click", renderRecommendation);
}

function pickRecommendedBus() {
  if (selectedPreference === "fastest") {
    return buses.reduce((a, b) => (a.arrivalTime < b.arrivalTime ? a : b));
  }
  if (selectedPreference === "comfort") {
    return buses.reduce((a, b) => (a.predictedOccupancyPercent < b.predictedOccupancyPercent ? a : b));
  }
  // balanced: score = arrivalTime + predictedOccupancyPercent (lower is better)
  return buses.reduce((a, b) => {
    const scoreA = a.arrivalTime + a.predictedOccupancyPercent;
    const scoreB = b.arrivalTime + b.predictedOccupancyPercent;
    return scoreA < scoreB ? a : b;
  });
}

function renderRecommendation() {
  const bus = pickRecommendedBus();

  const reasons = {
    fastest: "It has the shortest waiting time among all available buses.",
    comfort: "It has the lowest predicted crowding, prioritizing your comfort.",
    balanced: "It offers the best balance between waiting time and predicted crowding.",
  };

  app.innerHTML = `
    <div class="recommendation">
      <h2>🤖 AI Recommendation</h2>
      <h1>🚌 Bus ${bus.busId}</h1>
      <p><strong>Why?</strong></p>
      <p>${reasons[selectedPreference]}</p>
      <p>Arrives in ${bus.arrivalTime} min, predicted occupancy ${bus.predictedOccupancyPercent}%.</p>
      <button id="startOverBtn">Start Over</button>
    </div>
  `;

  document.getElementById("startOverBtn").addEventListener("click", renderHome);
}

renderHome();