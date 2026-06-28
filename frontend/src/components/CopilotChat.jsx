import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, RefreshCw, Paperclip } from 'lucide-react';
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
          content: `Notice: Server returned status ${res.status}. Ensure backend is online. ${errText.substring(0, 100)}`,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error('Query error:', err);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `Connection Notice: Unable to reach backend server at ${API_BASE}.`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)', width: '100%', maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
      
      {/* ChatGPT-Style Sleek Header */}
      <div style={{ padding: '1rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'var(--primary-gradient)', padding: '0.4rem', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
            <Sparkles size={20} color="white" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc' }}>KnowledgeBrain 3.5</span>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', color: '#94a3b8', padding: '0.15rem 0.5rem', borderRadius: '6px', marginLeft: '0.4rem' }}>Document Agent</span>
        </div>
        
        <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={fetchHistory}>
          <RefreshCw size={14} /> Sync History
        </button>
      </div>

      {/* Main ChatGPT Stream Box */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '120px' }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b', maxWidth: '500px', padding: '4rem 1rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.12)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Sparkles size={32} color="#6366f1" />
            </div>
            <h3 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>How can I help with your documents today?</h3>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '2rem' }}>
              Ask anything about your specific uploaded report, equipment specifications, or operational details.
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
                width: '100%',
                maxWidth: msg.role === 'user' ? '85%' : '100%',
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{ background: 'var(--primary-gradient)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.2rem' }}>
                  <Sparkles size={18} color="white" />
                </div>
              )}

              <div
                style={{
                  flex: 1,
                  background: msg.role === 'user' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  border: msg.role === 'user' ? '1px solid rgba(99, 102, 241, 0.3)' : 'none',
                  borderRadius: msg.role === 'user' ? '18px' : '0',
                  padding: msg.role === 'user' ? '1rem 1.25rem' : '0.25rem 0',
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1.05rem', color: '#f8fafc', letterSpacing: '0.01em' }}>
                  {msg.content}
                </div>

                {/* Document source citation pill */}
                {msg.role === 'assistant' && msg.documents_referenced && msg.documents_referenced.length > 0 && (
                  <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#06b6d4', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                      📄 Source: {msg.documents_referenced.join(', ')}
                    </span>
                  </div>
                )}

                {/* Dynamic follow-up suggestion chips */}
                {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {msg.suggested_followups.map((f, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSend(f)}
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#a5b4fc',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        💡 {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div style={{ background: 'rgba(255,255,255,0.1)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.2rem' }}>
                  <User size={18} color="#f8fafc" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', color: '#94a3b8', fontSize: '0.95rem' }}>
            <div style={{ background: 'var(--primary-gradient)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles className="spin-icon" size={18} color="white" />
            </div>
            <span>Thinking and analyzing document details...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ChatGPT-Style Floating Bottom Prompt Bar */}
      <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, background: 'var(--bg-dark)', paddingTop: '10px' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Message KnowledgeBrain AI..."
            style={{
              width: '100%',
              background: 'rgba(24, 33, 54, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              padding: '1.1rem 3.5rem 1.1rem 1.5rem',
              color: 'white',
              fontSize: '1.05rem',
              outline: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            style={{
              position: 'absolute',
              right: '12px',
              background: inputQuery.trim() ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              cursor: inputQuery.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s'
            }}
          >
            <Send size={18} />
          </button>
        </form>
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
          KnowledgeBrain AI provides verified document insights. Always check source references.
        </div>
      </div>

    </div>
  );
}
