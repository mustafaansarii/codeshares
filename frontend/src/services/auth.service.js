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
        }
    }

    async me() {
        const response = await axiosInstance.get('me');
        return response.data;
    }

    isAuthenticated() {
        return localStorage.getItem('isAuthenticated') === 'true';
    }

    loginWithProvider(provider) {
        window.location.href = `https://codeshares-backend-latest.onrender.com/oauth2/authorization/${provider}`;
    }

    async verifyAuth() {
        try {
            const response = await silentAxios.get('me');
            if (response.status === 200) {
                localStorage.setItem('isAuthenticated', 'true');
            }
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('isAuthenticated');
            }
        }
    }
}

export default new AuthService();
