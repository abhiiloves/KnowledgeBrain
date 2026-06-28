import React, { useEffect, useState } from 'react';
import { Network, GitCommit, AlertOctagon, ArrowRight, Layers, ShieldAlert } from 'lucide-react';

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
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Analyzing cross-document intelligence patterns...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Network size={28} color="#f97316" /> Cross-Time Pattern Intelligence (UNIQUE FEATURE)
        </h2>
        <p style={{ color: '#94a3b8' }}>
          Autonomous agent compares every ingested document against all historical records. System escalates patterns from Low (1 incident) to Medium (2 incidents) to CRITICAL (3+ incidents).
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

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: '600' }}>CONNECTED DOCUMENTS IN TIMELINE:</div>
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
          <Layers size={22} color="#06b6d4" /> "Connect the Dots" Cross-Document Matrix
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Visualizing systemic safety culture deviations across temporal operational boundaries.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {patterns.filter(p => p.occurrence_count >= 2).map((p, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f97316', marginBottom: '1rem' }}>
                Pattern Chain: {p.title} ({p.occurrence_count} Occurrences Detected)
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                {p.document_names?.map((docName, dIdx) => (
                  <React.Fragment key={dIdx}>
                    <div style={{ background: 'rgba(16, 22, 36, 0.9)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.4)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#06b6d4' }}>Incident {dIdx + 1}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc' }}>{docName}</div>
                    </div>
                    {dIdx < p.document_names.length - 1 && (
                      <ArrowRight size={20} color="#6366f1" />
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
