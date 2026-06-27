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

    /** Current user's attempted/solved status across all problems. */
    async progress() {
        const response = await axiosInstance.get('progress');
        return response.data.data ?? response.data;
    }

    /** Admin: dry-run a reference solution against candidate test cases (no save). */
    async validate({ code, language, testCases }) {
        const response = await axiosInstance.post('validate', {
            code,
            language,
            test_cases: testCases,
        });
        return response.data.data ?? response.data;
    }
}

export default new ProblemsService();
