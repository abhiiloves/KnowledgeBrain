import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, CheckCircle2, Link2, HelpCircle, AlertCircle } from 'lucide-react';

import { API_BASE } from '../config';

export default function CopilotChat() {
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/copilot/history/default`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  const handleSend = async (queryToSend = null) => {
    const q = queryToSend || inputQuery;
    if (!q.trim() || loading) return;

    setInputQuery('');
    setLoading(true);

    // Optimistic UI update for user message
    const userMsg = { role: 'user', content: q, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch(`${API_BASE}/copilot/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, session_id: 'default' }),
      });

      if (res.ok) {
        const assistantMsg = await res.json();
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error('Query error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 160px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bot size={28} color="#6366f1" /> Expert Knowledge Copilot (RAG)
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Ask operational questions across all ingested industrial logs. Answers feature verified citations, confidence scores, and pattern links.
          </p>
        </div>
        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
          FIELD TECHNICIAN READY 📱
        </span>
      </div>

      {/* Chat Messages Box */}
      <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b', maxWidth: '500px' }}>
            <Bot size={48} color="#6366f1" style={{ marginBottom: '1rem', opacity: 0.6 }} />
            <h3 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Ask your Knowledge Base anything!</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Try asking: "What is the most common root cause across all incidents?" or "Which OISD standards were violated?"
            </p>
            <button className="btn-secondary" onClick={() => handleSend('What is the most common root cause across all incidents?')}>
              Ask Demo Question 🚀
            </button>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '1rem',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: msg.role === 'user' ? '80%' : '90%',
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{ background: 'var(--primary-gradient)', padding: '0.6rem', borderRadius: '12px', height: 'fit-content' }}>
                  <Bot size={20} color="white" />
                </div>
              )}

              <div
                className="glass-card"
                style={{
                  background: msg.role === 'user' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(16, 22, 36, 0.85)',
                  border: msg.role === 'user' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem' }}>{msg.content}</div>

                {/* Assistant Metadata Footer */}
                {msg.role === 'assistant' && (
                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', fontSize: '0.8rem' }}>
                    {msg.confidence && (
                      <span style={{ color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}>
                        <CheckCircle2 size={14} /> Confidence: {msg.confidence}%
                      </span>
                    )}
                    {msg.documents_referenced && msg.documents_referenced.length > 0 && (
                      <span style={{ color: '#06b6d4', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Link2 size={14} /> Cited: {msg.documents_referenced.join(', ')}
                      </span>
                    )}
                  </div>
                )}

                {/* Suggested Follow ups */}
                {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <div style={{ width: '100%', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>Suggested Proactive Follow-ups:</div>
                    {msg.suggested_followups.map((f, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSend(f)}
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#a5b4fc',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        💡 {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '12px', height: 'fit-content' }}>
                  <User size={20} color="#f8fafc" />
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div style={{ color: '#6366f1', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot className="spin-icon" size={18} /> Copilot analyzing vector chunks & synthesizing citations...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask Copilot about root causes, safety standards, equipment tags, or incident history..."
          style={{
            flex: 1,
            background: 'rgba(16, 22, 36, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '0.9rem 1.2rem',
            color: 'white',
            fontSize: '0.95rem',
            outline: 'none'
          }}
        />
        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0 1.5rem' }}>
          <Send size={18} /> Send
        </button>
      </form>
    </div>
  );
}
