import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true, // Important for cookies
});

// Add a request interceptor to add the auth token to requests
API.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
     
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Call refresh endpoint
                const { data } = await API.post('/users/refresh');
                
                // Update local storage with new token
                const user = JSON.parse(localStorage.getItem('user'));
                user.token = data.token;
                localStorage.setItem('user', JSON.stringify(user));
                
                // Update header and retry request
                API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
                
                return API(originalRequest);
            } catch (refreshError) {
                // Refresh failed (token expired/invalid), logout user
                localStorage.removeItem('user');
                window.location.href = '/login'; 
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default API;
