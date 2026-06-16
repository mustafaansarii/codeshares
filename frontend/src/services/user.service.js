import axios from 'axios';

const API_URL = '/codeshare/api/users/';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

class UserService {
    async getProfile() {
        const response = await axiosInstance.get('profile');
        return response.data;
    }

    async updateProfile(profile) {
        const response = await axiosInstance.patch('profile', profile);
        return response.data;
    }

    async getSolutions() {
        const response = await axiosInstance.get('solutions');
        return response.data;
    }

    async getSolution(id) {
        const response = await axiosInstance.get(`solutions/${id}`);
        return response.data;
    }
}

export default new UserService();
