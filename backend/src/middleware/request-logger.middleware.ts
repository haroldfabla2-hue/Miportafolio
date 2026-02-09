
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction) {
        this.logger.log(`Incoming Request: ${req.method} ${req.originalUrl}`);

        // Log body for debugging (be careful with passwords in production logs, hiding here)
        if (req.body && !req.originalUrl.includes('login')) {
            // this.logger.log(`Body: ${JSON.stringify(req.body)}`);
        }

        res.on('finish', () => {
            const { statusCode } = res;
            this.logger.log(`Request Completed: ${req.method} ${req.originalUrl} - Status: ${statusCode}`);
        });

        next();
    }
}
