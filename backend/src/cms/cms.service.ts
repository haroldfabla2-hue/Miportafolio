import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface FindAllOptions {
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}

interface CmsTranslationSource {
    type?: string | null;
    title?: string | null;
    content?: string | null;
    metaTitle?: string | null;
    metaDesc?: string | null;
    tags?: string[] | null;
    metadata?: Record<string, any> | null;
}

@Injectable()
export class CmsService {
    private readonly translationApiUrl = 'https://translate.googleapis.com/translate_a/single';
    private readonly translationCache = new Map<string, string>();

    constructor(private prisma: PrismaService) { }

    // --- PUBLIC METHODS (Read-Only) ---

    async getPortfolio() {
        return this.prisma.cmsContent.findMany({
            where: {
                type: 'PORTFOLIO',
                status: { mode: 'insensitive', equals: 'published' }
            },
            orderBy: { publishedAt: 'desc' }
        });
    }

    async getBlogs() {
        return this.prisma.cmsContent.findMany({
            where: {
                type: { mode: 'insensitive', equals: 'blog' },
                status: { mode: 'insensitive', equals: 'published' }
            },
            orderBy: { publishedAt: 'desc' }
        });
    }

    async getBySlug(slug: string) {
        const content = await this.prisma.cmsContent.findUnique({
            where: { slug }
        });
        if (!content || content.status?.toLowerCase() !== 'published') return null;
        return content;
    }

    // --- ADMIN METHODS (Full Access) ---

    async findAllWithFilters(options: FindAllOptions) {
        const where: any = {};

        if (options.type && options.type !== 'all') {
            where.type = options.type;
        }

        if (options.status && options.status !== 'all') {
            where.status = options.status;
        }

        if (options.search) {
            where.OR = [
                { title: { contains: options.search, mode: 'insensitive' } },
                { content: { contains: options.search, mode: 'insensitive' } },
                { slug: { contains: options.search, mode: 'insensitive' } },
            ];
        }

        const page = options.page || 1;
        const limit = options.limit || 20;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.prisma.cmsContent.findMany({
                where,
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.cmsContent.count({ where }),
        ]);

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findAll(type?: string) {
        return this.prisma.cmsContent.findMany({
            where: type ? { type } : {},
            orderBy: { updatedAt: 'desc' }
        });
    }

    async findOne(id: string) {
        const content = await this.prisma.cmsContent.findUnique({
            where: { id }
        });
        if (!content) {
            throw new NotFoundException(`Content with ID ${id} not found`);
        }
        return content;
    }

    async create(data: any) {
        const createData = { ...data };

        if (createData.type) {
            createData.type = this.normalizeType(createData.type);
        }

        // Generate slug if not provided
        if (!createData.slug && createData.title) {
            createData.slug = this.generateSlug(createData.title);
        }

        // Ensure unique slug
        const existingSlug = await this.prisma.cmsContent.findUnique({
            where: { slug: createData.slug }
        });
        if (existingSlug) {
            createData.slug = `${createData.slug}-${Date.now()}`;
        }

        const dataWithTranslations = await this.appendEnglishTranslation(createData);
        return this.prisma.cmsContent.create({ data: dataWithTranslations });
    }

    async update(id: string, data: any) {
        // Verify content exists
        const existing = await this.findOne(id);
        const updateData = { ...data };

        if (updateData.type) {
            updateData.type = this.normalizeType(updateData.type);
        }

        // If title changed and no new slug provided, regenerate slug
        if (updateData.title && !updateData.slug && existing.title !== updateData.title) {
            updateData.slug = this.generateSlug(updateData.title);
            // Check uniqueness
            const existingSlug = await this.prisma.cmsContent.findFirst({
                where: { slug: updateData.slug, NOT: { id } }
            });
            if (existingSlug) {
                updateData.slug = `${updateData.slug}-${Date.now()}`;
            }
        }

        const dataWithTranslations = await this.appendEnglishTranslation(updateData, existing);

        return this.prisma.cmsContent.update({
            where: { id },
            data: dataWithTranslations
        });
    }

    async delete(id: string) {
        // Verify content exists
        await this.findOne(id);

        return this.prisma.cmsContent.delete({ where: { id } });
    }

    async togglePublish(id: string, publish: boolean) {
        // Verify content exists
        const existing = await this.findOne(id);
        const updateData: any = {
            status: publish ? 'PUBLISHED' : 'DRAFT',
            publishedAt: publish ? new Date() : null,
        };

        // Ensure translation exists before a blog/project goes live.
        if (publish) {
            const translated = await this.appendEnglishTranslation({}, existing);
            if (translated.metadata) {
                updateData.metadata = translated.metadata;
            }
        }

        return this.prisma.cmsContent.update({
            where: { id },
            data: updateData,
        });
    }

    // --- UTILITY METHODS ---

    private normalizeType(type: unknown): string {
        return typeof type === 'string' ? type.toUpperCase().trim() : '';
    }

    private shouldAutoTranslate(type: unknown): boolean {
        const normalizedType = this.normalizeType(type);
        return normalizedType === 'BLOG' || normalizedType === 'PORTFOLIO';
    }

    private asObject(value: unknown): Record<string, any> {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            return value as Record<string, any>;
        }
        return {};
    }

    private sanitizeStringArray(value: unknown): string[] {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }

    private splitLongText(text: string, maxLen = 3000): string[] {
        if (!text || text.length <= maxLen) {
            return [text];
        }

        const chunks: string[] = [];
        let rest = text;

        while (rest.length > maxLen) {
            let cut = rest.lastIndexOf('\n', maxLen);
            if (cut < Math.floor(maxLen * 0.6)) {
                cut = rest.lastIndexOf('. ', maxLen);
            }
            if (cut < Math.floor(maxLen * 0.5)) {
                cut = maxLen;
            }

            chunks.push(rest.slice(0, cut));
            rest = rest.slice(cut);
        }

        if (rest.length > 0) {
            chunks.push(rest);
        }

        return chunks;
    }

    private setTranslationCache(key: string, value: string): void {
        if (this.translationCache.size > 3000) {
            this.translationCache.clear();
        }
        this.translationCache.set(key, value);
    }

    private async sleep(ms: number): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }

    private async translateText(text: string, source = 'es', target = 'en'): Promise<string> {
        if (!text || !text.trim()) {
            return text;
        }

        const cacheKey = `${source}:${target}:${text}`;
        const cached = this.translationCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const params = new URLSearchParams({
            client: 'gtx',
            sl: source,
            tl: target,
            dt: 't',
            q: text,
        });

        for (let attempt = 1; attempt <= 3; attempt += 1) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000);

                const response = await fetch(`${this.translationApiUrl}?${params.toString()}`, {
                    signal: controller.signal,
                });
                clearTimeout(timeout);

                if (!response.ok) {
                    throw new Error(`translation_http_${response.status}`);
                }

                const payload = await response.json() as any;
                const segments: any[] = Array.isArray(payload?.[0]) ? payload[0] : [];
                const translated = segments
                    .map((segment) => (Array.isArray(segment) && typeof segment[0] === 'string' ? segment[0] : ''))
                    .join('');

                const safe = translated && translated.length > 0 ? translated : text;
                this.setTranslationCache(cacheKey, safe);
                await this.sleep(80);
                return safe;
            } catch {
                if (attempt === 3) {
                    this.setTranslationCache(cacheKey, text);
                    return text;
                }
                await this.sleep(150 * attempt);
            }
        }

        return text;
    }

    private async translatePlainText(text: string): Promise<string> {
        const chunks = this.splitLongText(text, 3000);
        const translatedChunks: string[] = [];

        for (const chunk of chunks) {
            translatedChunks.push(await this.translateText(chunk, 'es', 'en'));
        }

        return translatedChunks.join('');
    }

    private async translateHtmlPreservingTags(html: string): Promise<string> {
        if (!html || !html.trim()) {
            return html;
        }

        const tokens = html.split(/(<[^>]+>)/g);
        const translatedTokens: string[] = [];

        for (const token of tokens) {
            if (!token) {
                continue;
            }

            if (token.startsWith('<') && token.endsWith('>')) {
                translatedTokens.push(token);
                continue;
            }

            translatedTokens.push(await this.translatePlainText(token));
        }

        return translatedTokens.join('');
    }

    private mergeTranslationSource(existing: any, incoming: any): CmsTranslationSource {
        const hasIncomingMetadata = incoming && Object.prototype.hasOwnProperty.call(incoming, 'metadata');

        let mergedMetadata: Record<string, any>;
        if (!hasIncomingMetadata) {
            mergedMetadata = this.asObject(existing?.metadata);
        } else if (incoming.metadata === null) {
            mergedMetadata = {};
        } else {
            mergedMetadata = {
                ...this.asObject(existing?.metadata),
                ...this.asObject(incoming.metadata),
            };
        }

        return {
            type: incoming?.type ?? existing?.type ?? null,
            title: incoming?.title ?? existing?.title ?? null,
            content: incoming?.content ?? existing?.content ?? null,
            metaTitle: Object.prototype.hasOwnProperty.call(incoming ?? {}, 'metaTitle')
                ? incoming.metaTitle
                : existing?.metaTitle ?? null,
            metaDesc: Object.prototype.hasOwnProperty.call(incoming ?? {}, 'metaDesc')
                ? incoming.metaDesc
                : existing?.metaDesc ?? null,
            tags: incoming?.tags ?? existing?.tags ?? [],
            metadata: mergedMetadata,
        };
    }

    private async buildEnglishMetadata(source: CmsTranslationSource): Promise<Record<string, any> | null> {
        if (!this.shouldAutoTranslate(source.type)) {
            return null;
        }

        const metadata = this.asObject(source.metadata);
        const i18n = this.asObject(metadata.i18n);
        const existingEn = this.asObject(i18n.en);
        const translatedEn: Record<string, any> = { ...existingEn };

        if (typeof source.title === 'string' && source.title.trim()) {
            translatedEn.title = await this.translatePlainText(source.title);
        }

        if (typeof source.content === 'string' && source.content.trim()) {
            translatedEn.content = await this.translateHtmlPreservingTags(source.content);
        }

        if (source.metaTitle === null) {
            translatedEn.metaTitle = null;
        } else if (typeof source.metaTitle === 'string' && source.metaTitle.trim()) {
            translatedEn.metaTitle = await this.translatePlainText(source.metaTitle);
        }

        if (source.metaDesc === null) {
            translatedEn.metaDesc = null;
        } else if (typeof source.metaDesc === 'string' && source.metaDesc.trim()) {
            translatedEn.metaDesc = await this.translatePlainText(source.metaDesc);
        }

        const sourceTags = this.sanitizeStringArray(source.tags);
        if (sourceTags.length > 0) {
            translatedEn.tags = await Promise.all(sourceTags.map((tag) => this.translatePlainText(tag)));
        }

        if (typeof metadata.role === 'string' && metadata.role.trim()) {
            translatedEn.role = await this.translatePlainText(metadata.role);
        }

        const sourceServices = this.sanitizeStringArray(metadata.services);
        if (sourceServices.length > 0) {
            translatedEn.services = await Promise.all(sourceServices.map((service) => this.translatePlainText(service)));
        }

        translatedEn.sourceLang = 'es';
        translatedEn.translatedAt = new Date().toISOString();

        return {
            ...metadata,
            i18n: {
                ...i18n,
                en: translatedEn,
            },
        };
    }

    private buildEnglishFallbackMetadata(source: CmsTranslationSource): Record<string, any> | null {
        if (!this.shouldAutoTranslate(source.type)) {
            return null;
        }

        const metadata = this.asObject(source.metadata);
        const i18n = this.asObject(metadata.i18n);
        const existingEn = this.asObject(i18n.en);
        const fallbackEn: Record<string, any> = { ...existingEn };

        if (typeof source.title === 'string' && source.title.trim()) {
            fallbackEn.title = source.title;
        }

        if (typeof source.content === 'string' && source.content.trim()) {
            fallbackEn.content = source.content;
        }

        if (source.metaTitle === null) {
            fallbackEn.metaTitle = null;
        } else if (typeof source.metaTitle === 'string' && source.metaTitle.trim()) {
            fallbackEn.metaTitle = source.metaTitle;
        }

        if (source.metaDesc === null) {
            fallbackEn.metaDesc = null;
        } else if (typeof source.metaDesc === 'string' && source.metaDesc.trim()) {
            fallbackEn.metaDesc = source.metaDesc;
        }

        const sourceTags = this.sanitizeStringArray(source.tags);
        if (sourceTags.length > 0) {
            fallbackEn.tags = sourceTags;
        }

        if (typeof metadata.role === 'string' && metadata.role.trim()) {
            fallbackEn.role = metadata.role;
        }

        const sourceServices = this.sanitizeStringArray(metadata.services);
        if (sourceServices.length > 0) {
            fallbackEn.services = sourceServices;
        }

        fallbackEn.sourceLang = 'es';
        fallbackEn.translatedAt = new Date().toISOString();
        fallbackEn.translationFallback = true;

        return {
            ...metadata,
            i18n: {
                ...i18n,
                en: fallbackEn,
            },
        };
    }

    private async appendEnglishTranslation(data: any, existing?: any): Promise<any> {
        const source = this.mergeTranslationSource(existing, data);

        if (!this.shouldAutoTranslate(source.type)) {
            return data;
        }

        try {
            const metadata = await this.buildEnglishMetadata(source);
            if (!metadata) {
                return data;
            }

            return {
                ...data,
                metadata,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'unknown_translation_error';
            console.warn(`[CMS] Auto translation failed, using fallback EN copy: ${message}`);
            const fallbackMetadata = this.buildEnglishFallbackMetadata(source);
            if (!fallbackMetadata) {
                return data;
            }
            return {
                ...data,
                metadata: fallbackMetadata,
            };
        }
    }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-')      // Replace spaces with hyphens
            .replace(/-+/g, '-')       // Replace multiple hyphens with single
            .substring(0, 100);        // Limit length
    }
}
