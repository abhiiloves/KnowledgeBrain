import React, { useEffect, useState } from 'react';
import { Network, GitCommit, ArrowRight, Layers, ShieldAlert, Cpu } from 'lucide-react';
import { API_BASE } from '../config';

export default function PatternIntelligence() {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      const res = await fetch(`${API_BASE}/patterns`);
      if (res.ok) {
        const data = await res.json();
        setPatterns(data);
      }
    } catch (err) {
      console.error('Error fetching patterns:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Analyzing equipment failure chains & cross-document patterns...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Network size={28} color="#f97316" /> Cross-Document Pattern Intelligence & Equipment Failure Matrix
        </h2>
        <p style={{ color: '#94a3b8' }}>
          Autonomous engine tracks equipment status, failure chains, and recurring procedural bypasses across historical timelines.
        </p>
      </div>

      {/* Pattern Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {patterns.map((pat) => (
          <div key={pat.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: `6px solid ${pat.severity === 'CRITICAL' ? '#ef4444' : pat.severity === 'MEDIUM' ? '#f97316' : '#eab308'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span className={`badge badge-${pat.severity.toLowerCase()}`}>
                {pat.badge} {pat.severity} SEVERITY
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#6366f1', background: 'rgba(99, 102, 241, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                {pat.occurrence_count} Connected Incidents
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem' }}>{pat.title}</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: '1.5' }}>{pat.summary}</p>

            {pat.equipment_involved && pat.equipment_involved.length > 0 && (
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>Equipment Involved:</span>
                {pat.equipment_involved.map((eq, eIdx) => (
                  <span key={eIdx} style={{ fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Cpu size={12} /> {eq}
                  </span>
                ))}
              </div>
            )}

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: '600' }}>CONNECTED INCIDENT FILES:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {pat.document_names?.map((dName, dIdx) => (
                  <div key={dIdx} style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <GitCommit size={14} color="#06b6d4" /> {dName}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '0.6rem', borderRadius: '6px', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <ShieldAlert size={16} /> {pat.recommendation}
            </div>
          </div>
        ))}
      </div>

      {/* Connect The Dots Visualizer */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={22} color="#06b6d4" /> "Connect the Dots" Failure Chain Linkage Matrix
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Visualizing similar equipment malfunctions and procedural lapses linked across different files.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {patterns.filter(p => p.occurrence_count >= 2).map((p, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f97316', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Failure Link: {p.title}</span>
                <span className="badge badge-medium">{p.occurrence_count} Incidents Linked</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                {p.document_names?.map((docName, dIdx) => (
                  <React.Fragment key={dIdx}>
                    <div style={{ background: 'rgba(16, 22, 36, 0.9)', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.4)', textAlign: 'center', flex: 1, minWidth: '220px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: '600' }}>Incident {dIdx + 1} File</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f8fafc', margin: '0.2rem 0' }}>{docName}</div>
                      {p.equipment_involved && p.equipment_involved[dIdx] && (
                        <div style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>Equipment: {p.equipment_involved[dIdx]}</div>
                      )}
                    </div>
                    {dIdx < p.document_names.length - 1 && (
                      <div style={{ textAlign: 'center' }}>
                        <ArrowRight size={22} color="#6366f1" />
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Similar Malfunction</div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
