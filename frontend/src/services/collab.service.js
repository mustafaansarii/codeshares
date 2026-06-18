import axios from 'axios';

// No trailing slash: createSession posts to '' so axios hits exactly /api/collab.
const API_URL = '/codeshare/api/collab';

// The collab WebSocket connects DIRECTLY to the backend — Vercel rewrites cannot proxy
// WebSocket upgrades, so it can't go through the /codeshare path like the REST calls do.
const WS_URL =
    import.meta.env.VITE_COLLAB_WS_URL ||
    (window.location.hostname === 'localhost'
        ? 'ws://localhost:5001/ws/collab'
        : 'wss://codeshares-backend-latest.onrender.com/ws/collab');

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

class CollabService {
    async createSession(problemId, language) {
        const { data } = await axiosInstance.post('', { problem_id: Number(problemId), language });
        return data.data ?? data;
    }

    async getSession(sessionId) {
        const { data } = await axiosInstance.get(sessionId);
        return data.data ?? data;
    }

    async getWsTicket() {
        const { data } = await axiosInstance.get('ws-ticket');
        return (data.data ?? data).ticket;
    }

    wsUrl(sessionId, ticket) {
        return `${WS_URL}?session=${encodeURIComponent(sessionId)}&ticket=${encodeURIComponent(ticket)}`;
    }
}

export default new CollabService();
