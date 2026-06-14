# City Traffic Navigation System using Graph Data Structure

An interactive web application demonstrating traffic-aware routing and navigation in a dynamic city grid. The system uses advanced graph data structures and routing algorithms to optimize traffic flow, compute shortest paths, and simulate real-time traffic dynamics.

## Key Features

- **Interactive Map Canvas**: Create intersections (nodes) and draw roads (edges) in real-time.
- **Graph Routing Algorithms**:
  - **Dijkstra's Algorithm**: Classical shortest path based on road length.
  - **A\* Search**: Heuristic-driven shortest path optimized for direction.
  - **Traffic-Aware Routing**: Dynamic pathfinding that recalculates travel time based on congestion levels, speed limits, and lanes.
  - **Minimum Spanning Tree (MST)**: Visualizes the most efficient backbone layout (e.g., for traffic light synchronization or utility laying) using Kruskal's / Prim's algorithms.
- **Real-Time Traffic Simulator**:
  - Simulates active traffic flow with moving vehicles.
  - Periodic traffic light cycle changes (Red, Green, Yellow) that delay traffic.
  - Random event generator (accidents, construction) creating sudden high-density bottlenecks.
- **Congestion & Analytics Dashboard**:
  - Monitored network-wide traffic density.
  - Comparison statistics showing the path-time improvement of Traffic-Aware routing vs standard routing.
  - Intersections, roads, and active vehicle counts.

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: React, Vite, HTML5 Canvas, Vanilla CSS (Glassmorphism layout)
- **Database**: InMemory Graph Persistence (with option to save/load JSON configurations)

---

## Installation & Local Development

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup

1. Clone or copy the files to your directory:
   ```bash
   git clone https://github.com/Tejakiran24/CityNavigation.git
   cd CityNavigation
   ```

2. Install all dependencies for root, backend, and frontend:
   ```bash
   npm run setup
   ```

3. Run the development environment (both backend and frontend concurrently):
   ```bash
   npm run dev
   ```

   The frontend will run at `http://localhost:5173` and the backend will run at `http://localhost:5000`.

---

## Testing

To run backend algorithm unit tests:
```bash
npm run test
```

## Deployment

The project is designed to be easily deployed to PaaS providers like Render, Heroku, or Railway.

The server at `backend/server.js` automatically compiles the React frontend (when using a build pipeline) and serves the static files.

For manual deployment:
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Start the Node backend in production mode:
   ```bash
   npm start
   ```
