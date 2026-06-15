import React, { useState, useEffect } from 'react';

export default function PresetsPage({
  currentNodes,
  currentEdges,
  onLoadMap,
  onBack
}) {
  const [presets, setPresets] = useState([]);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch presets on load
  const fetchPresets = async () => {
    try {
      const response = await fetch('/api/presets');
      if (!response.ok) throw new Error('Failed to load presets');
      const data = await response.json();
      setPresets(data);
    } catch (err) {
      console.error('Error fetching presets:', err);
      setErrorMsg('Could not establish connection to the templates database.');
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  // Save current grid layout
  const handleSaveCurrentMap = async (e) => {
    e.preventDefault();
    if (!saveName.trim()) {
      alert('Please enter a name for the map layout.');
      return;
    }

    if (currentNodes.length === 0) {
      alert('Cannot save an empty map layout. Please draw some intersections first!');
      return;
    }

    try {
      const response = await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveName,
          description: saveDesc || 'User created custom city network configuration.',
          nodes: currentNodes,
          edges: currentEdges
        })
      });

      if (!response.ok) throw new Error('Save template API failed');
      const data = await response.json();
      
      setSaveName('');
      setSaveDesc('');
      setSaveStatus('Template layout saved successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
      fetchPresets(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to save layout to server.');
    }
  };

  // Delete custom preset
  const handleDeletePreset = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this custom template?')) return;

    try {
      const response = await fetch(`/api/presets/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Delete template failed');
      fetchPresets(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Could not delete template.');
    }
  };

  // Load preset to simulator
  const handleLoadPreset = (preset) => {
    onLoadMap(preset.nodes, preset.edges);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--color-text-primary)',
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* Header navigation bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-clean)', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--color-text-primary)', fontFamily: "'Outfit', sans-serif" }}>Map Presets Gallery</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Select a preloaded layout or save your own custom designs</p>
          </div>
          <button className="btn-secondary" onClick={onBack} style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '6px' }}>
            🏠 Return to Dashboard
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* TWO SECTION SPLIT: SAVE CURRENT & PRESETS VIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Section 1: Save Current Grid Layout */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: "'Outfit', sans-serif" }}>
              💾 Save Current Active Layout
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              You have <strong>{currentNodes.length} intersections</strong> and <strong>{currentEdges.length} roadways</strong> active on your dashboard. Save them as a template layout to load later.
            </p>

            <form onSubmit={handleSaveCurrentMap} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 240px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Template Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rush Hour Loop, Downtown Bypass"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '2 1 320px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Short Description</label>
                <input
                  type="text"
                  placeholder="Describe your grid layout and traffic design patterns..."
                  value={saveDesc}
                  onChange={(e) => setSaveDesc(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '10px 24px', flex: '0 1 auto', borderRadius: '6px' }}>
                Save Layout
              </button>
            </form>

            {saveStatus && (
              <div style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '12px', fontWeight: 600 }}>
                ✓ {saveStatus}
              </div>
            )}
          </div>

          {/* Section 2: Presets Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', fontFamily: "'Outfit', sans-serif" }}>
              🗺️ Preloaded & Custom Templates
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {presets.map(preset => {
                const isPreloaded = preset.id === 'preset-tirupati' || preset.id === 'preset-expressway' || preset.id === 'preset-bottleneck';
                
                return (
                  <div
                    key={preset.id}
                    className="glass-panel"
                    style={{
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      cursor: 'pointer',
                      borderLeft: isPreloaded ? '4px solid var(--accent-dark)' : '4px solid var(--accent-blue)',
                      background: 'var(--bg-panel)',
                      transition: 'transform 0.2s ease, border-color 0.2s ease'
                    }}
                    onClick={() => handleLoadPreset(preset)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {/* Header title */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>{preset.name}</h4>
                        <span style={{ fontSize: '0.68rem', color: isPreloaded ? 'var(--color-text-muted)' : 'var(--accent-blue)', textTransform: 'uppercase', fontWeight: 700 }}>
                          {isPreloaded ? 'System Grid' : 'Custom Saved'}
                        </span>
                      </div>
                      {!isPreloaded && (
                        <button
                          onClick={(e) => handleDeletePreset(e, preset.id)}
                          className="btn-danger"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                          title="Remove custom template"
                        >
                          🗑️ Remove
                        </button>
                      )}
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, flex: 1 }}>
                      {preset.description}
                    </p>

                    {/* Stats summary */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-clean)', paddingTop: '10px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      <span>📍 {preset.nodes ? preset.nodes.length : 0} Intersections</span>
                      <span>🛣️ {preset.edges ? preset.edges.length : 0} Roadways</span>
                    </div>

                    <button
                      className="btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadPreset(preset);
                      }}
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', borderRadius: '6px' }}
                    >
                      Load Into Simulator
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer info bar */}
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '20px' }}>
          UrbanPulse Saved Map Gallery • v1.2
      </div>
    </div>
  </div>
);
}
