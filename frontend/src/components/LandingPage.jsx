import React, { useState, useEffect } from 'react';

export default function LandingPage({ onLaunch }) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [tickerOffset, setTickerOffset] = useState(0);

  // Auto-scrolling ticker text simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerOffset(prev => (prev - 1) % 600);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Track scroll position to show/hide the Scroll to Top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight - 80,
      behavior: 'smooth'
    });
  };

  const telemetryLines = [
    "FEED: OSRM LIVE DRIVING API CONNECTED [OK]",
    "GRID: RADIAL MANHATTAN RADAR INITIALIZED [OK]",
    "SIMULATOR: 30 VEHICLES COMMENCING SEGMENT STEERING",
    "METRIC ENGINES: DIJKSTRA, A-STAR, AND TRAFFIC-WEIGHT HYDRATED",
    "SIGNAL CONTROLLER: RED/GREEN LIGHT INTERVAL TIMERS COMPILED"
  ];

  return (
    <div style={{
      minHeight: '100vh',
      color: '#f8fafc',
      position: 'relative',
      overflowX: 'hidden',
      fontFamily: "'Inter', sans-serif",
      scrollBehavior: 'smooth'
    }}>
      {/* 1. FUTURISTIC BACKGROUND ORBS & GLOWS */}
      <div className="floating-orb-1" style={{
        position: 'absolute',
        top: '10%',
        left: '-10vw',
        width: '40vw',
        height: '40vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, rgba(6, 182, 212, 0) 70%)',
        filter: 'blur(120px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      <div className="floating-orb-2" style={{
        position: 'absolute',
        top: '40%',
        right: '-10vw',
        width: '45vw',
        height: '45vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0) 70%)',
        filter: 'blur(120px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* OPERATIONS STREAM BANNER */}
      <div style={{
        width: '100%',
        background: 'rgba(6, 182, 212, 0.04)',
        borderBottom: '1px solid rgba(6, 182, 212, 0.1)',
        padding: '6px 0',
        fontSize: '0.68rem',
        fontFamily: 'monospace',
        color: 'var(--accent-cyan)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'inline-block',
          transform: `translateX(${tickerOffset}px)`,
          transition: 'transform 0.05s linear'
        }}>
          {telemetryLines.join(" \u00a0\u00a0\u2022\u00a0\u00a0 ")} \u00a0\u00a0\u2022\u00a0\u00a0 {telemetryLines.join(" \u00a0\u00a0\u2022\u00a0\u00a0 ")}
        </div>
      </div>

      {/* HEADER BAR */}
      <header style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>🚦</span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Urban<span style={{ color: 'var(--accent-cyan)' }}>Pulse</span>
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '20px',
            padding: '2px 10px',
            fontSize: '0.65rem',
            color: '#34d399',
            fontWeight: 700,
            marginLeft: '12px'
          }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'active-route-pulse 1s infinite alternate' }} />
            GRID ENGINGE ONLINE
          </div>
        </div>
        <button
          onClick={onLaunch}
          className="btn-primary"
          style={{
            fontSize: '0.8rem',
            padding: '10px 24px',
            borderRadius: '20px',
            fontWeight: 700
          }}
        >
          Launch Control Deck
        </button>
      </header>

      {/* CORE CONTAINER */}
      <main style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '40px 24px',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '120px'
      }}>
        
        {/* HERO SECTION */}
        <section style={{
          minHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: '28px',
          position: 'relative'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: '30px',
            padding: '6px 16px',
            fontSize: '0.75rem',
            color: 'var(--accent-cyan)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            🛰️ GRAPH TELEMETRY COMMAND CONSOLE
          </div>
          
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '4.2rem',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #f8fafc 20%, var(--accent-cyan) 60%, var(--accent-purple) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            maxWidth: '900px'
          }}>
            City Traffic Optimization Console
          </h1>
          
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--color-text-secondary)',
            maxWidth: '650px',
            lineHeight: 1.65
          }}>
            Analyze road connectivity, compute dynamic travel times, and synchronize traffic controls. A professional operations visualizer utilizing real curved street geometries.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginTop: '15px' }}>
            <button
              onClick={onLaunch}
              className="btn-primary"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.1rem',
                fontWeight: 700,
                padding: '16px 42px',
                borderRadius: '50px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              Enter Live Simulator ⚡
            </button>
          </div>

          {/* Mouse Scroll indicator */}
          <div 
            onClick={handleScrollDown}
            style={{
              position: 'absolute',
              bottom: '-30px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              animation: 'bounce 2s infinite'
            }}
          >
            <div style={{
              width: '24px',
              height: '38px',
              borderRadius: '12px',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              justifyContent: 'center',
              padding: '6px'
            }}>
              <div style={{
                width: '4px',
                height: '8px',
                borderRadius: '2px',
                backgroundColor: 'var(--accent-cyan)',
                animation: 'scroll-dot 1.5s infinite'
              }} />
            </div>
            <span style={{ fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Telemetry Specifications
            </span>
          </div>
        </section>

        {/* SECTION 2: GRID ARCHITECTURE DETAILS */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontFamily: "'Outfit', sans-serif", color: '#f8fafc' }}>
              The Grid Architecture
            </h2>
            <div style={{ width: '40px', height: '3px', background: 'var(--accent-cyan)', margin: '12px auto 0' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
            <div className="telemetry-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>📍</span>
                <h4 style={{ fontSize: '1.15rem', color: '#f8fafc' }}>Intersections (Nodes)</h4>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: '1.65' }}>
                Modeled as spatial coordinate matrices. Supports dynamic traffic controller lights with cycle timers, regulating simulated vehicle flow at grid crossings.
              </p>
            </div>
            <div className="telemetry-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>🛣️</span>
                <h4 style={{ fontSize: '1.15rem', color: '#f8fafc' }}>Roadways (Edges)</h4>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: '1.65' }}>
                Directed road segments hydrating curved geometries. Integrates speed thresholds, lane counts, and live traffic load factors to simulate realistic bottlenecks.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: PATH SELECTION METHODS */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontFamily: "'Outfit', sans-serif", color: '#f8fafc' }}>
              Path Optimization Models
            </h2>
            <div style={{ width: '40px', height: '3px', background: 'var(--accent-cyan)', margin: '12px auto 0' }} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {[
              {
                title: "Dynamic Congestion-Dodging",
                color: "#10b981",
                icon: "⚡",
                desc: "Calculates operational travel delays based on speed limits and live gridlock densities, dynamically steering transits onto clear paths."
              },
              {
                title: "Traditional Shortest Distance",
                color: "#64748b",
                icon: "📏",
                desc: "Calculates segments strictly using flat geographic road lengths, representing standard, non-congested route routing."
              },
              {
                title: "Direct Eco-Scenic",
                color: "#a855f7",
                icon: "🍃",
                desc: "Uses straight-line heuristic distance calculations directed at target nodes, reducing search calculations for direct paths."
              }
            ].map((method, idx) => (
              <div
                key={idx}
                className="telemetry-card"
                style={{
                  borderLeft: `4px solid ${method.color}`,
                  padding: '28px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{method.icon}</span>
                  <h4 style={{ fontSize: '1.1rem', color: '#f8fafc' }}>{method.title}</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{method.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: SPANNING TREE BACKBONE */}
        <section className="telemetry-card" style={{
          padding: '48px 36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem' }}>🕸️</div>
          <h2 style={{ fontSize: '1.8rem', fontFamily: "'Outfit', sans-serif" }}>
            Optimal Backbone Topology
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', maxWidth: '750px', lineHeight: '1.7' }}>
            Calculates an optimal grid layout connecting every node with minimum layout length using Kruskal's spanning tree algorithm. Essential for minimizing the layout cost of central utility trunk lines and synchronized signal line installations.
          </p>
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
        marginTop: '100px',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '40px'
      }}>
        <span>© {new Date().getFullYear()} UrbanPulse Command Deck</span>
        <span>Made with 💜</span>
      </footer>

      {/* CSS Bounce & Scroll Dot Animations */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
          60% { transform: translateY(-4px); }
        }
        @keyframes scroll-dot {
          0% { opacity: 0; transform: translateY(-4px); }
          50% { opacity: 1; transform: translateY(4px); }
          100% { opacity: 0; transform: translateY(8px); }
        }
      `}</style>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(10, 17, 32, 0.95)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            color: 'var(--accent-cyan)',
            cursor: 'pointer',
            fontSize: '1rem',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            transition: 'transform 0.2s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          ↑
        </button>
      )}
    </div>
  );
}
