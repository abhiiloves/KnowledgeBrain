// Intelligent API Base URL resolver with automatic Render production default
const getApiBase = () => {
    let raw = '';
    
    // 1. Check localStorage override (for manual testing if needed)
    const stored = localStorage.getItem('KNOWLEDGEBRAIN_API_URL');
    if (stored && stored.trim()) {
        raw = stored.trim();
    } else if (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim()) {
        raw = import.meta.env.VITE_API_BASE_URL.trim();
    } else if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:8000/api/v1';
    } else {
        // PERMANENT AUTOMATIC PRODUCTION DEFAULT (FOR HACKATHON JUDGES)
        return 'https://knowledgebrain-backend.onrender.com/api/v1';
    }

    // Safely extract protocol + hostname (e.g. https://app.onrender.com)
    try {
        if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
            raw = 'https://' + raw;
        }
        const parsed = new URL(raw);
        return `${parsed.origin}/api/v1`;
    } catch (e) {
        console.error('URL parse error:', e);
        return 'https://knowledgebrain-backend.onrender.com/api/v1';
    }
};

export const API_BASE = getApiBase();
