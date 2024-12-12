import axios from 'axios';
import { checkTokenExpiration } from './auth';
import { toast } from 'react-toastify';

// Create axios instances with updated configurations
const loginAxios = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://login.swipetofit.com', // Ensure baseURL is defined
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
     withCredentials: true,
    credentials: 'include'
});

const workoutsAxios = axios.create({
    baseURL: process.env.REACT_APP_WORKOUTS_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,
});

// Request interceptor with error logging
const requestInterceptor = async (config) => {
    // Add CORS headers
    config.headers['Access-Control-Allow-Credentials'] = true;
    
    // Check token expiration
    if (checkTokenExpiration()) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        
        if (!window.location.pathname.includes('/login')) {
            toast.error('Session expired. Please log in again.', {
                position: "top-center",
                autoClose: 5000,
            });
            window.location.href = '/login';
            return Promise.reject('Session expired');
        }
    }

    // Add authorization token if exists
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Log request details for debugging
    console.log('Request Config:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        baseURL: config.baseURL
    });

    return config;
};

// Response error handler with detailed logging
const responseErrorHandler = (error) => {
    // Log detailed error information
    console.error('API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config,
        url: error.config?.url,
        method: error.config?.method
    });

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');

        if (!window.location.pathname.includes('/login')) {
            toast.error('Session expired. Please log in again.', {
                position: "top-center",
                autoClose: 5000,
            });
            window.location.href = '/login';
        }
    }

    return Promise.reject(error);
};

// Apply interceptors to both axios instances
loginAxios.interceptors.request.use(requestInterceptor, error => Promise.reject(error));
workoutsAxios.interceptors.request.use(requestInterceptor, error => Promise.reject(error));

loginAxios.interceptors.response.use(response => response, responseErrorHandler);
workoutsAxios.interceptors.response.use(response => response, responseErrorHandler);

export { loginAxios, workoutsAxios };