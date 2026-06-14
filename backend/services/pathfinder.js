/**
 * Pathfinder service containing graph algorithms for the City Traffic Navigation System.
 * Optimized for geographical coordinates (lat, lng) using the Haversine distance formula.
 */

// Helper: Calculate Haversine distance between two latitude/longitude points in meters
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
}

function getNodeDistance(nodeA, nodeB) {
  return getHaversineDistance(nodeA.lat, nodeA.lng, nodeB.lat, nodeB.lng);
}

// Helper: Build adjacency list from nodes and edges
function buildAdjacencyList(nodes, edges, useTraffic = false) {
  const adj = {};
  nodes.forEach(node => {
    adj[node.id] = [];
  });

  const trafficMultipliers = {
    'clear': 1.0,
    'moderate': 1.5,
    'heavy': 3.0,
    'jammed': 10.0
  };

  edges.forEach(edge => {
    const src = edge.source;
    const dest = edge.target;
    
    // Safety check in case graph contains outdated nodes
    if (!adj[src] || !adj[dest]) return;

    // Weight calculation
    let weight = edge.distance;
    if (useTraffic) {
      const multiplier = trafficMultipliers[edge.traffic] || 1.0;
      const speedLimit = edge.speedLimit || 50; // speed limit in km/h
      const lanes = edge.lanes || 2;
      
      // Travel Time (seconds) = (Distance (m) / SpeedLimit (m/s)) * TrafficMultiplier / LaneFactor
      // Speed Limit conversion: km/h to m/s -> speedLimit / 3.6
      const speedMPS = speedLimit / 3.6;
      const laneFactor = 1 + (lanes - 1) * 0.15; // 2 lanes -> 1.15, 3 lanes -> 1.3
      weight = (edge.distance / speedMPS) * multiplier / laneFactor;
    }

    adj[src].push({ node: dest, weight: weight, originalDistance: edge.distance, edgeId: edge.id });
    adj[dest].push({ node: src, weight: weight, originalDistance: edge.distance, edgeId: edge.id }); // Bidirectional
  });

  return adj;
}

/**
 * Dijkstra's Shortest Path Algorithm
 */
function dijkstra(nodes, edges, startId, endId, useTraffic = false) {
  const adj = buildAdjacencyList(nodes, edges, useTraffic);
  const distances = {};
  const previous = {};
  const visitedOrder = [];
  const queue = new Set();

  nodes.forEach(node => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    queue.add(node.id);
  });

  distances[startId] = 0;

  while (queue.size > 0) {
    // Get node with minimum distance
    let currentId = null;
    let minDistance = Infinity;
    for (const nodeId of queue) {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        currentId = nodeId;
      }
    }

    if (currentId === null || distances[currentId] === Infinity) {
      break;
    }

    queue.delete(currentId);
    visitedOrder.push(currentId);

    if (currentId === endId) {
      break;
    }

    // Update neighbors
    for (const neighbor of adj[currentId]) {
      if (!queue.has(neighbor.node)) continue;

      const alt = distances[currentId] + neighbor.weight;
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        previous[neighbor.node] = { nodeId: currentId, edgeId: neighbor.edgeId };
      }
    }
  }

  // Reconstruct path
  const path = [];
  let current = endId;
  const pathEdges = [];

  if (previous[current] !== null || current === startId) {
    while (current !== null) {
      path.unshift(current);
      const prevInfo = previous[current];
      if (prevInfo) {
        pathEdges.unshift(prevInfo.edgeId);
        current = prevInfo.nodeId;
      } else {
        current = null;
      }
    }
  }

  return {
    path,
    pathEdges,
    totalCost: distances[endId] === Infinity ? 0 : distances[endId],
    visited: visitedOrder
  };
}

/**
 * A* Shortest Path Algorithm
 * Uses Haversine distance heuristic to target intersection
 */
function aStar(nodes, edges, startId, endId) {
  const nodesMap = {};
  nodes.forEach(node => { nodesMap[node.id] = node; });

  const startNode = nodesMap[startId];
  const endNode = nodesMap[endId];

  if (!startNode || !endNode) {
    return { path: [], pathEdges: [], totalCost: 0, visited: [] };
  }

  const adj = buildAdjacencyList(nodes, edges, false);
  const gScores = {}; // cost from start to node
  const fScores = {}; // estimated total cost (g + heuristic)
  const previous = {};
  const visitedOrder = [];
  const openSet = new Set([startId]);

  nodes.forEach(node => {
    gScores[node.id] = Infinity;
    fScores[node.id] = Infinity;
    previous[node.id] = null;
  });

  gScores[startId] = 0;
  fScores[startId] = getNodeDistance(startNode, endNode);

  while (openSet.size > 0) {
    // Find node with lowest fScore
    let currentId = null;
    let minF = Infinity;
    for (const nodeId of openSet) {
      if (fScores[nodeId] < minF) {
        minF = fScores[nodeId];
        currentId = nodeId;
      }
    }

    if (currentId === null) break;

    visitedOrder.push(currentId);

    if (currentId === endId) {
      break;
    }

    openSet.delete(currentId);

    for (const neighbor of adj[currentId]) {
      const tentativeG = gScores[currentId] + neighbor.weight;
      
      if (tentativeG < gScores[neighbor.node]) {
        previous[neighbor.node] = { nodeId: currentId, edgeId: neighbor.edgeId };
        gScores[neighbor.node] = tentativeG;
        fScores[neighbor.node] = tentativeG + getNodeDistance(nodesMap[neighbor.node], endNode);
        openSet.add(neighbor.node);
      }
    }
  }

  // Reconstruct path
  const path = [];
  let current = endId;
  const pathEdges = [];

  if (previous[current] !== null || current === startId) {
    while (current !== null) {
      path.unshift(current);
      const prevInfo = previous[current];
      if (prevInfo) {
        pathEdges.unshift(prevInfo.edgeId);
        current = prevInfo.nodeId;
      } else {
        current = null;
      }
    }
  }

  return {
    path,
    pathEdges,
    totalCost: gScores[endId] === Infinity ? 0 : gScores[endId],
    visited: visitedOrder
  };
}

/**
 * Kruskal's Algorithm to find Minimum Spanning Tree (MST)
 */
function findMST(nodes, edges) {
  // Sort edges by distance
  const sortedEdges = [...edges].sort((a, b) => a.distance - b.distance);

  // Union-Find (Disjoint Set)
  const parent = {};
  nodes.forEach(node => {
    parent[node.id] = node.id;
  });

  function find(id) {
    if (parent[id] === id) return id;
    return parent[id] = find(parent[id]); // Path compression
  }

  function union(id1, id2) {
    const root1 = find(id1);
    const root2 = find(id2);
    if (root1 !== root2) {
      parent[root1] = root2;
      return true;
    }
    return false;
  }

  const mstEdges = [];
  let totalWeight = 0;

  for (const edge of sortedEdges) {
    if (find(edge.source) !== find(edge.target)) {
      union(edge.source, edge.target);
      mstEdges.push(edge);
      totalWeight += edge.distance;
    }
  }

  return {
    mstEdges,
    totalWeight
  };
}

module.exports = {
  dijkstra,
  aStar,
  findMST,
  getHaversineDistance
};
