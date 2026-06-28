// Intelligent API Base URL resolver
const getApiBase = () => {
    let base = '';
    
    // 1. Check localStorage override
    const stored = localStorage.getItem('KNOWLEDGEBRAIN_API_URL');
    if (stored) {
        base = stored.trim();
    } else if (import.meta.env.VITE_API_BASE_URL) {
        base = import.meta.env.VITE_API_BASE_URL.trim();
    } else if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:8000/api/v1';
    } else {
        return '/api/v1';
    }

    // Remove trailing slash
    if (base.endsWith('/')) base = base.slice(0, -1);
    
    // Ensure /api/v1 prefix is appended if not present
    if (!base.endsWith('/api/v1')) {
        base = `${base}/api/v1`;
    }

    return base;
};

export const API_BASE = getApiBase();
