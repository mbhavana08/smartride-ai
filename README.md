# 🚌 SmartRide AI

**Don't just track your bus. Choose the better bus.**

SmartRide AI is a smart public transport companion that helps commuters pick the best bus for their journey — not just the nearest one. It combines live bus tracking with AI-style recommendations based on speed, comfort, and crowding predictions.

🔗 **Live demo:** [cheery-naiad-59590f.netlify.app](https://cheery-naiad-59590f.netlify.app)

---

## ✨ Features

- **Live bus tracking** — buses move between stops in real time (simulated), with progress updates every few seconds
- **AI-style recommendations** — pick a bus based on your preference:
  - ⚡ **Fastest** — shortest arrival time
  - 🪑 **Comfort** — lowest predicted crowding
  - ⚖️ **Balanced** — best trade-off between speed and comfort
- **Crowding prediction** — estimates how full a bus will be by the time it arrives, using historical passenger trends
- **Conductor Panel** — lets conductors update passenger counts live, which instantly affects crowding predictions for commuters

---

## 🏗️ Tech Stack

**Frontend**
- Vanilla JavaScript, HTML, CSS (no frameworks)
- Polls the backend every 5 seconds to keep tracking data live

**Backend**
- Node.js + Express
- In-memory bus data with simulated movement (`setInterval`)
- REST API for bus tracking and passenger updates

**Deployment**
- Frontend: [Netlify](https://netlify.com)
- Backend: [Render](https://render.com)

---

## 📂 Project Structure

```
smartride-ai/
├── index.html          # Entry point
├── app.js              # Frontend logic (rendering, polling, UI)
├── style.css           # Styling
├── server/
│   ├── index.js        # Express server + bus simulation + API routes
│   ├── package.json
│   └── package-lock.json
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint                              | Description                          |
|--------|----------------------------------------|---------------------------------------|
| GET    | `/api/buses`                           | Returns live data for all buses      |
| POST   | `/api/buses/:busId/passengers`         | Updates a bus's passenger count (`{ delta: 1 }` or `{ delta: -1 }`) |

---

## 🚀 Running Locally

**1. Clone the repo**
```bash
git clone https://github.com/<your-username>/smartride-ai.git
cd smartride-ai
```

**2. Start the backend**
```bash
cd server
npm install
npm start
```
The server runs at `http://localhost:3001`.

**3. Run the frontend**

Open `index.html` directly in your browser, or serve it with a local static server.

> Note: if running locally, update the API URLs in `app.js` to `http://localhost:3001` instead of the deployed Render URL.

---

## ⚠️ Known Limitations

- Bus data is stored in memory on the server — it resets whenever the backend restarts
- The free-tier Render backend spins down after inactivity, so the first request after idling may take 30–50 seconds
- No authentication yet — the Conductor Panel is open to anyone with the link

---

## 🛣️ Possible Next Steps

- Persist bus and passenger data in a real database
- Add authentication for the Conductor Panel
- Support real GPS-based tracking instead of simulated movement
- Add more routes and stops

---

## 📄 License

This project is open for learning and personal use.
