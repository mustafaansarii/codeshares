import { Navigate } from 'react-router-dom';
import authService from '../../services/auth.service';

/** Blocks unauthenticated users — redirects to /login */
export function ProtectedRoute({ children }) {
    return authService.isAuthenticated() ? children : <Navigate to="/login" replace />;
}

/** Blocks authenticated users from auth pages — redirects to / */
export function GuestRoute({ children }) {
    return authService.isAuthenticated() ? <Navigate to="/" replace /> : children;
}
