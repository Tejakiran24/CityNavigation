import React, { useState } from 'react';

export default function Sidebar({
  nodes,
  edges,
  selectedNode,
  startNode,
  endNode,
  activeRoute,
  mode,
  algorithm,
  setAlgorithm,
  simulationSpeed,
  setMode,
  setStartNode,
  setEndNode,
  setSimulationSpeed,
  onFindRoute,
  onClearRoute,
  onTriggerRandomJams,
  onResetTraffic,
  onCalculateMST,
  onClearMST,
  onResetMap,
  isMstActive,
  onGoBack,
  weather,
  setWeather,
  activeEvent,
  setActiveEvent,
  showToast,
  incidentActive,
  onToggleIncident,
  raceState,
  setRaceState,
  globalGreenTime,
  setGlobalGreenTime,
  globalRedTime,
  setGlobalRedTime
}) {
  const [activeTab, setActiveTab] = useState('navigation');

  const formatDistance = (m) => {
    if (m >= 1000) {
      return (m / 1000).toFixed(2) + ' km';
    }
    return Math.round(m) + ' m';
  };

  const formatDuration = (s) => {
    const mins = Math.floor(s / 60);
    const secs = Math.round(s % 60);
    if (mins > 0) {
      return `${mins} min ${secs} sec`;
    }
    return `${secs} sec`;
  };

  const getCongestionIndex = () => {
    if (edges.length === 0) return 0;
    const congestedCount = edges.filter(e => e.traffic === 'heavy' || e.traffic === 'jammed').length;
    return Math.round((congestedCount / edges.length) * 100);
  };

  const congestionIndex = getCongestionIndex();

  const getCongestionColor = (val) => {
    if (val < 25) return 'var(--traffic-clear)';
    if (val < 60) return 'var(--traffic-moderate)';
    return 'var(--traffic-heavy)';
  };

  // Sandbox calculation metrics
  const cycleTime = globalGreenTime + globalRedTime + 3; // +3s yellow
  const greenRatio = globalGreenTime / cycleTime;
  const flowRate = Math.round(greenRatio * 42); // simulated vehicles per minute
  const efficiency = Math.round((flowRate / 30) * 100);

  const handleStartRace = () => {
    if (!startNode || !endNode) {
      showToast('Select Origin and Target intersections first!', 'error');
      return;
    }
    if (raceState === 'running') return;
    setRaceState('running');
    showToast('Solver race started. Animating path routes on map.', 'info');
  };

  return (
    <div className="glass-panel" style={{
      width: '100%',
      maxWidth: '380px',
      height: '100%',
      maxHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      gap: '16px',
      overflowY: 'auto',
      borderLeft: '1px solid var(--border-clean)',
      backgroundColor: 'var(--bg-panel)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      borderRadius: '6px'
    }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-clean)', paddingBottom: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)', fontWeight: 800 }}>
            TMD Console
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.62rem', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
            SECTOR CONTROL ROOM DECK
          </p>
        </div>
      </div>

      {/* 4-TAB TACTICAL SELECTOR */}
      <div style={{ 
        display: 'flex', 
        background: 'var(--bg-primary)', 
        border: '1px solid var(--border-clean)',
        padding: '2px',
        borderRadius: '6px',
        gap: '2px'
      }}>
        {[
          { id: 'navigation', label: 'Solver', icon: '🧭' },
          { id: 'editor', label: 'Planner', icon: '🛠️' },
          { id: 'sandbox', label: 'Signal', icon: '🚥' },
          { id: 'telemetry', label: 'Telemetry', icon: '📊' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              background: activeTab === tab.id ? 'var(--bg-secondary)' : 'transparent',
              border: activeTab === tab.id ? '1px solid var(--border-clean)' : 'none',
              color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--color-text-secondary)',
              padding: '6px 0',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.7rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: activeTab === tab.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* TAB 1: NAVIGATION ROUTE */}
        {activeTab === 'navigation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-clean)', paddingBottom: '4px' }}>
              Route Solver
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Origin Node</label>
              <select 
                value={startNode?.id || ''} 
                onChange={(e) => setStartNode(nodes.find(n => n.id === e.target.value) || null)}
                style={{ width: '100%', fontSize: '0.78rem', padding: '6px 8px', borderRadius: '4px' }}
              >
                <option value="">-- Choose Origin Intersection --</option>
                {nodes.map(node => (
                  <option key={node.id} value={node.id}>
                    📍 {node.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Target Node</label>
              <select 
                value={endNode?.id || ''} 
                onChange={(e) => setEndNode(nodes.find(n => n.id === e.target.value) || null)}
                style={{ width: '100%', fontSize: '0.78rem', padding: '6px 8px', borderRadius: '4px' }}
              >
                <option value="">-- Choose Destination --</option>
                {nodes.map(node => (
                  <option key={node.id} value={node.id}>
                    🏁 {node.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Pathfinding Strategy</label>
              <select 
                value={algorithm} 
                onChange={(e) => setAlgorithm(e.target.value)}
                style={{ width: '100%', fontSize: '0.78rem', padding: '6px 8px', borderRadius: '4px' }}
              >
                <option value="traffic">Dynamic Congestion-Bypassing Route</option>
                <option value="dijkstra">Traditional Shortest Distance Route</option>
                <option value="astar">Eco-Scenic Shortest Vector</option>
                <option value="osrm">Real-World OSRM Street Route</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <button
                className="btn-primary"
                onClick={() => onFindRoute(algorithm)}
                disabled={!startNode || !endNode}
                style={{ flex: 2, padding: '8px', fontSize: '0.78rem', borderRadius: '4px', opacity: (!startNode || !endNode) ? 0.45 : 1, pointerEvents: (!startNode || !endNode) ? 'none' : 'auto' }}
              >
                Solve Route
              </button>
              <button
                className="btn-secondary"
                onClick={onClearRoute}
                style={{ flex: 1, padding: '8px', fontSize: '0.78rem', borderRadius: '4px' }}
              >
                Clear
              </button>
            </div>

            {activeRoute && (
              <div className="metric-summary-container" style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Route Diagnostics
                </h4>

                <div className="metric-card" style={{ padding: '6px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.92rem' }}>🧭</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="metric-label">Routing Logic</span>
                      <span className="metric-value" style={{ fontSize: '0.78rem', color: 'var(--accent-blue)' }}>
                        {algorithm === 'traffic' ? 'Dynamic Traffic-Aware' : (algorithm === 'dijkstra' ? 'Shortest Path' : (algorithm === 'astar' ? 'Eco-Scenic' : 'OSRM Real-World'))}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div className="metric-card" style={{ padding: '6px 8px' }}>
                    <span className="metric-icon" style={{ fontSize: '1rem' }}>🛣️</span>
                    <div className="metric-details">
                      <span className="metric-label">Distance</span>
                      <span className="metric-value" style={{ fontSize: '0.82rem' }}>
                        {activeRoute.totalCost ? formatDistance(activeRoute.totalCost) : '0 m'}
                      </span>
                    </div>
                  </div>

                  <div className="metric-card" style={{ padding: '6px 8px' }}>
                    <span className="metric-icon" style={{ fontSize: '1rem' }}>⏱️</span>
                    <div className="metric-details">
                      <span className="metric-label">Travel Time</span>
                      <span className="metric-value" style={{ color: 'var(--traffic-clear)', fontSize: '0.82rem' }}>
                        {formatDuration(activeRoute.duration || (activeRoute.totalCost ? activeRoute.totalCost / 11.11 : 0))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="metric-card" style={{ padding: '6px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Intersections Crossed:</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                      {activeRoute.path ? activeRoute.path.length : 0} nodes
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EDIT PLANNER TOOLS */}
        {activeTab === 'editor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-clean)', paddingBottom: '4px' }}>
              Infrastructure Planner
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { id: 'select', label: 'Inspect Node', icon: '🔍', color: 'var(--accent-blue)' },
                { id: 'add-node', label: 'Place Node', icon: '➕', color: 'var(--traffic-clear)' },
                { id: 'add-edge', label: 'Link Node', icon: '🔗', color: 'var(--accent-blue)' },
                { id: 'delete', label: 'Remove Element', icon: '🗑️', color: 'var(--traffic-heavy)' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setMode(t.id)}
                  style={{
                    backgroundColor: mode === t.id ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                    borderColor: mode === t.id ? t.color : 'var(--border-clean)',
                    color: mode === t.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    padding: '8px 4px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    borderRadius: '4px'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Sim Speed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-clean)', padding: '10px', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 700 }}>Simulation Speed</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'monospace' }}>
                  {simulationSpeed === 0 ? 'PAUSED' : `${simulationSpeed}x`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="0.5"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
              />
            </div>

            {/* Operations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Operational Overrides</span>
              
              <button
                className="btn-secondary"
                onClick={onTriggerRandomJams}
                style={{ padding: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', borderRadius: '4px' }}
              >
                ⚠️ Inject Roadway Congestion
              </button>
              <button
                className="btn-secondary"
                onClick={onResetTraffic}
                style={{ padding: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', borderRadius: '4px' }}
              >
                🟢 Flush Traffic Density
              </button>
              
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="btn-secondary"
                  onClick={onCalculateMST}
                  style={{ flex: 1, padding: '6px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: isMstActive ? 'var(--bg-primary)' : '', borderColor: isMstActive ? 'var(--accent-blue)' : '' }}
                >
                  🕸️ Compute Grid Backbone
                </button>
                {isMstActive && (
                  <button
                    className="btn-secondary"
                    onClick={onClearMST}
                    style={{ padding: '6px', fontSize: '0.75rem', borderRadius: '4px' }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                className="btn-danger"
                onClick={onResetMap}
                style={{ padding: '6px', fontSize: '0.75rem', marginTop: '2px', borderRadius: '4px' }}
              >
                🔄 Restore Sector Layout
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SIGNAL CONTROL */}
        {activeTab === 'sandbox' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* 1. Traffic Light Timers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--border-clean)', paddingBottom: '10px' }}>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>🚥 Signal Control Deck</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Green Signal timer</span>
                  <span style={{ fontWeight: 700, color: 'var(--traffic-clear)', fontFamily: 'monospace' }}>{globalGreenTime}s</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="40" 
                  value={globalGreenTime} 
                  onChange={(e) => setGlobalGreenTime(parseInt(e.target.value))} 
                  style={{ width: '100%', accentColor: 'var(--traffic-clear)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Red Signal timer</span>
                  <span style={{ fontWeight: 700, color: 'var(--traffic-heavy)', fontFamily: 'monospace' }}>{globalRedTime}s</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="40" 
                  value={globalRedTime} 
                  onChange={(e) => setGlobalRedTime(parseInt(e.target.value))} 
                  style={{ width: '100%', accentColor: 'var(--traffic-heavy)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-clean)', padding: '8px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.7rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Cycle Duration (G+R+3s Yellow):</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{cycleTime}s</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Throughput Estimate:</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'monospace' }}>~{flowRate} veh/min</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Clearance Performance:</span>
                  <span style={{ fontWeight: 700, color: efficiency > 60 ? 'var(--traffic-clear)' : (efficiency > 35 ? 'var(--traffic-moderate)' : 'var(--traffic-heavy)'), fontFamily: 'monospace' }}>{efficiency}%</span>
                </div>
              </div>
            </div>

            {/* 2. Accident Detour Challenge */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px solid var(--border-clean)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>🚧 Incident Feed</h4>
                <button
                  onClick={() => onToggleIncident(!incidentActive)}
                  style={{
                    backgroundColor: incidentActive ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-primary)',
                    borderColor: incidentActive ? '#fca5a5' : 'var(--border-clean)',
                    color: incidentActive ? '#ef4444' : 'var(--color-text-secondary)',
                    padding: '3px 8px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {incidentActive ? 'Incident simulated 🚨' : 'Simulate Collision'}
                </button>
              </div>

              <p style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', lineHeight: 1.35 }}>
                Renders a crash lane block near Kapila Theertham Junction. Dijkstra Solver queues through it, while Traffic-Aware detours.
              </p>

              {incidentActive && (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '4px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.7rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-clean)', paddingBottom: '2px' }}>
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Dijkstra Queue routing:</span>
                    <span style={{ color: '#f87171', fontFamily: 'monospace', fontWeight: 700 }}>28 min (Gridlocked)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--traffic-clear)', fontWeight: 'bold' }}>Traffic-Aware Bypass:</span>
                    <span style={{ color: '#34d399', fontFamily: 'monospace', fontWeight: 700 }}>13 min (Flowing)</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Algorithm Battle on Map */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>🏆 Pathfinding Strategy Race</h4>
              <p style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', lineHeight: 1.35 }}>
                Animate colored markers representing Dijkstra (Red), A* (Purple), and Traffic-Aware (Blue) racing across the street grid.
              </p>
              
              <button
                onClick={handleStartRace}
                disabled={raceState === 'running'}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  borderRadius: '4px',
                  backgroundColor: raceState === 'running' ? '#64748b' : 'var(--accent-dark)'
                }}
              >
                {raceState === 'running' ? '🏎️ Solver Race In Progress...' : '🏁 Run Solvers Race'}
              </button>

              {raceState === 'finished' && (
                <div style={{ textAlign: 'center', padding: '4px', background: 'rgba(22, 163, 74, 0.1)', border: '1px solid rgba(22, 163, 74, 0.25)', color: 'var(--traffic-clear)', fontSize: '0.75rem', borderRadius: '4px', fontWeight: 700 }}>
                  👑 Winner: Traffic-Aware (Detoured past the crash!)
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: TELEMETRY DIAGNOSTICS & EVENTS */}
        {activeTab === 'telemetry' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Weather & Civic Events Console */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--border-clean)', paddingBottom: '10px' }}>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>🌦️ Environmental Conditions</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>WEATHER OVERRIDES</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => { setWeather('sunny'); showToast('Weather cleared. Standard speeds active.', 'success'); }}
                    style={{ flex: 1, padding: '6px', fontSize: '0.72rem', borderRadius: '4px', backgroundColor: weather === 'sunny' ? 'var(--bg-primary)' : 'var(--bg-secondary)', borderColor: weather === 'sunny' ? 'var(--accent-blue)' : 'var(--border-clean)', color: weather === 'sunny' ? 'var(--accent-blue)' : 'var(--color-text-secondary)' }}
                  >
                    ☀️ Clear Sky
                  </button>
                  <button
                    onClick={() => { setWeather('rain'); showToast('Heavy precipitation active. Muting speeds by 30%.', 'info'); }}
                    style={{ flex: 1, padding: '6px', fontSize: '0.72rem', borderRadius: '4px', backgroundColor: weather === 'rain' ? 'var(--bg-primary)' : 'var(--bg-secondary)', borderColor: weather === 'rain' ? 'var(--accent-blue)' : 'var(--border-clean)', color: weather === 'rain' ? 'var(--accent-blue)' : 'var(--color-text-secondary)' }}
                  >
                    🌧️ Heavy Rain
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>CIVIC INCIDENT OVERLAYS</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => {
                      const next = activeEvent === 'festival' ? 'none' : 'festival';
                      setActiveEvent(next);
                      showToast(next === 'festival' ? 'Leela Mahal Circle closed for Festival!' : 'Festival ended.', 'info');
                    }}
                    style={{ flex: 1, padding: '6px', fontSize: '0.72rem', borderRadius: '4px', backgroundColor: activeEvent === 'festival' ? 'var(--bg-primary)' : 'var(--bg-secondary)', borderColor: activeEvent === 'festival' ? 'var(--accent-blue)' : 'var(--border-clean)', color: activeEvent === 'festival' ? 'var(--accent-blue)' : 'var(--color-text-secondary)' }}
                  >
                    🎪 Street Festival
                  </button>
                  <button
                    onClick={() => {
                      const next = activeEvent === 'vip' ? 'none' : 'vip';
                      setActiveEvent(next);
                      showToast(next === 'vip' ? 'VIP Convoy active. Automatic signal priority enabled!' : 'VIP Convoy completed.', 'success');
                    }}
                    style={{ flex: 1, padding: '6px', fontSize: '0.72rem', borderRadius: '4px', backgroundColor: activeEvent === 'vip' ? 'var(--bg-primary)' : 'var(--bg-secondary)', borderColor: activeEvent === 'vip' ? 'var(--accent-blue)' : 'var(--border-clean)', color: activeEvent === 'vip' ? 'var(--accent-blue)' : 'var(--color-text-secondary)' }}
                  >
                    🚘 VIP Convoy Wave
                  </button>
                </div>
              </div>
            </div>

            {/* Gridlock index diagnostics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px solid var(--border-clean)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Congestion Level</span>
                <span className="badge" style={{
                  background: congestionIndex < 25 ? '#dcfce7' : (congestionIndex < 60 ? '#fef3c7' : '#fee2e2'),
                  color: getCongestionColor(congestionIndex),
                  borderColor: getCongestionColor(congestionIndex),
                  padding: '2px 6px',
                  fontSize: '0.62rem'
                }}>
                  {congestionIndex < 25 ? 'Flowing' : (congestionIndex < 60 ? 'Moderate' : 'Heavy')}
                </span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: getCongestionColor(congestionIndex), fontFamily: 'monospace', lineHeight: 1 }}>
                {congestionIndex}%
              </div>
              <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${congestionIndex}%`, height: '100%', background: getCongestionColor(congestionIndex), transition: 'width 0.5s ease' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '2px' }}>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-clean)', padding: '4px 6px', borderRadius: '4px', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.55rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Intersections</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace' }}>{nodes.length}</span>
                </div>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-clean)', padding: '4px 6px', borderRadius: '4px', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.55rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Roadways</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace' }}>{edges.length}</span>
                </div>
              </div>
            </div>

            {/* Inspected Node Panel */}
            {selectedNode ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '10px',
                borderLeft: '3px solid var(--accent-blue)',
                background: 'var(--bg-primary)',
                borderRadius: '4px',
                gap: '6px'
              }}>
                <h4 style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Node Inspector
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-clean)', paddingBottom: '2px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Intersection Name:</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{selectedNode.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-clean)', paddingBottom: '2px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>ID Reference:</span>
                    <span style={{ fontFamily: 'monospace', color: '#c084fc', fontSize: '0.72rem' }}>{selectedNode.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Traffic Signal:</span>
                    <span className="badge" style={{
                      background: selectedNode.trafficLight === 'red' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(22, 163, 74, 0.12)',
                      color: selectedNode.trafficLight === 'red' ? 'var(--traffic-heavy)' : 'var(--traffic-clear)',
                      borderColor: selectedNode.trafficLight === 'red' ? 'var(--traffic-heavy)' : 'var(--traffic-clear)',
                      padding: '1px 6px',
                      fontSize: '0.62rem'
                    }}>
                      {selectedNode.trafficLight.toUpperCase()} ({selectedNode.lightTimer || 5}s cycle)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px', color: 'var(--color-text-muted)', fontSize: '0.68rem', border: '1px dashed var(--border-clean)', borderRadius: '6px' }}>
                Select an intersection on the map in "Inspect Node" mode to audit traffic timers and node logs.
              </div>
            )}

          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={{ borderTop: '1px solid var(--border-clean)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b', fontFamily: 'monospace' }}>
        <span>TMD Console v1.4</span>
        <span>Sector TMD</span>
      </div>
    </div>
  );
}
