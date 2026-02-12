import axios from 'axios';

// Use a relative API path by default so the frontend can call '/api' and
// let the web server (dev proxy or nginx in Docker) proxy requests to the backend.
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
                    // Clear auth data and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    // Reload page to trigger auth context update
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    console.error('Access forbidden:', error.response.data);
                    break;
                default:
                    console.error('API Error:', error.response.data);
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response from server:', error.request);
            throw new Error('No response from server. Backend may be down.');
        } else {
            // Error in request setup
            console.error('Request error:', error.message);
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
            // Format error message from backend
            const serverData = error.response?.data;
            let message = 'Something went wrong during registration';
            
            if (serverData?.message) {
                message = serverData.message;
            } else if (serverData?.errors && Array.isArray(serverData.errors)) {
                // Extract error messages from validation errors array
                message = serverData.errors.map(err => err.msg || err.message).join(', ');
            } else if (error.message) {
                message = error.message;
            }
            
            throw new Error(message);
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
            // Format error message from backend
            const serverData = error.response?.data;
            let message = 'Something went wrong during login';
            
            if (serverData?.message) {
                message = serverData.message;
            } else if (serverData?.errors && Array.isArray(serverData.errors)) {
                // Extract error messages from validation errors array
                message = serverData.errors.map(err => err.msg || err.message).join(', ');
            } else if (error.message) {
                message = error.message;
            }
            
            throw new Error(message);
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