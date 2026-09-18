import { Injectable, NestMiddleware, Logger, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ErrorHandlerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('ErrorHandler');

    use(req: Request, res: Response, next: NextFunction) {
        try {
            next();
        } catch (error: any) {
            this.logger.error(`Error en ${req.method} ${req.path}:`, error.message);

            res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message || 'Internal Server Error',
                timestamp: new Date().toISOString(),
                path: req.path,

            });
        }
    }
}