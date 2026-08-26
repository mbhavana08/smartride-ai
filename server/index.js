const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const stops = ["Chittoor", "Stop 2", "Stop 3", "Stop 4", "Stop 5", "Tirupati"];

let buses = [
  {
    busId: "101",
    currentStopIndex: 0,
    progressToNextStop: 0,
    fromStop: stops[0],
    toStop: stops[1],
    arrivalTime: 12,
    capacity: 50,
    currentPassengers: 30,
    historicalIncrement: 8,
  },
  {
    busId: "102",
    currentStopIndex: 1,
    progressToNextStop: 30,
    fromStop: stops[1],
    toStop: stops[2],
    arrivalTime: 7,
    capacity: 45,
    currentPassengers: 40,
    historicalIncrement: 5,
  },
  {
    busId: "103",
    currentStopIndex: 2,
    progressToNextStop: 60,
    fromStop: stops[2],
    toStop: stops[3],
    arrivalTime: 15,
    capacity: 55,
    currentPassengers: 20,
    historicalIncrement: 10,
  },
];

setInterval(() => {
  buses.forEach(bus => {
    bus.progressToNextStop += 10;

    if (bus.progressToNextStop >= 100) {
      bus.progressToNextStop = 0;
      bus.currentStopIndex = (bus.currentStopIndex + 1) % (stops.length - 1);
      bus.fromStop = stops[bus.currentStopIndex];
      bus.toStop = stops[bus.currentStopIndex + 1];
    }

    bus.arrivalTime = Math.max(1, bus.arrivalTime - 1);
  });
}, 3000);

app.get("/api/buses", (req, res) => {
  res.json(buses);
});

app.post("/api/buses/:busId/passengers", (req, res) => {
  const { busId } = req.params;
  const { delta } = req.body;

  const bus = buses.find(b => b.busId === busId);
  if (!bus) {
    return res.status(404).json({ error: "Bus not found" });
  }

  bus.currentPassengers = Math.max(0, Math.min(bus.capacity, bus.currentPassengers + delta));

  res.json(bus);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});