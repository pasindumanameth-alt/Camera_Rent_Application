import axios from 'axios';

// Use a relative API path by default so the frontend can call '/api' and
// let the web server (nginx in Docker) proxy requests to the backend.
// When building the image you can still override this with REACT_APP_API_URL.
const API_URL = process.env.REACT_APP_API_URL || '/api';
console.log('Using API URL:', API_URL);

// Create axios instance with base URL and default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    break;
                default:
                    console.error('API Error:', error.response.data);
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    register: async (username, email, password) => {
        try {
            const response = await api.post('/auth/register', {
                username,
                email,
                password
            });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            // Normalize thrown error so callers can rely on a message string
            const serverData = error.response?.data;
            const message = serverData?.message || serverData?.errors || error.message || serverData || 'Network error';
            throw typeof message === 'string' ? { message } : message;
        }
    },

    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', {
                email,
                password
            });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            const serverData = error.response?.data;
            const message = serverData?.message || serverData?.errors || error.message || serverData || 'Network error';
            throw typeof message === 'string' ? { message } : message;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export const cameraService = {
    getAllCameras: async () => {
        const response = await api.get('/cameras');
        return response.data;
    },

    getCameraById: async (id) => {
        const response = await api.get(`/cameras/${id}`);
        return response.data;
    },

    createCamera: async (cameraData) => {
        const response = await api.post('/cameras', cameraData);
        return response.data;
    },

    updateCamera: async (id, cameraData) => {
        const response = await api.put(`/cameras/${id}`, cameraData);
        return response.data;
    },

    deleteCamera: async (id) => {
        const response = await api.delete(`/cameras/${id}`);
        return response.data;
    }
};

export const rentalService = {
    getRentals: async () => {
        const response = await api.get('/rentals');
        return response.data;
    },

    getRentalById: async (id) => {
        const response = await api.get(`/rentals/${id}`);
        return response.data;
    },

    createRental: async (rentalData) => {
        const response = await api.post('/rentals', rentalData);
        return response.data;
    },

    updateRentalStatus: async (id, status) => {
        const response = await api.patch(`/rentals/${id}/status`, { status });
        return response.data;
    }
};