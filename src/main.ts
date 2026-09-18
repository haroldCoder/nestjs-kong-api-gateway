import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import "dotenv/config";
import { KongService } from './common/kong/kong.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  const kongService = app.get(KongService);
  await kongService.setupKong();
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
