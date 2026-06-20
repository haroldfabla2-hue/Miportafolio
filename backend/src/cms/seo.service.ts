import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const defaultSettings = {
    siteName: 'Alberto Farah',
    siteUrl: 'https://albertofarah.com',
    seoDefaults: {
        blog: {
            metaTitleTemplate: '{title} | Alberto Farah - Blog',
            metaDescriptionTemplate: '{description}',
        },
        portfolio: {
            metaTitleTemplate: '{title} | Alberto Farah - Proyectos',
            metaDescriptionTemplate: '{description}',
        },
        indexing: {
            allowIndexing: true,
            disallowedPaths: ['/admin*', '/invite*'],
            sitemap: {
                enabled: true,
                changefreqByType: { BLOG: 'weekly', PORTFOLIO: 'monthly', PAGE: 'monthly' },
                priorityByType: { BLOG: 0.8, PORTFOLIO: 0.9, PAGE: 0.7 }
            }
        }
    },
    mediaSettings: {
        maxImageSizeMB: 5,
        autoResizeOnUpload: true,
        resizeOptions: {
            maxWidth: 1920,
            maxHeight: 1080,
            format: 'webp',
            quality: 0.85
        },
        storage: 'local'
    },
    publishingConfig: {
        webhooksEnabled: true
    }
};

@Injectable()
export class SeoService {
    private readonly cache = new Map<string, { value: any; expires: number }>();

    constructor(private readonly prisma: PrismaService) { }

    private getCache(key: string): any | null {
        const cached = this.cache.get(key);
        if (cached && cached.expires > Date.now()) {
            return cached.value;
        }
        return null;
    }

    private setCache(key: string, value: any, ttl = 300000): void {
        this.cache.set(key, { value, expires: Date.now() + ttl });
    }

    async getSettings(): Promise<any> {
        const cacheKey = 'cms:settings';
        const cached = this.getCache(cacheKey);
        if (cached) return cached;

        let settings = await this.prisma.cmsSettings.findUnique({
            where: { id: 1 }
        });

        if (!settings) {
            settings = await this.prisma.cmsSettings.create({
                data: {
                    id: 1,
                    siteName: defaultSettings.siteName,
                    siteUrl: defaultSettings.siteUrl,
                    seoDefaults: defaultSettings.seoDefaults,
                    mediaSettings: defaultSettings.mediaSettings,
                    publishingConfig: defaultSettings.publishingConfig
                }
            });
        }

        this.setCache(cacheKey, settings);
        return settings;
    }

    async clearCache(): Promise<void> {
        this.cache.clear();
    }

    async generateRobots(): Promise<string> {
        const settings = await this.getSettings();
        const siteUrl = settings.siteUrl || 'https://albertofarah.com';
        const seo = settings.seoDefaults as any;

        const allow = seo?.indexing?.allowIndexing !== false;
        const disallowed = seo?.indexing?.disallowedPaths || [];

        let txt = 'User-agent: *\n';
        if (!allow) {
            txt += 'Disallow: /\n';
        } else {
            disallowed.forEach((path: string) => {
                txt += `Disallow: ${path}\n`;
            });
            txt += `Sitemap: ${siteUrl}/sitemap.xml\n`;
        }

        return txt;
    }

    async generateSitemap(): Promise<string> {
        const settings = await this.getSettings();
        const siteUrl = settings.siteUrl || 'https://albertofarah.com';
        const seo = settings.seoDefaults as any;

        if (seo?.indexing?.sitemap?.enabled === false) {
            return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
        }

        const contents = await this.prisma.cmsContent.findMany({
            where: {
                status: { mode: 'insensitive', equals: 'published' }
            },
            select: { slug: true, type: true, updatedAt: true }
        });

        const disallowed = seo?.indexing?.disallowedPaths || [];
        const changefreq = seo?.indexing?.sitemap?.changefreqByType || {};
        const priority = seo?.indexing?.sitemap?.priorityByType || {};

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Add home page
        xml += '  <url>\n';
        xml += `    <loc>${siteUrl}/</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>1.0</priority>\n';
        xml += '  </url>\n';

        // Add services page
        xml += '  <url>\n';
        xml += `    <loc>${siteUrl}/services</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        xml += '  </url>\n';

        for (const item of contents) {
            const isBlog = item.type.toUpperCase() === 'BLOG';
            const path = isBlog ? `/blog/${item.slug}` : `/projects/${item.slug}`;

            // Check if disallowed by path patterns
            const isDisallowed = disallowed.some((d: string) => {
                const regexStr = '^' + d.replace(/\*/g, '.*') + '$';
                try {
                    const regex = new RegExp(regexStr);
                    return regex.test(path);
                } catch {
                    return false;
                }
            });

            if (isDisallowed) continue;

            const freq = changefreq[item.type.toUpperCase()] || 'weekly';
            const prio = priority[item.type.toUpperCase()] !== undefined ? priority[item.type.toUpperCase()] : 0.8;

            xml += '  <url>\n';
            xml += `    <loc>${siteUrl}${path}</loc>\n`;
            xml += `    <lastmod>${item.updatedAt.toISOString()}</lastmod>\n`;
            xml += `    <changefreq>${freq}</changefreq>\n`;
            xml += `    <priority>${prio}</priority>\n`;
            xml += '  </url>\n';
        }

        xml += '</urlset>';
        return xml;
    }

    async generateRss(): Promise<string> {
        const settings = await this.getSettings();
        const siteUrl = settings.siteUrl || 'https://albertofarah.com';

        const posts = await this.prisma.cmsContent.findMany({
            where: {
                type: 'BLOG',
                status: { mode: 'insensitive', equals: 'published' }
            },
            orderBy: { publishedAt: 'desc' },
            take: 50
        });

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
        xml += '  <channel>\n';
        xml += `    <title>${settings.siteName || 'Alberto Farah'} - Blog</title>\n`;
        xml += `    <link>${siteUrl}</link>\n`;
        xml += '    <description>Soluciones IA, agentes autónomos y automatización B2B</description>\n';
        xml += '    <language>es</language>\n';
        xml += `    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;

        posts.forEach(post => {
            const description = post.metaDesc || this.stripHtml(post.content);
            const pubDate = post.publishedAt ? post.publishedAt.toUTCString() : post.updatedAt.toUTCString();

            xml += '    <item>\n';
            xml += `      <title>${this.escapeXml(post.title)}</title>\n`;
            xml += `      <link>${siteUrl}/blog/${post.slug}</link>\n`;
            xml += `      <description>${this.escapeXml(description)}</description>\n`;
            xml += `      <pubDate>${pubDate}</pubDate>\n`;
            xml += `      <guid isPermaLink="false">${post.id}</guid>\n`;
            xml += '    </item>\n';
        });

        xml += '  </channel>\n';
        xml += '</rss>';
        return xml;
    }

    private stripHtml(html: string): string {
        if (!html) return '';
        const stripped = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return stripped.length > 250 ? stripped.substring(0, 250) + '...' : stripped;
    }

    private escapeXml(unsafe: string): string {
        if (!unsafe) return '';
        return unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });
    }
}
