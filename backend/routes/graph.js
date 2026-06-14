const express = require('express');
const router = express.Router();
const pathfinder = require('../services/pathfinder');

const sectors = require('../data/sectors');

let currentSector = 'tirupati';

// Fallback straight-line hydration
function hydrateEdgesFallback(nodes, edges) {
  const nodesMap = {};
  nodes.forEach(n => { nodesMap[n.id] = n; });
  
  return edges.map(edge => {
    const src = nodesMap[edge.source];
    const dest = nodesMap[edge.target];
    if (!src || !dest) return { ...edge, distance: 300, geometry: null };
    
    const distance = Math.round(pathfinder.getHaversineDistance(src.lat, src.lng, dest.lat, dest.lng));
    return {
      ...edge,
      distance: distance,
      geometry: null
    };
  });
}

// Load default Tirupati sector
const defaultSector = sectors.tirupati;
let currentMap = {
  nodes: JSON.parse(JSON.stringify(defaultSector.nodes)),
  edges: hydrateEdgesFallback(defaultSector.nodes, JSON.parse(JSON.stringify(defaultSector.edges)))
};

// Global Preset Store with OSRM geometries placeholder
let presets = [
  {
    id: 'preset-tirupati',
    name: 'Tirupati City Grid (Default)',
    description: 'A real-world transit network connecting major hubs in Tirupati, Andhra Pradesh, India.',
    nodes: currentMap.nodes,
    edges: currentMap.edges
  }
];

// OSRM API Geometry fetcher
async function getRoadGeometry(src, dest) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${src.lng},${src.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM Server Error');
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      const distance = Math.round(data.routes[0].distance);
      const geometry = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
      return { distance, geometry };
    }
  } catch (err) {
    console.warn(`OSRM failed for [${src.name} -> ${dest.name}], falling back to straight line.`);
  }
  
  const distance = Math.round(pathfinder.getHaversineDistance(src.lat, src.lng, dest.lat, dest.lng));
  return { distance, geometry: null };
}

// OSRM API Route fetcher for arbitrary coordinates
async function getOSRMRoute(src, dest) {
  const url = `https://router.project-osrm.org/route/v1/driving/${src.lng},${src.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('OSRM Server Error');
  const data = await res.json();
  if (data.code === 'Ok' && data.routes && data.routes[0]) {
    const distance = Math.round(data.routes[0].distance);
    const duration = Math.round(data.routes[0].duration); // in seconds
    const geometry = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    return { distance, duration, geometry };
  }
  throw new Error('No route found by OSRM');
}

// Sector Hydrator
async function hydrateSectorGeometries(nodes, edges) {
  const nodesMap = {};
  nodes.forEach(n => { nodesMap[n.id] = n; });

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    if (edge.geometry && edge.geometry.length > 0) continue;
    const src = nodesMap[edge.source];
    const dest = nodesMap[edge.target];
    if (src && dest) {
      const roadData = await getRoadGeometry(src, dest);
      edges[i] = {
        ...edge,
        distance: roadData.distance,
        geometry: roadData.geometry
      };
    }
    // Throttle requests slightly (60ms) to respect OSRM public servers
    await new Promise(r => setTimeout(r, 60));
  }
}

setTimeout(() => {
  console.log('Fetching real-world street geometries for default sector (Tirupati)...');
  hydrateSectorGeometries(currentMap.nodes, currentMap.edges).then(() => {
    presets[0].edges = currentMap.edges;
    console.log('Default sector street geometries successfully loaded!');
  });
}, 1000);

// 1. Get current map
router.get('/map', (req, res) => {
  res.json(currentMap);
});

// 2. Update current map (re-hydrates dynamically if geometry missing)
router.post('/map', async (req, res) => {
  const { nodes, edges } = req.body;
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return res.status(400).json({ error: 'Invalid map format.' });
  }

  const nodesMap = {};
  nodes.forEach(n => { nodesMap[n.id] = n; });

  const updatedEdges = [];
  for (const edge of edges) {
    // If geometry is already computed, keep it; otherwise fetch
    if (edge.geometry && edge.geometry.length > 0) {
      updatedEdges.push(edge);
    } else {
      const src = nodesMap[edge.source];
      const dest = nodesMap[edge.target];
      if (src && dest) {
        const roadData = await getRoadGeometry(src, dest);
        updatedEdges.push({
          ...edge,
          distance: roadData.distance,
          geometry: roadData.geometry
        });
      } else {
        updatedEdges.push(edge);
      }
    }
  }

  currentMap = { nodes, edges: updatedEdges };
  res.json({ message: 'Map updated successfully', map: currentMap });
});

// 3. Compute route
router.post('/route', async (req, res) => {
  const { startNodeId, endNodeId, algorithm } = req.body;
  if (!startNodeId || !endNodeId) {
    return res.status(400).json({ error: 'startNodeId and endNodeId are required.' });
  }

  const nodeIds = currentMap.nodes.map(n => n.id);
  if (!nodeIds.includes(startNodeId) || !nodeIds.includes(endNodeId)) {
    return res.status(404).json({ error: 'Start or end node not found in the graph.' });
  }

  if (algorithm === 'osrm') {
    const startNode = currentMap.nodes.find(n => n.id === startNodeId);
    const endNode = currentMap.nodes.find(n => n.id === endNodeId);
    try {
      const roadData = await getOSRMRoute(startNode, endNode);
      return res.json({
        algorithm: 'osrm',
        path: [startNodeId, endNodeId],
        pathEdges: [],
        totalCost: roadData.distance,
        duration: roadData.duration,
        geometry: roadData.geometry,
        visited: [startNodeId, endNodeId]
      });
    } catch (err) {
      console.warn('OSRM routing failed, falling back to traffic-aware Dijkstra:', err);
      const result = pathfinder.dijkstra(currentMap.nodes, currentMap.edges, startNodeId, endNodeId, true);
      return res.json({
        algorithm: 'osrm-fallback',
        ...result,
        message: 'OSRM routing failed. Fell back to traffic-aware graph routing.'
      });
    }
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

// 4. Calculate MST
router.get('/mst', (req, res) => {
  const result = pathfinder.findMST(currentMap.nodes, currentMap.edges);
  res.json(result);
});

// 5. GET all presets
router.get('/presets', (req, res) => {
  res.json(presets);
});

// 6. SAVE current map as a preset
router.post('/presets', (req, res) => {
  const { name, description, nodes, edges } = req.body;
  if (!name || !Array.isArray(nodes) || !Array.isArray(edges)) {
    return res.status(400).json({ error: 'Name, nodes, and edges are required.' });
  }

  const newPreset = {
    id: 'preset-' + Math.random().toString(36).substring(2, 9),
    name,
    description: description || 'User-designed city network.',
    nodes,
    edges
  };

  presets.push(newPreset);
  res.json({ message: 'Template saved successfully', preset: newPreset });
});

// 7. DELETE custom preset
router.delete('/presets/:id', (req, res) => {
  const { id } = req.params;
  if (id.startsWith('preset-')) {
    return res.status(403).json({ error: 'Preloaded template cannot be removed.' });
  }

  const index = presets.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Template not found.' });
  }

  presets.splice(index, 1);
  res.json({ message: 'Template deleted successfully', id });
});

// 8. GET available sectors
router.get('/sectors', (req, res) => {
  const list = Object.values(sectors).map(s => ({
    id: s.id,
    name: s.name,
    country: s.country,
    center: s.center
  }));
  res.json(list);
});

// 9. POST switch current sector
router.post('/sector', async (req, res) => {
  const { sectorId } = req.body;
  if (!sectors[sectorId]) {
    return res.status(404).json({ error: 'Sector not found' });
  }

  currentSector = sectorId;
  const sector = sectors[sectorId];

  const nodes = JSON.parse(JSON.stringify(sector.nodes));
  const edges = hydrateEdgesFallback(nodes, JSON.parse(JSON.stringify(sector.edges)));

  currentMap = { nodes, edges };

  // Update default preset
  const defaultIndex = presets.findIndex(p => p.id.startsWith('preset-'));
  const newDefaultPreset = {
    id: `preset-${sector.id}`,
    name: `${sector.name} City Grid (Default)`,
    description: `A real-world transit network connecting major hubs in ${sector.name}, ${sector.country}.`,
    nodes: currentMap.nodes,
    edges: currentMap.edges
  };

  if (defaultIndex !== -1) {
    presets[defaultIndex] = newDefaultPreset;
  } else {
    presets.unshift(newDefaultPreset);
  }

  res.json({
    message: `Switched sector to ${sector.name}`,
    sectorId: sector.id,
    center: sector.center,
    map: currentMap
  });

  // Background hydrate geometries
  hydrateSectorGeometries(currentMap.nodes, currentMap.edges).then(() => {
    console.log(`OSRM hydration complete for sector: ${sector.name}`);
    newDefaultPreset.edges = currentMap.edges;
  });
});

module.exports = router;
