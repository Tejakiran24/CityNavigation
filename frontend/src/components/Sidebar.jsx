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
  onGoBack // Trigger transition back to Landing page
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

  // Congestion index calculation (percentage of edges that are heavy or jammed)
  const getCongestionIndex = () => {
    if (edges.length === 0) return 0;
    const congestedCount = edges.filter(e => e.traffic === 'heavy' || e.traffic === 'jammed').length;
    return Math.round((congestedCount / edges.length) * 100);
  };

  const congestionIndex = getCongestionIndex();

  // Color mapping for congestion levels
  const getCongestionColor = (val) => {
    if (val < 25) return 'var(--traffic-clear)'; // Green
    if (val < 60) return 'var(--traffic-moderate)'; // Orange
    return 'var(--traffic-heavy)'; // Red
  };

  return (
    <div className="glass-panel" style={{
      width: '100%',
      maxWidth: '400px',
      height: '100%',
      maxHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      gap: '24px',
      overflowY: 'auto',
      borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="glow-text" style={{ fontSize: '1.5rem', color: 'var(--accent-cyan)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🚦</span> UrbanPulse
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
            CONGESTION TELEMETRY
          </p>
        </div>
        {/* Back to Home Button */}
        <button
          className="btn-secondary"
          onClick={onGoBack}
          style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '15px' }}
        >
          🏠 Landing
        </button>
      </div>

      {/* TACTICAL TAB SELECTOR */}
      <div style={{ 
        display: 'flex', 
        background: 'rgba(8, 12, 24, 0.65)', 
        border: '1px solid var(--border-glass)',
        padding: '3px',
        borderRadius: '10px',
        gap: '4px'
      }}>
        {[
          { id: 'navigation', label: 'Navigation', icon: '🧭' },
          { id: 'editor', label: 'Planner', icon: '🛠️' },
          { id: 'analytics', label: 'Telemetry', icon: '📊' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              background: activeTab === tab.id ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
              border: 'none',
              borderBottom: 'none',
              color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--color-text-secondary)',
              padding: '8px 2px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: activeTab === tab.id ? 'inset 0 0 8px rgba(6, 182, 212, 0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* 1. NAVIGATION/DIRECTIONS TAB */}
        {activeTab === 'navigation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '0.92rem', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
              Pathfinding Solver
            </h3>
            
            {/* Start Node Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Start Intersection</label>
              <select 
                value={startNode?.id || ''} 
                onChange={(e) => setStartNode(nodes.find(n => n.id === e.target.value) || null)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                <option value="">-- Select Origin Node --</option>
                {nodes.map(node => (
                  <option key={node.id} value={node.id}>
                    📍 {node.name} {startNode?.id === node.id ? '(Start)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* End Node Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Destination Intersection</label>
              <select 
                value={endNode?.id || ''} 
                onChange={(e) => setEndNode(nodes.find(n => n.id === e.target.value) || null)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                <option value="">-- Select Destination Node --</option>
                {nodes.map(node => (
                  <option key={node.id} value={node.id}>
                    🏁 {node.name} {endNode?.id === node.id ? '(End)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Algorithm Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Travel Path Priority</label>
              <select 
                value={algorithm} 
                onChange={(e) => setAlgorithm(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                <option value="traffic">Dynamic Congestion-Dodging Route</option>
                <option value="dijkstra">Traditional Shortest Distance Route</option>
                <option value="astar">Direct Eco-Scenic Route</option>
                <option value="osrm">Real-World OSRM Street Route</option>
              </select>
            </div>

            {/* Run Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                className="btn-primary"
                onClick={() => onFindRoute(algorithm)}
                disabled={!startNode || !endNode}
                style={{ flex: 2, padding: '12px', opacity: (!startNode || !endNode) ? 0.45 : 1, pointerEvents: (!startNode || !endNode) ? 'none' : 'auto' }}
              >
                Calculate Route
              </button>
              <button
                className="btn-secondary"
                onClick={onClearRoute}
                style={{ flex: 1, padding: '12px' }}
              >
                Clear
              </button>
            </div>

            {/* Route Stats Result Display (non-technical renames) */}
            {activeRoute && (
              <div 
                key={activeRoute.totalCost}
                className="metric-summary-container" 
                style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <h4 style={{ fontSize: '0.85rem', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>
                  Trip Analytics
                </h4>

                {/* Primary priority indicator */}
                <div className="metric-card" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🧭</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="metric-label">Route Mode</span>
                      <span className="metric-value" style={{ fontSize: '0.88rem', color: '#c084fc' }}>
                        {algorithm === 'traffic' ? 'Dynamic Traffic-Aware' : (algorithm === 'dijkstra' ? 'Shortest Path' : (algorithm === 'astar' ? 'Eco-Scenic' : 'OSRM Real-World'))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2-column metrics display */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="metric-card">
                    <span className="metric-icon">🛣️</span>
                    <div className="metric-details">
                      <span className="metric-label">Distance</span>
                      <span className="metric-value">
                        {activeRoute.totalCost ? formatDistance(activeRoute.totalCost) : '0 m'}
                      </span>
                    </div>
                  </div>

                  <div className="metric-card">
                    <span className="metric-icon">⏱️</span>
                    <div className="metric-details">
                      <span className="metric-label">Travel Time</span>
                      <span className="metric-value" style={{ color: 'var(--traffic-clear)' }}>
                        {formatDuration(activeRoute.duration || (activeRoute.totalCost ? activeRoute.totalCost / 11.11 : 0))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="metric-card" style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Intersections Transited:</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {activeRoute.path ? activeRoute.path.length : 0} nodes
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. MAP EDITOR & PLANNER TAB */}
        {activeTab === 'editor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <h3 style={{ fontSize: '0.92rem', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px', marginBottom: '14px' }}>
                Grid Editor Tools
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => setMode('select')}
                  style={{
                    backgroundColor: mode === 'select' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(8, 12, 24, 0.45)',
                    borderColor: mode === 'select' ? 'var(--accent-cyan)' : 'var(--border-glass)',
                    color: mode === 'select' ? 'var(--accent-cyan)' : '#f8fafc',
                    padding: '12px 6px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>🔍</span>
                  Inspect Node
                </button>
                <button
                  onClick={() => setMode('add-node')}
                  style={{
                    backgroundColor: mode === 'add-node' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(8, 12, 24, 0.45)',
                    borderColor: mode === 'add-node' ? 'var(--traffic-clear)' : 'var(--border-glass)',
                    color: mode === 'add-node' ? '#34d399' : '#f8fafc',
                    padding: '12px 6px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>➕</span>
                  Place Node
                </button>
                <button
                  onClick={() => setMode('add-edge')}
                  style={{
                    backgroundColor: mode === 'add-edge' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(8, 12, 24, 0.45)',
                    borderColor: mode === 'add-edge' ? 'var(--accent-cyan)' : 'var(--border-glass)',
                    color: mode === 'add-edge' ? 'var(--accent-cyan)' : '#f8fafc',
                    padding: '12px 6px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>🔗</span>
                  Link Nodes
                </button>
                <button
                  onClick={() => setMode('delete')}
                  style={{
                    backgroundColor: mode === 'delete' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(8, 12, 24, 0.45)',
                    borderColor: mode === 'delete' ? 'var(--traffic-heavy)' : 'var(--border-glass)',
                    color: mode === 'delete' ? '#f87171' : '#fca5a5',
                    padding: '12px 6px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>🗑️</span>
                  Removal Tool
                </button>
              </div>
            </div>

            {/* Simulation Speed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(8, 12, 24, 0.45)', border: '1px solid var(--border-glass)', padding: '14px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Simulation Speed</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
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
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
            </div>

            {/* Quick Simulation Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                Simulator Operations
              </h3>
              
              <button
                className="btn-secondary"
                onClick={onTriggerRandomJams}
                style={{ padding: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px' }}
              >
                💥 Simulate Road Bottlenecks
              </button>
              <button
                className="btn-secondary"
                onClick={onResetTraffic}
                style={{ padding: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px' }}
              >
                🟢 Reset Traffic Flows
              </button>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-secondary"
                  onClick={onCalculateMST}
                  style={{ flex: 1, padding: '10px', fontSize: '0.78rem', borderRadius: '8px', backgroundColor: isMstActive ? 'rgba(6, 182, 212, 0.08)' : '', borderColor: isMstActive ? 'var(--accent-cyan)' : '' }}
                >
                  🕸️ Synced Backbone
                </button>
                {isMstActive && (
                  <button
                    className="btn-secondary"
                    onClick={onClearMST}
                    style={{ padding: '10px', fontSize: '0.78rem', borderRadius: '8px' }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                className="btn-danger"
                onClick={onResetMap}
                style={{ padding: '10px', fontSize: '0.8rem', marginTop: '8px', borderRadius: '8px' }}
              >
                🔄 Restore Default Manhattan Grid
              </button>
            </div>
          </div>
        )}

        {/* 3. STATS/METRICS TAB */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '0.92rem', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px', marginBottom: '8px' }}>
              Network Diagnostics
            </h3>

            {/* Congestion Index Box */}
            <div className="metric-card" style={{
              padding: '18px 14px',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: '12px',
              borderLeft: `4px solid ${getCongestionColor(congestionIndex)}`,
              background: 'rgba(8, 12, 24, 0.45)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Gridlock Density</span>
                <span className="badge" style={{
                  background: congestionIndex < 25 ? 'rgba(16, 185, 129, 0.08)' : (congestionIndex < 60 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)'),
                  color: getCongestionColor(congestionIndex),
                  borderColor: getCongestionColor(congestionIndex)
                }}>
                  {congestionIndex < 25 ? 'Flowing' : (congestionIndex < 60 ? 'Moderate' : 'Heavy')}
                </span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: getCongestionColor(congestionIndex), fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
                {congestionIndex}%
              </div>
              {/* Custom Cyberpunk progress bar */}
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${congestionIndex}%`, height: '100%', background: getCongestionColor(congestionIndex), transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              </div>
            </div>

            {/* Network Count Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="metric-card" style={{ flexDirection: 'column', padding: '14px', alignItems: 'flex-start', background: 'rgba(8, 12, 24, 0.45)' }}>
                <div className="metric-value" style={{ fontSize: '1.4rem', color: 'var(--accent-cyan)', lineHeight: 1 }}>{nodes.length}</div>
                <div className="metric-label" style={{ fontSize: '0.62rem', marginTop: '4px' }}>Intersections</div>
              </div>
              <div className="metric-card" style={{ flexDirection: 'column', padding: '14px', alignItems: 'flex-start', background: 'rgba(8, 12, 24, 0.45)' }}>
                <div className="metric-value" style={{ fontSize: '1.4rem', color: 'var(--accent-cyan)', lineHeight: 1 }}>{edges.length}</div>
                <div className="metric-label" style={{ fontSize: '0.62rem', marginTop: '4px' }}>Roadway Edges</div>
              </div>
            </div>

            {/* Inspected Node Panel */}
            {selectedNode ? (
              <div className="metric-card" style={{
                flexDirection: 'column',
                alignItems: 'stretch',
                padding: '16px',
                borderLeft: '4px solid var(--accent-cyan)',
                background: 'rgba(168, 85, 247, 0.02)',
                gap: '12px'
              }}>
                <h4 style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Node Inspector
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Intersection name:</span>
                    <span style={{ fontWeight: 700, color: '#f8fafc' }}>{selectedNode.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Intersection ID:</span>
                    <span style={{ fontFamily: 'monospace', color: '#c084fc', fontSize: '0.75rem' }}>{selectedNode.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Coordinates:</span>
                    <span style={{ color: '#f8fafc', fontSize: '0.78rem', fontFamily: 'monospace' }}>Lat: {selectedNode.lat.toFixed(4)}, Lng: {selectedNode.lng.toFixed(4)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Traffic Signal:</span>
                    <span className="badge" style={{
                      background: selectedNode.trafficLight === 'red' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                      color: selectedNode.trafficLight === 'red' ? 'var(--traffic-heavy)' : 'var(--traffic-clear)',
                      borderColor: selectedNode.trafficLight === 'red' ? 'var(--traffic-heavy)' : 'var(--traffic-clear)',
                      padding: '2px 8px'
                    }}>
                      {selectedNode.trafficLight.toUpperCase()} ({selectedNode.lightTimer || 5}s cycle)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', fontSize: '0.75rem', border: '1px dashed var(--border-glass)', borderRadius: '10px' }}>
                Select an intersection on the map in "Inspect Node" mode to audit traffic timers and node logs.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569', fontFamily: 'monospace' }}>
        <span>UrbanPulse v1.2</span>
        <span>Made with 💜</span>
      </div>
    </div>
  );
}
