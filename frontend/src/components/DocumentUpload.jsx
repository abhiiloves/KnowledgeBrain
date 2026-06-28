import React, { useState, useEffect } from 'react';
import { UploadCloud, File, CheckCircle, Cpu, Tag, Bot, Send, Sparkles } from 'lucide-react';
import { API_BASE } from '../config';

export default function DocumentUpload() {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [latestDoc, setLatestDoc] = useState(null);

  // Instant Chat integrated right inside Document Studio
  const [chatQuery, setChatQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [instantAnswer, setInstantAnswer] = useState(null);

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
    setInstantAnswer(null);
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

  const handleInstantChat = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim() || chatLoading) return;

    setChatLoading(true);
    const q = chatQuery;
    setChatQuery('');

    try {
      const res = await fetch(`${API_BASE}/copilot/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, session_id: 'default' }),
      });

      if (res.ok) {
        const data = await res.json();
        setInstantAnswer(data);
      }
    } catch (err) {
      console.error('Instant query error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Knowledge Studio & Ingestion Agent</h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
          Ingest industrial documents (PDF, DOCX, XLSX, images) and talk to them instantly without switching screens.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', border: '2px dashed rgba(99, 102, 241, 0.4)', background: 'rgba(16, 22, 36, 0.6)' }}>
        <UploadCloud size={56} color="#6366f1" style={{ marginBottom: '1.25rem' }} />
        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>Upload Industrial Documents Here</h3>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
          Supports PDF, DOCX, XLSX, PNG/JPG photos, MSG email archives (Unlimited storage & continuous intelligence)
        </p>
        
        <label className="btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', padding: '1rem 2rem', fontSize: '1.05rem', borderRadius: '12px' }}>
          Select Document to Ingest
          <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg,.msg,.eml" />
        </label>

        {uploading && (
          <div style={{ marginTop: '2rem', color: '#06b6d4', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <Cpu className="spin-icon" size={24} /> Autonomous Agent parsing content, extracting entity tags, and indexing vector memory...
          </div>
        )}
      </div>

      {/* Instant AI Question Bar right on Upload Screen */}
      <div className="glass-panel" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Bot size={24} color="#6366f1" /> Instant Document AI Query (No Tab Switching Needed)
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
          Ask any question directly about your uploaded files right here:
        </p>

        <form onSubmit={handleInstantChat} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            value={chatQuery}
            onChange={(e) => setChatQuery(e.target.value)}
            placeholder="Ask AI about this document or root causes (e.g. Is incident mein kya hua tha?)..."
            style={{
              flex: 1,
              background: 'rgba(16, 22, 36, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              color: 'white',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button type="submit" className="btn-primary" disabled={chatLoading} style={{ padding: '0 1.75rem' }}>
            <Send size={20} /> Ask AI
          </button>
        </form>

        {chatLoading && (
          <div style={{ color: '#06b6d4', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <Sparkles className="spin-icon" size={18} /> AI synthesizing answer from your uploaded files...
          </div>
        )}

        {instantAnswer && (
          <div className="glass-card" style={{ marginTop: '1.25rem', background: 'rgba(16, 22, 36, 0.95)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #6366f1' }}>
            <div style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: '700', marginBottom: '0.5rem', uppercase: 'true' }}>AI INSTANT INTELLIGENCE ANSWER:</div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '1rem', color: '#f8fafc' }}>{instantAnswer.content}</div>
          </div>
        )}
      </div>

      {/* Latest Ingestion Extraction Preview */}
      {latestDoc && (
        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(34, 197, 94, 0.4)' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <CheckCircle size={22} /> Ingestion & Entity Extraction Complete: {latestDoc.filename}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="glass-card">
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Auto-Detected Domain</div>
              <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4', padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}>{latestDoc.domain}</span>
            </div>
            
            <div className="glass-card">
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Equipment Tags Found</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {latestDoc.entities_json?.equipment_tags?.map((tag, idx) => (
                  <span key={idx} style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Regulatory References</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {latestDoc.entities_json?.regulatory_references?.map((ref, idx) => (
                  <span key={idx} style={{ background: 'rgba(249, 115, 22, 0.2)', color: '#fdba74', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Knowledge Repository List */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <File size={22} color="#6366f1" /> Stored Document Memory Repository ({documents.length} Files Indexed)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {documents.map((doc) => (
            <div key={doc.id} className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc' }}>{doc.filename}</h4>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Domain: <span style={{ color: '#06b6d4' }}>{doc.domain}</span> | Ingested: {doc.upload_date?.substring(0, 10)}
                  </div>
                </div>
                <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '0.3rem 0.75rem' }}>VECTOR INDEXED</span>
              </div>

              {doc.entities_json?.root_causes && doc.entities_json.root_causes.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.2rem' }}>Extracted Root Cause:</div>
                  <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{doc.entities_json.root_causes[0]}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
