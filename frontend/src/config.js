// Intelligent API Base URL resolver
const getApiBase = () => {
    // 1. Check localStorage override (if user specified custom URL in settings)
    const stored = localStorage.getItem('KNOWLEDGEBRAIN_API_URL');
    if (stored) return stored.endsWith('/') ? stored.slice(0, -1) : stored;

    // 2. Check Vite environment variable
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    // 3. Check if running locally
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:8000/api/v1';
    }

    // 4. Production fallback relative route
    return '/api/v1';
};

export const API_BASE = getApiBase();
