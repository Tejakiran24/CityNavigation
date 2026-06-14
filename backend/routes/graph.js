const express = require('express');
const router = express.Router();
const pathfinder = require('../services/pathfinder');

// Initial default city map centered in Manhattan, NY (lat/lng coordinates)
const defaultNodes = [
  { id: 'n1', name: 'Manhattan City Hall', lat: 40.7128, lng: -74.0060, trafficLight: 'green', lightTimer: 8 },
  { id: 'n2', name: 'Wall Street bull', lat: 40.7069, lng: -74.0113, trafficLight: 'red', lightTimer: 5 },
  { id: 'n3', name: 'Chinatown Square', lat: 40.7158, lng: -73.9967, trafficLight: 'green', lightTimer: 6 },
  { id: 'n4', name: 'Tribeca Junction', lat: 40.7182, lng: -74.0083, trafficLight: 'red', lightTimer: 10 },
  { id: 'n5', name: 'Union Square Hub', lat: 40.7308, lng: -73.9973, trafficLight: 'green', lightTimer: 4 },
  { id: 'n6', name: 'East Village Crossing', lat: 40.7265, lng: -73.9815, trafficLight: 'red', lightTimer: 7 },
  { id: 'n7', name: 'Greenwich Village Gate', lat: 40.7336, lng: -74.0027, trafficLight: 'green', lightTimer: 6 },
  { id: 'n8', name: 'Stuyvesant Town Circle', lat: 40.7317, lng: -73.9784, trafficLight: 'red', lightTimer: 9 },
  { id: 'n9', name: 'Battery Park Esplanade', lat: 40.7033, lng: -74.0170, trafficLight: 'green', lightTimer: 8 }
];

const rawEdges = [
  // Outer Connections
  { id: 'e1', source: 'n9', target: 'n2', traffic: 'clear', speedLimit: 50, lanes: 2 },
  { id: 'e2', source: 'n2', target: 'n1', traffic: 'clear', speedLimit: 50, lanes: 2 },
  { id: 'e3', source: 'n1', target: 'n3', traffic: 'moderate', speedLimit: 40, lanes: 2 },
  { id: 'e4', source: 'n3', target: 'n6', traffic: 'clear', speedLimit: 50, lanes: 3 },
  { id: 'e5', source: 'n6', target: 'n8', traffic: 'heavy', speedLimit: 40, lanes: 1 },
  { id: 'e6', source: 'n8', target: 'n5', traffic: 'clear', speedLimit: 50, lanes: 2 },
  { id: 'e7', source: 'n5', target: 'n7', traffic: 'jammed', speedLimit: 50, lanes: 2 },
  { id: 'e8', source: 'n7', target: 'n4', traffic: 'clear', speedLimit: 40, lanes: 2 },
  { id: 'e9', source: 'n4', target: 'n9', traffic: 'clear', speedLimit: 60, lanes: 3 },
  
  // Radial grid lines to Central Hub (Union Square)
  { id: 'e10', source: 'n1', target: 'n5', traffic: 'clear', speedLimit: 50, lanes: 2 },
  { id: 'e11', source: 'n2', target: 'n5', traffic: 'heavy', speedLimit: 60, lanes: 2 },
  { id: 'e12', source: 'n3', target: 'n5', traffic: 'clear', speedLimit: 50, lanes: 2 },
  { id: 'e13', source: 'n4', target: 'n5', traffic: 'clear', speedLimit: 50, lanes: 2 },
  { id: 'e14', source: 'n6', target: 'n5', traffic: 'moderate', speedLimit: 45, lanes: 2 },
  
  // Cross streets
  { id: 'e15', source: 'n1', target: 'n4', traffic: 'clear', speedLimit: 40, lanes: 2 },
  { id: 'e16', source: 'n3', target: 'n4', traffic: 'clear', speedLimit: 40, lanes: 2 }
];

// Helper: Hydrate distances dynamically from geographical coordinates
function hydrateEdges(nodes, edges) {
  const nodesMap = {};
  nodes.forEach(n => { nodesMap[n.id] = n; });
  
  return edges.map(edge => {
    const src = nodesMap[edge.source];
    const dest = nodesMap[edge.target];
    if (!src || !dest) return { ...edge, distance: 300 }; // default fall back
    
    const distance = Math.round(pathfinder.getHaversineDistance(src.lat, src.lng, dest.lat, dest.lng));
    return {
      ...edge,
      distance: distance // distance in meters
    };
  });
}

let currentMap = {
  nodes: defaultNodes,
  edges: hydrateEdges(defaultNodes, rawEdges)
};

// 1. Get current map configuration
router.get('/map', (req, res) => {
  res.json(currentMap);
});

// 2. Update/Save map configuration
router.post('/map', (req, res) => {
  const { nodes, edges } = req.body;
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return res.status(400).json({ error: 'Invalid map format. Expecting nodes and edges arrays.' });
  }

  // Hydrate distances for any edge missing distance or recalculated due to node movements
  const hydratedEdges = hydrateEdges(nodes, edges);

  currentMap = { nodes, edges: hydratedEdges };
  res.json({ message: 'Map updated successfully', map: currentMap });
});

// 3. Compute route between start and end node
router.post('/route', (req, res) => {
  const { startNodeId, endNodeId, algorithm } = req.body;

  if (!startNodeId || !endNodeId) {
    return res.status(400).json({ error: 'startNodeId and endNodeId are required.' });
  }

  const nodeIds = currentMap.nodes.map(n => n.id);
  if (!nodeIds.includes(startNodeId) || !nodeIds.includes(endNodeId)) {
    return res.status(404).json({ error: 'Start or end node not found in the graph.' });
  }

  let result;
  switch (algorithm) {
    case 'dijkstra':
      result = pathfinder.dijkstra(currentMap.nodes, currentMap.edges, startNodeId, endNodeId, false);
      break;
    case 'traffic':
      result = pathfinder.dijkstra(currentMap.nodes, currentMap.edges, startNodeId, endNodeId, true);
      break;
    case 'astar':
      result = pathfinder.aStar(currentMap.nodes, currentMap.edges, startNodeId, endNodeId);
      break;
    default:
      result = pathfinder.dijkstra(currentMap.nodes, currentMap.edges, startNodeId, endNodeId, true);
  }

  res.json({
    algorithm: algorithm || 'traffic',
    ...result
  });
});

// 4. Calculate Minimum Spanning Tree (MST)
router.get('/mst', (req, res) => {
  const result = pathfinder.findMST(currentMap.nodes, currentMap.edges);
  res.json(result);
});

module.exports = router;
