import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SeoService } from './seo.service';

@Injectable()
export class CmsSettingsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly seoService: SeoService
    ) {}

    // --- SETTINGS METHODS ---

    async getSettings() {
        return this.seoService.getSettings();
    }

    async updateSeo(data: any) {
        const settings = await this.prisma.cmsSettings.update({
            where: { id: 1 },
            data: { seoDefaults: data }
        });
        await this.seoService.clearCache();
        return settings;
    }

    async updateMedia(data: any) {
        const settings = await this.prisma.cmsSettings.update({
            where: { id: 1 },
            data: { mediaSettings: data }
        });
        await this.seoService.clearCache();
        return settings;
    }

    async updatePublishing(data: any) {
        const settings = await this.prisma.cmsSettings.update({
            where: { id: 1 },
            data: { publishingConfig: data }
        });
        await this.seoService.clearCache();
        return settings;
    }

    async updateGeneral(siteName: string, siteUrl: string) {
        const settings = await this.prisma.cmsSettings.update({
            where: { id: 1 },
            data: { siteName, siteUrl }
        });
        await this.seoService.clearCache();
        return settings;
    }

    // --- TAXONOMY METHODS ---

    async getTaxonomies() {
        return this.prisma.taxonomy.findMany({
            include: { terms: true },
            orderBy: { name: 'asc' }
        });
    }

    async createTaxonomy(data: any) {
        return this.prisma.taxonomy.create({
            data: {
                name: data.name,
                slug: data.slug || this.generateSlug(data.name),
                description: data.description,
                kind: data.kind, // CATEGORY or TAG
                scope: data.scope || 'GLOBAL',
                isRequired: data.isRequired ?? false,
                isMultiSelect: data.isMultiSelect ?? true
            }
        });
    }

    async updateTaxonomy(id: number, data: any) {
        return this.prisma.taxonomy.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                scope: data.scope,
                isRequired: data.isRequired,
                isMultiSelect: data.isMultiSelect
            }
        });
    }

    async deleteTaxonomy(id: number) {
        return this.prisma.taxonomy.delete({
            where: { id }
        });
    }

    // --- TAXONOMY TERM METHODS ---

    async createTerm(taxonomyId: number, data: any) {
        return this.prisma.taxonomyTerm.create({
            data: {
                taxonomyId,
                name: data.name,
                slug: data.slug || this.generateSlug(data.name),
                description: data.description
            }
        });
    }

    async updateTerm(id: number, data: any) {
        return this.prisma.taxonomyTerm.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description
            }
        });
    }

    async deleteTerm(id: number) {
        return this.prisma.taxonomyTerm.delete({
            where: { id }
        });
    }

    // --- CUSTOM FIELD DEFINITION METHODS ---

    async getCustomFields(contentType?: string) {
        return this.prisma.customFieldDefinition.findMany({
            where: contentType ? { contentType } : {},
            orderBy: { order: 'asc' }
        });
    }

    async createCustomField(data: any) {
        return this.prisma.customFieldDefinition.create({
            data: {
                contentType: data.contentType,
                key: data.key,
                label: data.label,
                description: data.description,
                fieldType: data.fieldType,
                required: data.required ?? false,
                options: data.options,
                order: data.order ?? 0
            }
        });
    }

    async updateCustomField(id: number, data: any) {
        return this.prisma.customFieldDefinition.update({
            where: { id },
            data: {
                label: data.label,
                description: data.description,
                required: data.required,
                options: data.options,
                order: data.order
            }
        });
    }

    async deleteCustomField(id: number) {
        return this.prisma.customFieldDefinition.delete({
            where: { id }
        });
    }

    // --- WEBHOOK METHODS ---

    async getWebhooks() {
        return this.prisma.publishingWebhook.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async createWebhook(data: any) {
        return this.prisma.publishingWebhook.create({
            data: {
                name: data.name,
                target: data.target,
                url: data.url,
                secret: data.secret,
                active: data.active ?? true,
                contentTypes: data.contentTypes || [],
                events: data.events || []
            }
        });
    }

    async updateWebhook(id: number, data: any) {
        return this.prisma.publishingWebhook.update({
            where: { id },
            data: {
                name: data.name,
                target: data.target,
                url: data.url,
                secret: data.secret,
                active: data.active,
                contentTypes: data.contentTypes,
                events: data.events
            }
        });
    }

    async deleteWebhook(id: number) {
        return this.prisma.publishingWebhook.delete({
            where: { id }
        });
    }

    // --- HELPERS ---

    private generateSlug(text: string): string {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 100);
    }
}
