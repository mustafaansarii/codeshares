import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/auth.service';

/**
 * Guards admin-only routes. Optimistically uses cached roles, but re-verifies with the
 * backend so a stale/forged localStorage role can't grant access (the API is the real gate).
 */
export default function AdminRoute({ children }) {
    const [state, setState] = useState(authService.isAuthenticated() ? 'checking' : 'denied');

    useEffect(() => {
        let active = true;
        if (!authService.isAuthenticated()) return undefined;
        authService.me()
            .then((u) => {
                const roles = u?.roles ?? u?.data?.roles ?? [];
                if (active) setState(roles.includes('ADMIN') ? 'allowed' : 'denied');
            })
            .catch(() => { if (active) setState('denied'); });
        return () => { active = false; };
    }, []);

    if (state === 'checking') {
        return <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-muted">Checking access…</div>;
    }
    if (state === 'denied') {
        return <Navigate to="/" replace />;
    }
    return children;
}
