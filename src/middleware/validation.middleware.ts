import { BadRequestException, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
    constructor() { }

    use(req: Request, res: Response, next: NextFunction) {
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const contentType = req.get('content-type');

            if (!contentType || !contentType.includes('application/json')) {
                throw new BadRequestException(
                    'Content-Type debe ser application/json'
                );
            }
        }

        // Validar que no esté vacío el body para POST/PUT
        if (['POST', 'PUT'].includes(req.method)) {
            if (!req.body || Object.keys(req.body).length === 0) {
                throw new BadRequestException('Body no puede estar vacío');
            }
        }

        next();
    }
}