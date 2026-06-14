import React, { useState, useEffect } from 'react';
import LeafletMap from './components/LeafletMap';
import Sidebar from './components/Sidebar';
import Legend from './components/Legend';
import PresetsPage from './components/PresetsPage';
import GuidePage from './components/GuidePage';

// Client side helper: calculate Haversine distance in meters
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

  return R * c;
}

// Default seeded city map in Manhattan, NY
const DEFAULT_MAP = {
  nodes: [
    { id: 'n1', name: 'Alipiri Toll Gate', lat: 13.6500, lng: 79.4005, trafficLight: 'green', lightTimer: 8 },
    { id: 'n2', name: 'Kapila Theertham Junction', lat: 13.6465, lng: 79.4180, trafficLight: 'red', lightTimer: 5 },
    { id: 'n3', name: 'Leela Mahal Circle', lat: 13.6355, lng: 79.4260, trafficLight: 'green', lightTimer: 6 },
    { id: 'n4', name: 'Tirupati RTC Bus Stand', lat: 13.6255, lng: 79.4190, trafficLight: 'red', lightTimer: 10 },
    { id: 'n5', name: 'Tirupati Railway Station', lat: 13.6276, lng: 79.4208, trafficLight: 'green', lightTimer: 4 },
    { id: 'n6', name: 'Ramanuja Circle', lat: 13.6253, lng: 79.4312, trafficLight: 'red', lightTimer: 7 },
    { id: 'n7', name: 'SV University Campus', lat: 13.6280, lng: 79.4020, trafficLight: 'green', lightTimer: 6 },
    { id: 'n8', name: 'Karakambadi Road Junction', lat: 13.6470, lng: 79.4420, trafficLight: 'red', lightTimer: 9 },
    { id: 'n9', name: 'Srinivasam Complex Hub', lat: 13.6265, lng: 79.4255, trafficLight: 'green', lightTimer: 8 }
  ],
  edges: [
    { id: 'e1', source: 'n9', target: 'n2', distance: 2300, traffic: 'clear', speedLimit: 50, lanes: 2 },
    { id: 'e2', source: 'n2', target: 'n1', distance: 1900, traffic: 'clear', speedLimit: 50, lanes: 2 },
    { id: 'e3', source: 'n1', target: 'n3', distance: 3200, traffic: 'moderate', speedLimit: 40, lanes: 2 },
    { id: 'e4', source: 'n3', target: 'n6', distance: 1200, traffic: 'clear', speedLimit: 50, lanes: 3 },
    { id: 'e5', source: 'n6', target: 'n8', distance: 2600, traffic: 'heavy', speedLimit: 40, lanes: 1 },
    { id: 'e6', source: 'n8', target: 'n5', distance: 3100, traffic: 'clear', speedLimit: 50, lanes: 2 },
    { id: 'e7', source: 'n5', target: 'n7', distance: 2000, traffic: 'jammed', speedLimit: 50, lanes: 2 },
    { id: 'e8', source: 'n7', target: 'n4', distance: 1850, traffic: 'clear', speedLimit: 40, lanes: 2 },
    { id: 'e9', source: 'n4', target: 'n9', distance: 700, traffic: 'clear', speedLimit: 60, lanes: 3 },
    { id: 'e10', source: 'n1', target: 'n5', distance: 3300, traffic: 'clear', speedLimit: 50, lanes: 2 },
    { id: 'e11', source: 'n2', target: 'n5', distance: 2100, traffic: 'heavy', speedLimit: 60, lanes: 2 },
    { id: 'e12', source: 'n3', target: 'n5', distance: 1000, traffic: 'clear', speedLimit: 50, lanes: 2 },
    { id: 'e13', source: 'n4', target: 'n5', distance: 300, traffic: 'clear', speedLimit: 50, lanes: 2 },
    { id: 'e14', source: 'n6', target: 'n5', distance: 1100, traffic: 'moderate', speedLimit: 45, lanes: 2 },
    { id: 'e15', source: 'n1', target: 'n4', distance: 3400, traffic: 'clear', speedLimit: 40, lanes: 2 },
    { id: 'e16', source: 'n3', target: 'n4', distance: 1300, traffic: 'clear', speedLimit: 40, lanes: 2 }
  ]
};

const streetPrefixes = ['Alipiri', 'Kapila', 'Bypass', 'University', 'Station', 'RTC', 'Karakambadi', 'Ramanuja', 'Srinivasam', 'LeelaMahal', 'SV', 'Renigunta', 'Tirumala'];
const streetSuffixes = ['Road', 'Circle', 'Bypass', 'Junction', 'Hub', 'Way', 'Flyover'];

export default function App() {
  const [view, setView] = useState('app'); // 'app', 'presets', 'guide'
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  
  const [activeRoute, setActiveRoute] = useState(null);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [mstEdges, setMstEdges] = useState([]);
  
  const [mode, setMode] = useState('select'); // 'select', 'add-node', 'add-edge', 'delete'
  const [algorithm, setAlgorithm] = useState('traffic');
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [apiError, setApiError] = useState(null);
  const [mapTheme, setMapTheme] = useState('light');
  const [toasts, setToasts] = useState([]);
  const [weather, setWeather] = useState('sunny'); // 'sunny', 'rain'
  const [activeEvent, setActiveEvent] = useState('none'); // 'none', 'festival', 'vip'
  const [incidentActive, setIncidentActive] = useState(false);
  const [raceState, setRaceState] = useState('idle');
  const [globalGreenTime, setGlobalGreenTime] = useState(15);
  const [globalRedTime, setGlobalRedTime] = useState(20);

  const [sectorsList, setSectorsList] = useState([
    { id: 'tirupati', name: 'Tirupati', country: 'India', center: [13.628, 79.419] }
  ]);
  const [activeSector, setActiveSector] = useState('tirupati');
  const [mapCenter, setMapCenter] = useState([13.628, 79.419]);

  const [dashboardTheme, setDashboardTheme] = useState('light');

  useEffect(() => {
    if (dashboardTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [dashboardTheme]);

  const dispatchMessages = [
    "Officer Rao: Pilgrims queuing near Alipiri Toll Gate, traffic crawling.",
    "Dispatch: VIP convoy cleared Kapila Theertham. Signals synced to green waves.",
    "Sensors: Heavy rush near Srinivasam Complex, delay expected.",
    "Traffic Radio: Minor block at Ramanuja Circle. Speed reduced.",
    "Officer Naidu: Flower stalls blocking pathway near Railway Station.",
    "Dispatch: RTC buses queuing near Tirupati Bus Stand.",
    "System: Routing algorithm recalibrated. Dijkstra execution time: 0.08ms."
  ];
  
  const [dispatchLog, setDispatchLog] = useState("CONSOLE: TMD operational deck online. Monitoring Tirupati grid...");
  
  useEffect(() => {
    const interval = setInterval(() => {
      const msg = dispatchMessages[Math.floor(Math.random() * dispatchMessages.length)];
      setDispatchLog(`DISPATCH LOG: ${msg}`);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Toast notification helper
  const showToast = (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Fetch current map from backend
  const fetchMap = async () => {
    try {
      const response = await fetch('/api/map');
      if (!response.ok) throw new Error('Failed to fetch map from server');
      const data = await response.json();
      setNodes(data.nodes);
      setEdges(data.edges);
      setApiError(null);
    } catch (err) {
      console.warn('API error, falling back to local simulation data:', err);
      setNodes(DEFAULT_MAP.nodes);
      setEdges(DEFAULT_MAP.edges);
      setApiError('Connected to local storage. Running in offline fallback mode.');
    }
  };

  const fetchSectors = async () => {
    try {
      const response = await fetch('/api/sectors');
      if (response.ok) {
        const data = await response.json();
        setSectorsList(data);
      }
    } catch (err) {
      console.warn('Failed to fetch sectors list:', err);
    }
  };

  const handleSectorChange = async (sectorId) => {
    showToast(`Loading ${sectorId.toUpperCase()} sector grid...`, 'info');
    try {
      const response = await fetch('/api/sector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectorId })
      });
      if (!response.ok) throw new Error('Switch sector API failed');
      const data = await response.json();
      
      setActiveSector(data.sectorId);
      setMapCenter(data.center);
      setNodes(data.map.nodes);
      setEdges(data.map.edges);
      
      // Clear navigation states
      setSelectedNode(null);
      setStartNode(null);
      setEndNode(null);
      handleClearRoute();
      setMstEdges([]);
      
      setDispatchLog(`DISPATCH LOG: Sector switched to ${data.sectorId.toUpperCase()}. Traffic control deck initialized.`);
      showToast(`Loaded ${data.sectorId.toUpperCase()} grid successfully`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Could not load sector grid.', 'error');
    }
  };

  useEffect(() => {
    fetchSectors();
    fetchMap();
  }, []);

  // Save current map to backend
  const saveMap = async (newNodes, newEdges) => {
    try {
      const response = await fetch('/api/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: newNodes, edges: newEdges })
      });
      if (!response.ok) throw new Error('Failed to update map');
      const data = await response.json();
      setNodes(data.map.nodes);
      setEdges(data.map.edges);
    } catch (err) {
      console.error('Save failed, updating local state only:', err);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  };

  // Add a new intersection node (click on Map)
  const handleAddNode = (coords) => {
    const prefix = streetPrefixes[Math.floor(Math.random() * streetPrefixes.length)];
    const suffix = streetSuffixes[Math.floor(Math.random() * streetSuffixes.length)];
    const nodeName = `${prefix} ${suffix}`;
    const nodeId = 'n_' + Math.random().toString(36).substring(2, 9);
    
    const newNode = {
      id: nodeId,
      name: nodeName,
      lat: coords.lat,
      lng: coords.lng,
      trafficLight: Math.random() > 0.5 ? 'green' : 'red',
      lightTimer: 5 + Math.floor(Math.random() * 6)
    };

    const updatedNodes = [...nodes, newNode];
    saveMap(updatedNodes, edges);
  };

  // Add a new road connection
  const handleAddRoad = (sourceId, targetId) => {
    const roadExists = edges.some(e => 
      (e.source === sourceId && e.target === targetId) || 
      (e.source === targetId && e.target === sourceId)
    );

    if (roadExists) {
      alert('A road already connects these two intersections.');
      return;
    }

    const srcNode = nodes.find(n => n.id === sourceId);
    const destNode = nodes.find(n => n.id === targetId);
    if (!srcNode || !destNode) return;

    const distance = Math.round(getHaversineDistance(srcNode.lat, srcNode.lng, destNode.lat, destNode.lng));
    const roadId = 'e_' + Math.random().toString(36).substring(2, 9);

    const newRoad = {
      id: roadId,
      source: sourceId,
      target: targetId,
      distance: distance,
      traffic: 'clear',
      speedLimit: 50 + (Math.random() > 0.6 ? 20 : 0),
      lanes: Math.random() > 0.5 ? 3 : 2
    };

    const updatedEdges = [...edges, newRoad];
    saveMap(nodes, updatedEdges);
  };

  // Delete a node and all connecting roads
  const handleDeleteNode = (nodeId) => {
    const updatedNodes = nodes.filter(n => n.id !== nodeId);
    const updatedEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    
    if (selectedNode?.id === nodeId) setSelectedNode(null);
    if (startNode?.id === nodeId) setStartNode(null);
    if (endNode?.id === nodeId) setEndNode(null);
    
    handleClearRoute();
    setMstEdges([]);
    
    saveMap(updatedNodes, updatedEdges);
  };

  // Delete a road
  const handleDeleteEdge = (edgeId) => {
    const updatedEdges = edges.filter(e => e.id !== edgeId);
    handleClearRoute();
    setMstEdges([]);
    saveMap(nodes, updatedEdges);
  };

  // Calculate route using API
  const handleFindRoute = async (algParam, customStart = null, customEnd = null) => {
    const activeAlg = algParam || algorithm;
    const start = customStart || startNode;
    const end = customEnd || endNode;
    if (!start || !end) return;
    
    setMstEdges([]);
    showToast('Calculating route...', 'info');

    try {
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startNodeId: start.id,
          endNodeId: end.id,
          algorithm: activeAlg
        })
      });

      if (!response.ok) throw new Error('API route failed');
      const data = await response.json();
      
      if (!data.path || data.path.length === 0) {
        showToast('No path exists between these two points.', 'error');
        alert('No path exists between these two intersections.');
        handleClearRoute();
        return;
      }

      setActiveRoute({
        path: data.path,
        pathEdges: data.pathEdges,
        totalCost: data.totalCost,
        duration: data.duration, // Pass duration to frontend state
        geometry: data.geometry
      });
      setVisitedNodes(data.visited);
      showToast('Route calculated successfully!', 'success');
    } catch (err) {
      console.warn('API route failed:', err);
      showToast('Routing engine connection failed.', 'error');
      alert('Routing engine connection failed. Please check if the backend is running.');
    }
  };

  // Handle node drag coordinate updates and clear connected edge geometries
  const handleNodeDrag = async (nodeId, newCoords) => {
    showToast('Recalculating route...', 'info');
    // Update node coordinates in local nodes array
    const updatedNodes = nodes.map(n => n.id === nodeId ? { ...n, lat: newCoords.lat, lng: newCoords.lng } : n);
    
    // Clear geometries of edges connected to this node so OSRM geometries re-hydrate correctly
    const updatedEdges = edges.map(e => {
      if (e.source === nodeId || e.target === nodeId) {
        return { ...e, geometry: null };
      }
      return e;
    });

    // Keep startNode and endNode references updated if they are the dragged node
    let updatedStart = startNode;
    let updatedEnd = endNode;
    if (startNode?.id === nodeId) {
      updatedStart = { ...startNode, lat: newCoords.lat, lng: newCoords.lng };
      setStartNode(updatedStart);
    }
    if (endNode?.id === nodeId) {
      updatedEnd = { ...endNode, lat: newCoords.lat, lng: newCoords.lng };
      setEndNode(updatedEnd);
    }

    // Save mapping changes to backend to trigger re-hydration and database sync
    await saveMap(updatedNodes, updatedEdges);

    // Instantly recalculate route if active
    if (activeRoute) {
      handleFindRoute(algorithm, updatedStart, updatedEnd);
    }
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
    setVisitedNodes([]);
  };

  const handleToggleIncident = async (active) => {
    setIncidentActive(active);
    showToast(active ? '🚧 Incident triggered at Wall Street Junction!' : '🟢 Incident cleared. Normal lanes restored.', active ? 'error' : 'success');
    
    const updatedEdges = edges.map(edge => {
      if (edge.id === 'e2') {
        return { ...edge, traffic: active ? 'jammed' : 'clear' };
      }
      return edge;
    });
    
    await saveMap(nodes, updatedEdges);
    
    if (startNode && endNode) {
      handleFindRoute(algorithm, startNode, endNode);
    }
  };

  // Inject Random Traffic Bottlenecks
  const handleTriggerRandomJams = () => {
    showToast('Simulating traffic bottlenecks...', 'info');
    const levels = ['clear', 'moderate', 'heavy', 'jammed'];
    const updatedEdges = edges.map(edge => {
      if (Math.random() < 0.35) {
        const idx = Math.floor(Math.random() * levels.length);
        return { ...edge, traffic: levels[idx] };
      }
      return edge;
    });
    saveMap(nodes, updatedEdges);
    handleClearRoute();
  };

  // Clear all traffic levels back to clear
  const handleResetTraffic = () => {
    showToast('Traffic congestions cleared', 'success');
    const updatedEdges = edges.map(edge => ({ ...edge, traffic: 'clear' }));
    saveMap(nodes, updatedEdges);
    handleClearRoute();
  };

  // Calculate Minimum Spanning Tree (MST)
  const handleCalculateMST = async () => {
    handleClearRoute();
    showToast('Designing optimal grid backbone...', 'info');

    try {
      const response = await fetch('/api/mst');
      if (!response.ok) throw new Error('MST computation error');
      const data = await response.json();
      setMstEdges(data.mstEdges);
      showToast('Optimal grid backbone synced!', 'success');
    } catch (err) {
      console.error('MST calculation error:', err);
      showToast('MST calculation failed.', 'error');
      alert('MST service unavailable. Make sure backend is running.');
    }
  };

  const handleClearMST = () => {
    setMstEdges([]);
    showToast('Grid backbone cleared', 'info');
  };

  // Reset entire map back to initial seeds
  const handleResetMap = () => {
    if (window.confirm('Are you sure you want to reset the map and overwrite all changes?')) {
      handleClearRoute();
      setMstEdges([]);
      setSelectedNode(null);
      setStartNode(null);
      setEndNode(null);
      saveMap(DEFAULT_MAP.nodes, DEFAULT_MAP.edges);
      showToast('Map reset to default grid', 'success');
    }
  };

  const getCongestionIndex = () => {
    if (edges.length === 0) return 0;
    const congestedCount = edges.filter(e => e.traffic === 'heavy' || e.traffic === 'jammed').length;
    return Math.round((congestedCount / edges.length) * 100);
  };
  const congestionIndex = getCongestionIndex();

  // Main Conditional View Render
  if (view === 'presets') {
    return (
      <PresetsPage
        currentNodes={nodes}
        currentEdges={edges}
        onLoadMap={(newNodes, newEdges) => {
          setSelectedNode(null);
          setStartNode(null);
          setEndNode(null);
          handleClearRoute();
          setMstEdges([]);
          saveMap(newNodes, newEdges);
          setView('app');
        }}
        onBack={() => setView('app')}
      />
    );
  }

  if (view === 'guide') {
    return (
      <GuidePage
        onBack={() => setView('app')}
      />
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--bg-primary)',
      overflow: 'hidden'
    }}>
      {/* 1. APP HEADER NAVIGATION BAR (Sleek telemetry command bar) */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-clean)',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2000
      }}>
        {/* Logo and Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setView('app')}>
            <span style={{ fontSize: '1.4rem' }}>🚦</span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-text-primary)' }}>
              Traffic Monitor Deck <span style={{ color: 'var(--accent-blue)', fontWeight: 500, fontSize: '0.82rem', fontFamily: 'monospace', marginLeft: '4px' }}>[TMD-v1.4]</span>
            </span>
          </div>

          {/* Telemetry feed status badges */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '0.62rem',
              color: 'var(--color-text-secondary)',
              fontFamily: 'monospace',
              fontWeight: 700
            }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#64748b' }} />
              CONSOLE: OK
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: apiError ? '#fef2f2' : '#dcfce7',
              border: apiError ? '1px solid #fca5a5' : '1px solid #bbf7d0',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '0.62rem',
              color: apiError ? '#991b1b' : '#16a34a',
              fontFamily: 'monospace',
              fontWeight: 700
            }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: apiError ? '#dc2626' : '#16a34a' }} />
              OSRM FEED: {apiError ? 'FALLBACK' : 'LIVE'}
            </span>
          </div>

          {/* Sector selection dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>SECTOR:</span>
            <select
              value={activeSector}
              onChange={(e) => handleSectorChange(e.target.value)}
              style={{
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: '1px solid var(--border-clean)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                outline: 'none',
                height: 'auto'
              }}
            >
              {sectorsList.map(sec => (
                <option key={sec.id} value={sec.id}>
                  📍 {sec.name} ({sec.country})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Buttons */}
        <nav style={{ display: 'flex', gap: '4px', background: 'var(--bg-primary)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-clean)' }}>
          <button 
            onClick={() => setView('app')} 
            style={{ 
              background: view === 'app' ? 'var(--bg-secondary)' : 'transparent', 
              border: view === 'app' ? '1px solid var(--border-clean)' : 'none', 
              color: view === 'app' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', 
              fontWeight: 700, 
              cursor: 'pointer',
              fontSize: '0.78rem',
              padding: '6px 14px',
              borderRadius: '4px',
              outline: 'none',
              boxShadow: view === 'app' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            🌐 Live Map
          </button>
          <button 
            onClick={() => setView('presets')} 
            style={{ 
              background: view === 'presets' ? 'var(--bg-secondary)' : 'transparent', 
              border: view === 'presets' ? '1px solid var(--border-clean)' : 'none', 
              color: view === 'presets' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', 
              fontWeight: 700, 
              cursor: 'pointer',
              fontSize: '0.78rem',
              padding: '6px 14px',
              borderRadius: '4px',
              outline: 'none',
              boxShadow: view === 'presets' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            🗺️ Templates
          </button>
          <button 
            onClick={() => setView('guide')} 
            style={{ 
              background: view === 'guide' ? 'var(--bg-secondary)' : 'transparent', 
              border: view === 'guide' ? '1px solid var(--border-clean)' : 'none', 
              color: view === 'guide' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', 
              fontWeight: 700, 
              cursor: 'pointer',
              fontSize: '0.78rem',
              padding: '6px 14px',
              borderRadius: '4px',
              outline: 'none',
              boxShadow: view === 'guide' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            📖 Guide
          </button>
        </nav>
      </header>

      {/* Telemetry Ticker Marquee */}
      <div className="ticker-wrap">
        <div className="ticker-content">
          <span className="ticker-item">🚦 <strong>SYSTEM STATUS:</strong> ACTIVE MONITORING</span>
          <span className="ticker-item">🚘 <strong>CONGESTION INDEX:</strong> {congestionIndex}%</span>
          <span className="ticker-item">🎙️ <strong>DISPATCH DECK:</strong> {dispatchLog}</span>
          <span className="ticker-item">🌤️ <strong>WEATHER CONDITION:</strong> {weather.toUpperCase()}</span>
          <span className="ticker-item">🎪 <strong>CIVIC STATE:</strong> {activeEvent === 'none' ? 'NORMAL OPERATIONS' : activeEvent.toUpperCase()}</span>
          <span className="ticker-item">📍 <strong>INTERSECTIONS:</strong> {nodes.length}</span>
          <span className="ticker-item">🛣️ <strong>STREET LANES:</strong> {edges.length}</span>
          
          <span className="ticker-item">🚦 <strong>SYSTEM STATUS:</strong> ACTIVE MONITORING</span>
          <span className="ticker-item">🚘 <strong>CONGESTION INDEX:</strong> {congestionIndex}%</span>
          <span className="ticker-item">🎙️ <strong>DISPATCH DECK:</strong> {dispatchLog}</span>
          <span className="ticker-item">🌤️ <strong>WEATHER CONDITION:</strong> {weather.toUpperCase()}</span>
          <span className="ticker-item">🎪 <strong>CIVIC STATE:</strong> {activeEvent === 'none' ? 'NORMAL OPERATIONS' : activeEvent.toUpperCase()}</span>
          <span className="ticker-item">📍 <strong>INTERSECTIONS:</strong> {nodes.length}</span>
          <span className="ticker-item">🛣️ <strong>STREET LANES:</strong> {edges.length}</span>
        </div>
      </div>

      {/* Top Banner Alert (API offline check) */}
      {apiError && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          fontSize: '0.8rem',
          textAlign: 'center',
          padding: '6px',
          borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999
        }}>
          ⚠️ {apiError}
          <button 
            onClick={fetchMap}
            style={{ 
              background: 'rgba(245,158,11,0.2)', 
              border: 'none', 
              color: '#fff', 
              cursor: 'pointer', 
              fontSize: '0.75rem', 
              padding: '2px 8px', 
              borderRadius: '4px' 
            }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Container */}
      <div style={{
        display: 'flex',
        flex: 1,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
        
        {/* Left Side: Map Visualizer */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          padding: '20px',
          gap: '15px'
        }}>
          {/* Map Wrapper */}
          <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <LeafletMap
              nodes={nodes}
              edges={edges}
              selectedNode={selectedNode}
              startNode={startNode}
              endNode={endNode}
              activeRoute={activeRoute}
              visitedNodes={visitedNodes}
              mstEdges={mstEdges}
              mode={mode}
              simulationSpeed={simulationSpeed}
              onCanvasClick={handleAddNode}
              onNodeSelect={setSelectedNode}
              onAddRoad={handleAddRoad}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={handleDeleteEdge}
              onNodeDrag={handleNodeDrag}
              mapTheme={mapTheme}
              onToggleTheme={(theme) => {
                setMapTheme(theme);
              }}
              weather={weather}
              activeEvent={activeEvent}
              incidentActive={incidentActive}
              raceState={raceState}
              setRaceState={setRaceState}
              globalGreenTime={globalGreenTime}
              globalRedTime={globalRedTime}
              mapCenter={mapCenter}
              dashboardTheme={dashboardTheme}
              onToggleDashboardTheme={() => {
                const newTheme = dashboardTheme === 'dark' ? 'light' : 'dark';
                setDashboardTheme(newTheme);
                showToast(`Switched dashboard to ${newTheme === 'dark' ? 'Dark Operations' : 'Light Municipal'} theme`, 'success');
              }}
            />
          </div>
          
          {/* Map Legend */}
          <Legend />
        </div>

        {/* Right Side: Sidebar Controls */}
        <div style={{
          padding: '20px 20px 20px 0',
          height: '100%',
          overflow: 'hidden'
        }}>
          <Sidebar
            nodes={nodes}
            edges={edges}
            selectedNode={selectedNode}
            startNode={startNode}
            endNode={endNode}
            activeRoute={activeRoute}
            mode={mode}
            algorithm={algorithm}
            setAlgorithm={setAlgorithm}
            simulationSpeed={simulationSpeed}
            setMode={setMode}
            setStartNode={setStartNode}
            setEndNode={setEndNode}
            setSimulationSpeed={setSimulationSpeed}
            onFindRoute={handleFindRoute}
            onClearRoute={handleClearRoute}
            onTriggerRandomJams={handleTriggerRandomJams}
            onResetTraffic={handleResetTraffic}
            onCalculateMST={handleCalculateMST}
            onClearMST={handleClearMST}
            onResetMap={handleResetMap}
            isMstActive={mstEdges.length > 0}
            onGoBack={null}
            weather={weather}
            setWeather={setWeather}
            activeEvent={activeEvent}
            setActiveEvent={setActiveEvent}
            showToast={showToast}
            incidentActive={incidentActive}
            onToggleIncident={handleToggleIncident}
            raceState={raceState}
            setRaceState={setRaceState}
            globalGreenTime={globalGreenTime}
            setGlobalGreenTime={setGlobalGreenTime}
            globalRedTime={globalRedTime}
            setGlobalRedTime={setGlobalRedTime}
          />
        </div>

      </div>

      {/* Toast notifications display */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className={`toast-message toast-${toast.type}`}>
              <span className="toast-icon">
                {toast.type === 'error' ? '❌' : (toast.type === 'success' ? '✅' : 'ℹ️')}
              </span>
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
