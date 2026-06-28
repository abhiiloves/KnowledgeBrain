import React, { useEffect, useState } from 'react';
import { FileText, Network, AlertTriangle, ShieldCheck, ArrowUpRight, Activity } from 'lucide-react';

import { API_BASE } from '../config';

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading Platform Intelligence...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>KnowledgeBrain Intelligence Command</h2>
            <p style={{ color: '#94a3b8', maxWidth: '700px' }}>
              Autonomous cross-document entity extraction, real-time temporal pattern detection, and industrial regulatory compliance mapping engine.
            </p>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('upload')}>
            <FileText size={18} /> Ingest New Document
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '1rem', borderRadius: '12px', color: '#6366f1' }}>
            <FileText size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Documents Indexed</div>
            <div style={{ fontSize: '2rem', fontWeight: '800' }}>{stats?.total_documents || 0}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '1rem', borderRadius: '12px', color: '#06b6d4' }}>
            <Network size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Knowledge Graph Nodes</div>
            <div style={{ fontSize: '2rem', fontWeight: '800' }}>{stats?.knowledge_nodes_count || 0}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', color: '#ef4444' }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Critical Active Patterns</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: stats?.critical_alerts_count > 0 ? '#ef4444' : '#f8fafc' }}>
              {stats?.critical_alerts_count || 0}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '1rem', borderRadius: '12px', color: '#22c55e' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Regulatory Compliance Score</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#22c55e' }}>{stats?.overall_compliance_score || 100}%</div>
          </div>
        </div>
      </div>

      {/* Content Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Active Alerts Feed */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} color="#f97316" /> Pattern Alerts Feed
            </h3>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => onNavigate('patterns')}>
              View All <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats?.recent_alerts && stats.recent_alerts.length > 0 ? (
              stats.recent_alerts.map((alert) => (
                <div key={alert.id} className="glass-card" style={{ borderLeft: `4px solid ${alert.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{alert.title}</span>
                    <span className={`badge badge-${alert.severity.toLowerCase()}`}>
                      {alert.badge} {alert.severity} ({alert.occurrence_count} Incidents)
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{alert.summary}</p>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Spanning documents: {alert.document_names?.join(', ')}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                No active critical patterns detected yet. Upload documents in the Document Ingestion tab to run continuous analysis.
              </div>
            )}
          </div>
        </div>

        {/* Recent Ingested Documents */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="#06b6d4" /> Ingested Intelligence Pipeline
            </h3>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => onNavigate('upload')}>
              Manage Files <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {stats?.recent_documents && stats.recent_documents.length > 0 ? (
              stats.recent_documents.map((doc) => (
                <div key={doc.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{doc.filename}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Domain: <span style={{ color: '#06b6d4' }}>{doc.domain}</span> | Indexed: {doc.upload_date?.substring(0, 10)}
                    </div>
                  </div>
                  <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    INDEXED
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                Knowledge base is ready for continuous ingestion.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
