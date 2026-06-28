import React, { useEffect, useState } from 'react';
import { ShieldCheck, Download, AlertTriangle, CheckCircle, FileText, ChevronRight } from 'lucide-react';

import { API_BASE } from '../config';

export default function ComplianceDashboard() {
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditPkg, setAuditPkg] = useState(null);

  useEffect(() => {
    fetchCompliance();
  }, []);

  const fetchCompliance = async () => {
    try {
      const res = await fetch(`${API_BASE}/compliance`);
      if (res.ok) {
        const data = await res.json();
        setComplianceData(data);
      }
    } catch (err) {
      console.error('Error fetching compliance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAudit = async () => {
    try {
      const res = await fetch(`${API_BASE}/compliance/export-audit`);
      if (res.ok) {
        const data = await res.json();
        setAuditPkg(data);
        
        // Trigger download JSON file for user
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `KnowledgeBrain_Audit_Package_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (err) {
      console.error('Audit export failed:', err);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Evaluating regulatory compliance matrix...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={28} color="#22c55e" /> Compliance Intelligence Agent
          </h2>
          <p style={{ color: '#94a3b8' }}>
            Automatic mapping against industrial safety standards (OISD, ISO 27001, HIPAA, Factory Act, PESO). Clause breaches are auto-flagged.
          </p>
        </div>
        <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)' }} onClick={handleExportAudit}>
          <Download size={18} /> Export Audit Package
        </button>
      </div>

      {/* Overall Score Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
        <div>
          <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Overall Regulatory Compliance Rating</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#22c55e' }}>
            {complianceData?.overall_compliance_score || 100}%
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Total Identified Clause Gaps: <span style={{ color: '#ef4444', fontWeight: '700' }}>{complianceData?.gaps?.length || 0}</span></div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Automated chain-of-custody tracking active</div>
        </div>
      </div>

      {/* Per Standard Coverage Bars */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Regulatory Standard Coverage Breakdown</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {complianceData?.standards?.map((std) => (
            <div key={std.code} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: '700', fontSize: '1rem', color: '#f8fafc' }}>{std.code}</span>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginLeft: '0.5rem' }}>— {std.name}</span>
                </div>
                <span style={{ fontWeight: '700', color: std.compliance_score >= 80 ? '#22c55e' : '#f97316' }}>
                  {std.compliance_score}%
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${std.compliance_score}%`,
                    height: '100%',
                    background: std.compliance_score >= 80 ? 'linear-gradient(90deg, #22c55e, #06b6d4)' : 'linear-gradient(90deg, #f97316, #ef4444)',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {std.key_clauses?.map((kc, kIdx) => (
                  <span key={kIdx} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#cbd5e1' }}>
                    📌 {kc.clause}: {kc.description.substring(0, 50)}...
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flagged Clause Gaps List */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={20} color="#ef4444" /> Flagged Regulatory Clause Gaps ({complianceData?.gaps?.length || 0})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {complianceData?.gaps && complianceData.gaps.length > 0 ? (
            complianceData.gaps.map((gap, idx) => (
              <div key={idx} className="glass-card" style={{ borderLeft: '4px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: '700', color: '#f8fafc', fontSize: '0.95rem' }}>
                    {gap.standard_name} ({gap.clause_reference})
                  </span>
                  <span className="badge badge-critical">NON-COMPLIANT</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>{gap.gap_description}</p>
                <div style={{ fontSize: '0.75rem', color: '#06b6d4' }}>Document Evidence: {gap.filename}</div>
              </div>
            ))
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              No compliance gaps flagged. Upload files or run demo steps to evaluate compliance breaches!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
