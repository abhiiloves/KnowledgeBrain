import React, { useState, useEffect } from 'react';
import { UploadCloud, File, CheckCircle, Cpu, Tag, AlertCircle } from 'lucide-react';

import { API_BASE } from '../config';

export default function DocumentUpload() {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [latestDoc, setLatestDoc] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setLatestDoc(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setLatestDoc(result.document);
        fetchDocuments();
      } else {
        alert(`Upload failed with status ${res.status}. Please check backend server.`);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert(`Upload connection failed: Unable to reach backend at ${API_BASE}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Universal Document Ingestion Agent</h2>
        <p style={{ color: '#94a3b8' }}>
          Continuously ingest PDF, DOCX, XLSX, images, or email archives. Entities and root causes are automatically extracted and indexed into vector memory.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', border: '2px dashed rgba(99, 102, 241, 0.4)', background: 'rgba(16, 22, 36, 0.5)' }}>
        <UploadCloud size={48} color="#6366f1" style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Drag & Drop Industrial Documents Here</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Supported formats: PDF, DOCX, XLSX, PNG/JPG, MSG/EML (Unlimited files & auto-detected domains)
        </p>
        
        <label className="btn-primary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
          Choose Local File
          <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg,.msg,.eml" />
        </label>

        {uploading && (
          <div style={{ marginTop: '1.5rem', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Cpu className="spin-icon" size={20} /> Agent extracting entities, analyzing domain, and vector indexing...
          </div>
        )}
      </div>

      {/* Latest Ingestion Extraction Preview */}
      {latestDoc && (
        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(34, 197, 94, 0.4)' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CheckCircle size={20} /> Ingestion & Entity Extraction Complete: {latestDoc.filename}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="glass-card">
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Auto-Detected Domain</div>
              <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4' }}>{latestDoc.domain}</span>
            </div>
            
            <div className="glass-card">
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Equipment Tags Found</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {latestDoc.entities_json?.equipment_tags?.map((tag, idx) => (
                  <span key={idx} style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Regulatory References</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {latestDoc.entities_json?.regulatory_references?.map((ref, idx) => (
                  <span key={idx} style={{ background: 'rgba(249, 115, 22, 0.2)', color: '#fdba74', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Knowledge Repository List */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <File size={20} color="#6366f1" /> Persistent Document Memory Repository ({documents.length} Files Stored)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {documents.map((doc) => (
            <div key={doc.id} className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc' }}>{doc.filename}</h4>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Domain: <span style={{ color: '#06b6d4' }}>{doc.domain}</span> | Ingested: {doc.upload_date?.substring(0, 10)}
                  </div>
                </div>
                <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>VECTOR INDEXED</span>
              </div>

              {doc.entities_json?.root_causes && doc.entities_json.root_causes.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.2rem' }}>Extracted Root Cause:</div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{doc.entities_json.root_causes[0]}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
