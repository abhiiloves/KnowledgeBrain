import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, CheckCircle2, Link2, Sparkles, AlertCircle } from 'lucide-react';
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
      } else {
        const errText = await res.text();
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: `⚠️ Notice: Server returned error (${res.status}). Ensure backend is running. Details: ${errText.substring(0, 150)}`,
          confidence: 50,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error('Query error:', err);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `⚠️ Connection Notice: Could not reach backend server at ${API_BASE}. Please verify your backend server is online.`,
        confidence: 0,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '82vh', width: '100%' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <Bot size={32} color="#6366f1" /> Knowledge Studio & AI Copilot
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
              Spacious conversational intelligence workspace. Ask anything about your uploaded logs, equipment specs, or incident reports.
            </p>
          </div>
          <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            ● AI INTELLIGENCE ACTIVE
          </span>
        </div>
      </div>

      {/* Main Spacious Chat Container */}
      <div className="glass-panel" style={{ flex: 1, padding: '2rem', minHeight: '550px', maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(10, 13, 20, 0.6)' }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b', maxWidth: '600px', padding: '3rem 1rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Sparkles size={40} color="#6366f1" />
            </div>
            <h3 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.75rem' }}>What would you like to know about your documents?</h3>
            <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '2rem' }}>
              Upload your industrial logs or reports, then ask operational questions, root causes, regulatory compliance gaps, or equipment status.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '1.25rem',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                width: msg.role === 'user' ? 'fit-content' : '100%',
                maxWidth: msg.role === 'user' ? '80%' : '100%',
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{ background: 'var(--primary-gradient)', padding: '0.75rem', borderRadius: '14px', height: 'fit-content', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                  <Bot size={24} color="white" />
                </div>
              )}

              <div
                className="glass-card"
                style={{
                  flex: 1,
                  background: msg.role === 'user' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(16, 22, 36, 0.9)',
                  border: msg.role === 'user' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '1.05rem', color: '#f8fafc' }}>{msg.content}</div>

                {/* Assistant Footer Info */}
                {msg.role === 'assistant' && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', fontSize: '0.85rem' }}>
                    {msg.confidence && (
                      <span style={{ color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', background: 'rgba(34, 197, 94, 0.1)', padding: '0.3rem 0.75rem', borderRadius: '6px' }}>
                        <CheckCircle2 size={16} /> Verified Confidence: {msg.confidence}%
                      </span>
                    )}
                    {msg.documents_referenced && msg.documents_referenced.length > 0 && (
                      <span style={{ color: '#06b6d4', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(6, 182, 212, 0.1)', padding: '0.3rem 0.75rem', borderRadius: '6px' }}>
                        <Link2 size={16} /> Knowledge Base Sources: {msg.documents_referenced.join(', ')}
                      </span>
                    )}
                  </div>
                )}

                {/* Proactive Follow-ups */}
                {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Proactive Intelligence Follow-ups:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {msg.suggested_followups.map((f, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleSend(f)}
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: '#a5b4fc',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.2)'}
                          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.06)'}
                        >
                          💡 {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: '0.75rem', borderRadius: '14px', height: 'fit-content' }}>
                  <User size={24} color="#f8fafc" />
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div style={{ color: '#6366f1', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', width: 'fit-content' }}>
            <Sparkles className="spin-icon" size={22} /> AI Copilot synthesizing document intelligence & cross-referencing records...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Prominent Large Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask AI Copilot anything about your uploaded documents (e.g. Explosion ki main waja kya thi?)"
          style={{
            flex: 1,
            background: 'rgba(16, 22, 36, 0.95)',
            border: '1.5px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            color: 'white',
            fontSize: '1.05rem',
            outline: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
        />
        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0 2rem', borderRadius: '14px', fontSize: '1.05rem' }}>
          <Send size={22} /> Send Query
        </button>
      </form>
    </div>
  );
}
