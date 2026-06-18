import axios from 'axios';

// No trailing slash: collection calls use '' so axios hits exactly /api/files
// (Spring Boot 3 doesn't match the trailing-slash variant).
const API_URL = '/codeshare/api/files';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

const unwrap = ({ data }) => data.data ?? data;

class FilesService {
    async list() {
        return unwrap(await axiosInstance.get(''));
    }

    async create({ name, language, content = '', visibility = 'PRIVATE' }) {
        return unwrap(await axiosInstance.post('', { name, language, content, visibility }));
    }

    async get(fileId) {
        return unwrap(await axiosInstance.get(fileId));
    }

    async saveContent(fileId, content) {
        return unwrap(await axiosInstance.put(fileId, { content }));
    }

    async updateMeta(fileId, meta) {
        // meta: { name?, language?, visibility? }
        return unwrap(await axiosInstance.patch(fileId, meta));
    }

    async remove(fileId) {
        return unwrap(await axiosInstance.delete(fileId));
    }

    async addShare(fileId, email, access) {
        return unwrap(await axiosInstance.post(`${fileId}/shares`, { email, access }));
    }

    async removeShare(fileId, email) {
        return unwrap(await axiosInstance.delete(`${fileId}/shares/${encodeURIComponent(email)}`));
    }
}

export default new FilesService();
