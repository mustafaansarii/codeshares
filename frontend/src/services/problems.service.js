import axios from 'axios';

const API_URL = '/codeshare/api/problems/';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

class ProblemsService {
    async getAll(params = {}) {
        const response = await axiosInstance.get('', { params });
        return response.data;
    }

    async getById(id) {
        const response = await axiosInstance.get(`${id}`);
        return response.data;
    }

    async create(problem) {
        const response = await axiosInstance.post('', problem);
        return response.data;
    }

    async update(id, problem) {
        const response = await axiosInstance.put(`${id}`, problem);
        return response.data;
    }

    async delete(id) {
        const response = await axiosInstance.delete(`${id}`);
        return response.data;
    }

    async runTestCases(problemId, code, language) {
        const response = await axiosInstance.post('run', {
            problem_id: problemId,
            code,
            language,
        });
        return response.data;
    }

    async submitSolution(problemId, code, language) {
        const response = await axiosInstance.post('submit', {
            problem_id: problemId,
            code,
            language,
        });
        return response.data;
    }
}

export default new ProblemsService();
