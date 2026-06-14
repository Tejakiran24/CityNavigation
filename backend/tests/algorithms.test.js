/**
 * Self-contained unit tests for graph pathfinding algorithms.
 * Run using `npm run test`
 */

const { dijkstra, aStar, findMST } = require('../services/pathfinder');

// Set up a mock graph with geographical coordinates (lat, lng):
// Node A (City Hall) -> Node B (Union Sq) -> Node C (Central Park)
const testNodes = [
  { id: 'A', name: 'Node A', lat: 40.7128, lng: -74.0060 }, // Downtown
  { id: 'B', name: 'Node B', lat: 40.7308, lng: -73.9973 }, // Midtown
  { id: 'C', name: 'Node C', lat: 40.7850, lng: -73.9682 }  // Uptown
];

// We assign explicit weights to edges
const testEdges = [
  { id: 'eAB', source: 'A', target: 'B', distance: 2500, traffic: 'clear', speedLimit: 50, lanes: 2 },
  { id: 'eBC', source: 'B', target: 'C', distance: 6500, traffic: 'clear', speedLimit: 50, lanes: 2 },
  { id: 'eAC', source: 'A', target: 'C', distance: 10000, traffic: 'clear', speedLimit: 50, lanes: 2 }
];

let failed = false;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Test failed: ${message}`);
    failed = true;
  } else {
    console.log(`✅ Test passed: ${message}`);
  }
}

console.log('--- Running Pathfinder Algorithms Tests ---');

// Test 1: Dijkstra standard routing
try {
  const result = dijkstra(testNodes, testEdges, 'A', 'C', false);
  assert(result.path.join('-') === 'A-B-C', 'Dijkstra standard path should be A-B-C (cost: 9000)');
  assert(result.totalCost === 9000, `Dijkstra standard cost should be 9000, got ${result.totalCost}`);
} catch (err) {
  console.error('Dijkstra failed with error:', err);
  failed = true;
}

// Test 2: A* Search
try {
  const result = aStar(testNodes, testEdges, 'A', 'C');
  assert(result.path.join('-') === 'A-B-C', 'A* path should be A-B-C (cost: 9000)');
  assert(result.totalCost === 9000, `A* cost should be 9000, got ${result.totalCost}`);
} catch (err) {
  console.error('A* failed with error:', err);
  failed = true;
}

// Test 3: Traffic-aware routing (forcing alternate route)
try {
  // Let's modify traffic on eAB to jammed (traffic multiplier 10)
  const trafficEdges = [
    { id: 'eAB', source: 'A', target: 'B', distance: 2500, traffic: 'jammed', speedLimit: 50, lanes: 2 }, 
    { id: 'eBC', source: 'B', target: 'C', distance: 6500, traffic: 'clear', speedLimit: 50, lanes: 2 },   
    { id: 'eAC', source: 'A', target: 'C', distance: 10000, traffic: 'clear', speedLimit: 80, lanes: 4 } 
  ];
  
  const result = dijkstra(testNodes, trafficEdges, 'A', 'C', true);
  assert(result.path.join('-') === 'A-C', 'Traffic-aware routing should route directly A-C to avoid heavy traffic on A-B');
} catch (err) {
  console.error('Traffic-aware Dijkstra failed with error:', err);
  failed = true;
}

// Test 4: Minimum Spanning Tree
try {
  const result = findMST(testNodes, testEdges);
  assert(result.mstEdges.length === 2, `MST should have 2 edges, got ${result.mstEdges.length}`);
  const edgeIds = result.mstEdges.map(e => e.id).sort();
  assert(edgeIds[0] === 'eAB' && edgeIds[1] === 'eBC', 'MST should choose edges eAB and eBC');
  assert(result.totalWeight === 9000, `MST total weight should be 9000, got ${result.totalWeight}`);
} catch (err) {
  console.error('MST failed with error:', err);
  failed = true;
}

if (failed) {
  console.log('--- Test Run FAILED ---');
  process.exit(1);
} else {
  console.log('--- Test Run PASSED ---');
  process.exit(0);
}
