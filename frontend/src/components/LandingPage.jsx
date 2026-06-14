import React, { useState, useEffect, useRef } from 'react';

export default function LandingPage({ 
  onLaunch, 
  weather, 
  setWeather, 
  activeEvent, 
  setActiveEvent, 
  showToast 
}) {
  // Live ticking telemetry values
  const [congestion, setCongestion] = useState(38);
  const [activeVehicles, setActiveVehicles] = useState(247);
  const [avgDelay, setAvgDelay] = useState(1.7);

  // Traffic Light Sandbox States
  const [greenTime, setGreenTime] = useState(15);
  const [redTime, setRedTime] = useState(20);

  // Detour Challenge States
  const [selectedRouteOption, setSelectedRouteOption] = useState('dijkstra');

  // Algorithm Battle States
  const [raceState, setRaceState] = useState('idle'); // 'idle' | 'running' | 'finished'
  const [dijkstraPos, setDijkstraPos] = useState({ x: 30, y: 150 });
  const [astarPos, setAstarPos] = useState({ x: 30, y: 150 });
  const [trafficPos, setTrafficPos] = useState({ x: 30, y: 150 });
  const [raceWinner, setRaceWinner] = useState(null);

  const raceTimerRef = useRef(null);

  // 1. Ticking Telemetry Loop
  useEffect(() => {
    const ticker = setInterval(() => {
      setCongestion(prev => {
        const delta = (Math.random() - 0.5) * 2;
        const base = weather === 'rain' ? 52 : (activeEvent === 'festival' ? 64 : 38);
        return Math.max(10, Math.min(95, Math.round(base + delta)));
      });
      setActiveVehicles(prev => {
        const delta = Math.floor((Math.random() - 0.5) * 8);
        const base = weather === 'rain' ? 180 : (activeEvent === 'vip' ? 210 : 247);
        return Math.max(50, Math.round(base + delta));
      });
      setAvgDelay(prev => {
        const delta = (Math.random() - 0.5) * 0.2;
        const base = weather === 'rain' ? 2.6 : (activeEvent === 'festival' ? 3.4 : 1.7);
        return parseFloat(Math.max(0.5, base + delta).toFixed(1));
      });
    }, 1200);

    return () => clearInterval(ticker);
  }, [weather, activeEvent]);

  // 2. Intersection Sandbox Calculations
  const cycleTime = greenTime + redTime + 3; // +3s yellow
  const greenRatio = greenTime / cycleTime;
  const flowRate = Math.round(greenRatio * 42); // simulated vehicles per minute
  const efficiency = Math.round((flowRate / 30) * 100);

  // 3. Algorithm Battle Animation Loop
  const handleStartRace = () => {
    if (raceState === 'running') return;
    setRaceState('running');
    setRaceWinner(null);
    setDijkstraPos({ x: 30, y: 150 });
    setAstarPos({ x: 30, y: 150 });
    setTrafficPos({ x: 30, y: 150 });

    let step = 0;
    const maxSteps = 150;

    raceTimerRef.current = setInterval(() => {
      step += 1;
      
      // Dijkstra: Shortest path but gets stuck in the congested middle section (x: 150 to 220)
      setDijkstraPos(prev => {
        let nextX = prev.x;
        let nextY = prev.y;
        if (step < 40) {
          nextX += 3.5; // moves quickly initially
        } else if (step >= 40 && step < 110) {
          nextX += 0.35; // stuck in traffic block!
        } else {
          nextX += 4.5; // clears jam, speeds to end
        }
        return { x: Math.min(nextX, 470), y: nextY };
      });

      // A*: Heuristic path, moves at a consistent moderate pace
      setAstarPos(prev => {
        let nextX = prev.x + 2.8;
        return { x: Math.min(nextX, 470), y: 150 };
      });

      // Traffic-Aware: Bypasses the center congestion via a detour path (curves upward and back down)
      setTrafficPos(prev => {
        let nextX = prev.x + 3.8; // moves fast and detours
        let nextY = 150;
        if (nextX > 80 && nextX < 380) {
          // Detour arc upward
          const midX = 230;
          nextY = 150 - Math.sin(((nextX - 80) / 300) * Math.PI) * 70;
        }
        return { x: Math.min(nextX, 470), y: nextY };
      });

      if (step >= maxSteps) {
        clearInterval(raceTimerRef.current);
        setRaceState('finished');
        setRaceWinner('Traffic-Aware Route');
        showToast('Algorithm race completed! Traffic-Aware detours won the challenge.', 'success');
      }
    }, 40);
  };

  useEffect(() => {
    return () => {
      if (raceTimerRef.current) clearInterval(raceTimerRef.current);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#020617',
      color: '#f8fafc',
      fontFamily: "'Inter', monospace",
      paddingBottom: '80px',
      position: 'relative'
    }}>
      
      {/* 1. TOP HEADER OPERATIONS BAR */}
      <header style={{
        background: 'rgba(8, 12, 24, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '14px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🚦</span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
            Urban<span style={{ color: 'var(--accent-cyan)' }}>Pulse</span>
          </span>
          <span style={{
            fontSize: '0.65rem',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            color: 'var(--accent-cyan)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontWeight: 700,
            marginLeft: '10px'
          }}>
            CONSOLE STATUS: MONITORING
          </span>
        </div>
        
        <button
          onClick={onLaunch}
          className="btn-primary"
          style={{
            fontSize: '0.8rem',
            padding: '8px 20px',
            borderRadius: '20px',
            fontWeight: 700
          }}
        >
          Enter Map Editor
        </button>
      </header>

      {/* 2. MAIN HUB LAYOUT */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        
        {/* HERO HEADER */}
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          paddingBottom: '30px'
        }}>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '2.8rem',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(90deg, #f8fafc, var(--accent-cyan))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Urban Traffic Command Center
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', maxWidth: '750px', lineHeight: 1.5 }}>
            A dense sandbox playground demonstrating traffic congestion mitigation, real-time signal calculations, and routing race dynamics across seed networks. Adjust controllers below and watch live systems adjust.
          </p>
        </section>

        {/* SECTION 1: LIVE COUNTERS (SHOW, DON'T TELL) */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          
          <div className="telemetry-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Congestion</span>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: congestion > 50 ? 'var(--traffic-heavy)' : 'var(--traffic-clear)', fontFamily: 'monospace' }}>
              {congestion}%
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${congestion}%`, height: '100%', background: congestion > 50 ? 'var(--traffic-heavy)' : 'var(--traffic-clear)', transition: 'width 0.8s ease' }} />
            </div>
          </div>

          <div className="telemetry-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicles Active</span>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
              {activeVehicles}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Updating sensors in real-time</span>
          </div>

          <div className="telemetry-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signals Synced</span>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-purple)', fontFamily: 'monospace' }}>
              9 / 9
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--traffic-clear)' }}>● Synchronized light cycles</span>
          </div>

          <div className="telemetry-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Delay</span>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: avgDelay > 2.5 ? 'var(--traffic-moderate)' : 'var(--traffic-clear)', fontFamily: 'monospace' }}>
              {avgDelay}m
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Estimated commute threshold</span>
          </div>

        </section>

        {/* SECTION 2: ASYMMETRICAL INTERACTIVE WIDGETS GRID */}
        <section style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px', alignItems: 'stretch' }}>
          
          {/* LEFT: ALGORITHM BATTLE RACE */}
          <div className="telemetry-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', color: '#f8fafc' }}>🏆 Live Pathfinding Algorithm Battle</h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Watch cars traverse a grid under different path optimization frameworks.</p>
              </div>
              <button 
                onClick={handleStartRace} 
                disabled={raceState === 'running'}
                className="btn-primary" 
                style={{ fontSize: '0.72rem', padding: '6px 16px', borderRadius: '15px' }}
              >
                {raceState === 'running' ? 'Competing...' : 'Start Race'}
              </button>
            </div>

            {/* SVG Race Visualizer */}
            <div style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '8px', border: '1px solid var(--border-glass)', padding: '20px', position: 'relative' }}>
              
              <svg width="100%" height="240" viewBox="0 0 500 300">
                {/* Grid guidelines */}
                <path d="M 0,50 L 500,50 M 0,150 L 500,150 M 0,250 L 500,250 M 100,0 L 100,300 M 250,0 L 250,300 M 400,0 L 400,300" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                
                {/* Traffic Jam Blockage Marker (Dijkstra track) */}
                <rect x="160" y="130" width="70" height="40" rx="4" fill="rgba(239, 68, 68, 0.15)" stroke="var(--traffic-heavy)" strokeWidth="1" strokeDasharray="3, 3" />
                <text x="195" y="154" fill="var(--traffic-heavy)" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">🚧 COLLISION</text>
                
                {/* Detour track outline (Traffic-Aware) */}
                <path d="M 30,150 Q 230,50 470,150" fill="none" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="4" strokeDasharray="4, 4" />
                <text x="230" y="70" fill="var(--accent-cyan)" fontSize="8" opacity="0.6" textAnchor="middle">DETOUR ROUTE</text>

                {/* Dijkstra Shortest Track line */}
                <path d="M 30,150 L 470,150" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="4" />

                {/* Start & End Nodes */}
                <circle cx="30" cy="150" r="10" fill="#10b981" />
                <text x="30" y="180" fill="#10b981" fontSize="9" textAnchor="middle" fontWeight="bold">START</text>

                <circle cx="470" cy="150" r="10" fill="#ef4444" />
                <text x="470" y="180" fill="#ef4444" fontSize="9" textAnchor="middle" fontWeight="bold">END</text>

                {/* Running Cars */}
                {/* 1. Dijkstra (Red Dot) */}
                <circle cx={dijkstraPos.x} cy={dijkstraPos.y - 12} r="6" fill="#ef4444" />
                <text x={dijkstraPos.x} y={dijkstraPos.y - 22} fill="#ef4444" fontSize="7" fontFamily="monospace" textAnchor="middle">Dijkstra</text>

                {/* 2. A* (Purple Dot) */}
                <circle cx={astarPos.x} cy={astarPos.y} r="6" fill="var(--accent-purple)" />
                <text x={astarPos.x} y={astarPos.y - 8} fill="var(--accent-purple)" fontSize="7" fontFamily="monospace" textAnchor="middle">A* Search</text>

                {/* 3. Traffic-Aware (Cyan Dot) */}
                <circle cx={trafficPos.x} cy={trafficPos.y + 12} r="6" fill="var(--accent-cyan)" />
                <text x={trafficPos.x} y={trafficPos.y + 24} fill="var(--accent-cyan)" fontSize="7" fontFamily="monospace" textAnchor="middle">Traffic-Aware</text>
              </svg>

              {raceWinner && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid var(--accent-cyan)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  color: 'var(--accent-cyan)',
                  fontWeight: 700
                }}>
                  👑 Winner: {raceWinner} (Detoured around collision!)
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '10px', borderRadius: '6px' }}>
                <span style={{ color: '#ef4444' }}>● Dijkstra path:</span>
                <p style={{ marginTop: '4px', color: 'var(--color-text-secondary)' }}>Fails detour check. Stuck in Broadway collision.</p>
              </div>
              <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.15)', padding: '10px', borderRadius: '6px' }}>
                <span style={{ color: '#c084fc' }}>● A* path:</span>
                <p style={{ marginTop: '4px', color: 'var(--color-text-secondary)' }}>Calculates heuristic straight vectors. Consistent time.</p>
              </div>
              <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.15)', padding: '10px', borderRadius: '6px' }}>
                <span style={{ color: 'var(--accent-cyan)' }}>● Traffic-Aware:</span>
                <p style={{ marginTop: '4px', color: 'var(--color-text-secondary)' }}>Senses congestion weight. Sweeps outer bypass road.</p>
              </div>
            </div>
          </div>

          {/* RIGHT: INTERACTIVE TRAFFIC SIGNAL SANDBOX */}
          <div className="telemetry-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', color: '#f8fafc' }}>🚥 Traffic Signal Sandbox</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Tune intersection timers to regulate simulated flow rate.</p>
            </div>

            {/* Slider 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Green Signal duration</span>
                <span style={{ fontWeight: 700, color: 'var(--traffic-clear)', fontFamily: 'monospace' }}>{greenTime}s</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="40" 
                value={greenTime} 
                onChange={(e) => setGreenTime(parseInt(e.target.value))} 
                style={{ width: '100%', accentColor: 'var(--traffic-clear)', cursor: 'pointer' }}
              />
            </div>

            {/* Slider 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Red Signal duration</span>
                <span style={{ fontWeight: 700, color: '#ef4444', fontFamily: 'monospace' }}>{redTime}s</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="40" 
                value={redTime} 
                onChange={(e) => setRedTime(parseInt(e.target.value))} 
                style={{ width: '100%', accentColor: '#ef4444', cursor: 'pointer' }}
              />
            </div>

            {/* Calculator Output */}
            <div style={{ 
              background: 'rgba(8, 12, 24, 0.75)', 
              border: '1px solid rgba(255, 255, 255, 0.05)', 
              borderRadius: '8px', 
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Total Signal Cycle:</span>
                <span style={{ fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>{cycleTime} seconds</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Flow rate:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>~{flowRate} vehicles/min</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Intersection Efficiency:</span>
                <span style={{ 
                  fontWeight: 700, 
                  color: efficiency > 60 ? 'var(--traffic-clear)' : (efficiency > 35 ? 'var(--traffic-moderate)' : 'var(--traffic-heavy)'),
                  fontFamily: 'monospace'
                }}>
                  {efficiency}%
                </span>
              </div>
            </div>
          </div>

        </section>

        {/* SECTION 3: DETOUR CHALLENGE & INCIDENT SIMULATOR */}
        <section className="telemetry-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', color: '#f8fafc' }}>🚧 Operational Incident Detour Challenge</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Toggle the paths below to see how traffic-aware path weights bypass gridlocks.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => { setSelectedRouteOption('dijkstra'); showToast('Dijkstra route selects standard physical shortest length', 'info'); }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                background: selectedRouteOption === 'dijkstra' ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                borderColor: selectedRouteOption === 'dijkstra' ? 'var(--traffic-heavy)' : 'var(--border-glass)',
                color: selectedRouteOption === 'dijkstra' ? '#fca5a5' : 'var(--color-text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem'
              }}
            >
              Standard Shortest Path (Dijkstra)
            </button>
            <button 
              onClick={() => { setSelectedRouteOption('traffic'); showToast('Traffic-Aware detours around Wall Street congestion', 'success'); }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                background: selectedRouteOption === 'traffic' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                borderColor: selectedRouteOption === 'traffic' ? 'var(--traffic-clear)' : 'var(--border-glass)',
                color: selectedRouteOption === 'traffic' ? '#34d399' : 'var(--color-text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem'
              }}
            >
              Traffic-Aware Detoured Path
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Selected Routing Logic</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: selectedRouteOption === 'dijkstra' ? '#ef4444' : '#10b981' }}>
                {selectedRouteOption === 'dijkstra' ? 'Traditional Dijkstra' : 'Intelligent Delay-Weighted'}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {selectedRouteOption === 'dijkstra' 
                  ? 'Routes traffic down Broadway Blvd (shortest raw length). Ignores the double lane collision block on Chinatown junction, locking the vehicle in queue.'
                  : 'Senses that Wall Street traffic is jammed. Modifies edge weights and routes cars on a bypass detour via Greenwich Village Gate, dodging the collision.'
                }
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '20px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Travel Time:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: selectedRouteOption === 'dijkstra' ? 'var(--traffic-heavy)' : 'var(--traffic-clear)', fontFamily: 'monospace' }}>
                  {selectedRouteOption === 'dijkstra' ? '28 mins' : '13 mins'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Congestion Factor:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: selectedRouteOption === 'dijkstra' ? '#f87171' : '#34d399', fontFamily: 'monospace' }}>
                  {selectedRouteOption === 'dijkstra' ? 'HIGH (1.8x Delay)' : 'NONE (Optimal Flow)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>Path Decision:</span>
                <span className="badge" style={{
                  background: selectedRouteOption === 'dijkstra' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                  color: selectedRouteOption === 'dijkstra' ? 'var(--traffic-heavy)' : 'var(--traffic-clear)',
                  borderColor: selectedRouteOption === 'dijkstra' ? 'var(--traffic-heavy)' : 'var(--traffic-clear)',
                }}>
                  {selectedRouteOption === 'dijkstra' ? '⚠ GRIDLOCKED' : '✓ OPTIMIZED'}
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 4: ENVIRONMENT CONDITIONS & EVENT CONTROLLERS */}
        <section className="telemetry-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', color: '#f8fafc' }}>🌦️ Global Weather & Event Controllers</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Toggling these modifiers updates the simulation parameters of the live Leaflet visualizer.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Weather Modifier */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>WEATHER CONDITIONS</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setWeather('sunny'); showToast('Weather clear. Vehicles traveling at standard speed limits.', 'success'); }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    background: weather === 'sunny' ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                    borderColor: weather === 'sunny' ? 'var(--accent-cyan)' : 'var(--border-glass)',
                    color: weather === 'sunny' ? 'var(--accent-cyan)' : 'var(--color-text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.8rem'
                  }}
                >
                  ☀️ Clear Sunny
                </button>
                <button
                  onClick={() => { setWeather('rain'); showToast('Rainstorm active. Braking distance doubled. Vehicle speeds reduced by 30%.', 'info'); }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    background: weather === 'rain' ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                    borderColor: weather === 'rain' ? 'var(--accent-cyan)' : 'var(--border-glass)',
                    color: weather === 'rain' ? 'var(--accent-cyan)' : 'var(--color-text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.8rem'
                  }}
                >
                  🌧️ Rainstorm
                </button>
              </div>
            </div>

            {/* Event Modifier */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>CIVIC EVENTS</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setActiveEvent(activeEvent === 'festival' ? 'none' : 'festival'); showToast(activeEvent === 'festival' ? 'Festival completed. Normal lanes restored.' : 'Chinatown Festival active. Chinatown Square closed. Surrounding streets congested.', 'info'); }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    background: activeEvent === 'festival' ? 'rgba(168, 85, 247, 0.08)' : 'transparent',
                    borderColor: activeEvent === 'festival' ? 'var(--accent-purple)' : 'var(--border-glass)',
                    color: activeEvent === 'festival' ? '#c084fc' : 'var(--color-text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.8rem'
                  }}
                >
                  🎪 Chinatown Festival
                </button>
                <button
                  onClick={() => { setActiveEvent(activeEvent === 'vip' ? 'none' : 'vip'); showToast(activeEvent === 'vip' ? 'VIP convoy completed. Normal signal timers restored.' : 'VIP Convoy active. Traffic lights turn green automatically on the route.', 'success'); }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    background: activeEvent === 'vip' ? 'rgba(168, 85, 247, 0.08)' : 'transparent',
                    borderColor: activeEvent === 'vip' ? 'var(--accent-purple)' : 'var(--border-glass)',
                    color: activeEvent === 'vip' ? '#c084fc' : 'var(--color-text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.8rem'
                  }}
                >
                  🚘 VIP Convoy wave
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER BAR */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        width: '100%',
        padding: '30px 24px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: '#475569',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '40px'
      }}>
        <span>© {new Date().getFullYear()} UrbanPulse Command Deck</span>
        <span>Made with 💜</span>
      </footer>

    </div>
  );
}
