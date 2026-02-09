// CMS Content types matching the backend schema
export interface CmsContent {
    id: string;
    slug: string;
    type: 'PORTFOLIO' | 'BLOG' | 'REPORT' | 'PAGE';
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
