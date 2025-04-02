import axios from 'axios';
import {API_CONFIG} from '../config/config';

const baseApi = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
})

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers['Authorization'] = `Token ${token}`;
    } else {
        delete api.defaults.headers['Authorization'];
    }
};

export const authService = {
    telegramAuth: async (telegramData) => {
        const response = await baseApi.post('/auth/telegram/', telegramData);
        return response.data;
    }
};

export const locationService = {
    getRandomLocation: async () => {
        const response = await api.get('/location/random');
        return response.data;
    },

    submitGuess: async (data) => {
        const response = await api.post('/location/guess', data);
        return response.data;
    },
    getRating: async () => {
        const response = await api.get('/rating');
        return response.data;
    },
    userProfile: async () => {
        const response = await api.get('/profile');
        return response.data;
    }
};

export default api;
