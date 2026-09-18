import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private jwtService: JwtService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const publicRoutes = ['/auth/login', '/auth/register', '/auth/health'];

        if (publicRoutes.includes(req.path)) {
            return next();
        }

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('No token provided');
        }

        const [bearer, token] = authHeader.split(' ');

        if (bearer !== 'Bearer' || !token) {
            throw new UnauthorizedException('Invalid token format');
        }

        try {
            const payload = this.jwtService.verify(token);
            res.locals.user = payload;
            next();
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}