import axios from 'axios';

// API configuration and base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Create Axios instance with default config
const apiInstance = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor for attaching auth token
apiInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('iris_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Queue for pending requests during refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

// Interceptor for handling HTTP errors with enhanced handling
apiInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        // Handle 429 - Rate Limited
        if (status === 429) {
            console.warn('Rate limited. Please wait before retrying.');
            return Promise.reject(new Error('Too many requests. Please wait a moment and try again.'));
        }

        // Handle 403 - Forbidden (no permissions)
        if (status === 403) {
            console.warn('Access forbidden - insufficient permissions');
            return Promise.reject(error);
        }

        // Handle 5xx - Server errors
        if (status >= 500) {
            console.error('Server error:', status);
            return Promise.reject(new Error('Server error. Please try again later.'));
        }

        // Handle 401 - Unauthorized (Auto-Refresh with Mutex)
        if (status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return apiInstance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('iris_refresh_token');

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Use a fresh axios instance to avoid infinite loops
                const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
                const { access_token, refresh_token: newRefresh } = response.data;

                localStorage.setItem('iris_token', access_token);
                if (newRefresh) localStorage.setItem('iris_refresh_token', newRefresh);

                apiInstance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

                processQueue(null, access_token);

                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                return apiInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Refresh failed - clean up and redirect
                localStorage.removeItem('iris_token');
                localStorage.removeItem('iris_refresh_token');
                window.location.href = '/admin/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

// Generic fetch wrapper for legacy support (optional, can be removed if specific endpoints are updated)
async function fetchAPI<T>(endpoint: string): Promise<T> {
    const response = await apiInstance.get(endpoint);
    return response.data;
}

// CMS Content types matching the backend schema
export interface CmsContent {
    id: string;
    slug: string;
    type: 'PORTFOLIO' | 'BLOG' | 'REPORT';
    title: string;
    content: string;
    metaTitle: string | null;
    metaDesc: string | null;
    tags: string[];
    metadata: {
        year: string;
        url: string;
        role: string;
        services: string[];
    } | null;
    coverImage: string | null;
    status: string;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

// Transformed Project type for frontend consumption
export interface Project {
    title: string;
    year: string;
    url: string;
    image: string;
    description: string;
    role: string;
    services: string[];
}

// Transform CmsContent to Project format
export function transformCmsToProject(cms: CmsContent): Project {
    return {
        title: cms.title,
        year: cms.metadata?.year || '',
        url: cms.metadata?.url || '',
        image: cms.coverImage || '/projects/placeholder.png',
        description: cms.content,
        role: cms.metadata?.role || '',
        services: cms.metadata?.services || cms.tags || []
    };
}

// Main API export (axios instance)
export const api = apiInstance;

// Legacy/Content API functions
export const contentApi = {
    // Portfolio
    getPortfolio: async (): Promise<Project[]> => {
        const response = await apiInstance.get('/cms/portfolio');
        return response.data.map(transformCmsToProject);
    },

    // Blog Posts
    getBlogPosts: async (): Promise<CmsContent[]> => {
        const response = await apiInstance.get('/cms/blog');
        return response.data;
    },

    // Single content by slug
    getContentBySlug: async (slug: string): Promise<CmsContent | null> => {
        const response = await apiInstance.get(`/cms/content/${slug}`);
        return response.data;
    }
};

// CMS Admin API (requires authentication)
export const cmsAdminApi = {
    getAll: async (params?: { type?: string; status?: string; search?: string; page?: number; limit?: number }) => {
        const response = await apiInstance.get('/cms/admin/all', { params });
        return response.data;
    },

    getOne: async (id: string): Promise<any> => {
        const response = await apiInstance.get(`/cms/admin/${id}`);
        return response.data;
    },

    create: async (data: any): Promise<any> => {
        const response = await apiInstance.post('/cms/admin', data);
        return response.data;
    },

    update: async (id: string, data: any): Promise<any> => {
        const response = await apiInstance.patch(`/cms/admin/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiInstance.delete(`/cms/admin/${id}`);
    },

    togglePublish: async (id: string, publish: boolean): Promise<any> => {
        const response = await apiInstance.patch(`/cms/admin/${id}/publish`, { publish });
        return response.data;
    },
};

// Auth-aware fetch wrapper for components still using fetch()
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('iris_token');
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
    }

    return fetch(url, { ...options, headers });
}

export default api;
