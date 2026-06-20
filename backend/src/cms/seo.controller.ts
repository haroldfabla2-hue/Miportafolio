import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../auth/public.decorator';
import { SeoService } from './seo.service';

@Controller()
export class SeoController {
    constructor(private readonly seoService: SeoService) { }

    @Get('robots.txt')
    @Public()
    async getRobots(@Res() res: Response) {
        const txt = await this.seoService.generateRobots();
        res.header('Content-Type', 'text/plain');
        res.send(txt);
    }

    @Get('sitemap.xml')
    @Public()
    async getSitemap(@Res() res: Response) {
        const xml = await this.seoService.generateSitemap();
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    }

    @Get('rss.xml')
    @Public()
    async getRss(@Res() res: Response) {
        const xml = await this.seoService.generateRss();
        res.header('Content-Type', 'application/rss+xml; charset=utf-8');
        res.send(xml);
    }
}
