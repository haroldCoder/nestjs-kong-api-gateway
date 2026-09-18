import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { KongModule } from './common/kong/kong.module.js';
import { LoggerMiddleware } from './middleware/loggin.middleware.js';
import { AuthMiddleware } from './middleware/auth.middleware.js';
import { ValidationMiddleware } from './middleware/validation.middleware.js';
import { JwtModule } from '@nestjs/jwt';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: process.env.OBSERVER_API_KEY as string,
      appSecret: process.env.OBSERVER_APP_SECRET as string,
      serviceId: process.env.OBSERVER_SERVICE_ID as string,
    }),
    KongModule,
    JwtModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');

    consumer.apply(ValidationMiddleware)
      .forRoutes('*');

    consumer.apply(AuthMiddleware)
      .exclude('/auth/login', '/auth/register', '/auth/health')
      .forRoutes("*")
  }
}
