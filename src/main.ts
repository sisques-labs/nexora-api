import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { BaseExceptionFilter } from './core/filters/base-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableShutdownHooks();

  // transform: true only — there's no class-validator decorators on
  // nexora-api's DTOs (see AGENTS.md: validation lives once, in each
  // Command's constructor). This pipe exists purely so `@Body()` gives
  // controllers a real DTO class instance (with its methods) instead of
  // a plain object from the JSON body parser.
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useGlobalFilters(new BaseExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nexora API')
    .setDescription(
      "Nexora's public API — entry point, orchestrates jobs, scheduler, nodes and models (mocked in v0)",
    )
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const corsOrigins = app
    .get(ConfigService)
    .getOrThrow<string[]>('app.corsOrigins');
  app.enableCors({ origin: corsOrigins, credentials: true });

  const port = process.env.PORT ?? 8090;
  await app.listen(port);
  console.log(`nexora-api listening on http://localhost:${port}`);
}
bootstrap().catch((error: unknown) => {
  console.error('Failed to start the application', error);
  process.exit(1);
});
