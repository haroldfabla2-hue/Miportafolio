import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface FindAllOptions {
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}

@Injectable()
export class CmsService {
    constructor(private prisma: PrismaService) { }

    // --- PUBLIC METHODS (Read-Only) ---

    async getPortfolio() {
        return this.prisma.cmsContent.findMany({
            where: {
                type: 'BLOG', // Also fetch PORTFOLIO type
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
        // Generate slug if not provided
        if (!data.slug && data.title) {
            data.slug = this.generateSlug(data.title);
        }

        // Ensure unique slug
        const existingSlug = await this.prisma.cmsContent.findUnique({
            where: { slug: data.slug }
        });
        if (existingSlug) {
            data.slug = `${data.slug}-${Date.now()}`;
        }

        return this.prisma.cmsContent.create({ data });
    }

    async update(id: string, data: any) {
        // Verify content exists
        await this.findOne(id);

        // If title changed and no new slug provided, regenerate slug
        if (data.title && !data.slug) {
            const existing = await this.prisma.cmsContent.findUnique({ where: { id } });
            if (existing && existing.title !== data.title) {
                data.slug = this.generateSlug(data.title);
                // Check uniqueness
                const existingSlug = await this.prisma.cmsContent.findFirst({
                    where: { slug: data.slug, NOT: { id } }
                });
                if (existingSlug) {
                    data.slug = `${data.slug}-${Date.now()}`;
                }
            }
        }

        return this.prisma.cmsContent.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        // Verify content exists
        await this.findOne(id);

        return this.prisma.cmsContent.delete({ where: { id } });
    }

    async togglePublish(id: string, publish: boolean) {
        // Verify content exists
        await this.findOne(id);

        return this.prisma.cmsContent.update({
            where: { id },
            data: {
                status: publish ? 'PUBLISHED' : 'DRAFT',
                publishedAt: publish ? new Date() : null,
            },
        });
    }

    // --- UTILITY METHODS ---

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
