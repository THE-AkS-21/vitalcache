import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true, // IMPORTANT: Allows sending the httpOnly refresh_token cookie
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor to handle token refresh seamlessly
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If 401 Unauthorized and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Call the refresh endpoint (it reads the refresh_token cookie automatically)
                const refreshRes = await axios.post(`${API_URL}/api/v1/auth/refresh`, {}, {
                    withCredentials: true
                });
                
                const newAccessToken = refreshRes.data?.data?.access_token;
                
                if (newAccessToken) {
                    // Note: If you have a global store (Zustand), you could update it here.
                    // But typically, the frontend can just rely on the new access token.
                    // Actually, for Axios interceptors, we just set the new token for this request
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    
                    // We also want to set it as default for future requests
                    apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                    
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed (e.g. cookie expired). Redirect to login.
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

// Method to manually set the initial access token when the app loads
export const setAccessToken = (token: string | null) => {
    if (token) {
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common.Authorization;
    }
};

export default apiClient;
