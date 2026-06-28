import React, { useState } from 'react';
import { LayoutDashboard, UploadCloud, Bot, Network, ShieldCheck, Play, RotateCcw, Sparkles, AlertTriangle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import DocumentUpload from './components/DocumentUpload';
import CopilotChat from './components/CopilotChat';
import PatternIntelligence from './components/PatternIntelligence';
import ComplianceDashboard from './components/ComplianceDashboard';

import { API_BASE } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [demoStepLoading, setDemoStepLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRunDemoStep = async (stepId, stepName) => {
    setDemoStepLoading(true);
    try {
      const res = await fetch(`${API_BASE}/demo/step/${stepId}`, { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        showToast(`✅ Demo Step Executed: ${stepName} Ingested & Pattern Engine Triggered!`);
        if (stepId === 'step2') setActiveTab('patterns');
        if (stepId === 'step3') setActiveTab('patterns');
      }
    } catch (err) {
      console.error('Demo step error:', err);
      showToast('❌ Demo step execution failed');
    } finally {
      setDemoStepLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch(`${API_BASE}/dashboard/reset`, { method: 'POST' });
      showToast('🔄 Knowledgebase & Patterns reset successfully');
      window.location.reload();
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '280px',
          background: 'rgba(10, 13, 20, 0.95)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          position: 'sticky',
          top: 0,
          height: '100vh'
        }}
      >
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div style={{ background: 'var(--primary-gradient)', padding: '0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                KnowledgeBrain
              </h1>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>ET HACKATHON 2026 EDITION</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'dashboard' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: activeTab === 'dashboard' ? '#6366f1' : '#94a3b8',
                fontWeight: activeTab === 'dashboard' ? '700' : '500',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <LayoutDashboard size={20} /> Dashboard
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'upload' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: activeTab === 'upload' ? '#6366f1' : '#94a3b8',
                fontWeight: activeTab === 'upload' ? '700' : '500',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <UploadCloud size={20} /> Document Ingestion
            </button>

            <button
              onClick={() => setActiveTab('copilot')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'copilot' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: activeTab === 'copilot' ? '#6366f1' : '#94a3b8',
                fontWeight: activeTab === 'copilot' ? '700' : '500',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <Bot size={20} /> Expert Copilot (RAG)
            </button>

            <button
              onClick={() => setActiveTab('patterns')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'patterns' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: activeTab === 'patterns' ? '#6366f1' : '#94a3b8',
                fontWeight: activeTab === 'patterns' ? '700' : '500',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <Network size={20} /> Pattern Intelligence
            </button>

            <button
              onClick={() => setActiveTab('compliance')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'compliance' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: activeTab === 'compliance' ? '#6366f1' : '#94a3b8',
                fontWeight: activeTab === 'compliance' ? '700' : '500',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <ShieldCheck size={20} /> Compliance Dashboard
            </button>
          </nav>
        </div>

        {/* Footer info & reset */}
        <div>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }} onClick={handleReset}>
            <RotateCcw size={14} /> Reset Knowledgebase
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
        {/* Toast alert */}
        {toastMessage && (
          <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'rgba(16, 22, 36, 0.95)', border: '1px solid #6366f1', padding: '1rem 1.5rem', borderRadius: '12px', color: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 1000 }}>
            {toastMessage}
          </div>
        )}

        {/* Render Active Screen */}
        {activeTab === 'dashboard' && <Dashboard onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'upload' && <DocumentUpload />}
        {activeTab === 'copilot' && <CopilotChat />}
        {activeTab === 'patterns' && <PatternIntelligence />}
        {activeTab === 'compliance' && <ComplianceDashboard />}
      </main>
    </div>
  );
}
