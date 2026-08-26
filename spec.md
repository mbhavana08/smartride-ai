# SmartRide AI — Spec

## Problem Statement
"Should I take this bus now or wait for another one?"
Answered by weighing: waiting time + predicted crowding + passenger preference.

## MVP Scope (v1 only — nothing more)

### Passenger flow
- Select starting stop
- Select destination
- See available buses
- See arrival time
- See predicted crowding
- Select preference: ⚡ Fastest / ⚖️ Balanced / 🪑 Comfort
- Get AI recommendation

### Admin/Conductor simulation
- Increase/decrease passenger count
- See current occupancy

**Explicitly OUT of scope for v1:** GPS, payments, QR tickets, real bus APIs, hardware, login systems.

## Demo Scenario
Route: Chittoor → Tirupati
Stop 1 → Stop 2 → Stop 3 → Stop 4 → Stop 5 → Stop 6

3 buses: Bus 101, Bus 102, Bus 103
Each has: capacity, current passengers, current location, estimated arrival, historical occupancy.

All data is static demo JSON — not live/government data.

## Screens

1. **Home** — title, tagline, "Find My Bus" button
2. **Journey selection** — From/To stop dropdowns, preference selector, "Find Best Bus" button
3. **Bus comparison** — list of buses with arrival time, current occupancy %, predicted occupancy %, crowding indicator (🔴/🟢)
4. **AI recommendation** — recommended bus + reasoning + "View Details" button

## Data Model

**Bus**: busId, route, capacity, currentPassengers, currentStop, arrivalTime
**Stop**: stopId, name, sequence
**HistoricalOccupancy**: busId, stop, time, passengers

Static JSON for v1 — no database.

## Build Order (do not skip ahead)

1. Static screens with hardcoded data, all 4 screens navigable
2. Wire up real data from JSON — occupancy/arrival pulled from data, not hardcoded
3. Prediction layer (plain JS, no AI):
   `predictedOccupancy = currentPassengers + historicalIncrement`
4. AI layer — explains the recommendation using already-calculated numbers. AI does NOT invent the numbers, only explains them.
5. Preference logic — Fastest/Balanced/Comfort produce different recommended buses from the same data

## Demo Script
"Imagine I'm standing at Stop 2. Three buses are available. Bus 101 arrives first, but our system predicts it'll be almost full by my stop." → show 🔴 94%
"Bus 102 takes four minutes longer, but predicted occupancy is only 63%." → show 🟢 63%
"The AI recommends Bus 102 because it provides the best balance between waiting time and crowding."