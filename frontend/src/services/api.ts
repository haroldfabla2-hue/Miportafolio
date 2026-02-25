import axios from 'axios';
import type { Lead, Client, CalendarEvent } from '../types/models';


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


// CMS Content types matching the backend schema
export interface LocalizedCmsEntry {
    title?: string;
    content?: string;
    metaTitle?: string | null;
    metaDesc?: string | null;
    role?: string;
    services?: string[];
    tags?: string[];
}

export type LocalizedCmsMap = Record<string, LocalizedCmsEntry>;

export interface CmsMetadata {
    year?: string;
    url?: string;
    role?: string;
    services?: string[];
    i18n?: LocalizedCmsMap;
    [key: string]: unknown;
}

export interface CmsContent {
    id: string;
    slug: string;
    type: 'PORTFOLIO' | 'BLOG' | 'REPORT' | 'PAGE';
    title: string;
    content: string;
    metaTitle: string | null;
    metaDesc: string | null;
    tags: string[];
    metadata: CmsMetadata | null;
    coverImage: string | null;
    status: string;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectTranslationEntry {
    title?: string;
    description?: string;
    role?: string;
    services?: string[];
}

export type ProjectTranslations = Record<string, ProjectTranslationEntry>;

// Transformed Project type for frontend consumption
export interface Project {
    title: string;
    year: string;
    url: string;
    image: string;
    description: string;
    role: string;
    services: string[];
    translations?: ProjectTranslations;
}

function normalizeLanguageKey(language: string): string {
    return language.toLowerCase().split('-')[0];
}

function hasText(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

function sanitizeStringArray(value: unknown): string[] | null {
    if (!Array.isArray(value)) {
        return null;
    }
    return value.filter((item): item is string => hasText(item));
}

function pickLocalizedEntry(localizedMap: LocalizedCmsMap | undefined, language: string): LocalizedCmsEntry | null {
    if (!localizedMap) {
        return null;
    }

    const candidates = [language, normalizeLanguageKey(language)]
        .map(normalizeLanguageKey)
        .filter((key, index, list) => list.indexOf(key) === index);

    for (const candidate of candidates) {
        const match = Object.entries(localizedMap).find(
            ([key]) => normalizeLanguageKey(key) === candidate
        );
        if (match) {
            return match[1];
        }
    }

    return null;
}

function extractProjectTranslations(metadata: CmsMetadata | null): ProjectTranslations | undefined {
    const localizedMap = metadata?.i18n;
    if (!localizedMap) {
        return undefined;
    }

    const translations: ProjectTranslations = {};

    Object.entries(localizedMap).forEach(([language, localized]) => {
        const normalizedLanguage = normalizeLanguageKey(language);
        const services = sanitizeStringArray(localized.services);

        const entry: ProjectTranslationEntry = {};
        if (hasText(localized.title)) entry.title = localized.title;
        if (hasText(localized.content)) entry.description = localized.content;
        if (hasText(localized.role)) entry.role = localized.role;
        if (services && services.length > 0) entry.services = services;

        if (Object.keys(entry).length > 0) {
            translations[normalizedLanguage] = entry;
        }
    });

    return Object.keys(translations).length > 0 ? translations : undefined;
}

export function localizeCmsContent(content: CmsContent, language: string): CmsContent {
    const localized = pickLocalizedEntry(content.metadata?.i18n, language);
    if (!localized) {
        return content;
    }

    const localizedServices = sanitizeStringArray(localized.services);
    const localizedTags = sanitizeStringArray(localized.tags);
    const hasLocalizedRole = hasText(localized.role);
    const hasLocalizedServices = localizedServices !== null && localizedServices.length > 0;

    const metadata = content.metadata && (hasLocalizedRole || hasLocalizedServices)
        ? {
            ...content.metadata,
            ...(hasLocalizedRole ? { role: localized.role } : {}),
            ...(hasLocalizedServices ? { services: localizedServices } : {}),
        }
        : content.metadata;

    return {
        ...content,
        title: hasText(localized.title) ? localized.title : content.title,
        content: hasText(localized.content) ? localized.content : content.content,
        metaTitle: localized.metaTitle === null
            ? null
            : hasText(localized.metaTitle) ? localized.metaTitle : content.metaTitle,
        metaDesc: localized.metaDesc === null
            ? null
            : hasText(localized.metaDesc) ? localized.metaDesc : content.metaDesc,
        tags: localizedTags && localizedTags.length > 0 ? localizedTags : content.tags,
        metadata,
    };
}

function pickProjectTranslation(
    translations: ProjectTranslations | undefined,
    language: string
): ProjectTranslationEntry | null {
    if (!translations) {
        return null;
    }

    const candidates = [language, normalizeLanguageKey(language)]
        .map(normalizeLanguageKey)
        .filter((key, index, list) => list.indexOf(key) === index);

    for (const candidate of candidates) {
        const match = Object.entries(translations).find(
            ([key]) => normalizeLanguageKey(key) === candidate
        );
        if (match) {
            return match[1];
        }
    }

    return null;
}

export function localizeProject(project: Project, language: string): Project {
    const localized = pickProjectTranslation(project.translations, language);
    if (!localized) {
        return project;
    }

    const localizedServices = sanitizeStringArray(localized.services);

    return {
        ...project,
        title: hasText(localized.title) ? localized.title : project.title,
        description: hasText(localized.description) ? localized.description : project.description,
        role: hasText(localized.role) ? localized.role : project.role,
        services: localizedServices && localizedServices.length > 0 ? localizedServices : project.services,
    };
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
        services: cms.metadata?.services || cms.tags || [],
        translations: extractProjectTranslations(cms.metadata),
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

// CRM API
export const leadsApi = {
    getAll: async (status?: string): Promise<Lead[]> => {
        const response = await apiInstance.get('/leads', { params: { status } });
        return response.data;
    },

    getStats: async (): Promise<any> => {
        const response = await apiInstance.get('/leads/stats');
        return response.data;
    },

    create: async (data: Partial<Lead>): Promise<Lead> => {
        const response = await apiInstance.post('/leads', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Lead>): Promise<Lead> => {
        const response = await apiInstance.put(`/leads/${id}`, data);
        return response.data;
    },

    updateStatus: async (id: string, status: string): Promise<Lead> => {
        const response = await apiInstance.put(`/leads/${id}/status`, { status });
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiInstance.delete(`/leads/${id}`);
    },

    // Composite action: Create Client from Lead + Mark Lead as WON
    convert: async (lead: Lead): Promise<Client> => {
        // 1. Create Client
        const clientData = {
            name: lead.name,
            email: lead.email,
            company: lead.company || 'Unknown',
            status: 'ACTIVE',
            avatar: `https://ui-avatars.com/api/?name=${lead.name}&background=random`
        };
        const clientResponse = await apiInstance.post('/clients', clientData);

        // 2. Mark Lead as WON
        await apiInstance.put(`/leads/${lead.id}/status`, { status: 'WON' });

        return clientResponse.data;
    }
};

export const clientsApi = {
    getAll: async (): Promise<Client[]> => {
        const response = await apiInstance.get('/clients');
        return response.data;
    },
    create: async (data: any): Promise<Client> => {
        const response = await apiInstance.post('/clients', data);
        return response.data;
    },
    update: async (id: string, data: any): Promise<Client> => {
        const response = await apiInstance.put(`/clients/${id}`, data);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await apiInstance.delete(`/clients/${id}`);
    }
};

export const eventsApi = {
    getAll: async (params?: { start?: string; end?: string; userId?: string; projectId?: string; clientId?: string }): Promise<CalendarEvent[]> => {
        const response = await apiInstance.get('/events', { params });
        return response.data;
    },

    getOne: async (id: string): Promise<CalendarEvent> => {
        const response = await apiInstance.get(`/events/${id}`);
        return response.data;
    },

    create: async (data: Partial<CalendarEvent>): Promise<CalendarEvent> => {
        const response = await apiInstance.post('/events', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> => {
        const response = await apiInstance.put(`/events/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiInstance.delete(`/events/${id}`);
    }
};

export const financeApi = {
    getStats: async () => {
        const response = await apiInstance.get('/finance');
        return response.data;
    },
    getSummary: async () => {
        const response = await apiInstance.get('/finance/summary');
        return response.data;
    },
    getChart: async () => {
        const response = await apiInstance.get('/finance/chart');
        return response.data;
    },
    getInvoices: async () => {
        const response = await apiInstance.get('/finance/invoices');
        return response.data;
    },
    getBills: async () => {
        const response = await apiInstance.get('/finance/bills');
        return response.data;
    }
};

export const reportsApi = {
    getAll: async () => {
        const response = await apiInstance.get('/reports');
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await apiInstance.get(`/reports/${id}`);
        return response.data;
    },
    generate: async (type: string, prompt: string) => {
        const response = await apiInstance.post('/reports/generate', { type, prompt });
        return response.data;
    },
    delete: async (id: string) => {
        await apiInstance.delete(`/reports/${id}`);
    }
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
