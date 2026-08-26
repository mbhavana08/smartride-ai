const app = document.getElementById("app");

const stops = ["Chittoor", "Stop 2", "Stop 3", "Stop 4", "Stop 5", "Tirupati"];

let buses = [];
let selectedFrom = null;
let selectedTo = null;
let selectedPreference = "balanced";
let pollInterval = null;

async function fetchBuses() {
  const res = await fetch("https://smartride-ai.onrender.com/api/buses");
  buses = await res.json();
}

async function updatePassengers(busId, delta) {
  const res = await fetch(`https://smartride-ai.onrender.com/api/buses/${busId}/passengers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ delta }),
  });
  const updatedBus = await res.json();

  const index = buses.findIndex(b => b.busId === busId);
  if (index !== -1) buses[index] = updatedBus;

  return updatedBus;
}

function getBusStats(bus) {
  const currentOccupancyPercent = Math.round((bus.currentPassengers / bus.capacity) * 100);
  const predictedPassengers = Math.min(bus.currentPassengers + bus.historicalIncrement, bus.capacity);
  const predictedOccupancyPercent = Math.round((predictedPassengers / bus.capacity) * 100);
  const isCrowded = predictedOccupancyPercent >= 80;
  return { currentOccupancyPercent, predictedOccupancyPercent, isCrowded };
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
  return buses.reduce((a, b) => {
    const statsA = getBusStats(a);
    const statsB = getBusStats(b);
    const scoreA = a.arrivalTime + statsA.predictedOccupancyPercent;
    const scoreB = b.arrivalTime + statsB.predictedOccupancyPercent;
    return scoreA < scoreB ? a : b;
  });
}

function renderHome() {
  if (pollInterval) clearInterval(pollInterval);

  app.innerHTML = `
    <div class="home">
      <h1>SmartRide AI</h1>
      <p>Don't just track your bus. Choose the better bus.</p>
      <button id="findBusBtn">Find My Bus</button>
      <button id="adminBtn" class="admin-link">Conductor Panel</button>
    </div>
  `;

  document.getElementById("findBusBtn").addEventListener("click", renderJourneySelection);
  document.getElementById("adminBtn").addEventListener("click", renderAdminPanel);
}

function renderJourneySelection() {
  const stopOptions = stops.map((s, i) => `<option value="${i}">${s}</option>`).join("");

  app.innerHTML = `
    <div class="journey">
      <h2>Plan Your Journey</h2>

      <label>From</label>
      <select id="fromStop">${stopOptions}</select>

      <label>To</label>
      <select id="toStop">${stopOptions}</select>

      <label>My preference:</label>
      <div class="preferences">
        <button class="pref-btn" data-pref="fastest">Fastest</button>
        <button class="pref-btn" data-pref="balanced">Balanced</button>
        <button class="pref-btn" data-pref="comfort">Comfort</button>
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

  document.getElementById("findBestBusBtn").addEventListener("click", async () => {
    selectedFrom = document.getElementById("fromStop").value;
    selectedTo = document.getElementById("toStop").value;
    await renderBusComparison();
  });
}

async function renderBusComparison() {
  await fetchBuses();

  const recommendedBus = pickRecommendedBus();

  const busCards = buses.map(bus => {
    const { currentOccupancyPercent, predictedOccupancyPercent, isCrowded } = getBusStats(bus);
    const isRecommended = bus.busId === recommendedBus.busId;

    return `
      <div class="bus-card ${isRecommended ? "recommended" : ""}">
        <h3>Bus ${bus.busId} ${isRecommended ? "AI RECOMMENDED" : ""}</h3>
        <p>Tracking: ${bus.fromStop} to ${bus.toStop} (${bus.progressToNextStop}%)</p>
        <p>Arrives in: ${bus.arrivalTime} min</p>
        <p>Current occupancy: ${currentOccupancyPercent}%</p>
        <p>Predicted occupancy: ${predictedOccupancyPercent}%</p>
        <p>${isCrowded ? "Very crowded" : "Low crowding"}</p>
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

  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(async () => {
    await renderBusComparison();
  }, 5000);
}

function renderRecommendation() {
  if (pollInterval) clearInterval(pollInterval);

  const bus = pickRecommendedBus();
  const { predictedOccupancyPercent } = getBusStats(bus);

  const reasons = {
    fastest: "It has the shortest waiting time among all available buses.",
    comfort: "It has the lowest predicted crowding, prioritizing your comfort.",
    balanced: "It offers the best balance between waiting time and predicted crowding.",
  };

  app.innerHTML = `
    <div class="recommendation">
      <h2>AI Recommendation</h2>
      <h1>Bus ${bus.busId}</h1>
      <p><strong>Why?</strong></p>
      <p>${reasons[selectedPreference]}</p>
      <p>Arrives in ${bus.arrivalTime} min, predicted occupancy ${predictedOccupancyPercent}%.</p>
      <button id="startOverBtn">Start Over</button>
    </div>
  `;

  document.getElementById("startOverBtn").addEventListener("click", renderHome);
}

async function renderAdminPanel() {
  if (pollInterval) clearInterval(pollInterval);

  await fetchBuses();
  renderAdminRows();
}

function renderAdminRows() {
  const rows = buses.map(bus => {
    const { currentOccupancyPercent } = getBusStats(bus);
    return `
      <div class="admin-row" data-bus="${bus.busId}">
        <h3>Bus ${bus.busId}</h3>
        <p>Tracking: ${bus.fromStop} to ${bus.toStop} (${bus.progressToNextStop}%)</p>
        <p>Passengers: <span class="pax-count">${bus.currentPassengers}</span> / ${bus.capacity}</p>
        <p>Occupancy: <span class="occ-percent">${currentOccupancyPercent}%</span></p>
        <div class="pax-controls">
          <button class="pax-btn" data-bus="${bus.busId}" data-delta="-1">-</button>
          <button class="pax-btn" data-bus="${bus.busId}" data-delta="1">+</button>
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

  document.querySelectorAll(".pax-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const busId = btn.dataset.bus;
      const delta = parseInt(btn.dataset.delta, 10);
      await updatePassengers(busId, delta);
      renderAdminRows();
    });
  });

  document.getElementById("backHomeBtn").addEventListener("click", renderHome);
}

renderHome();