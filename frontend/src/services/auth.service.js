import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = '/codeshare/api/auth/';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

const silentAxios = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('isAuthenticated');
            if (window.location.pathname !== '/login') {
                toast.error('Session expired. Please sign in again.');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

class AuthService {
    async logout() {
        try {
            const response = await axiosInstance.post('logout');
            return response.data;
        } finally {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('roles');
        }
    }

    async me() {
        const response = await axiosInstance.get('me');
        return response.data;
    }

    isAuthenticated() {
        return localStorage.getItem('isAuthenticated') === 'true';
    }

    roles() {
        try {
            return JSON.parse(localStorage.getItem('roles') || '[]');
        } catch {
            return [];
        }
    }

    isAdmin() {
        return this.roles().includes('ADMIN');
    }

    loginWithProvider(provider) {
        window.location.href = `/codeshare/oauth2/authorization/${provider}`;
    }

    async verifyAuth() {
        try {
            const response = await silentAxios.get('me');
            if (response.status === 200) {
                localStorage.setItem('isAuthenticated', 'true');
                const roles = response.data?.roles ?? response.data?.data?.roles ?? [];
                localStorage.setItem('roles', JSON.stringify(roles));
            }
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('roles');
            }
        }
    }
}

export default new AuthService();
