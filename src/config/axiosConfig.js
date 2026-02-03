import axios from 'axios';

// Maximum number of retries
const MAX_RETRIES = 3;

// Axios Response Interceptor
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const { config, response } = error;

        // 1. Handle 429 Too Many Requests (Rate Limiting)
        if (response && response.status === 429) {
            config.__retryCount = config.__retryCount || 0;

            if (config.__retryCount < MAX_RETRIES) {
                config.__retryCount += 1;

                // Calculate delay with exponential backoff (1s, 2s, 4s...)
                const backoffDelay = (Math.pow(2, config.__retryCount) * 1000) + Math.random() * 1000;

                console.warn(`[Axios] 429 Too Many Requests detected. Retrying request... Attempt ${config.__retryCount}/${MAX_RETRIES} in ${backoffDelay.toFixed(0)}ms`);

                // Wait for the delay
                await new Promise(resolve => setTimeout(resolve, backoffDelay));

                // Retry the request
                return axios(config);
            }
        }

        // 2. Handle 401 Unauthorized (Expired or Invalid Session)
        if (response && response.status === 401) {
            // Check if it's the login route itself - don't redirect if login fails!
            // Also ignore public/asset routes if any
            if (config.url.includes('/api/auth/login')) {
                return Promise.reject(error);
            }

            console.error('🚫 [Axios] 401 Unauthorized detected. Session may have expired.');

            // Avoid infinite loops if we are already on login page or just logged out
            if (!window.location.pathname.includes('/login')) {
                const isExpired = response.data?.code === 'TOKEN_EXPIRED';

                // Clear all auth related storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Use a standard confirmation if it's a critical error
                const message = isExpired
                    ? "Your session has expired. Please login again."
                    : (response.data?.message || "Your session is invalid or has expired. Redirecting to login.");

                alert(message);
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

console.log('✅ Global Axios 429 Retry Interceptor Configured');
