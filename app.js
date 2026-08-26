const app = document.getElementById("app");

const stops = [
  { stopId: 1, name: "Chittoor" },
  { stopId: 2, name: "Stop 2" },
  { stopId: 3, name: "Stop 3" },
  { stopId: 4, name: "Stop 4" },
  { stopId: 5, name: "Stop 5" },
  { stopId: 6, name: "Tirupati" },
];

const buses = [
  {
    busId: "101",
    capacity: 50,
    currentPassengers: 36,
    arrivalTime: 3,
    historicalIncrement: 10,
  },
  {
    busId: "102",
    capacity: 50,
    currentPassengers: 24,
    arrivalTime: 7,
    historicalIncrement: 7,
  },
  {
    busId: "103",
    capacity: 50,
    currentPassengers: 20,
    arrivalTime: 12,
    historicalIncrement: 6,
  },
];

let selectedFrom = null;
let selectedTo = null;
let selectedPreference = "balanced"; // default

// --- Shared prediction helper ---
function getBusStats(bus) {
  const currentOccupancyPercent = Math.round((bus.currentPassengers / bus.capacity) * 100);
  const predictedPassengers = Math.min(bus.currentPassengers + bus.historicalIncrement, bus.capacity);
  const predictedOccupancyPercent = Math.round((predictedPassengers / bus.capacity) * 100);
  const isCrowded = predictedOccupancyPercent >= 80;
  return { currentOccupancyPercent, predictedOccupancyPercent, isCrowded };
}

function renderHome() {
  app.innerHTML = `
    <div class="home">
      <h1>🚌 SmartRide AI</h1>
      <p>Don't just track your bus. Choose the better bus.</p>
      <button id="findBusBtn">Find My Bus</button>
      <button id="adminBtn" class="admin-link">Conductor Panel</button>
    </div>
  `;

  document.getElementById("findBusBtn").addEventListener("click", renderJourneySelection);
  document.getElementById("adminBtn").addEventListener("click", renderAdminPanel);
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
  const recommendedBus = pickRecommendedBus();

  const busCards = buses.map(bus => {
    const { currentOccupancyPercent, predictedOccupancyPercent, isCrowded } = getBusStats(bus);
    const isRecommended = bus.busId === recommendedBus.busId;

    return `
      <div class="bus-card ${isRecommended ? "recommended" : ""}">
        <h3>🚌 Bus ${bus.busId} ${isRecommended ? "⭐ AI RECOMMENDED" : ""}</h3>
        <p>Arrives in: ${bus.arrivalTime} min</p>
        <p>Current occupancy: ${currentOccupancyPercent}%</p>
        <p>Predicted occupancy: ${predictedOccupancyPercent}%</p>
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
    return buses.reduce((a, b) => {
      const statsA = getBusStats(a);
      const statsB = getBusStats(b);
      return statsA.predictedOccupancyPercent < statsB.predictedOccupancyPercent ? a : b;
    });
  }
  // balanced: score = arrivalTime + predictedOccupancyPercent (lower is better)
  return buses.reduce((a, b) => {
    const statsA = getBusStats(a);
    const statsB = getBusStats(b);
    const scoreA = a.arrivalTime + statsA.predictedOccupancyPercent;
    const scoreB = b.arrivalTime + statsB.predictedOccupancyPercent;
    return scoreA < scoreB ? a : b;
  });
}

function renderRecommendation() {
  const bus = pickRecommendedBus();
  const { predictedOccupancyPercent } = getBusStats(bus);

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
      <p>Arrives in ${bus.arrivalTime} min, predicted occupancy ${predictedOccupancyPercent}%.</p>
      <button id="startOverBtn">Start Over</button>
    </div>
  `;

  document.getElementById("startOverBtn").addEventListener("click", renderHome);
}

function renderAdminPanel() {
  const rows = buses.map(bus => {
    const { currentOccupancyPercent } = getBusStats(bus);
    return `
      <div class="admin-row" data-bus="${bus.busId}">
        <h3>🚌 Bus ${bus.busId}</h3>
        <p>Passengers: <span class="pax-count">${bus.currentPassengers}</span> / ${bus.capacity}</p>
        <p>Occupancy: <span class="occ-percent">${currentOccupancyPercent}%</span></p>
        <div class="admin-controls">
          <button class="minus-btn" data-bus="${bus.busId}">−</button>
          <button class="plus-btn" data-bus="${bus.busId}">+</button>
        </div>
      </div>
    `;
  }).join("");

  app.innerHTML = `
    <div class="admin">
      <h2>Conductor Panel</h2>
      ${rows}
      <button id="backHomeBtn">Back to Home</button>
    </div>
  `;

  function updateRow(busId) {
    const bus = buses.find(b => b.busId === busId);
    const row = document.querySelector(`.admin-row[data-bus="${busId}"]`);
    const { currentOccupancyPercent } = getBusStats(bus);
    row.querySelector(".pax-count").textContent = bus.currentPassengers;
    row.querySelector(".occ-percent").textContent = `${currentOccupancyPercent}%`;
  }

  document.querySelectorAll(".plus-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const bus = buses.find(b => b.busId === btn.dataset.bus);
      if (bus.currentPassengers < bus.capacity) bus.currentPassengers++;
      updateRow(btn.dataset.bus);
    });
  });

  document.querySelectorAll(".minus-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const bus = buses.find(b => b.busId === btn.dataset.bus);
      if (bus.currentPassengers > 0) bus.currentPassengers--;
      updateRow(btn.dataset.bus);
    });
  });

  document.getElementById("backHomeBtn").addEventListener("click", renderHome);
}

renderHome();