import React from 'react';

export default function GuidePage({ onBack }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--color-text-primary)',
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Container */}
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* Header navigation bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-clean)', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--color-text-primary)', fontFamily: "'Outfit', sans-serif" }}>Planning Guide</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Learn how UrbanPulse handles city transit calculations</p>
          </div>
          <button className="btn-secondary" onClick={onBack} style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '6px' }}>
            🏠 Return to Dashboard
          </button>
        </div>

        {/* Section 1: The Core Network Elements */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', borderBottom: '1px solid var(--border-clean)', paddingBottom: '8px' }}>
            🏙️ The Anatomy of a City Grid
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            Every transit map is mathematically modeled as a web of <strong>Intersections (Nodes)</strong> and <strong>Roadways (Edges)</strong>. 
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-clean)' }}>
              <h4 style={{ color: 'var(--color-text-primary)', marginBottom: '6px' }}>🚥 Intersections</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                Key connection points. Each contains a dynamic traffic signal that cycles between red, yellow, and green. Red lights halt active simulated vehicles, creating natural delay factors.
              </p>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-clean)' }}>
              <h4 style={{ color: 'var(--color-text-primary)', marginBottom: '6px' }}>🛣️ Roadways</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                The links between points. Defined by length (meters), speed limits (km/h), lane count (1 to 3), and live congestion values (ranging from clear to full gridlock).
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Path Calculations */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', borderBottom: '1px solid var(--border-clean)', paddingBottom: '8px' }}>
            🧭 How Travel Paths are Decided
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            UrbanPulse offers three routing priorities to calculate directions from one intersection to another:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Dijkstra */}
            <div style={{ borderLeft: '4px solid var(--traffic-heavy)', paddingLeft: '16px' }}>
              <h4 style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem', marginBottom: '4px' }}>Traditional Shortest Distance Route</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                Determines the route solely based on geographic physical road lengths. It always selects the shortest path on the map, even if that road is entirely blocked by construction or traffic jams.
              </p>
            </div>

            {/* A* */}
            <div style={{ borderLeft: '4px solid var(--accent-blue)', paddingLeft: '16px' }}>
              <h4 style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem', marginBottom: '4px' }}>Direct Eco-Scenic Route</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                An optimized search that targets the straight-line coordinate direction of the destination. It ignores side-turns and recalculations, finding a direct vector toward the target to reduce fuel consumption.
              </p>
            </div>

            {/* Traffic-Aware */}
            <div style={{ borderLeft: '4px solid var(--traffic-clear)', paddingLeft: '16px' }}>
              <h4 style={{ color: 'var(--color-text-primary)', fontSize: '0.95rem', marginBottom: '4px' }}>Dynamic Congestion-Dodging Route</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                Our recommended traffic-aware routing. It calculates the live estimated travel time for every road block using the following traffic weight formula:
              </p>
              <div style={{
                background: 'var(--bg-primary)',
                padding: '12px',
                borderRadius: '6px',
                margin: '8px 0',
                border: '1px solid var(--border-clean)',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: 'var(--traffic-clear)',
                textAlign: 'center',
                fontWeight: 700
              }}>
                Travel Delay = (Road Distance / Speed Limit) * Congestion Factor / Lane Factor
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                If a roadway has heavy gridlock, its "Travel Delay" spikes. The engine will steer vehicles onto longer, clear bypass streets, saving travel time.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: MST grid backbone */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', borderBottom: '1px solid var(--border-clean)', paddingBottom: '8px' }}>
            🕸️ Designing the Optimal Grid Backbone
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            When constructing municipal services, laying down synchronized fiber optic networks for traffic lights, or building utility pipes, budget and road length must be minimized.
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            The <strong>Optimal Grid Backbone</strong> uses a mathematical tree calculation (Kruskal's algorithm) to connect every intersection in the city using the minimum overall length of roadway possible, completely eliminating redundant loops.
          </p>
        </div>

        {/* Footer info bar */}
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '20px' }}>
          UrbanPulse Planning Guide • v1.2
        </div>
      </div>
    </div>
  );
}
